using System.Text.Json;
using System.Text.Json.Serialization;
using Vitasouss;
using System.Security.Cryptography;

var options=new JsonSerializerOptions{PropertyNameCaseInsensitive=true,PropertyNamingPolicy=JsonNamingPolicy.CamelCase};
if(args.Contains("--stock-only")) {
 var stockOut=Path.GetFullPath("output/f04-v131-work/final-stock");Directory.CreateDirectory(stockOut);
 var kinds=new[]{("stock","État du stock actuel"), ("fiche","Fiche de stock par produit"), ("entrees","Journal des entrées de stock"), ("consommations","Journal des consommations"), ("mouvements","État des mouvements de stock")};
 foreach(var (kind,title) in kinds){var r=new DrReport("STOCK-CONTROLE-"+kind,title,"DR-STOCK-"+kind,new DateTime(2026,10,9,15,0,0,DateTimeKind.Utc),"ZAOUIA / Drencher — Contexte synthétique","Recette","",["Période synthétique. Unités séparées."],[new("Données de contrôle",["Produit","Lot","Unité","Quantité","Nature","Bon / Cycle"],[["PRODUIT FICTIF A","LOT A","L","47,3","Ouverture",""],["PRODUIT FICTIF A","LOT A","L","2,7","Restitution","Cycle 1"],["PRODUIT FICTIF A","LOT A","L","-3","Consommation","Cycle 1"],["PRODUIT FICTIF B","LOT B","kg","20","Entrée","Bon FICTIF"]])]);File.WriteAllBytes(Path.Combine(stockOut,kind+"-v131.pdf"),DrencherPdf.Render(r));File.WriteAllBytes(Path.Combine(stockOut,kind+"-v13.pdf"),BaselineStockPdf.Render(r));}
 var actual=Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(typeof(DrencherPdf).Assembly.Location)));var published=Convert.ToHexString(SHA256.HashData(File.ReadAllBytes("publish-v131/Vitasouss.Api.dll")));if(actual!=published)throw new Exception("DLL de contrôle différente de la publication");
 File.WriteAllText("docs/tests-drencher-v131-final-renderer.json",JsonSerializer.Serialize(new{date=DateTime.UtcNow,assemblySha256=actual,mysqlWrites=0,productionAccess=false,documents=kinds.Select(k=>k.Item1)},new JsonSerializerOptions{WriteIndented=true}));Console.WriteLine("Five stock documents rendered with the final published assembly.");return;
}
var fixture=JsonSerializer.Deserialize<DrSnapshot>(File.ReadAllText("output/f04-v131-work/cycle-synthetique.json"),options)!;
var dir=Path.GetFullPath("docs/f04-v131-apercus");Directory.CreateDirectory(dir);
var results=new List<object>();void Check(string name,bool value){if(!value)throw new Exception(name);results.Add(new{name,passed=true});Console.WriteLine("PASS "+name);}
var before=JsonSerializer.Serialize(fixture,options);
DrReport Report(DrSnapshot s,int id=2,string status="Brouillon")=>new DrReport("DEMO-F04-V131-"+id,"Suivi du traitement au niveau du Drencher","F04 MPS-01 V06",new DateTime(2026,10,9,15,0,0,DateTimeKind.Utc),"ZAOUIA / Drencher — Exercice synthétique 2026/2027","Recette",status=="Validé"?"":"NON VALIDÉE — DOCUMENT DE TRAVAIL",[],[]){F04=new(id,1,status,"OPÉRATEUR FICTIF",status=="Validé"?"QUALITÉ FICTIVE":null,status=="Validé"?"2026-10-09 09:30:00 UTC":null,status=="Validé"?"Validation":"Enregistrement",status=="Validé"?"QUALITÉ FICTIVE":"OPÉRATEUR FICTIF","2026-10-09 09:00:00 UTC","",s)};
var simple=fixture with{Palettes=fixture.Palettes.Take(5).ToArray(),Produits=fixture.Produits.Take(1).ToArray(),Observations="Essai synthétique de mise en page : cinq palettes, un produit."};
var complex=fixture with{Observations="Essai synthétique : deux réceptions, deux variétés, quatre produits et 164 palettes. Les unités restent séparées."};
File.WriteAllBytes(Path.Combine(dir,"F04-V06-V1.3.1-SIMPLE.pdf"),DrencherPdf.Render(Report(simple,1,"Validé")));
File.WriteAllBytes(Path.Combine(dir,"F04-V06-V1.3.1-COMPLEXE.pdf"),DrencherPdf.Render(Report(complex)));
// Volume, exceptional labels and long observations are in-memory fixtures only.
var volume=complex with{Palettes=Enumerable.Range(0,30).Select(i=>fixture.Palettes[i] with{Numrec=100+i,Codvar=200+i,Variete="VARIÉTÉ FICTIVE "+i}).ToArray(),Produits=fixture.Produits.Concat(fixture.Produits.Select((p,i)=>p with{ProduitId=p.ProduitId+100,Reference="EXTRA-"+i,Nom="PRODUIT SUPPLÉMENTAIRE FICTIF "+i})).ToArray(),Observations=string.Join(" ",Enumerable.Repeat("Observation longue synthétique conservée intégralement.",30))};
File.WriteAllBytes(Path.Combine(dir,"F04-V06-V1.3.1-VOLUME-TEST.pdf"),DrencherPdf.Render(Report(volume,3)));
Check("Instantané source inchangé par les impressions",JsonSerializer.Serialize(fixture,options)==before);
Check("Compression palettes sans inventer les numéros manquants",DrencherF04Pdf.Compress([1,2,3,5,7,8,9])=="1 à 3, 5, 7 à 9");
Check("Compression dédoublonne et trie seulement l'affichage",DrencherF04Pdf.Compress([9,1,1,8])=="1, 8, 9");
Check("Quatre quantités sources inchangées",simple.Produits[0].Initial==fixture.Produits[0].Initial&&simple.Produits[0].Final==fixture.Produits[0].Final&&simple.Produits[0].Machine==fixture.Produits[0].Machine&&simple.Produits[0].Reel==fixture.Produits[0].Reel);
var stock=new DrReport("STOCK-COMPARAISON","État du stock actuel","DR-STOCK-STOCK V1.3",new DateTime(2026,10,9,15,0,0,DateTimeKind.Utc),"ZAOUIA / Drencher — Exercice synthétique","Recette","",["Stock actuel sans mutation."],[new("Disponibilités par produit",["Référence","Produit","Unité","Disponible"],[["A","PRODUIT FICTIF","L","47"]])]);
File.WriteAllBytes(Path.Combine(dir,"stock-renderer-v131-test.pdf"),DrencherPdf.Render(stock));
File.WriteAllBytes(Path.Combine(dir,"stock-renderer-v13-baseline.pdf"),BaselineStockPdf.Render(stock));
Check("Données F04 internes absentes du contrat JSON générique",!JsonSerializer.Serialize(Report(simple),options).Contains("\"f04\""));
File.WriteAllText("docs/tests-drencher-v131-layout.json",JsonSerializer.Serialize(new{date=DateTime.UtcNow,passed=results.Count,failed=0,mysqlWrites=0,productionAccess=false,results},new JsonSerializerOptions{WriteIndented=true}));
