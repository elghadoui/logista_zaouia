using System.Text.Json;
using Vitasouss;
using System.Security.Cryptography;
var options=new JsonSerializerOptions{PropertyNameCaseInsensitive=true,PropertyNamingPolicy=JsonNamingPolicy.CamelCase};
var fixture=JsonSerializer.Deserialize<DrSnapshot>(File.ReadAllText("tests/DrencherV132Tests/fixtures/cycle-synthetique.json"),options)!;
var results=new List<object>();void Check(string name,bool valid){if(!valid)throw new Exception(name);results.Add(new{name,passed=true});Console.WriteLine("PASS "+name);}
Check("Ancien instantané : produits visibles par défaut, MA absente",fixture.Produits.All(p=>p.AfficherF04&&p.MatiereActive is null));
Check("Ancien contrat fiche produit : visible par défaut",JsonSerializer.Deserialize<DrProduct>("{\"id\":1,\"reference\":\"A\",\"nom\":\"A\",\"unite\":\"L\",\"actif\":true}",options)!.AfficherF04);
var original=JsonSerializer.Serialize(fixture,options);
var output="output/pdf/v132-verification";Directory.CreateDirectory(output);Directory.CreateDirectory("docs/f04-v132-apercus");
DrReport Report(DrSnapshot snapshot,string mode="reel")=>new("DEMO-F04-V132","Suivi du traitement au niveau du Drencher","F04 MPS-01 V06",new DateTime(2026,10,14,10,0,0,DateTimeKind.Utc),"ZAOUIA / Drencher — Données fictives","Recette","NON VALIDÉE — DOCUMENT DE TRAVAIL",[],[]){F04=new(1,1,"Brouillon","OPÉRATEUR FICTIF",null,null,"Enregistrement","OPÉRATEUR FICTIF","2026-10-14 08:00:00 UTC","",snapshot,mode)};
var simple=fixture with{Palettes=fixture.Palettes.Take(5).ToArray(),Produits=fixture.Produits.Take(1).ToArray(),Observations="Essai synthétique de mise en page : cinq palettes, un produit."};
foreach(var (name,s) in new[]{("simple",simple),("complexe",fixture)}) {
 var r=Report(s);File.WriteAllBytes($"{output}/{name}-v132.pdf",DrencherPdf.Render(r));File.WriteAllBytes($"{output}/{name}-v131.pdf",BaselineF04Pdf.Render(r,r.F04!));
}
var printable=fixture with{Produits=fixture.Produits.Select((p,i)=>p with{MatiereActive=i==0?"MA FICTIVE A":i==1?"MA CACHEE":null,AfficherF04=i!=1}).ToArray()};
foreach(var mode in new[]{"reel","theorique","machine"})File.WriteAllBytes($"docs/f04-v132-apercus/F04-V06-V1.3.2-{mode.ToUpperInvariant()}.pdf",DrencherPdf.Render(Report(printable,mode)));
var hidden=fixture with{Produits=fixture.Produits.Select(p=>p with{AfficherF04=false}).ToArray()};File.WriteAllBytes($"{output}/all-hidden.pdf",DrencherPdf.Render(Report(hidden)));
var volume=printable with{Palettes=Enumerable.Range(0,30).Select(i=>fixture.Palettes[i] with{Numrec=100+i,Codvar=200+i,Variete="VARIÉTÉ FICTIVE "+i}).ToArray(),Observations=string.Join(" ",Enumerable.Repeat("Observation synthétique longue conservée intégralement.",30))};
File.WriteAllBytes($"{output}/volume-machine.pdf",DrencherPdf.Render(Report(volume,"machine")));
Check("Aucune mutation des quatre quantités ou paramètres par génération",original==JsonSerializer.Serialize(fixture,options));
Check("Compression palettes fidèle",DrencherF04Pdf.Compress([1,2,3,5,7,8,9])=="1 à 3, 5, 7 à 9");
foreach(var type in new[]{"stock","fiche","entrees","consommations","mouvements"}) {
 var r=new DrReport("STOCK-DEMO-"+type,"État de stock — contrôle "+type,"DR-STOCK-"+type,new DateTime(2026,10,14,10,0,0,DateTimeKind.Utc),"ZAOUIA / TEST SYNTHETIQUE","Recette","",["Document de contrôle sans mutation."],[new("Mouvements",["Produit","Unité","Nature","Quantité"],[["PRODUIT FICTIF","L","Soumission consommation","-3"],["PRODUIT FICTIF","L","Correction restitution","0,5"],["PRODUIT FICTIF","L","Suppression restitution","2,5"]])]);
 File.WriteAllBytes($"{output}/{type}-v132.pdf",DrencherPdf.Render(r));File.WriteAllBytes($"{output}/{type}-v13.pdf",BaselineStockPdf.Render(r));
}
Check("Arrondi métier six décimales",DrMath.Amount(1000,2.5m)==2.5m);
decimal available=50;Dictionary<int,decimal> accounted=[];
foreach(var wanted in new[]{3m,2.5m,4m,3m,0m}){var next=new Dictionary<int,decimal>{{1,wanted}};available=DrencherStockPlan.Balance(available,DrencherStockPlan.Difference(accounted,next)[1]);Check($"Stock différentiel séquence {wanted}",available==50-wanted);accounted=next;}
Check("Rejeu même consommation : delta nul",DrencherStockPlan.Difference(new Dictionary<int,decimal>{{1,3}},new Dictionary<int,decimal>{{1,3}})[1]==0);
var swapped=DrencherStockPlan.Difference(new Dictionary<int,decimal>{{1,3}},new Dictionary<int,decimal>{{2,2.5m}});Check("Changement lot : restitution source et sortie destination",swapped[1]==3&&swapped[2]==-2.5m);
bool Refused(Action action){try{action();return false;}catch(RuleException){return true;}}
Check("Stock insuffisant refusé",Refused(()=>DrencherStockPlan.Balance(1,-2)));
Check("Restitution excessive historique refusée",Refused(()=>DrencherStockPlan.Difference(new Dictionary<int,decimal>{{1,-1}},new Dictionary<int,decimal>())));
Check("Capacité DECIMAL18,6 protégée",Refused(()=>DrencherStockPlan.Balance(999999999999.999999m,1)));
Check("Précision micro-unités préservée",DrencherStockPlan.Balance(0.000002m,DrencherStockPlan.Difference(new Dictionary<int,decimal>{{1,0.000003m}},new Dictionary<int,decimal>{{1,0.000002m}})[1])==0.000003m);
Check("Plusieurs lots : conservation des quantités",DrencherStockPlan.Difference(new Dictionary<int,decimal>{{1,2},{2,1}},new Dictionary<int,decimal>{{1,1.5m},{2,1.5m}}).Values.Sum()==0);
File.WriteAllText("docs/tests-drencher-v132-renderer.json",JsonSerializer.Serialize(new{date=DateTime.UtcNow,productionAccess=false,mysqlWrites=0,assemblySha256=Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(typeof(DrencherPdf).Assembly.Location))),passed=results.Count,failed=0,results},new JsonSerializerOptions{WriteIndented=true}));
