using Dapper;
using System.Security.Claims;
using System.Text.Json;

namespace Vitasouss;

public sealed class SyncService(Connections connections, Catalog catalog, ReferentialService records, PilotCatalog pilotCatalog)
{
    public async Task<object> PrepareComparison(ContextInfo source, ClaimsPrincipal user, ComparisonPrepareRequest request)
    {
        if (request.Items is null || request.Items.Count is < 1 or > 25) throw new RuleException("Sélectionnez entre 1 et 25 fiches visibles.");
        if (request.Items.Any(i => i is null || i.Key is null || i.Source is null)) throw new RuleException("Clé et état ZAOUIA obligatoires pour chaque fiche.");
        var target = await connections.Resolve(request.TargetId, user, true);
        await using var admin = await connections.Admin();
        if (!source.IsMaster || source.Station != "ZAOUIA" || source.ReadOnly || target.Station != "DIAF" || await admin.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_sync_routes WHERE source_context_id=@source AND target_context_id=@target AND enabled=1", new { source = source.Id, target = target.Id }) != 1) throw new RuleException("Route ZAOUIA vers DIAF non autorisée.", 403);
        var entity = catalog.Get(request.Name); var outcomes = new List<object>();
        var identities = new HashSet<string>();
        foreach (var item in request.Items)
        {
            try
            {
                ReferentialService.Where(entity, item.Key);
                if (!identities.Add(Json.Write(entity.Keys.Select(k => entity.Column(k).Parse(item.Key[k]))))) throw new RuleException("Identité dupliquée dans la sélection.");
                await using var src = await connections.Business(source); await using var dst = await connections.Business(target);
                await SchemaGuard.Check(src, entity, false);
                await SchemaGuard.Check(dst, entity, true);
                var current = await records.Record(src, entity, item.Key);
                if (item.Source is null || item.Source.Count != entity.Columns.Length || entity.Columns.Any(c => !item.Source.ContainsKey(c.Name) || !Json.Equal(current[c.Name], c.Parse(item.Source[c.Name])))) throw new RuleException("ZAOUIA a changé ou son schéma est incomplet : recommencez la comparaison.", 409);
                var create = item.Target is null;
                if (create && entity.Name is not ("culture" or "grpvar" or "adherent")) throw new RuleException("Création DIAF protégée : initialisation/dépendances à valider pour ce référentiel.", 409);
                Dictionary<string, object?>? before = null;
                if (!create)
                {
                    before = await records.Record(dst, entity, item.Key);
                    if (item.Target!.Count != entity.Columns.Length || entity.Columns.Any(c => !item.Target.ContainsKey(c.Name) || !Json.Equal(before[c.Name], c.Parse(item.Target[c.Name])))) throw new RuleException("DIAF a changé : recommencez la comparaison.", 409);
                }
                else await CheckCreation(dst, entity, item.Key);
                var patch = entity.Columns.Where(c => !c.Generated && c.Name != "refsta" && (create || !entity.Keys.Contains(c.Name))).Where(c => create || !Json.Equal(current[c.Name], before![c.Name])).ToDictionary(c => c.Name, c => current[c.Name]);
                if (patch.Count == 0) throw new RuleException("Aucun écart métier à appliquer.", 409);
                var id = Guid.NewGuid().ToString(); var job = Guid.NewGuid().ToString();
                await using var tx = await admin.BeginTransactionAsync();
                await admin.ExecuteAsync("INSERT INTO app_changes(id,user_id,context_id,entity,record_key,operation,before_json,after_json,patch_json,sync_requested,status,created_at,completed_at) VALUES(@id,@uid,@cid,@name,@key,@operation,@source,@source,@patch,1,'Applied',UTC_TIMESTAMP(6),UTC_TIMESTAMP(6))", new { id, uid = user.FindFirstValue(ClaimTypes.NameIdentifier), cid = source.Id, name = entity.Name, key = Json.Write(item.Key), operation = create ? "CompareCreate" : "CompareUpdate", source = Json.Write(current), patch = Json.Write(patch) }, tx);
                await admin.ExecuteAsync("INSERT INTO app_sync_jobs(id,change_id,target_context_id,status,created_at,updated_at) VALUES(@job,@id,@target,'Pending',UTC_TIMESTAMP(6),UTC_TIMESTAMP(6))", new { job, id, target = target.Id }, tx);
                await tx.CommitAsync();
                outcomes.Add(new { key = item.Key, status = "Prepared", jobId = job, before = before ?? new(), message = "Demande préparée ; confirmation DIAF nécessaire." });
            }
            catch (RuleException e) { outcomes.Add(new { key = item.Key, status = "Refused", message = e.Message }); }
            catch { outcomes.Add(new { key = item.Key, status = "Unconfirmed", message = "Préparation non confirmée : vérifiez la file de synchronisation avant de recommencer." }); }
        }
        return new { items = outcomes };
    }

    private static async Task CheckCreation(MySqlConnector.MySqlConnection db, Entity entity, Dictionary<string, JsonElement> key)
    {
        if (entity.Name is not ("culture" or "grpvar" or "adherent")) throw new RuleException("Création DIAF protégée.", 409);
        await SchemaGuard.Check(db, entity, true);
        var primary = (await db.QueryAsync<string>("SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION", new { name = entity.Name })).ToArray();
        var engine = await db.ExecuteScalarAsync<string>("SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name", new { name = entity.Name });
        var columns = (await db.QueryAsync("SELECT COLUMN_NAME,COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name", new { name = entity.Name })).ToArray();
        if (engine != "InnoDB" || !primary.SequenceEqual(entity.Keys) || columns.Length != entity.Columns.Length || entity.Columns.Any(c => !columns.Any(a => (string)a.COLUMN_NAME == c.Name && c.Definition.StartsWith((string)a.COLUMN_TYPE, StringComparison.OrdinalIgnoreCase))) || await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE=@name", new { name = entity.Name }) != 0) throw new RuleException("Schéma DIAF différent : création suspendue.", 409);
        var (where, parameters) = ReferentialService.Where(entity, key);
        if (await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM `{entity.Name}` WHERE {where}", parameters) != 0) throw new RuleException("La fiche DIAF existe désormais : nouvelle comparaison obligatoire.", 409);
    }
    private async Task<dynamic> Job(string id, ClaimsPrincipal user)
    {
        await using var admin = await connections.Admin();
        var job = await admin.QuerySingleOrDefaultAsync("SELECT j.*,c.context_id source_context_id,c.entity,c.operation,c.record_key,c.patch_json,c.after_json source_after,c.status source_status FROM app_sync_jobs j JOIN app_changes c ON c.id=j.change_id WHERE j.id=@id", new
        {
            id
        }) ?? throw new RuleException("Synchronisation absente.", 404);
        if ((string)job.operation == "Delete")
            throw new RuleException("Suppression DIAF synchronisée non autorisée.", 403);
        var source = await connections.Resolve((int)job.source_context_id, user, true);
        var target = await connections.Resolve((int)job.target_context_id, user, true);
        if (source.Station != "ZAOUIA" || !source.IsMaster || target.Station != "DIAF")
            throw new RuleException("Route de synchronisation non autorisée.", 403);
        if ((string)job.source_status != "Applied")
            throw new RuleException("Enregistrement ZAOUIA à réconcilier avant synchronisation.", 409);
        if ((string)job.status == "Applied")
            throw new RuleException("Synchronisation déjà effectuée.", 409);
        if ((string)job.status == "Applying")
            throw new RuleException("Tentative interrompue ou en cours : réconciliation administrateur nécessaire.", 409);
        return job;
    }
    private Dictionary<string, object?> Patch(dynamic job, Entity entity)
    {
        var patch = Json.Read((string)job.patch_json);
        return patch.Where(x => x.Key != "refsta" && !entity.Keys.Contains(x.Key) && !entity.Column(x.Key).Generated).ToDictionary(x => x.Key, x => entity.Column(x.Key).Parse(x.Value));
    }
    public async Task<object> Preview(string id, ClaimsPrincipal user)
    {
        var job = await Job(id, user);
        var entity = catalog.Get((string)job.entity);
        var target = await connections.Resolve((int)job.target_context_id, user, true);
        try
        {
            await using var db = await connections.Business(target);
            if ((string)job.operation == "CompareCreate")
            {
                await CheckCreation(db, entity, Json.Read((string)job.record_key));
                var values = Json.Read((string)job.patch_json).ToDictionary(v => v.Key, v => entity.Column(v.Key).Parse(v.Value));
                return new { id, entity = entity.Name, target = target.Label, before = new Dictionary<string, object?>(), differences = values.Select(v => new { field = v.Key, before = (object?)null, after = v.Value }), preservesRefsta = true };
            }
            var before = await records.Record(db, entity, Json.Read((string)job.record_key));
            var patch = (Dictionary<string, object?>)Patch(job, entity);
            return new
            {
                id,
                entity = entity.Name,
                target = target.Label,
                before,
                differences = patch.Select(x => new { field = x.Key, before = before[x.Key], after = x.Value }).Where(x => !Json.Equal(x.before, x.after)),
                preservesRefsta = true
            };
        }
        catch (Exception ex) when (ex is not RuleException || ((RuleException)ex).Status is 404 or 409)
        {
            await Mark(id, "Pending", "DIAF inaccessible, identifiant absent ou ambigu. Initialisation manuelle nécessaire si absent.");
            throw new RuleException("Modification enregistrée dans ZAOUIA. Synchronisation DIAF en attente : base inaccessible ou identifiant absent/ambigu.", 409);
        }
    }
    private async Task Mark(string id, string status, string? error)
    {
        await using var admin = await connections.Admin();
        await admin.ExecuteAsync("UPDATE app_sync_jobs SET status=@status,error=@error,updated_at=UTC_TIMESTAMP(6) WHERE id=@id", new
        {
            id,
            status,
            error
        });
    }
    public async Task<object> Apply(string id, ClaimsPrincipal user, Dictionary<string, JsonElement> expected)
    {
        var job = await Job(id, user);
        var entity = catalog.Get((string)job.entity);
        var key = Json.Read((string)job.record_key);
        var patch = (Dictionary<string, object?>)Patch(job, entity);
        var source = await connections.Resolve((int)job.source_context_id, user, true);
        var target = await connections.Resolve((int)job.target_context_id, user, true);
        var creation = (string)job.operation == "CompareCreate";
        if (creation) patch = Json.Read((string)job.patch_json).Where(v => v.Key != "refsta" && !entity.Column(v.Key).Generated).ToDictionary(v => v.Key, v => entity.Column(v.Key).Parse(v.Value));
        await using (var db = await connections.Business(source))
        {
            var current = await records.Record(db, entity, key);
            if (patch.Any(x => !Json.Equal(current[x.Key], x.Value)))
                throw new RuleException("ZAOUIA a changé depuis cette demande. Créez une nouvelle synchronisation depuis la fiche actuelle.", 409);
        }
        if (expected.Count != (creation ? 0 : entity.Columns.Length))
            throw new RuleException("Aperçu DIAF complet obligatoire.", 409);
        var before = expected.ToDictionary(x => x.Key, x => entity.Column(x.Key).Parse(x.Value));
        await using var admin = await connections.Admin();
        var locked = await admin.ExecuteAsync("UPDATE app_sync_jobs SET status='Applying',attempts=attempts+1,before_json=@before,last_user_id=@uid,updated_at=UTC_TIMESTAMP(6) WHERE id=@id AND status IN ('Pending','Error')", new
        {
            id,
            before = Json.Write(before),
            uid = user.FindFirstValue(ClaimTypes.NameIdentifier)
        });
        if (locked != 1)
            throw new RuleException("Une tentative est en cours ou nécessite une réconciliation administrateur.", 409);
        try
        {
            await using var db = await connections.Business(target);
            if ((string)job.operation == "CompareUpdate") await SchemaGuard.Check(db, entity, true);
            if (creation)
            {
                await CheckCreation(db, entity, key);
                await records.Validate(db, entity, patch);
                var values = new DynamicParameters(); foreach (var value in patch) values.Add(value.Key, value.Value);
                await db.ExecuteAsync($"INSERT INTO `{entity.Name}` ({string.Join(",", patch.Keys.Select(k => $"`{k}`"))}) VALUES({string.Join(",", patch.Keys.Select(k => "@" + k))})", values);
                try { await admin.ExecuteAsync("UPDATE app_sync_jobs SET status='Applied',after_json=@after,error=NULL,updated_at=UTC_TIMESTAMP(6) WHERE id=@id", new { id, after = Json.Write(patch) }); } catch { return new { message = "DIAF créé ; journal à réconcilier.", status = "Applying" }; }
                return new { message = "Fiche DIAF créée après confirmation, sans refsta transmis.", status = "Applied" };
            }
            var current = await records.Record(db, entity, key);
            if (entity.Columns.Any(c => !Json.Equal(current[c.Name], before[c.Name])))
                throw new RuleException("DIAF a changé : affichez un nouvel aperçu.", 409);
            var after = new Dictionary<string, object?>(before);
            foreach (var item in patch)
                after[item.Key] = item.Value;
            await records.Validate(db, entity, after);
            var effective = patch.Where(x => !Json.Equal(current[x.Key], x.Value)).ToDictionary(x => x.Key, x => x.Value);
            await records.Update(db, entity, key, before, effective);
            try
            {
                await admin.ExecuteAsync("UPDATE app_sync_jobs SET status='Applied',after_json=@after,error=NULL,updated_at=UTC_TIMESTAMP(6) WHERE id=@id", new
                {
                    id,
                    after = Json.Write(after)
                });
            }
            catch { return new { message = "DIAF mis à jour. Journal à réconcilier.", status = "Applying" }; }
            return new
            {
                message = "DIAF synchronisé. Son refsta a été conservé.",
                status = "Applied"
            };
        }
        catch (RuleException) { await Mark(id, "Error", "Conflit ou validation : nouvel aperçu nécessaire."); throw; }
        catch
        {
            if (creation) throw new RuleException("Création DIAF non confirmée. La demande reste à réconcilier par l’administrateur avant toute nouvelle tentative.", 503);
            await Mark(id, "Error", "Connexion interrompue. Vérifiez l’état DIAF avec un nouvel aperçu avant de réessayer.");
            throw new RuleException("Modification enregistrée dans ZAOUIA. Synchronisation DIAF en attente.", 503);
        }
    }
    public async Task<object> Compare(ContextInfo context, ClaimsPrincipal user, string name, Dictionary<string, JsonElement> key)
    {
        await using var admin = await connections.Admin();
        var targetId = await admin.QuerySingleOrDefaultAsync<int?>("SELECT target_context_id FROM app_sync_routes WHERE source_context_id=@id AND enabled=1 LIMIT 1", new
        {
            id = context.Id
        });
        if (targetId is null)
            return new
            {
                status = "NotConfigured",
                message = "DIAF non configuré"
            };
        var target = await connections.Resolve(targetId.Value, user);
        var entity = catalog.Get(name);
        try
        {
            await using var sourceDb = await connections.Business(context);
            await using var targetDb = await connections.Business(target);
            var source = await records.Record(sourceDb, entity, key);
            var destination = await records.Record(targetDb, entity, key);
            var different = entity.Columns.Where(c => c.Name != "refsta" && !c.Generated && !Json.Equal(source[c.Name], destination[c.Name])).Select(c => new { field = c.Name, zaouia = source[c.Name], diaf = destination[c.Name] }).ToArray();
            var pending = await admin.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_sync_jobs j JOIN app_changes c ON c.id=j.change_id WHERE c.context_id=@cid AND c.entity=@name AND c.record_key=@key AND j.status<>'Applied' AND c.status='Applied'", new
            {
                cid = context.Id,
                name,
                key = Json.Write(key)
            });
            return new
            {
                status = pending > 0 ? "Pending" : different.Length > 0 ? "Different" : "Synchronized",
                differences = different
            };
        }
        catch { return new { status = "Unavailable", message = "DIAF inaccessible ou identifiant absent/ambigu" }; }
    }
    public async Task<object> Reconcile(string changeId, ClaimsPrincipal user)
    {
        await using var admin = await connections.Admin();
        var change = await admin.QuerySingleAsync("SELECT * FROM app_changes WHERE id=@changeId", new
        {
            changeId
        });
        if ((string)change.status == "Applied")
            throw new RuleException("Déjà confirmé.");
        var context = await connections.Resolve((int)change.context_id, user);
        var entity = catalog.Entities.FirstOrDefault(e => e.Name == (string)change.entity) ?? pilotCatalog.Get((string)change.entity);
        await using var db = await connections.Business(context);
        if ((string)change.operation == "Delete")
        {
            if ((string)change.status != "Prepared")
                throw new RuleException("Cette tentative de suppression ne nécessite pas de réconciliation.", 409);
            var (where, parameters) = ReferentialService.Where(entity, Json.Read((string)change.record_key));
            if (await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM `{entity.Name}` WHERE {where}", parameters) != 0)
                throw new RuleException("L’enregistrement existe : suppression non confirmée. Vérification manuelle nécessaire.", 409);
            await admin.ExecuteAsync("UPDATE app_changes SET status='Applied',error=NULL,completed_at=UTC_TIMESTAMP(6) WHERE id=@changeId AND status='Prepared'", new
            {
                changeId
            });
            return new
            {
                message = "Absence de l’enregistrement vérifiée : journal de suppression réconcilié."
            };
        }
        var row = await records.Record(db, entity, Json.Read((string)change.record_key));
        var after = Json.Read((string)change.after_json);
        if (after.Where(x => !entity.Column(x.Key).Generated).Any(x => !Json.Equal(row[x.Key], entity.Column(x.Key).Parse(x.Value))))
            throw new RuleException("Résultat différent de l’intention journalisée. Vérification manuelle nécessaire.", 409);
        await using var tx = await admin.BeginTransactionAsync();
        await admin.ExecuteAsync("UPDATE app_changes SET status='Applied',error=NULL,completed_at=UTC_TIMESTAMP(6) WHERE id=@changeId; UPDATE app_sync_jobs SET status='Pending',updated_at=UTC_TIMESTAMP(6) WHERE change_id=@changeId AND status='AwaitingSource'", new
        {
            changeId
        }, tx);
        await tx.CommitAsync();
        return new
        {
            message = "Enregistrement vérifié, journal réconcilié."
        };
    }
    public async Task<object> ReconcileJob(string id, ClaimsPrincipal user)
    {
        await using var admin = await connections.Admin();
        var job = await admin.QuerySingleOrDefaultAsync("SELECT j.*,c.entity,c.operation,c.record_key,c.patch_json FROM app_sync_jobs j JOIN app_changes c ON c.id=j.change_id WHERE j.id=@id", new
        {
            id
        }) ?? throw new RuleException("Demande absente.", 404);
        if ((string)job.status != "Applying")
            throw new RuleException("La demande ne nécessite pas cette réconciliation.");
        // Une tentative active garde un bail de 60 secondes pour éviter une reprise concurrente.
        if (await admin.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_sync_jobs WHERE id=@id AND updated_at<UTC_TIMESTAMP(6)-INTERVAL 60 SECOND", new
        {
            id
        }) == 0)
            throw new RuleException("Attendez la fin de la tentative avant de réconcilier.", 409);
        var context = await connections.Resolve((int)job.target_context_id, user, true);
        var entity = catalog.Get((string)job.entity);
        await using var db = await connections.Business(context);
        Dictionary<string, object?> row;
        try { row = await records.Record(db, entity, Json.Read((string)job.record_key)); }
        catch (RuleException ex) when (ex.Status == 404 && (string)job.operation == "CompareCreate")
        {
            await Mark(id, "Error", "Création non constatée. Un nouvel aperçu est obligatoire avant toute reprise.");
            return new { message = "Absence DIAF vérifiée ; la création peut être reprise après un nouvel aperçu." };
        }
        var patch = (Dictionary<string, object?>)Patch(job, entity);
        var previous = Json.Read((string)job.before_json);
        if (previous.TryGetValue("refsta", out var refsta) && !Json.Equal(row["refsta"], entity.Column("refsta").Parse(refsta)))
            throw new RuleException("refsta a changé depuis la tentative. Vérification manuelle requise.", 409);
        if (patch.All(x => Json.Equal(row[x.Key], x.Value)))
        {
            await admin.ExecuteAsync("UPDATE app_sync_jobs SET status='Applied',after_json=@after,error=NULL,updated_at=UTC_TIMESTAMP(6),last_user_id=@uid WHERE id=@id AND status='Applying'", new
            {
                id,
                after = Json.Write(row),
                uid = user.FindFirstValue(ClaimTypes.NameIdentifier)
            });
            return new
            {
                message = "Résultat DIAF vérifié : synchronisation confirmée."
            };
        }
        if (previous.Count == 0) throw new RuleException("DIAF contient une fiche différente de la création attendue : validation métier requise.", 409);
        if (entity.Columns.All(c => Json.Equal(row[c.Name], c.Parse(previous[c.Name]))))
        {
            await Mark(id, "Error", "Aucune application constatée. Un nouvel aperçu est requis pour réessayer.");
            return new
            {
                message = "Aucune modification constatée. La demande peut être reprise après comparaison."
            };
        }
        throw new RuleException("DIAF a évolué : réconciliation automatique refusée, intervention métier requise.", 409);
    }
}
