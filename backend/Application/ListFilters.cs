using Dapper;
using System.Text.Json;
namespace Vitasouss;
public static class ListFilters
{
    public static bool Apply(Entity entity, string? encoded, DynamicParameters parameters, List<string> conditions, Func<string, bool>? available = null)
    {
        if (string.IsNullOrWhiteSpace(encoded)) return true;
        Dictionary<string, JsonElement> filters;
        try { filters = Json.Read(encoded); } catch { throw new RuleException("Filtres invalides."); }
        if (filters is null || filters.Count > 8) throw new RuleException("Huit filtres maximum.");
        var i = 0;
        foreach (var item in filters)
        {
            var column = entity.Column(item.Key);
            if (available is not null && !available(item.Key)) return false;
            var parameter = "listFilter" + i++;
            conditions.Add($"e.`{column.Name}` <=> @{parameter}");
            parameters.Add(parameter, column.Parse(item.Value));
        }
        return true;
    }
}
