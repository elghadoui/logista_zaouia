using Dapper;
using MySqlConnector;

namespace Vitasouss;

// Presentation preference only. Connections.Resolve remains the authorization boundary.
public static class ContextVisibility
{
    public static async Task<IEnumerable<dynamic>> Select(Connections connections, System.Security.Claims.ClaimsPrincipal user)
    {
        await using var db = await connections.Admin();
        var visibility = await Installed(db) ? " AND c.show_in_selectors=1" : "";
        return await db.QueryAsync("SELECT c.id,s.code station,c.label,c.database_name databaseName,c.read_only readOnly,s.is_master isMaster,c.local_refsta localRefsta FROM app_contexts c JOIN app_stations s ON s.id=c.station_id WHERE c.enabled=1" + visibility + " AND (@isAdmin=1 OR EXISTS(SELECT 1 FROM app_user_contexts u WHERE u.context_id=c.id AND u.user_id=@uid)) ORDER BY s.code,c.read_only,c.id DESC", new
        {
            isAdmin=user.IsInRole("Admin"), uid=user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        });
    }
    public static async Task<bool> Installed(MySqlConnection db) =>
        await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='app_contexts' AND COLUMN_NAME='show_in_selectors'") == 1;

    public static async Task RequireInstalled(MySqlConnection db)
    {
        if (!await Installed(db))
            throw new RuleException("Appliquez d'abord la migration administrative 013 pour modifier la visibilité des exercices.", 409);
    }
}
