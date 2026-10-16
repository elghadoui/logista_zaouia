using Dapper;
using MySqlConnector;
using System.Security.Claims;
using System.Text.Json;
namespace Vitasouss;
public sealed class ComplementaryService(Connections connections,PilotCatalog catalog,ReferentialService records)
{
    public static string[] Editable(string name)=>name switch {"partenaire"=>["nom"],"destination"=>["vildes"],"pays"=>["nompay","abrpay"],"grpemb"=>["nomgre"],"groupart"=>["type"],"defaut"=>["intdef"],"typeecart"=>["destype"],_=>[]};
    public static async Task Check(MySqlConnection db,Entity entity,bool writing)
    {
        var columns=(await db.QueryAsync("SELECT COLUMN_NAME,COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name",new{name=entity.Name})).ToArray();
        var engine=await db.ExecuteScalarAsync<string>("SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@name",new{name=entity.Name});
        if(engine is not("InnoDB" or "MyISAM")||columns.Length!=entity.Columns.Length||entity.Columns.Any(c=>!columns.Any(a=>(string)a.COLUMN_NAME==c.Name&&c.Definition.StartsWith((string)a.COLUMN_TYPE,StringComparison.OrdinalIgnoreCase))))throw new RuleException("Schéma non validé : cette opération reste protégée.",409);
        var keys=string.Join(",",entity.Keys.Select(k=>"`"+k+"`"));
        if(await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM `{entity.Name}` WHERE "+string.Join(" OR ",entity.Keys.Select(k=>"`"+k+"` IS NULL")))>0||await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM (SELECT {keys} FROM `{entity.Name}` GROUP BY {keys} HAVING COUNT(*)>1) d")>0)throw new RuleException("Identifiants nuls ou doublons : écriture protégée jusqu'à correction validée des données.",409);
        if(writing&&(!await SchemaGuard.CanInspectTriggers(db,entity.Name)||await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE=@name",new{name=entity.Name})>0))throw new RuleException("Déclencheurs présents ou inspection indisponible : opération protégée.",409);
    }
    public static async Task Conflicts(MySqlConnection db,Entity entity,Dictionary<string,object?> row,string station="DIAF")
    {
        if(entity.Name=="declaration_verger")throw new RuleException("Synchronisation des déclarations protégée : l'id auto-incrémenté n'est pas une identité métier interstations validée.",409);
        var p=new DynamicParameters();p.Add("label",Convert.ToString(row[entity.Label]));
        foreach(var key in entity.Keys)p.Add("key_"+key,row[key]);
        var sameKey=string.Join(" AND ",entity.Keys.Select(k=>$"`{k}` <=> @key_{k}"));
        if(await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM `{entity.Name}` WHERE LOWER(TRIM(`{entity.Label}`))=LOWER(TRIM(@label)) AND NOT ({sameKey})",p)>0)throw new RuleException("Conflit : même libellé avec un autre code dans "+station+". Arbitrage administrateur requis, aucun rapprochement automatique.",409);
    }
    public static async Task References(MySqlConnection db,Entity entity,Dictionary<string,object?> values)
    {
        var relations=entity.Name switch {"groupart"=>new[]{("codgre","grpemb","codgre")},"destination" or "partenaire"=>new[]{("codpay","pays","codpay")},"declaration_verger"=>new[]{("refver_reel","verger","refver"),("refver_nreel","verger","refver"),("codvar","variete","codvar"),("refstat","station","refsta")},_=>Array.Empty<(string,string,string)>()};
        foreach(var (field,table,key) in relations)if(values.TryGetValue(field,out var value)&&value is not null){if(await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM `{table}` WHERE `{key}`=@value",new{value})!=1)throw new RuleException("Référence liée absente ou ambiguë : "+table+". Créez/validez d'abord le référentiel parent avec le même code.",409);}
    }
    public async Task<object> Write(ContextInfo ctx,ClaimsPrincipal user,string name,PilotMutation request,bool create,bool delete=false)
    {
        var entity=catalog.Get(name);if(!PilotCatalog.References.Contains(name))throw new RuleException("Écriture non autorisée.",403);
        await new PermissionService(connections).Demand(user,name,delete?"delete":create?"add":"modify");
        if(ctx.ReadOnly||!ctx.IsMaster||ctx.Station!="ZAOUIA")throw new RuleException("Les référentiels complémentaires sont gérés dans ZAOUIA maître ; DIAF est mis à jour par synchronisation contrôlée.",403);
        if(name=="declaration_verger"&&!create)throw new RuleException("Déclaration protégée : le lien exact avec les réceptions n'est pas prouvé. Modification et suppression suspendues, y compris si aucun usage ne peut être certifié.",409);
        if(delete&&name!="grpemb")throw new RuleException("Suppression protégée : cartographie complète des dépendances historiques à valider pour "+name+".",409);
        var editable=Editable(name).Concat(create?entity.Keys.Where(k=>!entity.Column(k).Generated):[]).Concat(create&&name=="groupart"?["codgre"]:[]).Concat(create&&name is "destination" or "partenaire"?["codpay"]:[]).Concat(create&&name=="declaration_verger"?["refver_reel","refver_nreel","codvar","refstat"]:[]).ToArray();
        if(!delete&&(request.Values.Count==0||request.Values.Any(v=>!editable.Contains(v.Key))))throw new RuleException("Seuls les libellés sont modifiables. Les champs structurels existants restent protégés.");
        var values=request.Values.ToDictionary(p=>p.Key,p=>entity.Column(p.Key).Parse(p.Value));
        foreach(var relation in RelationService.Fields(name))if(values.TryGetValue(relation.Key,out var referenced)&&referenced is not null&&PermissionService.Modules.Contains(relation.Value.Table))await new PermissionService(connections).Demand(user,relation.Value.Table);
        if(!delete&&name!="declaration_verger"&&((create&&!values.ContainsKey(entity.Label))||(values.TryGetValue(entity.Label,out var label)&&string.IsNullOrWhiteSpace(Convert.ToString(label)))))throw new RuleException("Libellé obligatoire.");
        await using var db=await connections.Business(ctx);await Check(db,entity,true);
        var related=name switch {"grpemb"=>new[]{"groupart"},"groupart"=>new[]{"grpemb"},"destination" or "partenaire"=>new[]{"pays"},"declaration_verger"=>new[]{"verger","variete","station"},_=>Array.Empty<string>()};
        await db.ExecuteAsync($"LOCK TABLES `{name}` WRITE"+string.Concat(related.Select(t=>$",`{t}` READ")));
        try {
            await Check(db,entity,true);
            Dictionary<string,object?>? before=null;Dictionary<string,JsonElement> key;
            if(create){
                foreach(var field in entity.Keys)if(!values.ContainsKey(field)){
                    if(!entity.Column(field).Numeric)throw new RuleException("Référence métier obligatoire.");
                    var next=await db.ExecuteScalarAsync<decimal>($"SELECT COALESCE(MAX(`{field}`),0)+1 FROM `{name}`");values[field]=entity.Column(field).Parse(JsonSerializer.SerializeToElement(next));
                }
                key=values.Where(v=>entity.Keys.Contains(v.Key)).ToDictionary(v=>v.Key,v=>JsonSerializer.SerializeToElement(v.Value));
                if(name!="declaration_verger"){var (where,p)=ReferentialService.Where(entity,key);if(await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM `{name}` WHERE {where}",p)>0)throw new RuleException("Cette référence existe déjà.",409);}
                await References(db,entity,values);
                if(name=="declaration_verger"&&new[]{"refver_reel","refver_nreel","codvar","refstat"}.Any(k=>!values.ContainsKey(k)||values[k] is null))throw new RuleException("Les quatre références de la déclaration sont obligatoires.");
                if(name=="declaration_verger"){
                    var args=new DynamicParameters();foreach(var v in values)args.Add(v.Key,v.Value);
                    if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM declaration_verger WHERE refver_reel <=> @refver_reel AND refver_nreel <=> @refver_nreel AND codvar <=> @codvar AND refstat <=> @refstat",args)>0)throw new RuleException("Cette origine/déclaration existe déjà pour cette variété et cette station.",409);
                }
            }else{
                key=request.Key;before=await records.Record(db,entity,key);
                if(request.Before.Count!=entity.Columns.Length||entity.Columns.Any(c=>!request.Before.TryGetValue(c.Name,out var v)||!Json.Equal(before[c.Name],c.Parse(v))))throw new RuleException("La fiche a changé. Rechargez-la.",409);
            }
            if(delete){
                // Confirmed grpemb -> groupart relationship; any extra codgre carrier blocks the operation.
                var other=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND COLUMN_NAME='codgre' AND TABLE_NAME NOT IN('grpemb','groupart')");
                if(other>0)throw new RuleException("Autres usages du code groupe détectés : suppression protégée jusqu'à validation.",409);
                var used=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM groupart WHERE codgre=@id",new{id=before!["codgre"]});
                if(used>0)throw new RuleException($"Impossible de supprimer {before!["nomgre"]} : {used} articles utilisent ce groupe.",409);
                var inbound=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_NAME='grpemb'");
                if(inbound>0)throw new RuleException("Contraintes SQL supplémentaires : suppression protégée.",409);
            }
            var after=before is null?new Dictionary<string,object?>(values):new(before);foreach(var v in values)after[v.Key]=v.Value;
            if(!delete&&name!="declaration_verger")await Conflicts(db,entity,after,"ZAOUIA");
            await using var admin=await connections.Admin();var id=Guid.NewGuid().ToString();
            await admin.ExecuteAsync("INSERT INTO app_changes(id,user_id,context_id,entity,record_key,operation,before_json,after_json,patch_json,status,created_at) VALUES(@id,@uid,@cid,@name,@key,@operation,@before,@after,@patch,'Prepared',UTC_TIMESTAMP(6))",new{id,uid=user.FindFirstValue(ClaimTypes.NameIdentifier),cid=ctx.Id,name,key=Json.Write(key),operation=delete?"Delete":create?"Create":"Update",before=Json.Write(before),after=Json.Write(delete?null:after),patch=Json.Write(values)});
            if(delete){var (where,p)=ReferentialService.Where(entity,key);if(await db.ExecuteAsync($"DELETE FROM `{name}` WHERE {where}",p)!=1)throw new RuleException("Suppression non confirmée.",409);}
            else if(create){var p=new DynamicParameters();foreach(var v in values)p.Add(v.Key,v.Value);await db.ExecuteAsync($"INSERT INTO `{name}` ({string.Join(',',values.Keys.Select(k=>"`"+k+"`"))}) VALUES ({string.Join(',',values.Keys.Select(k=>"@"+k))})",p);
                after=await records.Record(db,entity,key);
            }else await records.Update(db,entity,key,before!,values);
            try{await admin.ExecuteAsync("UPDATE app_changes SET status='Applied',record_key=@key,after_json=@after,completed_at=UTC_TIMESTAMP(6) WHERE id=@id",new{id,key=Json.Write(key),after=Json.Write(delete?null:after)});}catch{return new{id,status="Prepared",message="Écriture locale réalisée ; journal à réconcilier avant toute reprise."};}
            return new{id,status="Applied",key=key.ToDictionary(v=>v.Key,v=>entity.Column(v.Key).Definition.StartsWith("bigint")?JsonSerializer.SerializeToElement(Convert.ToString(entity.Column(v.Key).Parse(v.Value),System.Globalization.CultureInfo.InvariantCulture)):v.Value),message="Enregistrement ZAOUIA réalisé. Comparer puis confirmer la synchronisation DIAF."};
        }finally{await db.ExecuteAsync("UNLOCK TABLES");}
    }
}

