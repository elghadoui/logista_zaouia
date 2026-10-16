using Dapper;
using MySqlConnector;
using System.Security.Claims;
using System.Text.Json;
namespace Vitasouss;
public sealed class ComplementaryService(Connections connections,PilotCatalog catalog,ReferentialService records)
{
    public static string[] Editable(string name)=>name switch {
        "partenaire"=>["nom","type","rue","adresse","ville","pays","codpay","cp","tel","fax","rep","coment"],
        "destination"=>["vildes","codpay","adresse","adresse2"],"pays"=>["nompay","abrpay","codmar"],
        "marche"=>["nommar","gest"],"grpemb"=>["nomgre"],"groupart"=>["type","codgre"],
        "defaut"=>["intdef","famdef","culture"],"typeecart"=>["destype"],
        "declaration_verger"=>["refver_reel","refver_nreel","codvar","refstat"],_=>[]};
    public static async Task Check(MySqlConnection db,Entity entity,bool writing)
    {
        if(writing&&!await SchemaGuard.CanInspectDependencies(db))throw new RuleException("Inspection complète des dépendances indisponible : écriture protégée. Vérifier les droits de lecture du schéma avec le DBA.",409);
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
        var relations=RelationService.Fields(entity.Name).Select(r=>(r.Key,r.Value.Table,r.Value.Key));
        foreach(var (field,table,key) in relations)if(values.TryGetValue(field,out var value)&&value is not null){
            var type=await db.ExecuteScalarAsync<string>("SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@table AND COLUMN_NAME=@key",new{table,key});
            if(type is null||!System.Text.RegularExpressions.Regex.IsMatch(type,"^(smallint|int|bigint)\\("))throw new RuleException("Type SQL de référence parent non validé : "+table+"."+key,409);
            if(await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM `{table}` WHERE `{key}`=@value",new{value})!=1)throw new RuleException("Référence liée absente ou ambiguë : "+table+". Créez/validez d'abord le référentiel parent avec le même code.",409);
        }
    }
    public async Task<object> Protection(ContextInfo ctx,string name,Dictionary<string,JsonElement> key)
    {
        var entity=catalog.Get(name);if(!PilotCatalog.References.Contains(name))throw new RuleException("Référentiel non autorisé.",403);
        await using var db=await connections.Business(ctx);await Check(db,entity,false);
        var row=await records.Record(db,entity,key);var plan=await ComplementaryRules.Plan(db,entity);
        var usages=await ComplementaryRules.Usages(db,entity,row,plan);
        var editable=Editable(name).Where(field=>ComplementaryRules.Blocked(name,[field],false,usages).Length==0&&!plan.Any(d=>d.SqlForeign&&d.ParentField==field&&usages.Any(u=>u.Table==d.Table&&u.Field==d.Field&&u.Count>0))).ToArray();
        return new{editable,deleteAllowed=ComplementaryRules.Blocked(name,[],true,usages).Length==0,usages=usages.Where(u=>u.Count>0),reason=editable.Length==0?"Cette référence est utilisée : modification protégée.":"Les champs autorisés restent corrigeables ; les contrôles sont répétés lors de l’enregistrement."};
    }
    public async Task<object> Write(ContextInfo ctx,ClaimsPrincipal user,string name,PilotMutation request,bool create,bool delete=false)
    {
        var entity=catalog.Get(name);if(!PilotCatalog.References.Contains(name))throw new RuleException("Écriture non autorisée.",403);
        await new PermissionService(connections).Demand(user,name,delete?"delete":create?"add":"modify");
        if(ctx.ReadOnly||!ctx.IsMaster||ctx.Station!="ZAOUIA")throw new RuleException("Les référentiels complémentaires sont gérés dans ZAOUIA maître ; DIAF est mis à jour par synchronisation contrôlée.",403);
        if(request.Values is null||request.Key is null||request.Before is null)throw new RuleException("Demande incomplète.");
        var editable=Editable(name).Concat(create?entity.Keys.Where(k=>!entity.Column(k).Generated):[]).ToArray();
        if(!delete&&(request.Values.Count==0||request.Values.Any(v=>!editable.Contains(v.Key))))throw new RuleException("Champ non autorisé ou identifiant historique non modifiable.");
        if(delete&&request.Values.Count!=0)throw new RuleException("Une suppression ne peut pas contenir de modifications.");
        var values=request.Values.ToDictionary(p=>p.Key,p=>entity.Column(p.Key).Parse(p.Value));
        foreach(var relation in RelationService.Fields(name))if(values.TryGetValue(relation.Key,out var referenced)&&referenced is not null&&PermissionService.Modules.Contains(relation.Value.Table))await new PermissionService(connections).Demand(user,relation.Value.Table);
        if(!delete&&name!="declaration_verger"&&((create&&!values.ContainsKey(entity.Label))||(values.TryGetValue(entity.Label,out var label)&&string.IsNullOrWhiteSpace(Convert.ToString(label)))))throw new RuleException("Libellé obligatoire.");
        await using var db=await connections.Business(ctx);await Check(db,entity,true);
        var plan=await ComplementaryRules.Plan(db,entity);
        var related=ComplementaryRules.LockTables(entity,plan);
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
                {var (where,p)=ReferentialService.Where(entity,key);if(await db.ExecuteScalarAsync<int>($"SELECT COUNT(*) FROM `{name}` WHERE {where}",p)>0)throw new RuleException("Cette référence existe déjà.",409);}
                if(name=="defaut"){values["lier"]="1";values["catdef"]="1";if(!values.ContainsKey("culture"))throw new RuleException("Sélectionnez une culture pour le défaut.");}
                await References(db,entity,values);
                if(name=="declaration_verger"&&new[]{"refver_reel","refver_nreel","codvar","refstat"}.Any(k=>!values.ContainsKey(k)||values[k] is null))throw new RuleException("Les quatre références de la déclaration sont obligatoires.");
                if(name=="declaration_verger")await ComplementaryRules.DeclarationUnique(db,values);
            }else{
                key=request.Key;before=await records.Record(db,entity,key);
                if(request.Before.Count!=entity.Columns.Length||entity.Columns.Any(c=>!request.Before.TryGetValue(c.Name,out var v)||!Json.Equal(before[c.Name],c.Parse(v))))throw new RuleException("La fiche a changé. Rechargez-la.",409);
                await ComplementaryRules.Guard(db,entity,before,values,delete,plan);
                if(!delete)await References(db,entity,values);
            }
            var after=before is null?new Dictionary<string,object?>(values):new(before);foreach(var v in values)after[v.Key]=v.Value;
            if(!delete&&name=="declaration_verger")await ComplementaryRules.DeclarationUnique(db,after,create?null:before!["id"]);
            if(!delete&&name!="declaration_verger"&&(create||!Json.Equal(before![entity.Label],after[entity.Label])))await Conflicts(db,entity,after,"ZAOUIA");
            await using var admin=await connections.Admin();var id=Guid.NewGuid().ToString();
            await admin.ExecuteAsync("INSERT INTO app_changes(id,user_id,context_id,entity,record_key,operation,before_json,after_json,patch_json,status,created_at) VALUES(@id,@uid,@cid,@name,@key,@operation,@before,@after,@patch,'Prepared',UTC_TIMESTAMP(6))",new{id,uid=user.FindFirstValue(ClaimTypes.NameIdentifier),cid=ctx.Id,name,key=Json.Write(key),operation=delete?"Delete":create?"Create":"Update",before=Json.Write(before),after=Json.Write(delete?null:after),patch=Json.Write(values)});
            if(delete){var (where,p)=ReferentialService.Where(entity,key);if(await db.ExecuteAsync($"DELETE FROM `{name}` WHERE {where}",p)!=1)throw new RuleException("Suppression non confirmée.",409);}
            else if(create){var p=new DynamicParameters();foreach(var v in values)p.Add(v.Key,v.Value);await db.ExecuteAsync($"INSERT INTO `{name}` ({string.Join(',',values.Keys.Select(k=>"`"+k+"`"))}) VALUES ({string.Join(',',values.Keys.Select(k=>"@"+k))})",p);
                after=await records.Record(db,entity,key);
            }else await records.Update(db,entity,key,before!,values);
            try{await admin.ExecuteAsync("UPDATE app_changes SET status='Applied',record_key=@key,after_json=@after,completed_at=UTC_TIMESTAMP(6) WHERE id=@id",new{id,key=Json.Write(key),after=Json.Write(delete?null:after)});}catch{return new{id,status="Prepared",message="Écriture locale réalisée ; journal à réconcilier avant toute reprise."};}
            return new{id,status="Applied",key=key.ToDictionary(v=>v.Key,v=>entity.Column(v.Key).Definition.StartsWith("bigint")?JsonSerializer.SerializeToElement(Convert.ToString(entity.Column(v.Key).Parse(v.Value),System.Globalization.CultureInfo.InvariantCulture)):v.Value),message="Enregistrement ZAOUIA réalisé. La synchronisation DIAF nécessite une confirmation distincte."};
        }finally{await db.ExecuteAsync("UNLOCK TABLES");}
    }
}

