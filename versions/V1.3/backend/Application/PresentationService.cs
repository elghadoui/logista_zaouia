using Dapper;
using System.Text.Json;
namespace Vitasouss;

// Lectures métier uniquement : aucune modification du contrat des écritures historiques.
public sealed class PresentationService(Connections connections, Catalog catalog, ReferentialService records)
{
    public static (string Select, string Joins) Projection(string name) => name switch
    {
        "verger" => ("a.nomadh adherentName,pc.parcellesCount", " LEFT JOIN adherent a ON a.refadh=e.refadh LEFT JOIN (SELECT refver,COUNT(*) parcellesCount FROM parcelle GROUP BY refver) pc ON pc.refver=e.refver"),
        "parcelle" => ("v.nomver vergerName,a.nomadh adherentName,a.refadh ownerRef,vr.nomvar varietyName,sv.nomsvar subvarietyName,c.nomcul cultureName,vr.codcul cultureCode", " LEFT JOIN verger v ON v.refver=e.refver LEFT JOIN adherent a ON a.refadh=v.refadh LEFT JOIN variete vr ON vr.codvar=e.codvar LEFT JOIN culture c ON c.codcul=vr.codcul LEFT JOIN (SELECT codsvar,codvar,MIN(nomsvar) nomsvar FROM souvar GROUP BY codsvar,codvar HAVING COUNT(*)=1) sv ON sv.codsvar=e.codsvar AND sv.codvar=e.codvar"),
        "variete" => ("c.nomcul cultureName,g.nomgrv groupName", " LEFT JOIN culture c ON c.codcul=e.codcul LEFT JOIN grpvar g ON g.codgrv=e.codgrv"),
        "souvar" => ("v.nomvar varietyName", " LEFT JOIN variete v ON v.codvar=e.codvar"),
        _ => ("", "")
    };
    public async Task<object> Details(ContextInfo context, string name, Dictionary<string, JsonElement> key)
    {
        var entity = catalog.Get(name);
        await using var db = await connections.Business(context);
        var record = await records.Record(db, entity, key);
        var relations = new Dictionary<string, object?>();
        object? metrics = null;
        if (name == "adherent")
            metrics = await db.QuerySingleAsync("SELECT (SELECT COUNT(*) FROM verger WHERE refadh=@id) vergers,(SELECT COUNT(*) FROM parcelle p JOIN verger v ON v.refver=p.refver WHERE v.refadh=@id) parcelles,(SELECT SUM(p.suppar) FROM parcelle p JOIN verger v ON v.refver=p.refver WHERE v.refadh=@id) surface FROM adherent WHERE refadh=@id", new
            {
                id = record["refadh"]
            });
        if (name == "verger")
        {
            relations["adherent"] = await db.QuerySingleOrDefaultAsync("SELECT refadh,nomadh FROM adherent WHERE refadh=@id", new
            {
                id = record["refadh"]
            });
            metrics = await db.QuerySingleAsync("SELECT COUNT(*) parcelles,SUM(suppar) surface FROM parcelle WHERE refver=@id", new
            {
                id = record["refver"]
            });
        }
        if (name == "parcelle")
        {
            var parent = await db.QuerySingleOrDefaultAsync("SELECT v.refver,v.nomver,a.refadh,a.nomadh FROM verger v LEFT JOIN adherent a ON a.refadh=v.refadh WHERE v.refver=@id", new
            {
                id = record["refver"]
            });
            relations["parent"] = parent;
        }
        return new
        {
            record,
            relations,
            metrics
        };
    }
    public async Task<object> Lookup(ContextInfo context, string name, string? search, string? selected, string? variety)
    {
        var entity = catalog.Get(name);
        var id = entity.Keys[0];
        await using var db = await connections.Business(context);
        var p = new DynamicParameters();
        p.Add("search", "%" + (search ?? "") + "%");
        p.Add("selected", selected is null ? null : entity.Column(id).Parse(JsonSerializer.SerializeToElement(selected)));
        var filter = "";
        if (name == "souvar")
        {
            if (variety is null)
                return Array.Empty<object>();
            p.Add("variety", entity.Column("codvar").Parse(JsonSerializer.SerializeToElement(variety)));
            filter = " AND codvar=@variety";
        }
        // La valeur sélectionnée reste résolue même hors de la première page de recherche.
        var rows = await db.QueryAsync($"SELECT `{id}`,`{entity.Label}` FROM `{name}` WHERE (`{entity.Label}` LIKE @search OR CAST(`{id}` AS CHAR) LIKE @search OR `{id}` <=> @selected){filter} ORDER BY (`{id}` <=> @selected) DESC,`{entity.Label}` LIMIT 40", p);
        return rows.Select(ReferentialService.Row);
    }
}
