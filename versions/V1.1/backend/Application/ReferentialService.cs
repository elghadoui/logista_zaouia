using Dapper;
using MySqlConnector;
using System.Security.Claims;
using System.Text.Json;

namespace Vitasouss;

public sealed class ReferentialService(Connections connections, Catalog catalog)
{
    public static Dictionary<string, object?> Row(object row) => ((IDictionary<string, object?>)row).ToDictionary(x => x.Key, x => Normalize(x.Value));
    private static object? Normalize(object? value)
    {
        if (value is MySqlDateTime mysqlDate)
            return mysqlDate.IsValidDateTime ? mysqlDate.GetDateTime() : null;
        return value is DateTime d && d == DateTime.MinValue ? null : value;
    }
    public static (string Sql, DynamicParameters Parameters) Where(Entity entity, Dictionary<string, JsonElement> key, string prefix = "k")
    {
        if (key.Count != entity.Keys.Length || entity.Keys.Any(k => !key.ContainsKey(k)))
            throw new RuleException("Clé historique complète obligatoire.");
        var p = new DynamicParameters();
        foreach (var k in entity.Keys)
            p.Add(prefix + k, entity.Column(k).Parse(key[k]));
        return (string.Join(" AND ", entity.Keys.Select(k => $"`{k}` <=> @{prefix}{k}")), p);
    }
    public async Task<Dictionary<string, object?>> Record(MySqlConnection db, Entity entity, Dictionary<string, JsonElement> key, MySqlTransaction? transaction = null)
    {
        var (where, p) = Where(entity, key);
        var records = (await db.QueryAsync($"SELECT * FROM `{entity.Name}` WHERE {where} LIMIT 2", p, transaction)).ToArray();
        if (records.Length == 0)
            throw new RuleException("Enregistrement absent.", 404);
        if (records.Length > 1)
            throw new RuleException("Identifiant historique ambigu : plusieurs enregistrements. Modification refusée.", 409);
        return Row(records[0]);
    }
    public async Task<object> List(ContextInfo context, string name, string? search, int page, int pageSize, string? sort, bool descending, string? filter, string? value, bool presentation = false)
    {
        var entity = catalog.Get(name);
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        sort = string.IsNullOrEmpty(sort) ? entity.Label : entity.Column(sort).Name;
        var p = new DynamicParameters();
        var clauses = new List<string>();
        if (!string.IsNullOrWhiteSpace(search))
        {
            clauses.Add($"(e.`{entity.Label}` LIKE @search OR CAST(e.`{entity.Keys[0]}` AS CHAR) LIKE @search)");
            p.Add("search", "%" + search + "%");
        }
        if (!string.IsNullOrEmpty(filter))
        {
            entity.Column(filter);
            clauses.Add($"e.`{filter}` <=> @filter");
            p.Add("filter", entity.Column(filter).Parse(JsonSerializer.SerializeToElement(value)));
        }
        var where = clauses.Count > 0 ? " WHERE " + string.Join(" AND ", clauses) : "";
        p.Add("limit", pageSize);
        p.Add("offset", (page - 1) * pageSize);
        await using var db = await connections.Business(context);
        var total = await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM `{name}` e{where}", p);
        var projection = presentation ? PresentationService.Projection(name) : (Select: "", Joins: "");
        var extra = string.IsNullOrEmpty(projection.Select) ? "" : "," + projection.Select;
        object? summary = name == "parcelle" ? await db.QuerySingleAsync($"SELECT COUNT(*) count,SUM(e.suppar) surface FROM parcelle e{where}", p) : null;
        var rows = (await db.QueryAsync($"SELECT e.*{extra} FROM `{name}` e{projection.Joins}{where} ORDER BY e.`{sort}` {(descending ? "DESC" : "ASC")}, {string.Join(",", entity.Keys.Select(k => $"e.`{k}`"))} LIMIT @limit OFFSET @offset", p)).Select(Row).ToArray();
        return new
        {
            total,
            page,
            pageSize,
            summary,
            rows
        };
    }
    public async Task Validate(MySqlConnection db, Entity entity, Dictionary<string, object?> row)
    {
        async Task Exists(string field, string table, string key)
        {
            if (!row.TryGetValue(field, out var v) || v is null)
                return;
            if (await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM `{table}` WHERE `{key}`=@value", new
            {
                value = v
            }) != 1)
                throw new RuleException($"{field} : référence absente ou ambiguë.");
        }
        if (entity.Name == "verger")
            await Exists("refadh", "adherent", "refadh");
        if (entity.Name == "variete")
        {
            await Exists("codcul", "culture", "codcul");
            await Exists("codgrv", "grpvar", "codgrv");
        }
        if (entity.Name == "souvar")
            await Exists("codvar", "variete", "codvar");
        if (entity.Name == "parcelle")
        {
            await Exists("refver", "verger", "refver");
            await Exists("codvar", "variete", "codvar");
            foreach (var pair in new[] { ("codvar", "codsvar"), ("codvar2", "souvar2") })
            {
                row.TryGetValue(pair.Item1, out var variety);
                row.TryGetValue(pair.Item2, out var sub);
                if (sub is not null && Convert.ToDecimal(sub) != 0 && (variety is null || await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM souvar WHERE codvar=@variety AND codsvar=@sub", new
                {
                    variety,
                    sub
                }) != 1))
                    throw new RuleException("La sous-variété doit appartenir à la variété choisie et être unique.");
            }
            if (row.TryGetValue("codvar2", out var secondary) && secondary is not null && Convert.ToDecimal(secondary) != 0)
                await Exists("codvar2", "variete", "codvar");
        }
        foreach (var field in new[] { "supver", "suppar", "nbrarb", "estimation", "ecarte", "espace" })
            if (row.TryGetValue(field, out var val) && val is not null && Convert.ToDecimal(val) < 0)
                throw new RuleException($"{field} doit être positif.");
        foreach (var (field, max) in new[] { ("latitude", 90m), ("longitude", 180m) })
            if (row.TryGetValue(field, out var val) && val is not null && (!decimal.TryParse(Convert.ToString(val), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var coord) || Math.Abs(coord) > max))
                throw new RuleException($"{field} invalide.");
    }
    public async Task Update(MySqlConnection db, Entity entity, Dictionary<string, JsonElement> key, Dictionary<string, object?> expected, Dictionary<string, object?> patch)
    {
        var (where, p) = Where(entity, key);
        foreach (var col in entity.Columns)
        {
            if (!expected.ContainsKey(col.Name))
                throw new RuleException("Aperçu incomplet : rechargez la fiche.", 409);
            if (col.Date && expected[col.Name] is null)
            {
                // Le schéma historique contient des dates zéro. La lecture les expose comme absence
                // de date, mais l'UPDATE doit toujours reconnaître leur représentation SQL réelle.
                where += $" AND (`{col.Name}` IS NULL OR CAST(`{col.Name}` AS CHAR) IN ('0000-00-00','0000-00-00 00:00:00'))";
            }
            else
            {
                where += $" AND `{col.Name}` <=> @old_{col.Name}";
                p.Add("old_" + col.Name, expected[col.Name]);
            }
        }
        foreach (var item in patch)
            p.Add("v_" + item.Key, item.Value);
        if (patch.Count == 0)
            return;
        var updated = await db.ExecuteAsync($"UPDATE `{entity.Name}` SET {string.Join(",", patch.Keys.Select(k => $"`{k}`=@v_{k}"))} WHERE {where} LIMIT 1", p);
        if (updated != 1)
            throw new RuleException("La fiche a changé depuis votre consultation. Rechargez avant de réessayer.", 409);
    }
    public async Task<object> Save(ContextInfo context, ClaimsPrincipal user, string name, SaveRequest request)
    {
        var entity = catalog.Get(name);
        if (request.Synchronize && (!context.IsMaster || context.Station != "ZAOUIA"))
            throw new RuleException("Seule ZAOUIA maître peut synchroniser vers DIAF.");
        await using var db = await connections.Business(context);
        var before = await Record(db, entity, request.Key);
        if (request.Before.Count != entity.Columns.Length || entity.Columns.Any(c => !request.Before.ContainsKey(c.Name) || !Json.Equal(before[c.Name], c.Parse(request.Before[c.Name]))))
            throw new RuleException("La fiche a changé. Rechargez-la.", 409);
        var patch = new Dictionary<string, object?>();
        foreach (var item in request.Values)
        {
            var column = entity.Column(item.Key);
            if (entity.Keys.Contains(item.Key) || column.Generated)
                throw new RuleException("Les clés historiques et champs générés sont protégés.");
            var parsed = column.Parse(item.Value);
            if (!Json.Equal(before[item.Key], parsed))
                patch[item.Key] = parsed;
        }
        if (patch.Count == 0)
            throw new RuleException("Aucune modification à enregistrer.");
        var after = new Dictionary<string, object?>(before);
        foreach (var pair in patch)
            after[pair.Key] = pair.Value;
        await Validate(db, entity, after);
        var id = Guid.NewGuid().ToString();
        await using (var admin = await connections.Admin())
        {
            await using var tx = await admin.BeginTransactionAsync();
            await admin.ExecuteAsync("INSERT INTO app_changes(id,user_id,context_id,entity,record_key,operation,before_json,after_json,patch_json,sync_requested,status,created_at) VALUES(@id,@uid,@cid,@name,@key,'Update',@before,@after,@patch,@sync,'Prepared',UTC_TIMESTAMP(6))", new
            {
                id,
                uid = user.FindFirstValue(ClaimTypes.NameIdentifier),
                cid = context.Id,
                name,
                key = Json.Write(request.Key),
                before = Json.Write(before),
                after = Json.Write(after),
                patch = Json.Write(patch),
                sync = request.Synchronize
            }, tx);
            if (request.Synchronize)
            {
                var targets = await admin.QueryAsync<int>("SELECT r.target_context_id FROM app_sync_routes r JOIN app_contexts c ON c.id=r.target_context_id JOIN app_stations s ON s.id=c.station_id WHERE r.source_context_id=@id AND r.enabled=1 AND c.enabled=1 AND s.code='DIAF'", new
                {
                    id = context.Id
                }, tx);
                if (!targets.Any())
                    throw new RuleException("DIAF n’est pas configuré pour cet exercice. Choisissez ZAOUIA uniquement.");
                foreach (var target in targets)
                {
                    await connections.Resolve(target, user, true);
                    await admin.ExecuteAsync("INSERT INTO app_sync_jobs(id,change_id,target_context_id,status,created_at,updated_at) VALUES(@job,@id,@target,'AwaitingSource',UTC_TIMESTAMP(6),UTC_TIMESTAMP(6))", new
                    {
                        job = Guid.NewGuid().ToString(),
                        id,
                        target
                    }, tx);
                }
            }
            await tx.CommitAsync();
        }
        try
        {
            await Update(db, entity, request.Key, before, patch);
        }
        catch (Exception) { await using var admin = await connections.Admin(); await admin.ExecuteAsync("UPDATE app_changes SET status='Rejected',error='Modification refusée ou résultat à vérifier' WHERE id=@id", new { id }); throw; }
        // Les deux serveurs ne partagent pas de transaction. Prepared reste récupérable en cas de panne admin.
        try
        {
            await using var admin = await connections.Admin();
            await using var tx = await admin.BeginTransactionAsync();
            await admin.ExecuteAsync("UPDATE app_changes SET status='Applied',completed_at=UTC_TIMESTAMP(6) WHERE id=@id; UPDATE app_sync_jobs SET status='Pending',updated_at=UTC_TIMESTAMP(6) WHERE change_id=@id", new
            {
                id
            }, tx);
            await tx.CommitAsync();
        }
        catch { return new { id, message = "Modification enregistrée. Journal à réconcilier par l’administrateur.", synchronization = "Reconciliation" }; }
        return new
        {
            id,
            message = request.Synchronize ? "Modification enregistrée dans ZAOUIA. Synchronisation DIAF en attente de votre confirmation." : "Modification enregistrée.",
            synchronization = request.Synchronize ? "Pending" : "NotRequested"
        };
    }
    public async Task<object> Create(ContextInfo context, ClaimsPrincipal user, string name, CreateRequest request)
    {
        var entity = catalog.Get(name);
        if (name == "souvar")
            throw new RuleException("Création sous-variété suspendue : absence de clé unique dans le schéma historique. Validation DBA nécessaire.", 409);
        var values = new Dictionary<string, object?>();
        foreach (var item in request.Values)
        {
            var c = entity.Column(item.Key);
            if (c.Generated)
                throw new RuleException("Champ généré protégé.");
            values[item.Key] = c.Parse(item.Value);
        }
        foreach (var c in entity.Columns.Where(c => !c.Generated && !c.Nullable && !c.Definition.Contains("DEFAULT")))
            if (!values.ContainsKey(c.Name))
                throw new RuleException($"{c.Name} obligatoire.");
        foreach (var k in entity.Keys.Where(k => !entity.Column(k).Generated))
            if (!values.ContainsKey(k) || values[k] is null)
                throw new RuleException($"Identifiant historique {k} obligatoire.");
        await using var db = await connections.Business(context);
        await Validate(db, entity, values);
        var id = Guid.NewGuid().ToString();
        await using var admin = await connections.Admin();
        await admin.ExecuteAsync("INSERT INTO app_changes(id,user_id,context_id,entity,record_key,operation,after_json,patch_json,status,created_at) VALUES(@id,@uid,@cid,@name,@key,'Create',@after,@after,'Prepared',UTC_TIMESTAMP(6))", new
        {
            id,
            uid = user.FindFirstValue(ClaimTypes.NameIdentifier),
            cid = context.Id,
            name,
            key = Json.Write(values.Where(x => entity.Keys.Contains(x.Key)).ToDictionary(x => x.Key, x => x.Value)),
            after = Json.Write(values)
        });
        var p = new DynamicParameters();
        foreach (var pair in values)
            p.Add(pair.Key, pair.Value);
        try
        {
            await using var tx = await db.BeginTransactionAsync();
            await db.ExecuteAsync($"INSERT INTO `{name}` ({string.Join(",", values.Keys.Select(k => $"`{k}`"))}) VALUES ({string.Join(",", values.Keys.Select(k => $"@{k}"))})", p, tx);
            if (entity.Columns.Any(c => c.Definition.Contains("AUTO_INCREMENT")))
                values["idparcelle"] = await db.ExecuteScalarAsync<long>("SELECT LAST_INSERT_ID()", transaction: tx);
            // Audit durable avant commit; la réconciliation vérifie un éventuel commit incertain.
            await admin.ExecuteAsync("UPDATE app_changes SET record_key=@key,after_json=@after WHERE id=@id", new
            {
                id,
                key = Json.Write(values.Where(x => entity.Keys.Contains(x.Key)).ToDictionary(x => x.Key, x => x.Value)),
                after = Json.Write(values)
            });
            await tx.CommitAsync();
        }
        catch (MySqlException ex) when (ex.Number == 1062) { await admin.ExecuteAsync("UPDATE app_changes SET status='Rejected',error='Identifiant déjà utilisé' WHERE id=@id", new { id }); throw new RuleException("Cet identifiant historique est déjà utilisé.", 409); }
        try
        {
            await admin.ExecuteAsync("UPDATE app_changes SET status='Applied',completed_at=UTC_TIMESTAMP(6) WHERE id=@id", new
            {
                id
            });
        }
        catch { return new { id, message = "Création enregistrée. Journal à réconcilier." }; }
        return new
        {
            id,
            message = "Enregistrement créé. La création dans DIAF nécessite une initialisation contrôlée."
        };
    }
    public async Task<object> Dependencies(ContextInfo context, string name, Dictionary<string, JsonElement> key)
    {
        var entity = catalog.Get(name);
        Where(entity, key);
        await using var db = await connections.Business(context);
        var columns = await db.QueryAsync("SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND COLUMN_NAME IN ('refadh','refver','refpar','codvar','codvar2','codgrv','codsvar','souvar2','codcul','idparcelle','numcul')");
        var found = new List<object>();
        foreach (var group in columns.GroupBy(c => (string)c.TABLE_NAME))
        {
            if (group.Key == name || !System.Text.RegularExpressions.Regex.IsMatch(group.Key, @"^[a-zA-Z0-9_]+$"))
                continue;
            var fields = group.Select(x => (string)x.COLUMN_NAME).ToArray();
            var matched = entity.Keys.Where(fields.Contains).ToArray();
            if (matched.Length == 0)
                continue;
            var p = new DynamicParameters();
            foreach (var k in matched)
                p.Add(k, entity.Column(k).Parse(key[k]));
            var count = await db.ExecuteScalarAsync<long>($"SELECT COUNT(*) FROM `{group.Key}` WHERE {string.Join(" AND ", matched.Select(k => $"`{k}` <=> @{k}"))}", p);
            if (count > 0)
                found.Add(new
                {
                    table = group.Key,
                    count,
                    fields = matched
                });
        }
        return new
        {
            canDelete = false,
            reason = "Les suppressions physiques sont désactivées en V1. Utilisez le blocage du verger si nécessaire. Les dépendances par noms de colonnes constituent un contrôle conservateur, pas une preuve exhaustive.",
            dependencies = found
        };
    }
}

