using Dapper;
using MySqlConnector;
namespace Vitasouss;
public static class SchemaGuard
{
    public static async Task<bool> CanInspectTriggers(MySqlConnection db, string name)
    {
        var account = await db.ExecuteScalarAsync<string>("SELECT CURRENT_USER()");
        var split = account!.LastIndexOf('@');
        var grantee = "'" + account[..split].Replace("'", "''") + "'@'" + account[(split + 1)..].Replace("'", "''") + "'";
        return await db.ExecuteScalarAsync<int>("SELECT (SELECT COUNT(*) FROM information_schema.USER_PRIVILEGES WHERE GRANTEE=@grantee AND PRIVILEGE_TYPE='TRIGGER')+(SELECT COUNT(*) FROM information_schema.SCHEMA_PRIVILEGES WHERE GRANTEE=@grantee AND PRIVILEGE_TYPE='TRIGGER' AND DATABASE() LIKE TABLE_SCHEMA)+(SELECT COUNT(*) FROM information_schema.TABLE_PRIVILEGES WHERE GRANTEE=@grantee AND PRIVILEGE_TYPE='TRIGGER' AND TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name)", new { grantee, name }) > 0;
    }
    public static async Task Check(MySqlConnection db, Entity entity, bool writing)
    {
        var primary = (await db.QueryAsync<string>("SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION", new { name = entity.Name })).ToArray();
        var engine = await db.ExecuteScalarAsync<string>("SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name", new { name = entity.Name });
        var columns = (await db.QueryAsync("SELECT COLUMN_NAME,COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name", new { name = entity.Name })).ToArray();
        if (engine != "InnoDB" || !primary.SequenceEqual(entity.Keys) || columns.Length != entity.Columns.Length || entity.Columns.Any(c => !columns.Any(a => (string)a.COLUMN_NAME == c.Name && c.Definition.StartsWith((string)a.COLUMN_TYPE, StringComparison.OrdinalIgnoreCase)))) throw new RuleException("Clé primaire, moteur ou schéma non validé : application protégée.", 409);
        if (writing && (!await CanInspectTriggers(db, entity.Name) || await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE=@name", new { name = entity.Name }) != 0)) throw new RuleException("Écriture protégée : déclencheurs présents ou inspection indisponible. Validation DBA nécessaire.", 409);
    }
}
