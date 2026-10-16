using Vitasouss;
using Dapper;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.Logging.Abstractions;
using System.Security.Claims;
using System.Text.Json;
using System.Security.Cryptography;
using System.Xml.Linq;
using System.IO.Compression;
using System.Net;

var location=new DirectoryInfo(AppContext.BaseDirectory);
while(location is not null&&!File.Exists(Path.Combine(location.FullName,"backend/Vitasouss.Api.csproj")))location=location.Parent;
var root=location?.FullName??throw new Exception("Project root not found");
var config=new ConfigurationBuilder().SetBasePath(Path.Combine(root,"backend")).AddJsonFile("appsettings.json").AddJsonFile("appsettings.Local.json").Build();
if(config["Admin:Host"]!="127.0.0.1"||config["Admin:Port"]!="33307")throw new Exception("Local tests only");
var keys=Path.GetFullPath(config["Security:KeyDirectory"]??"keys",Path.Combine(root,"backend"));
var dp=DataProtectionProvider.Create(new DirectoryInfo(keys),b=>{b.SetApplicationName("Vitasouss.Referentiels.V1");if(OperatingSystem.IsWindows())b.ProtectKeysWithDpapi();});
using var connections=new Connections(config,dp);var permissions=new PermissionService(connections);
var service=new ExportAnalyticsService(connections,permissions,NullLogger<ExportAnalyticsService>.Instance);
await using var adminDb=await connections.Admin();
var station=await adminDb.QuerySingleAsync("SELECT s.id,s.server_id FROM app_stations s JOIN app_servers v ON v.id=s.server_id WHERE s.code='ZAOUIA' AND v.host='127.0.0.1' AND v.port=33307");
var diaf=await adminDb.QuerySingleAsync("SELECT s.id,s.server_id FROM app_stations s JOIN app_servers v ON v.id=s.server_id WHERE s.code='DIAF' AND v.host='127.0.0.1' AND v.port=33307");
var ids=new List<int>();var users=new List<long>();var nonce=Guid.NewGuid().ToString("N");var results=new List<object>();var success=false;
void Check(string name,bool ok){if(!ok)throw new Exception(name);results.Add(new{name,passed=true});Console.WriteLine("PASS "+name);}
ClaimsPrincipal Actor(string role,long id=0)=>new(new ClaimsIdentity([new(ClaimTypes.Role,role),new(ClaimTypes.NameIdentifier,id.ToString())],"SyntheticLocalTest"));
async Task<bool> Refused(Func<Task> action,int status){try{await action();return false;}catch(RuleException ex){return ex.Status==status;}}
async Task<int> Context(string database,bool secondary=false,bool archive=false){if(!database.StartsWith("vitasouss_test_"))throw new Exception("Fixture only");var st=secondary?diaf:station;await adminDb.ExecuteAsync("INSERT INTO app_contexts(station_id,database_name,label,read_only,local_refsta) VALUES(@sid,@database,@label,@archive,@refsta) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id),enabled=1,read_only=VALUES(read_only)",new{sid=(int)st.id,database,label="TEST EXPORT V160 "+nonce,archive,refsta=secondary?7702:7816});var id=await adminDb.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()");ids.Add(id);return id;}
async Task<long> User(int context,bool allow){await adminDb.ExecuteAsync("INSERT INTO app_users(username,display_name,password_hash,role,enabled) VALUES(@name,'TEST EXPORT V160','not-a-login-hash','Consultation',0)",new{name="test_export_"+Guid.NewGuid().ToString("N")});var uid=await adminDb.ExecuteScalarAsync<long>("SELECT LAST_INSERT_ID()");users.Add(uid);await adminDb.ExecuteAsync("INSERT INTO app_user_contexts(user_id,context_id) VALUES(@uid,@context);INSERT INTO app_module_permissions(user_id,module,can_view,can_add,can_modify,can_delete) VALUES(@uid,'export',@allow,0,0,0)",new{uid,context,allow});return uid;}
var admin=Actor("Admin");var output=Path.Combine(root,"output/audit-v160");Directory.CreateDirectory(output);
try {
 var audit=await Context("vitasouss_test_export_audit_20261015");
 var context=await connections.Resolve(audit,admin);await using var auditDb=await connections.Business(context);
 var before=await auditDb.QueryAsync("CHECKSUM TABLE bdq,dossier,palette,palette_d");var beforeJson=JsonSerializer.Serialize(before);
 var a=await service.Read(audit,new(),admin);
 if(!a.Complete)Console.WriteLine(string.Join(";",a.Warnings));
 Check("Audit importé : quatre dossiers et quatre bons de quai",a.Complete&&a.Count==4&&a.Total!.Shipments==4);
 Check("Poids net enregistré distinct du commercial et pesé",a.Total!.NetKg==21158.40m&&a.Total.CommercialKg==21858m&&a.Total.WeighedKg==25852.20m);
 Check("21 palettes déclarées, pas les 31 palettes créées",a.Total.Pallets==21&&a.Total.Packages==4773);
 Check("Audit codmaj 0 : aucun export officiel, client destination confirmé",a.ConfirmationAvailable&&a.ConfirmedNetKg==0&&a.Official!.Shipments==0&&a.StatusCounts.InProgress==4&&a.Rows.All(r=>r.Client==r.Destination));
 Check("Agrégats journaliers, ISO, variétés et destinations réconciliés",a.Daily.Length==0&&a.Weekly.Length==0&&a.Varieties.Length==0&&a.Destinations.Length==0);
 var r=a.Rows.First();
 Check("Filtre variété",(await service.Read(audit,new(){Variety=r.VarietyId},admin)).Rows.All(x=>x.VarietyId==r.VarietyId));
 Check("Filtre destination",(await service.Read(audit,new(){Destination=r.DestinationId},admin)).Rows.All(x=>x.DestinationId==r.DestinationId));
 Check("Filtre emballage",(await service.Read(audit,new(){Packaging=r.PackagingId},admin)).Rows.All(x=>x.PackagingId==r.PackagingId));
 Check("Recherche SQL paramétrée",(await service.Read(audit,new(){Search="' OR 1=1 --"},admin)).Count==0);
 var cal=await service.Read(audit,new(){Calibre=4},admin);Check("Calibre : 756 colis réels, net non ventilé NULL",cal.Total!.Packages==756&&cal.Total.NetKg is null&&cal.Rows.All(x=>x.Calibre==4)&&cal.Total.Pallets==7);
 Check("État technique 2 sans résultat, aucune confirmation inventée",(await service.Read(audit,new(){Status=2},admin)).Count==0);
 Check("Détail dossier en lecture seule",(await service.Read(audit,new(){Shipment=1},admin)).Rows.All(x=>x.Shipment==1));
 Check("Bornes de période inclusives",(await service.Read(audit,new(){Period="custom",From="2026-10-15",To="2026-10-15"},admin)).Count==4&&(await service.Read(audit,new(){Period="custom",From="2026-10-14",To="2026-10-14"},admin)).Count==0);
 Check("Année ISO 53 préservée",ExportAnalyticsService.Week("2021-01-01")=="2020-S53");
 int z=await Context("vitasouss_test_export_v160_z"),d=await Context("vitasouss_test_export_v160_d",true),pz=await Context("vitasouss_test_export_v160_pz",archive:true),pd=await Context("vitasouss_test_export_v160_pd",true,true);
 Check("Station locale strictement bornée",(await service.Read(z,new(),admin)).Total!.NetKg==21158.40m);
 var both=await service.Read(z,new(){OtherContext=d},admin);Check("Consolidation sans collision des numéros dossier",both.Total!.Shipments==8&&both.Total.NetKg==42316.80m&&both.Rows.Select(x=>(x.ContextId,x.Shipment)).Distinct().Count()==8);
 var previous=await service.Read(z,new(){OtherContext=d,PreviousContext=pz,PreviousOtherContext=pd},admin);Check("Comparaison archives réelles configurées, durée équivalente",previous.Sources.Length==4&&previous.Sources.All(x=>x.Available)&&previous.Sources[2].Period!.From==previous.Sources[0].Period!.From.AddYears(-1)&&previous.Sources[2].SelectedMetrics.NetKg==21158.40m&&previous.Sources[2].Metrics.CommercialKg==0);
 Check("Campagnes incompatibles refusées",await Refused(()=>service.Read(z,new(){OtherContext=pd},admin),409));
 var nullId=await Context("vitasouss_test_export_v160_null");var nullResult=await service.Read(nullId,new(),admin);Check("Poids NULL et palette négative ne deviennent jamais zéro",nullResult.Total!.NetKg is null&&nullResult.Total.Pallets is null&&nullResult.Total.Packages==4773);
 var ambiguous=await Context("vitasouss_test_export_v160_ambiguous");Check("Clé de bon de quai ambiguë : agrégats suspendus",!(await service.Read(ambiguous,new(),admin)).Complete);
 var missing=await Context("vitasouss_test_audit_20261015",true);var partial=await service.Read(z,new(){OtherContext=missing},admin);Check("Source absente : total consolidé indisponible",!partial.Complete&&partial.Total is null&&partial.Official is null&&partial.Observed.NetKg==21158.40m);
 Check("Export incomplet refusé",await Refused(()=>service.Read(z,new(){OtherContext=missing},admin,export:true),409));
 var page=await Context("vitasouss_test_export_v160_page");var p1=await service.Read(page,new(){Sort="net",Asc=true},admin);var p2=await service.Read(page,new(){Page=2,Sort="net",Asc=true},admin);Check("Pagination stable 25 puis 9, aucun doublon",p1.Count==34&&p1.Rows.Length==25&&p2.Rows.Length==9&&p1.Rows.Concat(p2.Rows).Select(x=>x.Dock).Distinct().Count()==34);
 Check("Tri numérique du poids",p1.Rows.Zip(p1.Rows.Skip(1)).All(x=>x.First.NetKg<=x.Second.NetKg));

 var confirmed=await Context("vitasouss_test_export_v160_confirmed");var official=await service.Read(confirmed,new(),admin);
 Check("Statuts 0/1/2/9 distincts sans compter les deux BDQ comme deux dossiers",official.Count==5&&official.StatusCounts==new ExportStatusCounts(1,1,1,1)&&official.Official!.Shipments==1);
 Check("Poids officiel pdscom uniquement codmaj 2, sans net secondaire",official.ConfirmedNetKg==7739m&&official.Official!.CommercialKg==7739m&&official.Official!.NetKg==7603.6m&&official.Official!.Pallets==9&&official.Official!.Packages==3362);
 Check("Graphiques officiels quotidien/ISO/client/pays/variété réconciliés",official.Daily.Sum(r=>r.NetKg)==7739&&official.Weekly.Sum(r=>r.NetKg)==7739&&official.Destinations.Sum(r=>r.NetKg)==7739&&official.Countries.Sum(r=>r.NetKg)==7739&&official.Varieties.Sum(r=>r.NetKg)==7739);
 foreach(var status in new[]{0,1,2,-1}){var filtered=await service.Read(confirmed,new(){Status=status},admin);Check("Filtre statut "+status+" sans contamination des exports",filtered.Rows.All(r=>status==-1?r.Status is not (0 or 1 or 2):r.Status==status)&&filtered.Official!.CommercialKg==(status==2?7739:0)&&filtered.StatusCounts==official.StatusCounts);}
 Check("Libellés métier et informations de transport",official.Rows.Any(r=>r.StatusLabel=="Chargé")&&official.Rows.Any(r=>r.StatusLabel=="Expédié et clôturé")&&official.Rows.Any(r=>r.StatusLabel=="Statut inconnu")&&official.Rows.All(r=>r.Carrier is not null&&r.Forwarder is not null));
 var unknownRow=new ExportRow{Status=null,CommercialKg=999};Check("Statut NULL jamais considéré expédié",unknownRow.StatusLabel=="Statut inconnu"&&ExportAnalyticsService.StatusCounts([unknownRow]).Unknown==1);

 var cd=await Context("vitasouss_test_export_v160_confirmed_d",true);var cpz=await Context("vitasouss_test_export_v160_confirmed_pz",archive:true);var cpd=await Context("vitasouss_test_export_v160_confirmed_pd",true,true);
 var officialBoth=await service.Read(confirmed,new(){OtherContext=cd,PreviousContext=cpz,PreviousOtherContext=cpd},admin);
 Check("Consolidation officielle : 15478 kg, deux dossiers distincts entre stations",officialBoth.ConfirmedNetKg==15478&&officialBoth.Official!.Shipments==2&&officialBoth.Daily.Sum(r=>r.NetKg)==15478);
 Check("Comparaison archives officielle pdscom et statuts identiques",officialBoth.Sources.Length==4&&officialBoth.Sources.All(s=>s.Metrics.CommercialKg==7739&&s.Metrics.Shipments==1));
 var sn=await Context("vitasouss_test_export_v160_status_null");var nullStatus=await service.Read(sn,new(){Status=-1},admin);Check("SQL statut NULL : dossier visible inconnu mais non exporté",nullStatus.Count==1&&nullStatus.Rows[0].Status is null&&nullStatus.ConfirmedNetKg==0);
 var calOfficial=await service.Read(confirmed,new(){Calibre=3,Status=2},admin);Check("Filtre calibre ne substitue jamais palette_d au poids officiel BDQ",calOfficial.Rows.Length==1&&calOfficial.ConfirmedNetKg is null&&calOfficial.Official!.Packages==3360&&calOfficial.Rows.All(r=>r.CommercialKg is null));
 var officialNull=await Context("vitasouss_test_export_v160_official_null");Check("Poids officiel NULL reste indisponible, aucun repli pdsnet",(await service.Read(officialNull,new(),admin)).ConfirmedNetKg is null);
 var officialExcel=ExportAnalyticsService.Excel(await service.Read(confirmed,new(){Status=2},admin,true),new(){Status=2});File.WriteAllBytes(Path.Combine(output,"export-official.xlsx"),officialExcel);
 var uid=await User(audit,true);var none=await User(audit,false);var reader=Actor("Consultation",uid);
 Check("Consultation Export autorisée",(await service.Read(audit,new(),reader)).Count==4);
 Check("Module absent refusé",await Refused(()=>service.Read(audit,new(),Actor("Consultation",none)),403));
 Check("Station et exercice non attribués refusés",await Refused(()=>service.Read(audit,new(){OtherContext=d},reader),403)&&await Refused(()=>service.Read(audit,new(){PreviousContext=pz},reader),403));
 Check("Tri et pagination invalides refusés",await Refused(()=>service.Read(audit,new(){Sort="DROP"},admin),400)&&await Refused(()=>service.Read(audit,new(){Page=0},admin),400));
 var exported=await service.Read(audit,new(),admin,export:true);var bytes=ExportAnalyticsService.Excel(exported,new());File.WriteAllBytes(Path.Combine(output,"export-service.xlsx"),bytes);
 using(var zip=new ZipArchive(new MemoryStream(bytes))){XNamespace ns="http://schemas.openxmlformats.org/spreadsheetml/2006/main";var sheet=XDocument.Load(zip.GetEntry("xl/worksheets/sheet1.xml")!.Open());Check("Excel typé, 24 colonnes et pas de formule",sheet.Descendants(ns+"row").Count()==5&&!sheet.Descendants(ns+"f").Any()&&sheet.Descendants(ns+"autoFilter").Single().Attribute("ref")!.Value=="A1:X5");}
 // Real endpoint binding and service over ephemeral loopback HTTP; synthetic identities only in this test host.
 var builder=WebApplication.CreateBuilder(new WebApplicationOptions{ContentRootPath=root});builder.Logging.ClearProviders();builder.WebHost.UseUrls("http://127.0.0.1:0");builder.Services.AddSingleton(connections);builder.Services.AddSingleton(permissions);builder.Services.AddScoped<ExportAnalyticsService>();builder.Services.AddScoped<AnalyticsService>();
 await using var app=builder.Build();app.Use(async(http,next)=>{var actor=http.Request.Headers["X-Test-Actor"].ToString();http.User=actor switch{"admin"=>admin,"reader"=>reader,"denied"=>Actor("Consultation",none),_=>new ClaimsPrincipal()};if(http.User.Identity?.IsAuthenticated!=true){http.Response.StatusCode=401;return;}try{await next();}catch(RuleException ex){http.Response.StatusCode=ex.Status;await http.Response.WriteAsJsonAsync(new{title=ex.Message});}});var routes=app.MapGroup("/api");routes.MapAnalytics();routes.MapExportAnalytics();await app.StartAsync();var address=app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.Single();using var client=new HttpClient{BaseAddress=new Uri(address)};
 async Task<HttpResponseMessage> Http(string suffix="",string? actor="admin",HttpMethod? method=null,int? target=null){using var req=new HttpRequestMessage(method??HttpMethod.Get,$"/api/contexts/{target??audit}/analytics/export"+suffix);if(actor!=null)req.Headers.Add("X-Test-Actor",actor);return await client.SendAsync(req);}
 Check("HTTP anonyme refusé",(await Http(actor:null)).StatusCode==HttpStatusCode.Unauthorized);
 Check("HTTP module Export sans droit refusé",(await Http(actor:"denied")).StatusCode==HttpStatusCode.Forbidden);
 var res=await Http(actor:"reader");var payload=JsonDocument.Parse(await res.Content.ReadAsStringAsync());Check("HTTP vrai contrat de lecture et net audit",res.IsSuccessStatusCode&&payload.RootElement.GetProperty("total").GetProperty("netKg").GetDecimal()==21158.40m);

 var officialHttp=await Http("?status=2",target:confirmed);var officialPayload=JsonDocument.Parse(await officialHttp.Content.ReadAsStringAsync());Check("HTTP officiel codmaj 2 et pdscom avec détail filtré",officialHttp.IsSuccessStatusCode&&officialPayload.RootElement.GetProperty("confirmedNetKg").GetDecimal()==7739&&officialPayload.RootElement.GetProperty("count").GetInt32()==2&&officialPayload.RootElement.GetProperty("official").GetProperty("shipments").GetInt32()==1);
 Check("HTTP export statut 1 sans contamination",JsonDocument.Parse(await (await Http("?status=1",target:confirmed)).Content.ReadAsStringAsync()).RootElement.GetProperty("confirmedNetKg").GetDecimal()==0);
 Check("HTTP sources sans duplication de toutes les lignes brutes",!payload.RootElement.GetProperty("sources")[0].TryGetProperty("rows",out _));
 Check("HTTP autre station non autorisée refusée",(await Http("?otherContext="+d,"reader")).StatusCode==HttpStatusCode.Forbidden);
 Check("HTTP paramètres SQL libres et répétés refusés",(await Http("?sql=SELECT%201")).StatusCode==HttpStatusCode.BadRequest&&(await Http("?page=1&page=2")).StatusCode==HttpStatusCode.BadRequest);
 Check("HTTP aucune mutation",(await Http(method:HttpMethod.Post)).StatusCode==HttpStatusCode.MethodNotAllowed&&(await Http(method:HttpMethod.Delete)).StatusCode==HttpStatusCode.MethodNotAllowed);
 var excel=await Http("/export");var httpBytes=await excel.Content.ReadAsByteArrayAsync();File.WriteAllBytes(Path.Combine(output,"export-http.xlsx"),httpBytes);Check("HTTP Excel et type MIME",excel.IsSuccessStatusCode&&httpBytes[0]=='P'&&httpBytes[1]=='K'&&excel.Content.Headers.ContentType!.MediaType!.Contains("spreadsheetml"));
 Check("HTTP Excel interdit sans permission",(await Http("/export","denied")).StatusCode==HttpStatusCode.Forbidden);
 await app.StopAsync();
 var afterJson=JsonSerializer.Serialize(await auditDb.QueryAsync("CHECKSUM TABLE bdq,dossier,palette,palette_d"));Check("Données audit inchangées après lectures/Excel/HTTP",beforeJson==afterJson);
 var baseline=JsonDocument.Parse(File.ReadAllText(Path.Combine(root,"output/audit-v150/baseline/drencher-hashes.json"))).RootElement;Check("Drencher et SQL010/011 inchangés",baseline.EnumerateArray().All(x=>Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(Path.Combine(root,x.GetProperty("path").GetString()!))))==x.GetProperty("sha256").GetString()));
 success=true;
}finally{
 foreach(var id in ids)await adminDb.ExecuteAsync("UPDATE app_contexts SET enabled=0 WHERE id=@id AND database_name LIKE 'vitasouss_test_%'",new{id});
 foreach(var uid in users)await adminDb.ExecuteAsync("UPDATE app_users SET enabled=0 WHERE id=@uid AND username LIKE 'test_export_%'",new{uid});
 File.WriteAllText(Path.Combine(root,"docs/tests-v160-export.json"),JsonSerializer.Serialize(new{date=DateTime.UtcNow,success,passed=results.Count,failed=success?0:1,productionAccess=false,httpScope="Hôte Kestrel éphémère loopback, vrais endpoints/services, identités synthétiques. Authentification cookie inchangée non réexécutée.",assemblySha256=Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(typeof(ExportAnalyticsService).Assembly.Location))),results},new JsonSerializerOptions{WriteIndented=true}));
}
