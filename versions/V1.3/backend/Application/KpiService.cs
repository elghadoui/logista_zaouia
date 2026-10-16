using Dapper;
using System.Text.Json;
namespace Vitasouss;

public sealed class KpiService(Connections connections, Catalog catalog)
{
    public async Task<object> Read(ContextInfo context, string name, string? search, string? filter, string? value, string? filters = null)
    {
        var entity = catalog.Get(name);
        if (name is not ("adherent" or "verger" or "parcelle"))
            throw new RuleException("Synthèse non disponible pour ce référentiel.", 404);
        await using var db = await connections.Business(context);
        var schema = (await db.QueryAsync("SELECT TABLE_NAME,COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('adherent','verger','parcelle','variete','culture')")).GroupBy(c => (string)c.TABLE_NAME).ToDictionary(g => g.Key, g => g.Select(c => (string)c.COLUMN_NAME).ToHashSet());
        var warnings = new HashSet<string>();
        bool Has(string table, params string[] fields)
        {
            if (schema.TryGetValue(table, out var columns) && fields.All(columns.Contains))
                return true;
            warnings.Add($"{table} : colonne ou table absente dans cet exercice ; indicateur non disponible.");
            return false;
        }
        var p = new DynamicParameters();
        var conditions = new List<string>();
        if (!string.IsNullOrWhiteSpace(search))
        {
            if (!Has(name, entity.Label, entity.Keys[0]))
                return new
                {
                    metrics = new Dictionary<string, object?>(),
                    warnings
                };
            conditions.Add($"(e.`{entity.Label}` LIKE @search OR CAST(e.`{entity.Keys[0]}` AS CHAR) LIKE @search)");
            p.Add("search", "%" + search + "%");
        }
        if (!string.IsNullOrEmpty(filter))
        {
            entity.Column(filter);
            if (!Has(name, filter))
                return new
                {
                    metrics = new Dictionary<string, object?>(),
                    warnings
                };
            conditions.Add($"e.`{filter}` <=> @filter");
            p.Add("filter", entity.Column(filter).Parse(JsonSerializer.SerializeToElement(value)));
        }
        if (!ListFilters.Apply(entity, filters, p, conditions, field => Has(name, field))) return new { metrics = new Dictionary<string, object?>(), warnings };
        var where = conditions.Any() ? " WHERE " + string.Join(" AND ", conditions) : "";
        var metrics = new Dictionary<string, object?>();
        async Task Metric(string key, bool available, string sql)
        {
            metrics[key] = available ? await db.ExecuteScalarAsync<object>(sql + where, p) : null;
        }
        await Metric("count", Has(name, entity.Keys[0]), $"SELECT COUNT(*) FROM `{name}` e");
        if (name == "adherent")
        {
            var vergers = Has("adherent", "refadh") && Has("verger", "refadh", "refver");
            var parcels = vergers && Has("parcelle", "refver");
            var linked = " FROM parcelle p JOIN verger v ON v.refver=p.refver JOIN adherent e ON e.refadh=v.refadh";
            await Metric("vergers", vergers, "SELECT COUNT(*) FROM verger v JOIN adherent e ON e.refadh=v.refadh");
            await Metric("parcelles", parcels, "SELECT COUNT(*)" + linked);
            await Metric("surface", parcels && Has("parcelle", "suppar"), "SELECT SUM(p.suppar)" + linked);
            var linkedVergers = metrics["vergers"];
            var linkedParcels = metrics["parcelles"];
            // Hors filtre adhérent, les totaux de l'exercice incluent aussi les lignes orphelines.
            if (conditions.Count == 0)
            {
                await Metric("vergers", Has("verger", "refver"), "SELECT COUNT(*) FROM verger");
                await Metric("parcelles", Has("parcelle", "idparcelle"), "SELECT COUNT(*) FROM parcelle");
                await Metric("surface", Has("parcelle", "suppar"), "SELECT SUM(suppar) FROM parcelle");
                if (linkedParcels is not null && metrics["parcelles"] is not null && Convert.ToDecimal(linkedParcels) != Convert.ToDecimal(metrics["parcelles"]))
                    warnings.Add("Des parcelles sans rattachement complet à un adhérent sont incluses dans le total de l’exercice, mais exclues de la moyenne par adhérent.");
            }
            var count = Convert.ToDecimal(metrics["count"] ?? 0);
            metrics["meanVergers"] = count > 0 && linkedVergers is not null ? Convert.ToDecimal(linkedVergers) / count : null;
            metrics["meanParcelles"] = count > 0 && linkedParcels is not null ? Convert.ToDecimal(linkedParcels) / count : null;
        }
        if (name == "verger")
        {
            await Metric("surface", Has("verger", "supver"), "SELECT SUM(e.supver) FROM verger e");
            await Metric("meanSurface", Has("verger", "supver"), "SELECT AVG(e.supver) FROM verger e");
            var linked = " FROM parcelle p JOIN verger e ON e.refver=p.refver";
            await Metric("parcelles", Has("verger", "refver") && Has("parcelle", "refver"), "SELECT COUNT(*)" + linked);
            await Metric("parcelSurface", Has("verger", "refver") && Has("parcelle", "refver", "suppar"), "SELECT SUM(p.suppar)" + linked);
        }
        if (name == "parcelle")
        {
            await Metric("surface", Has("parcelle", "suppar"), "SELECT SUM(e.suppar) FROM parcelle e");
            await Metric("meanSurface", Has("parcelle", "suppar"), "SELECT AVG(e.suppar) FROM parcelle e");
            await Metric("varieties", Has("parcelle", "codvar") && Has("variete", "codvar"), "SELECT COUNT(DISTINCT v.codvar) FROM parcelle e JOIN variete v ON v.codvar=e.codvar");
            await Metric("cultures", Has("parcelle", "codvar") && Has("variete", "codvar", "codcul") && Has("culture", "codcul"), "SELECT COUNT(DISTINCT c.codcul) FROM parcelle e JOIN variete v ON v.codvar=e.codvar JOIN culture c ON c.codcul=v.codcul");
        }
        return new
        {
            metrics,
            warnings
        };
    }
}
