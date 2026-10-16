using Dapper;
using System.Security.Claims;
using System.Text.Json;

namespace Vitasouss;

public sealed class SyncService(Connections connections, Catalog catalog, ReferentialService records)
{
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
        await using (var db = await connections.Business(source))
        {
            var current = await records.Record(db, entity, key);
            if (patch.Any(x => !Json.Equal(current[x.Key], x.Value)))
                throw new RuleException("ZAOUIA a changé depuis cette demande. Créez une nouvelle synchronisation depuis la fiche actuelle.", 409);
        }
        if (expected.Count != entity.Columns.Length)
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
        catch { await Mark(id, "Error", "Connexion interrompue. Vérifiez l’état DIAF avec un nouvel aperçu avant de réessayer."); throw new RuleException("Modification enregistrée dans ZAOUIA. Synchronisation DIAF en attente.", 503); }
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
        var entity = catalog.Get((string)change.entity);
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
        var job = await admin.QuerySingleOrDefaultAsync("SELECT j.*,c.entity,c.record_key,c.patch_json FROM app_sync_jobs j JOIN app_changes c ON c.id=j.change_id WHERE j.id=@id", new
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
        var row = await records.Record(db, entity, Json.Read((string)job.record_key));
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
