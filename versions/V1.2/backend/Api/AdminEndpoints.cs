using Dapper;
using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;

namespace Vitasouss;

public static class AdminEndpoints
{
    public static void Map(RouteGroupBuilder api)
    {
        var admin = api.MapGroup("/admin").RequireAuthorization("Admin");
        admin.MapGet("/configuration", async (Connections connections) =>
        {
            await using var db = await connections.Admin();
            var servers = await db.QueryAsync("SELECT id,label,host,port,username,ssl_mode FROM app_servers");
            var stations = await db.QueryAsync("SELECT * FROM app_stations");
            var contexts = await db.QueryAsync("SELECT * FROM app_contexts");
            var users = await db.QueryAsync("SELECT id,username,display_name,role,enabled FROM app_users");
            var grants = await db.QueryAsync("SELECT * FROM app_user_contexts");
            var routes = await db.QueryAsync("SELECT * FROM app_sync_routes");
            return new
            {
                servers,
                stations,
                contexts,
                users,
                grants,
                routes
            };
        });
        admin.MapPost("/servers", async (ServerRequest r, Connections connections) =>
        {
            ValidateServer(r);
            if (string.IsNullOrEmpty(r.Password))
                throw new RuleException("Mot de passe MySQL requis.");
            await using var db = await connections.Admin();
            await db.ExecuteAsync("INSERT INTO app_servers(label,host,port,username,protected_password,ssl_mode) VALUES(@Label,@Host,@Port,@Username,@secret,@SslMode)", new
            {
                r.Label,
                r.Host,
                r.Port,
                r.Username,
                secret = connections.Protect(r.Password),
                r.SslMode
            });
            return Results.Ok(new
            {
                message = "Serveur ajouté. Secret protégé côté serveur."
            });
        });
        admin.MapPut("/servers/{id:int}", async (int id, ServerRequest r, Connections connections) =>
        {
            ValidateServer(r);
            await using var db = await connections.Admin();
            await db.ExecuteAsync("UPDATE app_servers SET label=@Label,host=@Host,port=@Port,username=@Username,ssl_mode=@SslMode WHERE id=@id", new
            {
                id,
                r.Label,
                r.Host,
                r.Port,
                r.Username,
                r.SslMode
            });
            if (!string.IsNullOrEmpty(r.Password))
                await db.ExecuteAsync("UPDATE app_servers SET protected_password=@secret WHERE id=@id", new
                {
                    id,
                    secret = connections.Protect(r.Password)
                });
            return Results.Ok(new
            {
                message = "Serveur mis à jour."
            });
        });
        admin.MapPost("/stations", async (StationRequest r, Connections connections) =>
        {
            if (!Regex.IsMatch(r.Code, @"^[A-Z0-9_]{2,20}$") || string.IsNullOrWhiteSpace(r.Label) || (r.IsMaster && r.Code != "ZAOUIA"))
                throw new RuleException("Station invalide ; seul ZAOUIA peut être maître.");
            await using var db = await connections.Admin();
            await db.ExecuteAsync("INSERT INTO app_stations(code,label,server_id,is_master) VALUES(@Code,@Label,@ServerId,@IsMaster)", r);
            return Results.Ok(new
            {
                message = "Station ajoutée."
            });
        });
        admin.MapPost("/contexts", async (ContextRequest r, Connections connections) =>
        {
            ValidateContext(r);
            await using var db = await connections.Admin();
            await db.ExecuteAsync("INSERT INTO app_contexts(station_id,database_name,label,read_only,local_refsta) VALUES(@StationId,@DatabaseName,@Label,@ReadOnly,@LocalRefsta)", r);
            return Results.Ok(new
            {
                message = "Exercice configuré."
            });
        });
        admin.MapPut("/contexts/{id:int}", async (int id, ContextRequest r, Connections connections) =>
        {
            ValidateContext(r);
            await using var db = await connections.Admin();
            await db.ExecuteAsync("UPDATE app_contexts SET label=@Label,read_only=@ReadOnly,local_refsta=@LocalRefsta WHERE id=@id AND station_id=@StationId AND database_name=@DatabaseName", new
            {
                id,
                r.Label,
                r.ReadOnly,
                r.LocalRefsta,
                r.StationId,
                r.DatabaseName
            });
            return Results.Ok(new
            {
                message = "Libellé et accès mis à jour."
            });
        });
        admin.MapPost("/users", async (UserRequest r, Connections connections, PasswordHasher<string> hasher) =>
        {
            if (r.Role is not ("Admin" or "Gestionnaire" or "Consultation") || r.Password.Length < 12 || r.Username.Length is < 1 or > 100 || r.DisplayName.Length is < 1 or > 100)
                throw new RuleException("Utilisateur invalide. Mot de passe de 12 caractères minimum.");
            await using var db = await connections.Admin();
            await using var tx = await db.BeginTransactionAsync();
            await db.ExecuteAsync("INSERT INTO app_users(username,display_name,password_hash,role) VALUES(@Username,@DisplayName,@hash,@Role)", new
            {
                r.Username,
                r.DisplayName,
                hash = hasher.HashPassword(r.Username, r.Password),
                r.Role
            }, tx);
            var id = await db.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()", transaction: tx);
            foreach (var cid in r.ContextIds.Distinct())
                await db.ExecuteAsync("INSERT INTO app_user_contexts(user_id,context_id) VALUES(@id,@cid)", new
                {
                    id,
                    cid
                }, tx);
            await tx.CommitAsync();
            return Results.Ok(new
            {
                message = "Utilisateur créé."
            });
        });
        admin.MapPut("/users/{id:int}/access", async (int id, AccessRequest r, Connections connections, System.Security.Claims.ClaimsPrincipal principal) =>
        {
            if (r.Role is not ("Admin" or "Gestionnaire" or "Consultation"))
                throw new RuleException("Rôle invalide.");
            if (Convert.ToString(id) == principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value && (!r.Enabled || r.Role != "Admin"))
                throw new RuleException("Vous ne pouvez pas retirer votre propre accès administrateur.");
            await using var db = await connections.Admin();
            await using var tx = await db.BeginTransactionAsync();
            await db.ExecuteAsync("UPDATE app_users SET role=@Role,enabled=@Enabled,auth_version=auth_version+1 WHERE id=@id", new
            {
                id,
                r.Role,
                r.Enabled
            }, tx);
            await db.ExecuteAsync("DELETE FROM app_user_contexts WHERE user_id=@id", new
            {
                id
            }, tx);
            foreach (var cid in r.ContextIds.Distinct())
                await db.ExecuteAsync("INSERT INTO app_user_contexts(user_id,context_id) VALUES(@id,@cid)", new
                {
                    id,
                    cid
                }, tx);
            await tx.CommitAsync();
            return Results.Ok(new
            {
                message = "Droits mis à jour. Les sessions antérieures sont révoquées."
            });
        });
        admin.MapPost("/routes", async (RouteRequest r, Connections connections, System.Security.Claims.ClaimsPrincipal user) =>
        {
            var source = await connections.Resolve(r.SourceContextId, user, true);
            var target = await connections.Resolve(r.TargetContextId, user, true);
            if (!source.IsMaster || source.Station != "ZAOUIA" || target.Station != "DIAF" || source.Id == target.Id)
                throw new RuleException("Route attendue : ZAOUIA maître → DIAF, exercices modifiables.");
            await using var db = await connections.Admin();
            await db.ExecuteAsync("INSERT INTO app_sync_routes(source_context_id,target_context_id) VALUES(@SourceContextId,@TargetContextId)", r);
            return Results.Ok(new
            {
                message = "Route ajoutée. Confirmez la correspondance des exercices."
            });
        });
        admin.MapPost("/contexts/{id:int}/test", async (int id, Connections connections, Catalog catalog, System.Security.Claims.ClaimsPrincipal user) =>
        {
            var context = await connections.Resolve(id, user);
            await using var db = await connections.Business(context);
            var errors = new List<string>();
            foreach (var e in catalog.Entities)
            {
                var columns = (await db.QueryAsync<string>("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name", new
                {
                    name = e.Name
                })).ToHashSet();
                foreach (var c in e.Columns)
                if (!columns.Contains(c.Name))
                    errors.Add($"{e.Name}.{c.Name} absent");
            }
            var duplicates = await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM (SELECT codsvar,codvar FROM souvar GROUP BY codsvar,codvar HAVING COUNT(*)>1) d");
            return new
            {
                connected = true,
                errors,
                ambiguousSubvarieties = duplicates
            };
        });
    }
    private static void ValidateServer(ServerRequest r)
    {
        if (string.IsNullOrWhiteSpace(r.Label) || r.Label.Length > 100 || string.IsNullOrWhiteSpace(r.Host) || r.Host.Length > 255 || r.Port is < 1 or > 65535 || string.IsNullOrWhiteSpace(r.Username) || !new[] { "Required", "VerifyCA", "VerifyFull", "Preferred", "None" }.Contains(r.SslMode))
            throw new RuleException("Configuration serveur invalide.");
    }
    private static void ValidateContext(ContextRequest r)
    {
        if (!Regex.IsMatch(r.DatabaseName, @"^[a-zA-Z0-9_]{1,64}$") || string.IsNullOrWhiteSpace(r.Label) || r.Label.Length > 100 || r.LocalRefsta is < -32768 or > 32767)
            throw new RuleException("Configuration exercice invalide.");
    }
    public record AccessRequest(string Role, bool Enabled, int[] ContextIds);
}
