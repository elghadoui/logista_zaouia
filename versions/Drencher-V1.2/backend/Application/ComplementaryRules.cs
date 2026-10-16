using Dapper;
using MySqlConnector;
namespace Vitasouss;

/// <summary>Business guards shared by local CRUD and confirmed replication to DIAF.</summary>
public static class ComplementaryRules
{
    public sealed record Dependency(string Table, string Field, string ParentField, bool Confirmed,bool SqlForeign=false);
    public sealed record Usage(string Table, string Field, long Count, bool Confirmed);
    private static Dependency[] Confirmed(string name) => name switch {
        "destination" => [new("dossier","coddes","coddes",true)],
        "partenaire" => [new("dossier","refexp","ref",true),new("dossier","refte","ref",true),new("dossier","reftrp","ref",true),new("dossier","reftm","ref",true),new("palette","codexp","ref",true)],
        "pays" => [new("destination","codpay","codpay",true),new("partenaire","codpay","codpay",true)],
        "marche" => [new("pays","codmar","codmar",true)],
        "grpemb" => [new("groupart","codgre","codgre",true)],
        "groupart" => [new("tpalette","codgrp","codgrp",true),new("palette","codgrp","codgrp",true)],
        "defaut" => [new("agreage","coddef","coddef",true)],
        "typeecart" => [new("ecart_e","codtype","codtype",true)],
        _ => []
    };
    private static string[] CandidateFields(string name) => name switch {
        "partenaire" => ["refexp","refte","reftrp","reftm","codexp"],
        "declaration_verger" => [],
        _ => Confirmed(name).Select(d=>d.ParentField).Distinct().ToArray()
    };
    public static async Task<Dependency[]> Plan(MySqlConnection db,Entity entity)
    {
        if(!await SchemaGuard.CanInspectDependencies(db))throw new RuleException("Inspection complète des dépendances indisponible : opération protégée.",409);
        var columns=(await db.QueryAsync("SELECT c.TABLE_NAME,c.COLUMN_NAME FROM information_schema.COLUMNS c JOIN information_schema.TABLES t ON t.TABLE_SCHEMA=c.TABLE_SCHEMA AND t.TABLE_NAME=c.TABLE_NAME WHERE c.TABLE_SCHEMA=DATABASE() AND t.TABLE_TYPE='BASE TABLE'")).ToArray();
        var required=Confirmed(entity.Name);
        if(required.Any(d=>!columns.Any(c=>(string)c.TABLE_NAME==d.Table&&(string)c.COLUMN_NAME==d.Field)))
            throw new RuleException("Contrôle des dépendances indisponible : table ou colonne métier manquante. Écriture protégée.",409);
        if(entity.Name=="declaration_verger" && new[]{"refverreel","refver","codvar","refsta"}.Any(field=>!columns.Any(c=>(string)c.TABLE_NAME=="reception"&&(string)c.COLUMN_NAME==field)))
            throw new RuleException("Contrôle de la combinaison réception indisponible : écriture protégée.",409);
        var candidates=columns.Where(c=>(string)c.TABLE_NAME!=entity.Name && CandidateFields(entity.Name).Contains((string)c.COLUMN_NAME)
            // marque.codmar is a distinct identifier, not the pays -> marche relationship.
            && !(entity.Name=="marche"&&(string)c.TABLE_NAME=="marque"))
            .Select(c=>new Dependency((string)c.TABLE_NAME,(string)c.COLUMN_NAME,entity.Keys[0],false));
        var foreign=(await db.QueryAsync("SELECT TABLE_NAME,COLUMN_NAME,REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_NAME=@name",new{name=entity.Name}))
            .Select(c=>new Dependency((string)c.TABLE_NAME,(string)c.COLUMN_NAME,(string)c.REFERENCED_COLUMN_NAME,true,true));
        var result=foreign.Concat(required).Concat(candidates).DistinctBy(d=>(d.Table,d.Field,d.ParentField)).ToArray();
        foreach(var d in result) foreach(var identifier in new[]{d.Table,d.Field,d.ParentField})
            if(!System.Text.RegularExpressions.Regex.IsMatch(identifier,"^[a-zA-Z0-9_]+$"))throw new RuleException("Dépendance SQL non validée.",409);
        return result;
    }
    public static string[] LockTables(Entity entity,Dependency[] plan) => plan.Select(d=>d.Table)
        .Concat(RelationService.Fields(entity.Name).Values.Select(r=>r.Table))
        .Concat(entity.Name=="declaration_verger"?new[]{"reception"}:[]).Where(t=>t!=entity.Name).Distinct().Order().ToArray();

    public static async Task<Usage[]> Usages(MySqlConnection db,Entity entity,Dictionary<string,object?> row,Dependency[] plan)
    {
        var usages=new List<Usage>();
        if(entity.Name=="declaration_verger"){
            var count=await db.ExecuteScalarAsync<long>("SELECT COUNT(*) FROM reception WHERE refverreel=@real AND refver=@declared AND codvar=@variety AND refsta=@station",new{real=row["refver_reel"],declared=row["refver_nreel"],variety=row["codvar"],station=row["refstat"]});
            usages.Add(new("reception","refverreel + refver + codvar + refsta",count,true));
        }
        foreach(var d in plan){
            if(!row.TryGetValue(d.ParentField,out var value))throw new RuleException("Identifiant de dépendance absent : opération protégée.",409);
            if(value is null){usages.Add(new(d.Table,d.Field,0,d.Confirmed));continue;}
            var count=await db.ExecuteScalarAsync<long>($"SELECT COUNT(*) FROM `{d.Table}` WHERE `{d.Field}`=@value",new{value});
            usages.Add(new(d.Table,d.Field,count,d.Confirmed));
        }
        return usages.ToArray();
    }
    public static async Task Guard(MySqlConnection db,Entity entity,Dictionary<string,object?> before,Dictionary<string,object?> patch,bool delete,Dependency[]? plan=null)
    {
        var changed=patch.Where(p=>!Json.Equal(before[p.Key],p.Value)).Select(p=>p.Key).ToArray();
        if(!delete && changed.Length==0)throw new RuleException("Aucune modification à enregistrer.");
        plan??=await Plan(db,entity);
        var usages=await Usages(db,entity,before,plan);
        var foreign=usages.Where(u=>u.Count>0&&plan.Any(d=>d.SqlForeign&&d.Table==u.Table&&d.Field==u.Field&&changed.Contains(d.ParentField)));
        var blocking=Blocked(entity.Name,changed,delete,usages).Concat(foreign).DistinctBy(u=>(u.Table,u.Field)).ToArray();
        if(blocking.Length>0)throw new RuleException((delete?"Suppression interdite":"Modification interdite")+" : "+string.Join(" ; ",blocking.Select(u=>$"{u.Count} utilisation(s) dans {u.Table}.{u.Field}"+(u.Confirmed?"":" (porteur de code à valider)")))+". Aucun changement effectué.",409);
    }
    public static Usage[] Blocked(string name,string[] changed,bool delete,Usage[] usages) => usages.Where(u=>u.Count>0 && (delete || name switch {
            "destination" => changed.Contains("codpay")&&u.Table=="dossier",
            "partenaire" => changed.Contains("type"),
            "pays" => u.Table=="destination",
            "grpemb" => u.Table=="groupart",
            "groupart" => u.Table=="tpalette",
            "defaut" => u.Table=="agreage",
            "typeecart" => u.Table=="ecart_e",
            "declaration_verger" => u.Table=="reception",
            _ => false
        })).ToArray();
    public static async Task DeclarationUnique(MySqlConnection db,Dictionary<string,object?> row,object? excludingId=null)
    {
        if(new[]{"refver_reel","refver_nreel","codvar","refstat"}.Any(k=>!row.TryGetValue(k,out var value)||value is null))throw new RuleException("Les quatre références de la déclaration sont obligatoires.");
        if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM declaration_verger WHERE refver_reel=@real AND refver_nreel=@declared AND codvar=@variety AND refstat=@station AND (@id IS NULL OR id<>@id)",new{real=row["refver_reel"],declared=row["refver_nreel"],variety=row["codvar"],station=row["refstat"],id=excludingId})>0)
            throw new RuleException("Cette combinaison verger réel / déclaré / variété / station existe déjà.",409);
    }
}
