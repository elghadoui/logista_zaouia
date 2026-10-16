using Dapper;
using System.Globalization;
namespace Vitasouss;
public sealed class RelationService(Connections connections)
{
    public static Dictionary<string,(string Table,string Key,string Label)> Fields(string name)=>name switch {
        "groupart"=>new(){["codgre"]=("grpemb","codgre","nomgre")},
        "destination" or "partenaire"=>new(){["codpay"]=("pays","codpay","nompay")},
        "pays"=>new(){["codmar"]=("marche","codmar","nommar")},
        "defaut"=>new(){["culture"]=("culture","codcul","nomcul")},
        "declaration_verger"=>new(){["refver_reel"]=("verger","refver","nomver"),["refver_nreel"]=("verger","refver","nomver"),["codvar"]=("variete","codvar","nomvar"),["refstat"]=("station","refsta","nomsta")},
        "reception"=>new(){["refver"]=("verger","refver","nomver"),["refverreel"]=("verger","refver","nomver"),["codvar"]=("variete","codvar","nomvar"),["refsta"]=("station","refsta","nomsta")},
        "versement"=>new(){["refver"]=("verger","refver","nomver"),["codvar"]=("variete","codvar","nomvar"),["refsta"]=("station","refsta","nomsta")},
        "dossier"=>new(){["coddes"]=("destination","coddes","vildes"),["refexp"]=("partenaire","ref","nom"),["refte"]=("partenaire","ref","nom"),["reftrp"]=("partenaire","ref","nom"),["reftm"]=("partenaire","ref","nom")},
        "ecart_e"=>new(){["codvar"]=("variete","codvar","nomvar"),["codtype"]=("typeecart","codtype","destype")},_=>new()};
    public async Task<Dictionary<string,object[]>> Options(ContextInfo ctx,string name)
    {
        var result=new Dictionary<string,object[]>();await using var db=await connections.Business(ctx);
        foreach(var (field,reference) in Fields(name)){
            try {
                var joined=reference.Table=="verger";
                var label=joined?"CONCAT(COALESCE(a.nomadh,''),' / ',e.nomver,' · Réf. ',e.refver)":$"e.`{reference.Label}`";
                var joins=joined?" LEFT JOIN adherent a ON a.refadh=e.refadh":"";
                var rows=await db.QueryAsync($"SELECT e.`{reference.Key}` value,MIN({label}) label FROM `{reference.Table}` e{joins} WHERE e.`{reference.Key}` IS NOT NULL GROUP BY e.`{reference.Key}` HAVING COUNT(*)=1 ORDER BY label LIMIT 5000");
                result[field]=rows.Select(r=>(object)new{value=Convert.ToString(r.value,CultureInfo.InvariantCulture)!,label=Convert.ToString(r.label)??"Sans libellé"}).ToArray();
            }catch(MySqlConnector.MySqlException e)when(e.Number==1146||e.Number==1054){result[field]=[];}
        }
        if(name=="defaut"){
            var families=await db.QueryAsync<string>("SELECT DISTINCT famdef FROM defaut WHERE famdef IS NOT NULL AND TRIM(famdef)<>'' ORDER BY famdef LIMIT 5000");
            result["famdef"]=families.Select(v=>(object)new{value=v,label=v}).ToArray();
        }
        return result;
    }
    public async Task<Dictionary<string,object?>[]> Display(ContextInfo ctx,string name,Dictionary<string,object?>[] rows)
    {
        var options=await Options(ctx,name);var fields=Fields(name);
        var maps=options.Where(o=>fields.ContainsKey(o.Key)).ToDictionary(o=>o.Key,o=>o.Value.Select(v=>System.Text.Json.JsonSerializer.SerializeToElement(v)).ToDictionary(v=>v.GetProperty("value").GetString()!,v=>v.GetProperty("label").GetString()));
        var result=rows.Select(r=>new Dictionary<string,object?>(r)).ToArray();
        foreach(var row in result)foreach(var (field,map) in maps)row[field]=row.TryGetValue(field,out var value)&&value is not null?map.GetValueOrDefault(Convert.ToString(value,CultureInfo.InvariantCulture)!)??"Référence absente ou ambiguë":"—";
        if(name=="grpemb"){
            await using var db=await connections.Business(ctx);foreach(var row in result){try{row["articlesCount"]=await db.ExecuteScalarAsync<long>("SELECT COUNT(*) FROM groupart WHERE codgre=@id",new{id=row["codgre"]});}catch(MySqlConnector.MySqlException e)when(e.Number==1146||e.Number==1054){row["articlesCount"]=null;}}
        }return result;
    }
}
