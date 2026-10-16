using Vitasouss;
using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.DataProtection;
using System.Security.Claims;
using System.Text.Json;
using System.Security.Cryptography;
using System.Xml.Linq;
using System.IO.Compression;

var root=Path.GetFullPath(Environment.GetEnvironmentVariable("VITASOUSS_TEST_ROOT")??Environment.CurrentDirectory);
var config=new ConfigurationBuilder().SetBasePath(Path.Combine(root,"backend")).AddJsonFile("appsettings.json").AddJsonFile("appsettings.Local.json").Build();
if(config["Admin:Host"]!="127.0.0.1"||config["Admin:Port"]!="33307")throw new Exception("Local only");
var keys=Path.GetFullPath(config["Security:KeyDirectory"]??"keys",Path.Combine(root,"backend"));
var dp=DataProtectionProvider.Create(new DirectoryInfo(keys),b=>{b.SetApplicationName("Vitasouss.Referentiels.V1");if(OperatingSystem.IsWindows())b.ProtectKeysWithDpapi();});
using var connections=new Connections(config,dp);
var service=new AnalyticsService(connections,new PermissionService(connections),LoggerFactory.Create(b=>b.AddConsole()).CreateLogger<AnalyticsService>());
var results=new List<object>();void Check(string name,bool passed){if(!passed)throw new Exception(name);results.Add(new{name,passed});Console.WriteLine("PASS "+name);}
ClaimsPrincipal User(string role,long id=0)=>new(new ClaimsIdentity([new(ClaimTypes.Role,role),new(ClaimTypes.NameIdentifier,id.ToString())],"test"));
var admin=User("Admin");
await using var db=await connections.Admin();
var station=await db.QuerySingleAsync("SELECT s.id,s.server_id FROM app_stations s JOIN app_servers v ON v.id=s.server_id WHERE s.code='ZAOUIA' AND v.host='127.0.0.1' AND v.port=33307");
var diaf=await db.QuerySingleAsync("SELECT s.id,s.server_id FROM app_stations s JOIN app_servers v ON v.id=s.server_id WHERE s.code='DIAF' AND v.host='127.0.0.1' AND v.port=33307");
var contexts=new List<int>();var nonce=Guid.NewGuid().ToString("N");
async Task<int> Context(string database,string label,int refsta,bool archive=false,bool secondary=false){if(!database.StartsWith("vitasouss_test_"))throw new Exception("Test prefix required");var st=secondary?diaf:station;await db.ExecuteAsync("INSERT INTO app_contexts(station_id,database_name,label,read_only,local_refsta) VALUES(@sid,@database,@label,@archive,@refsta) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id),label=VALUES(label),enabled=1",new{sid=(int)st.id,server=(int)st.server_id,database,label,archive,refsta});var id=await db.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()");contexts.Add(id);return id;}
string Json(object value)=>JsonSerializer.Serialize(value,new JsonSerializerOptions{PropertyNamingPolicy=JsonNamingPolicy.CamelCase});
async Task<bool> Refused(Func<Task> action,int status){try{await action();return false;}catch(RuleException ex){return ex.Status==status;}}
try {
 var audit=await Context("vitasouss_test_audit_20261015","AUDIT V150 "+nonce,7816);
 var a=(await service.Read(audit,"receptions",new(),admin))[0];
 if(!a.Available) Console.WriteLine(Json(a.Warnings)); Check("Audit réel importé : source disponible",a.Available);
 Check("Net officiel 1 809 096 kg sans duplication des 215 détails",a.Metrics.SelectedKg==1809096m&&a.Total==213&&a.Metrics.Lots==213);
 Check("Sommes variété et producteur égales au net officiel",a.Varieties.Sum(v=>v.Kg)==1809096m&&a.Producers.Sum(v=>v.Kg)==1809096m);
 Check("Séries quotidiennes et ISO réconciliées",a.Daily.Sum(v=>v.Kg)==1809096m&&a.Weekly.Sum(v=>v.Kg)==1809096m);
 Check("Détails paginés 25",a.Rows.Length==25&&Json(AnalyticsService.Response([a],new())).Contains("\"pageSize\":25"));
 Check("Estimation explicitement non rattachée campagne",a.Estimates is not null&&Json(a.Estimates).Contains("\"campaignLinked\":false"));
 var crates=(await service.Read(audit,"caisserie",new(),admin))[0];
 Check("471 mouvements de caisserie",crates.Available&&crates.Total==471);
 Check("E 95 208 caisses ; S 136 218 ; aucun solde physique déduit",crates.Movements.Single(v=>v.Key=="1:E").Quantity==95208&&crates.Movements.Single(v=>v.Key=="1:S").Quantity==136218&&crates.Warnings.Any(w=>w.Contains("stock")));
 var types=(await service.Read(audit,"caisserie",new(){Movement="E",CrateType=1},admin))[0];Check("Filtrage E et type caisse",types.Total==213&&types.Movements.Length==1);
 var days=(await service.Read(audit,"receptions",new(){Period="custom",From="2026-10-15",To="2026-10-15"},admin))[0];Check("Filtre date réelle inclusif",days.Available&&days.Rows.All(r=>r.Date=="2026-10-15")&&days.Daily.Length==1);
 var variety=a.Varieties.First();var filtered=(await service.Read(audit,"receptions",new(){Variety=int.Parse(variety.Key)},admin))[0];Check("Filtre variété exact",filtered.Metrics.SelectedKg==variety.Kg);
 var prod=a.Producers.First();var byProducer=(await service.Read(audit,"receptions",new(){Producer=int.Parse(prod.Key)},admin))[0];Check("Filtre producteur exact",byProducer.Metrics.SelectedKg==prod.Kg);
 var exported=await service.Read(audit,"receptions",new(),admin,true);var bytes=AnalyticsExcel.Create(exported,new(),"receptions");Directory.CreateDirectory(Path.Combine(root,"output/audit-v150"));File.WriteAllBytes(Path.Combine(root,"output/audit-v150/receptions-export-test.xlsx"),bytes);
 using(var zip=new ZipArchive(new MemoryStream(bytes))){XNamespace ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main";var sheet=XDocument.Load(zip.GetEntry("xl/worksheets/sheet1.xml")!.Open());Check("Excel 213 lignes de données, cellules numériques, aucune formule",sheet.Descendants(ns+"row").Count()==214&&!sheet.Descendants(ns+"f").Any()&&sheet.Descendants(ns+"v").Any());}
 Check("Permissions consultation conservées",PermissionService.Allows(User("Consultation"),"receptions","view",[new("receptions",true,false,false,false)])&&!PermissionService.Allows(User("Consultation"),"receptions","modify",[new("receptions",true,true,true,false)]));
 Check("Module arbitraire refusé API/service",await Refused(()=>service.Read(audit,"arbitrary",new(),admin),404));
 Check("Page et tri arbitraire refusés",await Refused(()=>service.Read(audit,"receptions",new(){Page=401},admin),400)&&await Refused(()=>service.Read(audit,"receptions",new(){Sort="DROP TABLE reception"},admin),400));
 Check("Date invalide refusée",await Refused(()=>service.Read(audit,"receptions",new(){Period="custom",From="x",To="2026-10-15"},admin),400));
 // Synthetic cross-station and archive fixtures are provisioned by tools/prepare-v150-fixtures.py.
 var z=await Context("vitasouss_test_v150_z","SYNTH V150 Z "+nonce,7816);
 var d=await Context("vitasouss_test_v150_d","SYNTH V150 D "+nonce,7702,secondary:true);
 var pz=await Context("vitasouss_test_v150_pz","SYNTH V150 PZ "+nonce,7816,true);
 var pd=await Context("vitasouss_test_v150_pd","SYNTH V150 PD "+nonce,7702,true,true);
 var missing=await Context("vitasouss_test_v150_missing","SYNTH V150 MISSING "+nonce,7702,secondary:true);
 var nullable=await Context("vitasouss_test_v150_null2","SYNTH V150 NULL "+nonce,7816);
 var bad=await Context("vitasouss_test_v150_bad2","SYNTH V150 BAD "+nonce,7702,secondary:true);
 var pagez=await Context("vitasouss_test_v150_pagez2","SYNTH V150 PAGEZ "+nonce,7816);
 var paged=await Context("vitasouss_test_v150_paged2","SYNTH V150 PAGED "+nonce,7702,secondary:true);
 var q=new AnalyticsQuery{OtherContext=d,Period="custom",From="2026-10-15",To="2026-10-15"};
 var both=await service.Read(z,"receptions",q,admin);Check("Consolidation : numrec identiques distincts par station",both.All(s=>s.Available)&&both.Sum(s=>s.Metrics.SelectedKg)==5500m&&both.Sum(s=>s.Total)==3);
 Check("Station locale bornée même dans base contenant autre station",both[1].Metrics.SelectedKg==3000m&&both[1].Total==1);
 Check("Estimation consolidée volontairement indisponible",Json(AnalyticsService.Response(both,q)).Contains("\"estimateConsolidationAvailable\":false"));
 Check("Campagnes courantes incompatibles refusées",await Refused(()=>service.Read(z,"receptions",new(){OtherContext=bad},admin),409));
 var partial=await service.Read(nullable,"receptions",new(),admin);Check("Poids net nul et date absente ne donnent pas un faux total complet",partial[0].Available&&partial[0].Metrics.MissingNet==1&&partial[0].Metrics.MissingDate==1&&Json(AnalyticsService.Response(partial,new())).Contains("\"totalKg\":null"));
 Check("Rattachements manquants conservés en catégorie inconnue",partial[0].Varieties.Any(v=>v.Key=="999")&&partial[0].Rows.Any(r=>r.Number==100&&r.NetKg is null));
 Check("Parcelles ambiguës exclues du calcul, absences non assimilées zéro",Json(partial[0].Estimates!).Contains("\"estimatedKg\":2000")&&Json(partial[0].Estimates!).Contains("Identit"));
 var pages=new List<AnalyticsDetail>();for(var page=1;page<=5;page++){var pq=new AnalyticsQuery{OtherContext=paged,Period="custom",From="2026-10-15",To="2026-10-15",Page=page,Sort="number",Asc=true};var ss=await service.Read(pagez,"receptions",pq,admin);pages.AddRange(AnalyticsService.Order(ss.SelectMany(s=>s.Rows),pq).Skip((page-1)*25).Take(25));}Check("Pagination consolidée stable sans collision ou perte",pages.Count==123&&pages.Select(r=>(r.ContextId,r.Number)).Distinct().Count()==123);
 var unavailable=await service.Read(z,"receptions",new(){OtherContext=missing},admin);var response=Json(AnalyticsService.Response(unavailable,new(){OtherContext=missing}));Check("Source DIAF absente : total incomplet et totalKg NULL",!unavailable[1].Available&&response.Contains("\"complete\":false")&&response.Contains("\"totalKg\":null"));
 var compared=await service.Read(z,"receptions",new(){OtherContext=d,PreviousContext=pz,PreviousOtherContext=pd},admin);Check("Comparaison avec deux archives synthétiques",compared.Length==4&&compared.All(s=>s.Available));
 Check("Alignement archive même nombre de jours depuis début campagne",compared[2].Period!.From==compared[0].Period!.From.AddYears(-1)&&compared[2].Period!.To==compared[0].Period!.To.AddYears(-1));
 Check("Archive comparative future exclue et courant limité aujourd'hui",compared[0].Period!.To==AnalyticsPeriod.Today()&&compared[0].Metrics.SelectedKg==5100m&&compared[2].Metrics.SelectedKg==2550m);
 Check("Consolidation comparative sans deuxième archive refusée",await Refused(()=>service.Read(z,"receptions",new(){OtherContext=d,PreviousContext=pz},admin),409));
 var iso=(await service.Read(z,"receptions",new(){Period="custom",From="2026-12-31",To="2027-01-01"},admin))[0];Check("Année ISO semaine 53 : 31 décembre et 1 janvier regroupés",iso.Weekly.Length==1&&iso.Weekly[0].Key=="202653"&&iso.Weekly[0].Kg==700m);
 var search=(await service.Read(z,"receptions",new(){Search="' OR 1=1 --"},admin))[0];Check("Recherche paramétrée sans injection",search.Available&&search.Total==0);
 Check("Produit non agrume et catégorie filtrables",(await service.Read(z,"receptions",new(){Category=2,Product=2},admin))[0].Metrics.SelectedKg==1500m);
 var sq=new AnalyticsQuery{Period="custom",From="2026-10-15",To="2026-10-15"};var x=(await service.Read(z,"receptions",sq,admin))[0];Check("Net officiel distinct poids brut, aucun double comptage détails",x.Metrics.SelectedKg==2500m);
 // Fake user has only reception view and exactly ONE authorized context.
 var uid=await db.ExecuteScalarAsync<int>("SELECT id FROM app_users WHERE username='v150_readonly_fixture'");
 if(uid==0){await db.ExecuteAsync("INSERT INTO app_users(username,display_name,password_hash,role,enabled) VALUES('v150_readonly_fixture','TEST V150','not-a-login-hash','Consultation',0)");uid=await db.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()");}
 await db.ExecuteAsync("INSERT IGNORE INTO app_module_permissions(user_id,module,can_view,can_add,can_modify,can_delete) VALUES(@uid,'receptions',1,0,0,0);INSERT IGNORE INTO app_user_contexts(user_id,context_id) VALUES(@uid,@z)",new{uid,z});
 var consultation=User("Consultation",uid);Check("Consultation sur contexte autorisé",(await service.Read(z,"receptions",sq,consultation))[0].Available);
 Check("DIAF non autorisé refusé avant consolidation",await Refused(()=>service.Read(z,"receptions",new(){OtherContext=d},consultation),403));
 Check("Archive non autorisée refusée",await Refused(()=>service.Read(z,"receptions",new(){PreviousContext=pz},consultation),403));
 Check("Module Caisserie absent refusé",await Refused(()=>service.Read(z,"caisserie",new(),consultation),403));
 var fake=new AnalyticsSource{Available=true,Total=20001};Check("Export volumineux refusé sans troncature",await Refused(()=>Task.Run(()=>AnalyticsExcel.Create([fake],new(),"receptions")),413));
 fake.Total=1;fake.Rows=[new(){Producer="=HYPERLINK(\"https://example.invalid\")",NetKg=1234}];var safe=AnalyticsExcel.Create([fake],new(),"receptions");using(var zip=new ZipArchive(new MemoryStream(safe))){var doc=XDocument.Load(zip.GetEntry("xl/worksheets/sheet1.xml")!.Open());Check("Export texte dangereux stocké comme texte, jamais formule",!doc.Descendants().Any(x=>x.Name.LocalName=="f")&&doc.Root!.Value.Contains("=HYPERLINK"));}
 var hashes=JsonSerializer.Deserialize<JsonElement>(File.ReadAllText(Path.Combine(root,"output/audit-v150/baseline/drencher-hashes.json")));Check("Toutes les sources Drencher et SQL010/011 inchangées",hashes.EnumerateArray().All(h=>Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(Path.Combine(root,h.GetProperty("path").GetString()!))))==h.GetProperty("sha256").GetString()));
} finally {foreach(var id in contexts)await db.ExecuteAsync("UPDATE app_contexts SET enabled=0 WHERE id=@id AND label LIKE '%V150%'",new{id});}
Directory.CreateDirectory(Path.Combine(root,"docs"));File.WriteAllText(Path.Combine(root,"docs/tests-v150-service.json"),Json(new{date=DateTime.UtcNow,passed=results.Count,failed=0,productionAccess=false,results}));






