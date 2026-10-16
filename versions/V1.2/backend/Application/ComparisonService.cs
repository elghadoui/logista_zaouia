using Dapper;
using MySqlConnector;
using System.Globalization;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Text;

namespace Vitasouss;

public sealed record ComparisonDifference(string Field, object? Before, object? After);
public sealed record ComparisonRow(string Status, Dictionary<string, object?> Key, Dictionary<string, object?>? Source, Dictionary<string, object?>? Target, long SourceCount, long TargetCount, List<ComparisonDifference> Differences);
public sealed class ComparisonService(Connections connections, Catalog catalog)
{
    private sealed record Shape(string Name, string Type);
    private sealed record Group(Dictionary<string, object?> First, long Count);
    private sealed class Groups(IAsyncEnumerator<Dictionary<string, object?>> rows, Entity entity) : IAsyncDisposable
    {
        private Dictionary<string, object?>? next;
        private bool started;
        public async Task<Group?> Read()
        {
            if (!started)
            {
                started = true;
                next = await rows.MoveNextAsync() ? rows.Current : null;
            }
            if (next is null)
                return null;
            var first = next;
            long count = 0;
            do
            {
                count++;
                next = await rows.MoveNextAsync() ? rows.Current : null;
            } while (next is not null && CompareKeys(entity, first, next) == 0);
            return new(first, count);
        }
        public ValueTask DisposeAsync() => rows.DisposeAsync();
    }
    public async Task<object> Targets(int sourceId, ClaimsPrincipal user)
    {
        var source = await Source(sourceId, user);
        await using var admin = await connections.Admin();
        var ids = await admin.QueryAsync<int>("SELECT r.target_context_id FROM app_sync_routes r JOIN app_contexts c ON c.id=r.target_context_id JOIN app_stations s ON s.id=c.station_id WHERE r.source_context_id=@id AND r.enabled=1 AND c.enabled=1 AND s.code='DIAF' ORDER BY c.id", new
        {
            id = source.Id
        });
        var targets = new List<object>();
        foreach (var id in ids)
        {
            try
            {
                var target = await connections.Resolve(id, user);
                targets.Add(new
                {
                    target.Id,
                    target.Label,
                    target.Station
                });
            }
            catch (RuleException e) when (e.Status == 403) { /* Ne pas exposer un exercice non attribué. */ }
        }
        return targets;
    }
    private async Task<ContextInfo> Source(int id, ClaimsPrincipal user)
    {
        var source = await connections.Resolve(id, user);
        if (!source.IsMaster || source.Station != "ZAOUIA")
            throw new RuleException("Sélectionnez un contexte ZAOUIA maître pour comparer les référentiels.", 409);
        return source;
    }
    private static int CompareKeys(Entity entity, Dictionary<string, object?> a, Dictionary<string, object?> b)
    {
        foreach (var key in entity.Keys)
        {
            var left = a[key];
            var right = b[key];
            var comparison = left is null ? (right is null ? 0 : -1) : right is null ? 1 : entity.Column(key).Numeric
                ? Convert.ToDecimal(left, CultureInfo.InvariantCulture).CompareTo(Convert.ToDecimal(right, CultureInfo.InvariantCulture))
                : Encoding.UTF8.GetBytes(Convert.ToString(left, CultureInfo.InvariantCulture)!).AsSpan().SequenceCompareTo(Encoding.UTF8.GetBytes(Convert.ToString(right, CultureInfo.InvariantCulture)!));
            if (comparison != 0)
                return comparison;
        }
        return 0;
    }
    private static async IAsyncEnumerable<Dictionary<string, object?>> Rows(MySqlConnection db, MySqlTransaction tx, Entity entity, [EnumeratorCancellation] CancellationToken cancellation)
    {
        var order = string.Join(",", entity.Keys.Select(k => entity.Column(k).Numeric ? $"`{k}`" : $"CAST(CONVERT(`{k}` USING utf8mb4) AS BINARY)"));
        await foreach (var row in db.QueryUnbufferedAsync($"SELECT * FROM `{entity.Name}` ORDER BY {order}", transaction: tx, commandTimeout: 60).WithCancellation(cancellation))
            yield return ReferentialService.Row((object)row);
    }
    private static async Task<HashSet<string>> Columns(MySqlConnection db, Entity entity)
    {
        var fields = (await db.QueryAsync<Shape>("SELECT COLUMN_NAME Name,COLUMN_TYPE Type FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name", new
        {
            name = entity.Name
        })).ToArray();
        if (entity.Keys.Any(k => !fields.Any(f => f.Name == k && entity.Column(k).Definition.StartsWith(f.Type, StringComparison.OrdinalIgnoreCase))))
            throw new RuleException("Identifiants absents ou types incompatibles dans un exercice : comparaison suspendue.", 409);
        return fields.Select(f => f.Name).ToHashSet();
    }
    private static bool Matches(Entity entity, Group? source, Group? target, string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
            return true;
        return new[] { source, target }.Where(g => g is not null).Any(g => entity.Keys.Append(entity.Label).Any(k => g!.First.TryGetValue(k, out var v) && Convert.ToString(v, CultureInfo.InvariantCulture)?.Contains(search.Trim(), StringComparison.OrdinalIgnoreCase) == true));
    }
    private static void ValidateStatus(string status)
    {
        if (status is not ("All" or "Different" or "SourceOnly" or "TargetOnly" or "Ambiguous"))
            throw new RuleException("État de comparaison invalide.");
    }
    private async Task<(Dictionary<string, long> Summary, List<string> Warnings, ContextInfo Source, ContextInfo Target)> Walk(int sourceId, int targetId, string name, string? search, ClaimsPrincipal user, Func<ComparisonRow, Task> accept, CancellationToken cancellation)
    {
        var source = await Source(sourceId, user);
        var target = await connections.Resolve(targetId, user);
        await using var admin = await connections.Admin();
        if (target.Station != "DIAF" || await admin.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_sync_routes WHERE source_context_id=@sourceId AND target_context_id=@targetId AND enabled=1", new
        {
            sourceId,
            targetId
        }) != 1)
            throw new RuleException("Destination DIAF non autorisée pour ce contexte. Vérifiez la route configurée.", 403);
        var entity = catalog.Get(name);
        await using var sourceDb = await connections.Business(source);
        await using var targetDb = await connections.Business(target);
        var sourceColumns = await Columns(sourceDb, entity);
        var targetColumns = await Columns(targetDb, entity);
        var useful = entity.Columns.Where(c => c.Name != "refsta" && !c.Generated && !entity.Keys.Contains(c.Name)).ToArray();
        var common = useful.Where(c => sourceColumns.Contains(c.Name) && targetColumns.Contains(c.Name)).ToArray();
        var missing = useful.Except(common).Select(c => c.Name).ToArray();
        var warnings = new List<string>();
        if (missing.Any())
            warnings.Add("Colonnes absentes d’un exercice, non comparées : " + string.Join(", ", missing));
        var known = entity.Columns.Select(c => c.Name).ToHashSet();
        var extra = sourceColumns.Union(targetColumns).Where(c => !known.Contains(c)).ToArray();
        if (extra.Any())
            warnings.Add("Colonnes hors catalogue, non comparées : " + string.Join(", ", extra));
        var summary = new Dictionary<string, long> { ["SourceRows"] = 0, ["TargetRows"] = 0, ["Equal"] = 0, ["Different"] = 0, ["SourceOnly"] = 0, ["TargetOnly"] = 0, ["Ambiguous"] = 0 };
        await using var sourceTx = await sourceDb.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead, cancellation);
        await using var targetTx = await targetDb.BeginTransactionAsync(System.Data.IsolationLevel.RepeatableRead, cancellation);
        await using var sources = new Groups(Rows(sourceDb, sourceTx, entity, cancellation).GetAsyncEnumerator(cancellation), entity);
        await using var targets = new Groups(Rows(targetDb, targetTx, entity, cancellation).GetAsyncEnumerator(cancellation), entity);
        var left = await sources.Read();
        var right = await targets.Read();
        while (left is not null || right is not null)
        {
            cancellation.ThrowIfCancellationRequested();
            var comparison = left is null ? 1 : right is null ? -1 : CompareKeys(entity, left.First, right.First);
            var a = comparison <= 0 ? left : null;
            var b = comparison >= 0 ? right : null;
            if (Matches(entity, a, b, search))
            {
                summary["SourceRows"] += a?.Count ?? 0;
                summary["TargetRows"] += b?.Count ?? 0;
                var state = a?.Count > 1 || b?.Count > 1 ? "Ambiguous" : a is null ? "TargetOnly" : b is null ? "SourceOnly" : "Equal";
                var differences = new List<ComparisonDifference>();
                if (state != "Ambiguous")
                    foreach (var column in common)
                    {
                        var before = b?.First[column.Name];
                        var after = a?.First[column.Name];
                        if (!Json.Equal(before, after))
                            differences.Add(new(column.Name, before, after));
                    }
                if (state == "Equal" && differences.Count > 0)
                    state = "Different";
                summary[state]++;
                var row = a?.First ?? b!.First;
                if (state != "Equal")
                    await accept(new(state, entity.Keys.ToDictionary(k => k, k => row[k]), a?.Count > 1 ? null : a?.First, b?.Count > 1 ? null : b?.First, a?.Count ?? 0, b?.Count ?? 0, differences));
            }
            if (comparison <= 0)
                left = await sources.Read();
            if (comparison >= 0)
                right = await targets.Read();
        }
        // Transactions en lecture seule de fait ; souvar/MyISAM reste une observation à l'instant de lecture.
        if (name == "souvar")
            warnings.Add("Les sous-variétés n’ont pas de contrainte unique ; les doublons sont signalés, jamais rapprochés arbitrairement.");
        return (summary, warnings, source, target);
    }
    public async Task<object> Report(int sourceId, int targetId, string name, string? search, string status, int page, int pageSize, ClaimsPrincipal user, CancellationToken cancellation)
    {
        ValidateStatus(status);
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var rows = new List<ComparisonRow>();
        long total = 0;
        var snapshot = await Walk(sourceId, targetId, name, search, user, row =>
        {
            if (status != "All" && row.Status != status)
                return Task.CompletedTask;
            if (total >= (long)(page - 1) * pageSize && rows.Count < pageSize)
                rows.Add(row);
            total++;
            return Task.CompletedTask;
        }, cancellation);
        return new
        {
            rows,
            total,
            page,
            pageSize,
            snapshot.Summary,
            snapshot.Warnings,
            comparedAt = DateTime.UtcNow,
            sourceLabel = snapshot.Source.Label,
            targetLabel = snapshot.Target.Label,
            excluded = new[] { "refsta", "champs générés" }
        };
    }
    private static string Cell(object? value)
    {
        var text = value is DateTime date ? date.ToString("O") : Convert.ToString(value, CultureInfo.InvariantCulture) ?? "";
        var probe = text.TrimStart();
        if (text.Length > 0 && ("\t\r\n".Contains(text[0]) || (probe.Length > 0 && "=+-@".Contains(probe[0]))))
            text = "'" + text;
        return "\"" + text.Replace("\"", "\"\"") + "\"";
    }
    public async Task<byte[]> Export(int sourceId, int targetId, string name, string? search, string status, ClaimsPrincipal user, CancellationToken cancellation)
    {
        ValidateStatus(status);
        var csv = new StringBuilder("Référentiel;État;Identifiants;Champ;ZAOUIA;DIAF\r\n");
        long lines = 0;
        var snapshot = await Walk(sourceId, targetId, name, search, user, row =>
        {
            if (status != "All" && row.Status != status)
                return Task.CompletedTask;
            var differences = row.Differences.Any() ? row.Differences : [new ComparisonDifference("Identité / présence", row.TargetCount, row.SourceCount)];
            foreach (var difference in differences)
            {
                if (++lines > 50000)
                    throw new RuleException("Export trop volumineux : affinez la recherche ou l’état demandé.", 409);
                csv.AppendLine(string.Join(";", new object?[] { name, row.Status, Json.Write(row.Key), difference.Field, difference.After, difference.Before }.Select(Cell)));
            }
            return Task.CompletedTask;
        }, cancellation);
        foreach (var warning in snapshot.Warnings)
            csv.AppendLine(string.Join(";", new object?[] { name, "Avertissement", "", warning, "", "" }.Select(Cell)));
        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray();
    }
}
