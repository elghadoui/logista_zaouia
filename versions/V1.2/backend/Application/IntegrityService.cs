using Dapper;
using MySqlConnector;
using System.Security.Claims;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Vitasouss;

public sealed record Dependency(string Table, long Count, string[] Fields);
public sealed record DeleteInspection(bool CanDelete, string Reason, List<Dependency> Dependencies, List<string> Restrictions);

// Aucune suppression en cascade ni opération destructive vers DIAF.
public sealed class IntegrityService(Connections connections, Catalog catalog, ReferentialService records, ILogger<IntegrityService> logger)
{
    private sealed record FieldInfo(string TableName, string ColumnName, string ColumnType, string Engine);
    private sealed record ForeignField(string TableName, string SchemaName, string ConstraintName, string ColumnName, string ParentColumn);
    private sealed record Reference(string Table, string[] Fields, string Condition, Dictionary<string, object?> Values);
    private sealed record Plan(List<FieldInfo> Columns, List<Reference> References, List<string> Restrictions);
    private static string Q(string name) => "`" + name.Replace("`", "``") + "`";

    public Task<object> Transfer(ContextInfo context, ClaimsPrincipal user, TransferRequest request)
    {
        // Le schéma confirme refadh, relation simple vers adherent.refadh. Les historiques restent attachés à refver.
        if (!catalog.Get("verger").Columns.Any(c => c.Name == "refadh"))
            throw new RuleException("Relation adhérent/verger non reconnue : transfert suspendu.", 409);
        return records.Save(context, user, "verger", new SaveRequest(request.Key, request.Before,
            new()
            {
                ["refadh"] = JsonSerializer.SerializeToElement(request.NewAdherent)
            }, request.Synchronize), "Transfer");
    }

    private async Task<Plan> BuildPlan(MySqlConnection db, Entity entity, Dictionary<string, object?> row)
    {
        var columns = (await db.QueryAsync<FieldInfo>("SELECT c.TABLE_NAME TableName,c.COLUMN_NAME ColumnName,c.COLUMN_TYPE ColumnType,t.ENGINE Engine FROM information_schema.COLUMNS c JOIN information_schema.TABLES t ON t.TABLE_SCHEMA=c.TABLE_SCHEMA AND t.TABLE_NAME=c.TABLE_NAME WHERE c.TABLE_SCHEMA=DATABASE() AND t.TABLE_TYPE='BASE TABLE' ORDER BY c.TABLE_NAME,c.ORDINAL_POSITION")).ToList();
        var restrictions = new List<string>();
        var account = await db.ExecuteScalarAsync<string>("SELECT CURRENT_USER()");
        var separator = account!.LastIndexOf('@');
        var grantee = "'" + account[..separator].Replace("'", "''") + "'@'" + account[(separator + 1)..].Replace("'", "''") + "'";
        var completeRead = await db.ExecuteScalarAsync<int>("SELECT (SELECT COUNT(*) FROM information_schema.SCHEMA_PRIVILEGES WHERE GRANTEE=@grantee AND PRIVILEGE_TYPE='SELECT' AND DATABASE() LIKE TABLE_SCHEMA)+(SELECT COUNT(*) FROM information_schema.USER_PRIVILEGES WHERE GRANTEE=@grantee AND PRIVILEGE_TYPE='SELECT')", new { grantee });
        if (completeRead == 0) restrictions.Add("Le compte SQL doit disposer de SELECT sur toute cette base pour contrôler les dépendances sans tables masquées. Suppression suspendue.");
        var primary = (await db.QueryAsync<string>("SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION", new
        {
            name = entity.Name
        })).ToArray();
        if (!primary.SequenceEqual(entity.Keys) || columns.FirstOrDefault(c => c.TableName == entity.Name)?.Engine != "InnoDB")
            restrictions.Add("Clé ou moteur historique différent du schéma validé. Suppression suspendue.");
        if (columns.Count(c => c.TableName == entity.Name) != entity.Columns.Length || entity.Columns.Any(expected => !columns.Any(actual => actual.TableName == entity.Name && actual.ColumnName == expected.Name && expected.Definition.StartsWith(actual.ColumnType, StringComparison.OrdinalIgnoreCase))))
            restrictions.Add("Colonnes ou types historiques différents du catalogue validé. Suppression suspendue.");
        if (await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE=@name", new
        {
            name = entity.Name
        }) > 0)
            restrictions.Add("Cette table possède des déclencheurs : leurs effets doivent être validés avant suppression.");
        var references = new List<Reference>();
        foreach (var table in columns.Where(c => c.TableName != entity.Name).GroupBy(c => c.TableName))
        {
            var fields = table.Select(c => c.ColumnName).ToArray();
            var predicates = new List<string>();
            var used = new List<string>();
            var values = new Dictionary<string, object?>();
            void Add(string[] names, object?[] actual)
            {
                var terms = new List<string>();
                for (var i = 0; i < names.Length; i++)
                {
                    var parameter = "p" + values.Count;
                    values[parameter] = actual[i];
                    terms.Add($"{Q(names[i])} <=> @{parameter}");
                    used.Add(names[i]);
                }
                predicates.Add("(" + string.Join(" AND ", terms) + ")");
            }
            if (entity.Name == "verger")
            {
                foreach (var f in fields.Where(f => f.StartsWith("refver", StringComparison.OrdinalIgnoreCase) || f is "verger_id" or "idverger"))
                    Add([f], [row["refver"]]);
            }
            else
            {
                foreach (var f in fields.Where(f => f is "idpar" or "idparcelle" or "parcelle_id" or "id_parcelle"))
                    Add([f], [row["idparcelle"]]);
                foreach (var f in fields.Where(f => f.StartsWith("refpar", StringComparison.OrdinalIgnoreCase)))
                {
                    var identity = new List<string> { f };
                    var actual = new List<object?> { row["refpar"] };
                    // Une référence parcelle peut se répéter entre vergers/cultures : utiliser tout le tuple disponible.
                    foreach (var scope in new[] { "refver", "numcul" })
                        if (fields.Contains(scope))
                        {
                            identity.Add(scope);
                            actual.Add(row[scope]);
                        }
                    Add(identity.ToArray(), actual.ToArray());
                }
                if (!predicates.Any() && fields.Contains("refver") && fields.Contains("numcul"))
                    Add(["refver", "numcul"], [row["refver"], row["numcul"]]);
            }
            if (predicates.Any())
                references.Add(new(table.Key, used.Distinct().ToArray(), string.Join(" OR ", predicates), values));
            // Une identité nouvelle non reconnue n'est jamais ignorée silencieusement.
            if (fields.Any(f => Regex.IsMatch(f, entity.Name == "verger" ? @"^(id|ref|cod).*verger" : @"^(id|ref|cod).*parcell", RegexOptions.IgnoreCase) && !used.Contains(f)))
                restrictions.Add($"Relation non reconnue dans {table.Key}. Validation du schéma nécessaire.");
        }
        var foreign = await db.QueryAsync<ForeignField>("SELECT TABLE_NAME TableName,TABLE_SCHEMA SchemaName,CONSTRAINT_NAME ConstraintName,COLUMN_NAME ColumnName,REFERENCED_COLUMN_NAME ParentColumn FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_NAME=@name ORDER BY TABLE_SCHEMA,TABLE_NAME,CONSTRAINT_NAME,ORDINAL_POSITION", new
        {
            name = entity.Name
        });
        var schema = await db.ExecuteScalarAsync<string>("SELECT DATABASE()");
        foreach (var group in foreign.GroupBy(f => (f.SchemaName, f.TableName, f.ConstraintName)))
        {
            if (group.Key.SchemaName != schema || group.Key.TableName == entity.Name)
            {
                restrictions.Add("Une clé étrangère externe ou réflexive exige une validation spécifique.");
                continue;
            }
            var values = new Dictionary<string, object?>();
            var terms = group.Select(f => { var parameter = "f" + values.Count; values[parameter] = row[f.ParentColumn]; return $"{Q(f.ColumnName)} <=> @{parameter}"; }).ToArray();
            references.Add(new(group.Key.TableName, group.Select(f => f.ColumnName).ToArray(), string.Join(" AND ", terms), values));
        }
        return new(columns, references, restrictions);
    }

    private async Task<DeleteInspection> Inspect(MySqlConnection db, ContextInfo context, Entity entity, Dictionary<string, object?> row, Plan plan)
    {
        var found = new List<Dependency>();
        foreach (var reference in plan.References)
        {
            var count = await db.ExecuteScalarAsync<long>($"SELECT COUNT(*) FROM {Q(reference.Table)} WHERE {reference.Condition}", reference.Values);
            if (count > 0)
                found.Add(new(reference.Table, count, reference.Fields));
        }
        await using var admin = await connections.Admin();
        var pending = await admin.QueryAsync("SELECT c.record_key FROM app_sync_jobs j JOIN app_changes c ON c.id=j.change_id WHERE (c.context_id=@id OR j.target_context_id=@id) AND c.entity=@name AND j.status<>'Applied'", new
        {
            id = context.Id,
            name = entity.Name
        });
        var countJobs = pending.Count(j => entity.Keys.All(k => Json.Read((string)j.record_key).TryGetValue(k, out var value) && Json.Equal(row[k], entity.Column(k).Parse(value))));
        if (countJobs > 0)
            found.Add(new("File de synchronisation DIAF", countJobs, entity.Keys));
        var allowed = found.Count == 0 && plan.Restrictions.Count == 0 && !context.ReadOnly;
        return new(allowed, allowed ? "Aucune dépendance identifiée. Confirmation finale obligatoire." : "Suppression bloquée : dépendances, schéma non validé ou archive. Aucune cascade ne sera effectuée.", found, plan.Restrictions);
    }

    public async Task<DeleteInspection> Preview(ContextInfo context, string name, Dictionary<string, JsonElement> key)
    {
        if (name is not ("verger" or "parcelle"))
            return new(false, "Suppression non activée pour ce référentiel : dépendances à valider.", [], []);
        var entity = catalog.Get(name);
        await using var db = await connections.Business(context);
        var row = await records.Record(db, entity, key);
        return await Inspect(db, context, entity, row, await BuildPlan(db, entity, row));
    }

    private async Task<string> Audit(ContextInfo context, ClaimsPrincipal user, Entity entity, DeleteRequest request, Dictionary<string, object?> row, string status, string? reason)
    {
        var id = Guid.NewGuid().ToString();
        await using var admin = await connections.Admin();
        await admin.ExecuteAsync("INSERT INTO app_changes(id,user_id,context_id,entity,record_key,operation,before_json,after_json,patch_json,status,error,created_at) VALUES(@id,@uid,@cid,@name,@key,'Delete',@before,'null','{}',@status,@reason,UTC_TIMESTAMP(6))", new
        {
            id,
            uid = user.FindFirstValue(ClaimTypes.NameIdentifier),
            cid = context.Id,
            name = entity.Name,
            key = Json.Write(request.Key),
            before = Json.Write(row),
            status,
            reason
        });
        return id;
    }
    public async Task<object> Delete(ContextInfo context, ClaimsPrincipal user, string name, DeleteRequest request)
    {
        if (name is not ("verger" or "parcelle"))
            throw new RuleException("Suppression non activée pour ce référentiel.", 409);
        if (request.Confirmation != "SUPPRIMER")
            throw new RuleException("Confirmation finale SUPPRIMER obligatoire.");
        var entity = catalog.Get(name);
        await using var db = await connections.Business(context);
        var row = await records.Record(db, entity, request.Key);
        var plan = await BuildPlan(db, entity, row);
        string? audit = null;
        var locked = false;
        try
        {
            // Les verrous de tables couvrent aussi les anciennes applications, même sans FK et avec MyISAM.
            await db.ExecuteAsync("SET SESSION lock_wait_timeout=5");
            var locks = new[] { Q(name) + " WRITE" }.Concat(plan.References.Select(r => Q(r.Table) + " READ").Distinct());
            await db.ExecuteAsync("LOCK TABLES " + string.Join(",", locks));
            locked = true;
            row = await records.Record(db, entity, request.Key);
            if (request.Before.Count != entity.Columns.Length || entity.Columns.Any(c => !request.Before.ContainsKey(c.Name) || !Json.Equal(row[c.Name], c.Parse(request.Before[c.Name]))))
                throw new RuleException("La fiche a changé depuis la confirmation. Rechargez-la.", 409);
            var currentPlan = await BuildPlan(db, entity, row);
            if (Json.Write(plan.Columns) != Json.Write(currentPlan.Columns) || Json.Write(plan.References) != Json.Write(currentPlan.References))
                throw new RuleException("Le schéma a changé. Recommencez le contrôle de dépendances.", 409);
            var inspection = await Inspect(db, context, entity, row, currentPlan);
            if (!inspection.CanDelete)
            {
                var reason = inspection.Reason + " " + string.Join(" ; ", inspection.Dependencies.Select(d => $"{d.Table} : {d.Count}").Concat(inspection.Restrictions));
                audit = await Audit(context, user, entity, request, row, "Blocked", reason);
                throw new RuleException(reason, 409);
            }
            audit = await Audit(context, user, entity, request, row, "Prepared", null);
            var (where, parameters) = ReferentialService.Where(entity, request.Key);
            if (await db.ExecuteAsync($"DELETE FROM {Q(name)} WHERE {where} LIMIT 1", parameters) != 1)
                throw new RuleException("Suppression non confirmée : vérification nécessaire.", 409);
        }
        catch (MySqlException exception)
        {
            logger.LogWarning(exception, "Suppression refusée, contexte {ContextId}, référentiel {Entity}", context.Id, name);
            if (audit is null)
                await Audit(context, user, entity, request, row, "Blocked", "Contrôle/verrouillage ou privilèges SQL indisponibles. Aucune suppression autorisée.");
            throw new RuleException("Suppression non confirmée. Vérifiez les droits SELECT/DELETE/LOCK TABLES et le schéma ; consultez le journal avant de réessayer.", 409);
        }
        finally { if (locked) await db.ExecuteAsync("UNLOCK TABLES"); }
        try
        {
            await using var admin = await connections.Admin();
            await admin.ExecuteAsync("UPDATE app_changes SET status='Applied',completed_at=UTC_TIMESTAMP(6) WHERE id=@id", new
            {
                id = audit
            });
        }
        catch { return new { id = audit, message = "Suppression réalisée. Journal à réconcilier par l’administrateur.", status = "Prepared" }; }
        return new
        {
            id = audit,
            message = "Suppression réalisée dans cet exercice uniquement. DIAF n’a pas été supprimé.",
            status = "Applied"
        };
    }
}
