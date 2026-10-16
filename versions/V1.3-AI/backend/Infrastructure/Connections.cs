using Dapper;
using MySqlConnector;
using Microsoft.AspNetCore.DataProtection;
using System.Security.Claims;
using System.Collections.Concurrent;

namespace Vitasouss;

public sealed class Connections(IConfiguration configuration, IDataProtectionProvider protection) : IDisposable
{
    private readonly ConcurrentDictionary<string, MySqlDataSource> sources = new();
    private readonly IDataProtector protector = protection.CreateProtector("Vitasouss.MySqlSecrets.v1");
    public string Protect(string password) => protector.Protect(password);
    public async Task<MySqlConnection> Admin()
    {
        var protectedPassword = configuration["Admin:ProtectedPassword"];
        var password = string.IsNullOrWhiteSpace(protectedPassword) ? Environment.GetEnvironmentVariable("VITASOUSS_ADMIN_PASSWORD") ?? configuration["Admin:Password"] : protector.Unprotect(protectedPassword);
        if (string.IsNullOrWhiteSpace(password))
            throw new RuleException("Base d’administration non configurée. Consultez le README pour initialiser la V1.", 503);
        var builder = new MySqlConnectionStringBuilder { Server = configuration["Admin:Host"] ?? "localhost", Port = configuration.GetValue<uint>("Admin:Port", 3306), Database = configuration["Admin:Database"] ?? "referentiels_admin", UserID = configuration["Admin:User"] ?? "referentiels_app", Password = password, SslMode = Enum.Parse<MySqlSslMode>(configuration["Admin:SslMode"] ?? "Required"), AllowZeroDateTime = false, ConvertZeroDateTime = false, ConnectionTimeout = 5, DefaultCommandTimeout = 20 };
        return await Open(builder.ConnectionString);
    }
    private async Task<MySqlConnection> Open(string connectionString)
    {
        var connection = await sources.GetOrAdd(connectionString, s => new MySqlDataSourceBuilder(s).Build()).OpenConnectionAsync();
        try
        {
            await connection.ExecuteAsync("SET time_zone='+00:00'");
            return connection;
        }
        catch { await connection.DisposeAsync(); throw; }
    }
    public async Task<ContextInfo> Resolve(int id, ClaimsPrincipal user, bool write = false)
    {
        await using var admin = await Admin();
        var context = await admin.QuerySingleOrDefaultAsync<ContextInfo>("SELECT c.id Id,s.code Station,c.label Label,c.database_name DatabaseName,c.read_only ReadOnly,s.is_master IsMaster,c.local_refsta LocalRefsta,s.server_id ServerId FROM app_contexts c JOIN app_stations s ON s.id=c.station_id WHERE c.id=@id AND c.enabled=1", new
        {
            id
        }) ?? throw new RuleException("Contexte indisponible.", 404);
        if (!user.IsInRole("Admin") && await admin.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_user_contexts WHERE user_id=@uid AND context_id=@id", new
        {
            uid = user.FindFirstValue(ClaimTypes.NameIdentifier),
            id
        }) == 0)
            throw new RuleException("Contexte non autorisé.", 403);
        if (write && (context.ReadOnly || (!user.IsInRole("Admin") && !user.IsInRole("Gestionnaire"))))
            throw new RuleException("Ce contexte est en lecture seule ou vos droits ne permettent pas la modification.", 403);
        return context;
    }
    public async Task<MySqlConnection> Business(ContextInfo context)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(context.DatabaseName, @"^[a-zA-Z0-9_]+$"))
            throw new RuleException("Nom de base invalide.");
        await using var admin = await Admin();
        var server = await admin.QuerySingleAsync("SELECT * FROM app_servers WHERE id=@id", new
        {
            id = context.ServerId
        });
        var builder = new MySqlConnectionStringBuilder { Server = (string)server.host, Port = (uint)(int)server.port, UserID = (string)server.username, Password = protector.Unprotect((string)server.protected_password), Database = context.DatabaseName, SslMode = Enum.Parse<MySqlSslMode>((string)server.ssl_mode), AllowZeroDateTime = true, ConvertZeroDateTime = true, ConnectionTimeout = 5, DefaultCommandTimeout = 20 };
        return await Open(builder.ConnectionString);
    }
    public void Dispose()
    {
        foreach (var source in sources.Values)
            source.Dispose();
    }
}

