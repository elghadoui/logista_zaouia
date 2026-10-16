using Dapper;
using MySqlConnector;
using System.Security.Claims;
using System.Text.Json;
namespace Vitasouss;
public sealed class PilotCatalog
{
    public Entity[] Entities { get; } = JsonSerializer.Deserialize<Entity[]>(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "pilot-schema.json")), Json.Options)!;
    public Entity Get(string name) => Entities.FirstOrDefault(e => e.Name == name) ?? throw new RuleException("Module inconnu.", 404);
    public static readonly string[] References = ["declaration_verger", "partenaire", "destination", "pays", "marche", "grpemb", "groupart", "defaut", "typeecart"];
    public static readonly Dictionary<string, (string Table, string Date)> Boards = new() { ["receptions"] = ("reception", "dterec"), ["caisserie"] = ("caisserie", "dtecai"), ["versements"] = ("versement", "datver"), ["export"] = ("dossier", "dtedep"), ["ecarts"] = ("ecart_e", "dtepal") };
}
public sealed record PilotMutation(Dictionary<string, JsonElement> Key, Dictionary<string, JsonElement> Before, Dictionary<string, JsonElement> Values);
public sealed class PilotService(Connections connections, PilotCatalog catalog, ReferentialService records)
{
    private sealed record ActualColumn(string Name, string Type, string Engine);
    private static string[] Editable(string name) => name switch { "partenaire" => ["nom"], "destination" => ["vildes"], "groupart" => ["type"], "pays" => ["nompay", "abrpay"], "defaut" => ["intdef"], "typeecart" => ["destype"], _ => [] };
    private async Task<ActualColumn[]> Columns(MySqlConnection db, string name) => (await db.QueryAsync<ActualColumn>("SELECT c.COLUMN_NAME Name,c.COLUMN_TYPE Type,t.ENGINE Engine FROM information_schema.COLUMNS c JOIN information_schema.TABLES t ON t.TABLE_SCHEMA=c.TABLE_SCHEMA AND t.TABLE_NAME=c.TABLE_NAME WHERE c.TABLE_SCHEMA=DATABASE() AND c.TABLE_NAME=@name AND t.TABLE_TYPE='BASE TABLE' ORDER BY c.ORDINAL_POSITION", new { name })).ToArray();
    private async Task<bool> Safe(MySqlConnection db, Entity entity, ActualColumn[] columns)
    {
        if(PilotCatalog.References.Contains(entity.Name)) { try { await ComplementaryService.Check(db,entity,true); return true; } catch(RuleException) { return false; } }
        if (Editable(entity.Name).Length == 0 || columns.Length != entity.Columns.Length || columns.FirstOrDefault()?.Engine != "InnoDB") return false;
        if (!await SchemaGuard.CanInspectTriggers(db, entity.Name)) return false;
        if (entity.Columns.Any(c => !columns.Any(a => a.Name == c.Name && c.Definition.StartsWith(a.Type, StringComparison.OrdinalIgnoreCase)))) return false;
        var unique = await db.QueryAsync("SELECT INDEX_NAME,COLUMN_NAME,SEQ_IN_INDEX FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name AND NON_UNIQUE=0 ORDER BY INDEX_NAME,SEQ_IN_INDEX", new { name = entity.Name });
        return unique.GroupBy(i => (string)i.INDEX_NAME).Any(g => g.Select(i => (string)i.COLUMN_NAME).SequenceEqual(entity.Keys)) && await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE=@name", new { name = entity.Name }) == 0;
    }
    public async Task<object> Read(ContextInfo context, string name, string? search, string? filters, int page, string? from = null, string? to = null, string? dateField = null)
    {
        var entity = catalog.Get(name);
        await using var db = await connections.Business(context);
        var columns = await Columns(db, name);
        var present = entity.Columns.Where(c => columns.Any(a => a.Name == c.Name)).ToArray();
        if (present.Length == 0) return new { available = false, reason = "Table non disponible dans cet exercice.", columns = present, rows = Array.Empty<object>(), total = (long?)null, page, pageSize = 25, canWrite = false, editable = Array.Empty<string>(), evolution = Array.Empty<object>() };
        var p = new DynamicParameters(); var clauses = new List<string>();
        bool Has(string field) => present.Any(c => c.Name == field);
        if (!ListFilters.Apply(entity, filters, p, clauses, Has)) throw new RuleException("Ce filtre n'est pas disponible dans cet exercice.", 409);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var fields = new[] { entity.Label }.Concat(entity.Keys).Distinct().Where(Has).ToArray();
            if (fields.Length == 0) throw new RuleException("Recherche non disponible dans ce schéma.", 409);
            clauses.Add("(" + string.Join(" OR ", fields.Select(f => $"CAST(e.`{f}` AS CHAR) LIKE @search")) + ")"); p.Add("search", "%" + search + "%");
        }
        var dated = dateField is not null && Has(dateField);
        if ((!string.IsNullOrWhiteSpace(from) || !string.IsNullOrWhiteSpace(to)) && !dated) throw new RuleException("Période non disponible : colonne de date absente.", 409);
        foreach (var pair in new[] { (Value: from, Parameter: "from", Operator: ">="), (Value: to, Parameter: "to", Operator: "<") })
            if (!string.IsNullOrWhiteSpace(pair.Value))
            {
                if (!DateTime.TryParseExact(pair.Value, "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var date)) throw new RuleException("Date de période invalide.");
                p.Add(pair.Parameter, pair.Parameter == "to" ? date.AddDays(1) : date); clauses.Add($"e.`{dateField}` {pair.Operator} @{pair.Parameter}");
            }
        var where = clauses.Count > 0 ? " WHERE " + string.Join(" AND ", clauses) : "";
        var total = await db.ExecuteScalarAsync<long>($"SELECT COUNT(*) FROM `{name}` e{where}", p);
        page = Math.Clamp(page, 1, 1000000); p.Add("offset", (page - 1) * 25); p.Add("limit", 25);
        var order = entity.Keys.Where(Has).Concat(present.Select(c => c.Name)).Distinct().Take(4).ToArray();
        var rows = (await db.QueryAsync($"SELECT {string.Join(",", present.Select(c => $"e.`{c.Name}`"))} FROM `{name}` e{where} ORDER BY {string.Join(",", order.Select(c => $"e.`{c}`"))} LIMIT @limit OFFSET @offset", p)).Select(r => ReferentialService.Row((object)r).ToDictionary(v => v.Key, v => v.Value is long number ? (object?)number.ToString(System.Globalization.CultureInfo.InvariantCulture) : v.Value)).ToArray();
        IEnumerable<object> evolution = Array.Empty<object>();
        if (dated) evolution = (await db.QueryAsync($"SELECT DATE(e.`{dateField}`) day,COUNT(*) count FROM `{name}` e{where}{(clauses.Count > 0 ? " AND " : " WHERE ")}e.`{dateField}` IS NOT NULL AND e.`{dateField}`>'0000-00-00' GROUP BY DATE(e.`{dateField}`) ORDER BY day DESC LIMIT 60", p)).Select(r => (object)ReferentialService.Row(r)).ToArray();
        var safe = await Safe(db, entity, columns);
        var displayRows = await new RelationService(connections).Display(context,name,rows);
        return new { available = true, reason = safe ? "Les identifiants historiques sont conservés. Les modifications et suppressions sont contrôlées selon les usages métier ; consultez la fiche pour les protections applicables." : "Consultation disponible ; écritures protégées : schéma, déclencheurs ou identifiants nuls/doublons à valider.", columns = present, keys = entity.Keys, label = entity.Label, rows, displayRows, total, page, pageSize = 25, canWrite = safe && !context.ReadOnly && context.IsMaster && context.Station=="ZAOUIA", editable = ComplementaryService.Editable(name), evolution, periodAvailable = dated, missingColumns = entity.Columns.Where(c => !Has(c.Name)).Select(c => c.Name), quantities = "Tonnage, flux et unités métier non interprétés sans validation. Le compteur porte sur les lignes de la table principale." };
    }
    public async Task<object> Write(ContextInfo context, ClaimsPrincipal user, string name, PilotMutation request, bool create)
    {
        if (!PilotCatalog.References.Contains(name)) throw new RuleException("Écriture de ce module interdite.", 403);
        var entity = catalog.Get(name);
        await using var db = await connections.Business(context);
        if (context.ReadOnly || !await Safe(db, entity, await Columns(db, name))) throw new RuleException("Écriture protégée : clé, schéma ou relations à valider.", 409);
        var permitted = Editable(name).Concat(create ? entity.Keys : []).ToArray();
        if (request.Values.Count == 0 || request.Values.Any(v => !permitted.Contains(v.Key))) throw new RuleException("Seuls les libellés autorisés et les identifiants à la création peuvent être saisis.");
        var values = request.Values.ToDictionary(v => v.Key, v => entity.Column(v.Key).Parse(v.Value));
        if (values.TryGetValue(entity.Label, out var label) && string.IsNullOrWhiteSpace(Convert.ToString(label))) throw new RuleException("Libellé obligatoire.");
        Dictionary<string, object?>? before = null;
        var key = request.Key;
        if (create)
        {
            if (!values.ContainsKey(entity.Label)) throw new RuleException("Libellé obligatoire à la création.");
            if (entity.Keys.Any(k => !values.ContainsKey(k) || values[k] is null)) throw new RuleException("Identifiant historique explicite obligatoire.");
            key = values.Where(v => entity.Keys.Contains(v.Key)).ToDictionary(v => v.Key, v => JsonSerializer.SerializeToElement(entity.Column(v.Key).Definition.StartsWith("bigint") ? (object?)Convert.ToString(v.Value, System.Globalization.CultureInfo.InvariantCulture) : v.Value));
        }
        else
        {
            if (entity.Keys.Any(k => !key.ContainsKey(k) || key[k].ValueKind == JsonValueKind.Null)) throw new RuleException("Une fiche sans identifiant non nul reste en lecture seule.", 409);
            before = await records.Record(db, entity, key);
            if (request.Before.Count != entity.Columns.Length || entity.Columns.Any(c => !request.Before.ContainsKey(c.Name) || !Json.Equal(before[c.Name], c.Parse(request.Before[c.Name])))) throw new RuleException("La fiche a changé. Rechargez-la.", 409);
            if (values.All(v => Json.Equal(before[v.Key], v.Value))) throw new RuleException("Aucune modification à enregistrer.");
        }
        await using var admin = await connections.Admin(); var id = Guid.NewGuid().ToString();
        var after = before is null ? values : new Dictionary<string, object?>(before); foreach (var value in values) after[value.Key] = value.Value;
        object? AuditRow(Dictionary<string, object?>? row) => row?.ToDictionary(v => v.Key, v => entity.Column(v.Key).Definition.StartsWith("bigint") && v.Value is not null ? (object?)Convert.ToString(v.Value, System.Globalization.CultureInfo.InvariantCulture) : v.Value);
        await admin.ExecuteAsync("INSERT INTO app_changes(id,user_id,context_id,entity,record_key,operation,before_json,after_json,patch_json,status,created_at) VALUES(@id,@uid,@cid,@name,@key,@operation,@before,@after,@patch,'Prepared',UTC_TIMESTAMP(6))", new { id, uid = user.FindFirstValue(ClaimTypes.NameIdentifier), cid = context.Id, name, key = Json.Write(key), operation = create ? "Create" : "Update", before = Json.Write(AuditRow(before)), after = Json.Write(AuditRow(after)), patch = Json.Write(AuditRow(values)) });
        try
        {
            if (create)
            {
                var parameters = new DynamicParameters(); foreach (var pair in values) parameters.Add(pair.Key, pair.Value);
                await db.ExecuteAsync($"INSERT INTO `{name}` ({string.Join(",", values.Keys.Select(k => $"`{k}`"))}) VALUES({string.Join(",", values.Keys.Select(k => "@" + k))})", parameters);
            }
            else await records.Update(db, entity, key, before!, values);
        }
        catch (RuleException) { await admin.ExecuteAsync("UPDATE app_changes SET status='Rejected',error='Conflit, fiche inchangée' WHERE id=@id", new { id }); throw; }
        catch (MySqlException) { throw new RuleException("Écriture non confirmée. Vérifiez les privilèges et consultez le journal avant de réessayer.", 409); }
        try { await admin.ExecuteAsync("UPDATE app_changes SET status='Applied',completed_at=UTC_TIMESTAMP(6) WHERE id=@id", new { id }); } catch { return new { id, status = "Prepared", message = "Écriture réalisée ; journal à réconcilier." }; }
        return new { id, status = "Applied", message = "Enregistrement local réalisé. Aucune propagation DIAF." };
    }
    public Task<object> Board(ContextInfo context, string module, string? search, string? filters, int page, string? from, string? to)
    {
        if (!PilotCatalog.Boards.TryGetValue(module, out var board)) throw new RuleException("Tableau de bord inconnu.", 404);
        return Read(context, board.Table, search, filters, page, from, to, board.Date);
    }
}


