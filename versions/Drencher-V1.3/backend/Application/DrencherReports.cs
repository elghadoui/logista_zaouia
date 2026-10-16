using Dapper;
using System.Data;
using System.Globalization;
using System.Security.Claims;
using System.Text.Json;

namespace Vitasouss;

public record DrReportFilter(string Type, string? From=null, string? To=null, int? ProduitId=null, int? LotId=null, string? Actif=null, string? Nature=null, bool DetailLots=false);
public record DrReportTable(string Title, string[] Columns, List<string[]> Rows);
public record DrReport(string Id, string Title, string Reference, DateTime IssuedUtc, string Context, string Mode, string Warning, List<string> Notes, List<DrReportTable> Tables, string? CycleHeader=null);
public sealed class DrReportMovement {
 public long Id {get;set;} public int ProduitId {get;set;} public int LotId {get;set;}
 public int? CycleId {get;set;} public int? Revision {get;set;}
 public string Reference {get;set;}=""; public string Nom {get;set;}=""; public string Unite {get;set;}="";
 public string Lot {get;set;}=""; public string Nature {get;set;}=""; public string Bon {get;set;}=""; public string Auteur {get;set;}="";
 public decimal Quantite {get;set;} public object? DateCreation {get;set;} public object? DateReception {get;set;} public object? Peremption {get;set;}
}
public sealed partial class DrencherService {
 internal static string N(decimal? n)=>n?.ToString("0.######",CultureInfo.GetCultureInfo("fr-FR"))??"Non renseigné";
 static string D(object? d)=>DrDates.Day(d)??"Non renseignée";
 static string I(object? d)=>DrDates.Instant(d) is string s?s.Replace('T',' ')+" UTC":"Non renseignée";
 static string Label(string? name,int? id)=>string.IsNullOrWhiteSpace(name)?id?.ToString()??"Non renseigné":name+(id.HasValue?" ("+id+")":"");
 async Task<DrReport> ReportBase(ContextInfo c,string title,string reference,string warning="") {
  var mode=JsonSerializer.SerializeToElement(await Mode(c),Json.Options).GetProperty("mode").GetString()!;
  return new(Guid.NewGuid().ToString("N"),title,reference,DateTime.UtcNow,c.Station+" / Drencher — "+c.Label,mode,warning,[],[]);
 }
 static DrReportTable Table(DrReport r,string title,params string[] columns){var t=new DrReportTable(title,columns,[]);r.Tables.Add(t);return t;}
 public async Task<DrReport> F04(ContextInfo c,int id,int? revision,ClaimsPrincipal user) {
  await using var db=await Open(c);
  await db.ExecuteAsync("SET TRANSACTION READ ONLY");
  await using var tx=await db.BeginTransactionAsync(IsolationLevel.RepeatableRead);
  var cycle=await db.QuerySingleOrDefaultAsync("SELECT * FROM vit_dr_cycle WHERE id=@id",new{id},tx)??throw new RuleException("Cycle introuvable.",404);
  int current=(int)cycle.version,version=revision??current;
  var source=await db.QuerySingleOrDefaultAsync("SELECT contenu,action,motif,auteur,date_creation FROM vit_dr_revision WHERE cycle_id=@id AND version=@version",new{id,version},tx)??throw new RuleException("Révision introuvable.",404);
  var s=Deserialize<DrSnapshot>((string)source.contenu);
  bool historical=version!=current;
  bool validated=(string)cycle.statut=="Validé"&&(!historical||(string)source.action is "Validation" or "Correction");
  string? validator=validated?(historical?(string)source.auteur:(string?)cycle.validateur):null;
  object? validationDate=validated?(historical?(object?)source.date_creation:(object?)cycle.date_validation):null;
  var report=await ReportBase(c,"Suivi du traitement au niveau du Drencher","F04 MPS-01 V06",!validated?"NON VALIDÉE — DOCUMENT DE TRAVAIL":historical?"RÉVISION HISTORIQUE REMPLACÉE — UTILISER LA RÉVISION ACTUELLE":"");
  report=report with{CycleHeader=$"Cycle n° {id} / révision {version} — Traitement {s.Date}, {s.Debut} à {s.Fin}"};
  report.Notes.Add($"Cycle n° {id} / révision {version} — {s.Date}, {s.Debut} à {s.Fin} — Statut actuel : {cycle.statut}");
  report.Notes.Add($"Programme : {s.ProgrammeNom} — version {s.ProgrammeVersion}. Opérateur : {cycle.auteur}.");
  report.Notes.Add($"Responsable qualité : {validator??"Non attesté pour cette révision"}. Validation / correction attestée : {(validated?I(validationDate):"Non attestée")}");
  report.Notes.Add("Liste de distribution : agent réception, opérateur Drencher, responsable qualité. Version documentaire à approuver par le responsable qualité.");
  if(historical)report.Notes.Add("RÉVISION HISTORIQUE remplacée : données de l'instantané. L'action et l'auteur de cette révision attestent la validation ou correction uniquement si l'historique les indique explicitement.");
  bool kg=s.UnitePoids=="kg",tonnes=s.UnitePoids=="t";
  var groups=Table(report,"Lots de fruits traités — regroupement réception / variété / producteur / verger","Réception","Variété","Producteur / adhérent","Verger","Palettes","Poids (kg)","Tonnage (t)");
  foreach(var group in s.Palettes.GroupBy(a=>new{a.Numrec,a.Codvar,a.Variete,a.Refadh,a.Adherent,a.Refver,a.Verger}).OrderBy(g=>g.Key.Numrec)) {
   decimal? weight=(kg||tonnes)&&group.Any(a=>a.Poids.HasValue)?group.Sum(a=>a.Poids??0)*(kg?1:1000):null;
   string partial=group.Any(a=>!a.Poids.HasValue)?" (partiel)":"";
   groups.Rows.Add([group.Key.Numrec.ToString(),Label(group.Key.Variete,group.Key.Codvar),Label(group.Key.Adherent,group.Key.Refadh),Label(group.Key.Verger,group.Key.Refver),group.Count().ToString(),N(weight)+partial,N(weight/1000)+partial]);
  }
  var p=new DrReportTable("Annexe — détail des palettes traitées",["Réception","Palette","Variété","Producteur / adhérent","Verger","Poids (kg)","Tonnage (t)"],[]);
  foreach(var a in s.Palettes.OrderBy(a=>a.Numrec).ThenBy(a=>a.Codvar).ThenBy(a=>a.Numpal)) {
   decimal? weight=kg?a.Poids:tonnes?a.Poids*1000:null;
   p.Rows.Add([a.Numrec.ToString(),a.Numpal.ToString(),Label(a.Variete,a.Codvar),Label(a.Adherent,a.Refadh),Label(a.Verger,a.Refver),N(weight),N(weight/1000)]);
  }
  if(!kg&&!tonnes)report.Notes.Add("Unité de poids historique absente : aucun poids converti ni total inventé.");
  var u=Table(report,"Produits utilisés — quatre quantités distinctes","Produit / référence","Unité","Dose / 1 000 L d'eau","Théorique initiale","Théorique finale","Machine","Réelle","Écart réelle / finale","Écart réelle / machine");
  foreach(var a in s.Produits)u.Rows.Add([a.Nom+" / "+a.Reference,a.Unite,N(a.Dose),N(a.Initial),N(a.Final),N(a.Machine),N(a.Reel),N(a.EcartTheorique),N(a.EcartMachine)]);
  var lots=Table(report,"Lots fabricants, matières actives et écarts déclarés","Produit","Lot fabricant","Péremption","Quantité réelle / unité","Matière active vérifiée","Écart / observation");
  foreach(var a in s.Produits) {
   var flags=(a.HorsProgramme?"Produit hors programme. ":"")+(a.DoseModifiee?$"Dose modifiée ; programme : {N(a.DoseProgramme)} {a.Unite} / 1 000 L. ":"");
   if(a.Lots.Length==0)lots.Rows.Add([a.Nom,"Non renseigné","Non renseignée",N(a.Reel)+" "+a.Unite,"Non renseignée / non vérifiée",flags]);
   foreach(var l in a.Lots)lots.Rows.Add([a.Nom,l.Lot,D(l.Peremption),N(l.Quantite)+" "+a.Unite,"Non renseignée / non vérifiée",flags+(l.Peremption.HasValue&&l.Peremption.Value.Date<DrMath.Date(s.Date)?"Lot périmé à la date du traitement.":"")]);
  }
  var total=Table(report,"Totaux du cycle","Indicateur","Valeur");
  total.Rows.Add(["Palettes traitées",s.Palettes.Length.ToString()]);
  var known=s.Palettes.Count(a=>a.Poids.HasValue);
  total.Rows.Add(["Poids / tonnage" ,(kg||tonnes)&&known>0?N(s.Palettes.Sum(a=>a.Poids??0)*(kg?1:1000))+" kg / "+N(s.Palettes.Sum(a=>a.Poids??0)*(kg?0.001m:1))+" t"+(known<s.Palettes.Length?$" — TOTAL PARTIEL : {s.Palettes.Length-known} poids absents":""):"Non disponible"]);
  total.Rows.Add(["Eau initiale",N(s.EauInitiale)+" L"]);total.Rows.Add(["Eau totale consommée",N(s.EauConsommee)+" L"]);
  foreach(var group in s.Produits.GroupBy(a=>new{a.ProduitId,a.Reference,a.Nom,a.Unite}))total.Rows.Add([group.Key.Nom+" / "+group.Key.Reference,N(group.All(a=>a.Reel.HasValue)?group.Sum(a=>a.Reel!.Value):null)+" "+group.Key.Unite]);
  report.Notes.Add("Observations du cycle : "+(string.IsNullOrWhiteSpace(s.Observations)?"Aucune renseignée":s.Observations));
  report.Notes.Add($"Révision : {source.action}. Motif : {source.motif}. Auteur : {source.auteur}. Enregistrement : {I((object?)source.date_creation)}.");
  report.Notes.Add("Décision qualité C / NC : à renseigner par le responsable qualité ; aucune conformité automatique.");
  var visa=Table(report,"Visas","Opérateur","Responsable qualité");visa.Rows.Add(["Nom : "+(string)cycle.auteur+"\nSignature : ____________________","Nom : "+(validator??"____________________")+"\nSignature : ____________________"]);
  report.Tables.Add(p);
  await tx.CommitAsync();ReportLog(report,c,user);return report;
 }
 void ReportLog(DrReport r,ContextInfo c,ClaimsPrincipal user)=>logger.LogInformation("Drencher document {DocumentId}, référence {Reference}, contexte {ContextId}, utilisateur {UserId}, mode {Mode}",r.Id,r.Reference,c.Id,Uid(user),r.Mode);
 public async Task<DrReport> StockReport(ContextInfo c,DrReportFilter f,ClaimsPrincipal user) {
  if(f.Type is not("stock" or "fiche" or "entrees" or "consommations" or "mouvements"))throw new RuleException("Document inconnu.");
  if(f.Actif is not(null or "" or "actif" or "inactif"))throw new RuleException("Statut produit invalide.");
  if(f.Nature is not(null or "" or "Entree" or "Consommation" or "Correction restitution" or "Correction consommation"))throw new RuleException("Nature invalide.");
  if(f.Type=="fiche"&&f.ProduitId is null)throw new RuleException("Sélectionnez un produit pour sa fiche de stock.");
  DateTime? start=string.IsNullOrWhiteSpace(f.From)?null:DrMath.Date(f.From),end=string.IsNullOrWhiteSpace(f.To)?null:DrMath.Date(f.To).AddDays(1);
  if(start.HasValue&&end.HasValue&&start>=end)throw new RuleException("La fin de période doit suivre son début.");
  await using var db=await Open(c);await db.ExecuteAsync("SET TRANSACTION READ ONLY");await using var tx=await db.BeginTransactionAsync(IsolationLevel.RepeatableRead);
  var products=(await db.QueryAsync<DrProduct>("SELECT id,reference,nom,unite,actif FROM vit_traitement_produit WHERE (@pid IS NULL OR id=@pid) AND (@active IS NULL OR actif=@active) ORDER BY nom",new{pid=f.ProduitId,active=f.Actif=="actif"?true:f.Actif=="inactif"?false:(bool?)null},tx)).ToArray();
  if(f.ProduitId.HasValue&&!products.Any(p=>p.Id==f.ProduitId))throw new RuleException("Produit introuvable ou exclu par le filtre.",404);
  if(f.LotId.HasValue&&await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_stock_lot WHERE id=@lid AND (@pid IS NULL OR produit_id=@pid)",new{lid=f.LotId,pid=f.ProduitId},tx)!=1)throw new RuleException("Lot introuvable pour ce produit.",404);
  string title=f.Type switch{"stock"=>"État du stock actuel","fiche"=>"Fiche de stock par produit","entrees"=>"Journal des entrées de stock","consommations"=>"Journal des consommations — bilan net",_=>"État des mouvements de stock"};
  var r=await ReportBase(c,title,"DR-STOCK-"+f.Type.ToUpperInvariant()+" V1.3");
  r.Notes.Add("Période : "+(f.From??"origine")+" au "+(f.To??"édition")+" (bornes incluses).");
  if(f.Type=="stock")r.Notes[0]="Stock disponible à l'édition (la période ne s'applique pas).";
  r.Notes.Add("Filtres : produit "+(f.ProduitId?.ToString()??"tous")+", lot "+(f.LotId?.ToString()??"tous")+", statut "+(f.Actif??"tous")+", nature "+(f.Nature??"toutes")+".");
  var ids=products.Select(p=>p.Id).ToArray();if(ids.Length==0){r.Notes.Add("Aucun produit pour ces filtres.");await tx.CommitAsync();ReportLog(r,c,user);return r;}
  var args=new{ids,lid=f.LotId,start,end};
  const string join=" FROM vit_dr_mouvement m JOIN vit_dr_stock_lot l ON l.id=m.lot_id JOIN vit_traitement_produit p ON p.id=l.produit_id ";
  const string scope=" l.produit_id IN @ids AND (@lid IS NULL OR l.id=@lid) ";
  var balances=(await db.QueryAsync("SELECT l.produit_id produitId,SUM(l.solde) stock,(SELECT COALESCE(SUM(m.quantite),0) FROM vit_dr_mouvement m JOIN vit_dr_stock_lot z ON z.id=m.lot_id WHERE z.produit_id=l.produit_id AND (@lid IS NULL OR z.id=@lid)) ledger FROM vit_dr_stock_lot l WHERE l.produit_id IN @ids AND (@lid IS NULL OR l.id=@lid) GROUP BY l.produit_id",args,tx)).ToArray();
  foreach(var balance in balances.Where(b=>(decimal)b.stock!=(decimal)b.ledger)){var p=products.Single(p=>p.Id==(int)balance.produitId);r.Notes.Add($"ÉCART À CONTRÔLER : {p.Reference} — stock MySQL {N((decimal)balance.stock)} {p.Unite}, cumul du journal {N((decimal)balance.ledger)} {p.Unite}. Aucun solde corrigé par l'édition.");}
  if(f.Type=="stock") {
   var rows=(await db.QueryAsync("SELECT l.id,l.produit_id,l.lot,l.peremption,l.solde FROM vit_dr_stock_lot l WHERE l.produit_id IN @ids AND (@lid IS NULL OR l.id=@lid) ORDER BY l.produit_id,l.lot",args,tx)).ToArray();
   if(rows.Length>20000)throw new RuleException("Document trop volumineux : filtrez par produit ou lot.",409);
   var table=Table(r,"Disponibilités par produit","Référence","Produit","Statut","Unité","Disponible","Lots fabricants");
   var totals=new Dictionary<string,decimal>();
   foreach(var p in products) {
    var ls=rows.Where(l=>(int)l.produit_id==p.Id).ToArray();if(f.LotId.HasValue&&ls.Length==0)continue;
    var quantity=ls.Sum(l=>(decimal)l.solde);table.Rows.Add([p.Reference,p.Nom,p.Actif?"Actif":"Inactif",p.Unite,N(quantity),ls.Length.ToString()]);totals[p.Unite]=totals.GetValueOrDefault(p.Unite)+quantity;
   }
   UnitTotals(r,totals,"Totaux du stock par unité (sans conversion)");
   if(f.DetailLots){var detail=Table(r,"Lots fabricants","Produit","Lot","Péremption","Disponible","Unité","Statut du lot");foreach(var l in rows){var p=products.Single(p=>p.Id==(int)l.produit_id);var expiry=DrDates.Value((object?)l.peremption);detail.Rows.Add([p.Nom,(string)l.lot,D(expiry),N((decimal)l.solde),p.Unite,expiry.HasValue&&expiry.Value.Date<r.IssuedUtc.Date?"Périmé":""]);}}
  } else if(f.Type=="consommations") {
   r.Notes.Add("Période = date du traitement. Bilan net actuel après toutes les corrections enregistrées à l'édition, y compris celles enregistrées après la période. Le journal brut reste dans l'état des mouvements.");
   var rows=(await db.QueryAsync("SELECT m.cycle_id cycleId,l.id lotId,l.produit_id produitId,l.lot,-SUM(m.quantite) quantite,c.date_traitement,c.auteur,c.validateur,r.version cycleVersion,r.action revisionAction,r.auteur revisionAuthor,r.contenu"+join+" JOIN vit_dr_cycle c ON c.id=m.cycle_id JOIN vit_dr_revision r ON r.cycle_id=c.id AND r.version=c.version WHERE "+scope+" AND c.statut='Validé' AND (@start IS NULL OR c.date_traitement>=@start) AND (@end IS NULL OR c.date_traitement<@end) GROUP BY m.cycle_id,l.id,l.produit_id,l.lot,c.date_traitement,c.auteur,c.validateur,r.version,r.action,r.auteur,r.contenu ORDER BY c.date_traitement,m.cycle_id,l.id LIMIT 20001",args,tx)).ToArray();
   if(rows.Length>20000)throw new RuleException("Document trop volumineux : réduisez la période.",409);
   var table=Table(r,"Consommations nettes par cycle et lot","Traitement","Cycle / révision","Produit / référence","Lot","Réel net","Unité","Variétés","Opérateur","Qualité / correction");var totals=new Dictionary<string,decimal>();var productTotals=new Dictionary<(int Id,string Name,string Reference,string Unit),decimal>();
   foreach(var row in rows){var s=Deserialize<DrSnapshot>((string)row.contenu);var p=s.Produits.SingleOrDefault(p=>p.ProduitId==(int)row.produitId);if(p is null)throw new RuleException("Produit consommé absent de l'instantané du cycle.",409);decimal qty=(decimal)row.quantite;string quality=(string?)row.validateur??"Non renseigné";if((string)row.revisionAction=="Correction")quality+=" / correction : "+(string)row.revisionAuthor;table.Rows.Add([D((object?)row.date_traitement),$"{row.cycleId} / v{row.cycleVersion}",p.Nom+" / "+p.Reference,(string)row.lot,N(qty),p.Unite,string.Join(", ",s.Palettes.Select(p=>Label(p.Variete,p.Codvar)).Distinct()),(string)row.auteur,quality]);totals[p.Unite]=totals.GetValueOrDefault(p.Unite)+qty;var key=(p.ProduitId,p.Nom,p.Reference,p.Unite);productTotals[key]=productTotals.GetValueOrDefault(key)+qty;}
   UnitTotals(r,totals,"Consommations nettes par unité");
   var byProduct=Table(r,"Consommations nettes par produit et unité","Produit / référence","Unité","Quantité nette");
   foreach(var item in productTotals)byProduct.Rows.Add([item.Key.Name+" / "+item.Key.Reference,item.Key.Unit,N(item.Value)]);
  } else {
   bool entries=f.Type=="entrees";
   r.Notes.Add(entries?"Période = date de réception magasin ; date d'enregistrement indiquée séparément.":"Période et ordre = date d'enregistrement UTC puis identifiant du mouvement. Les corrections restent à leur date d'enregistrement. Le solde par produit inclut toutes les natures, même si le filtre n'en affiche qu'une.");
   var opening=(await db.QueryAsync("SELECT l.produit_id produitId,COALESCE(SUM(m.quantite),0) quantity"+join+" WHERE "+scope+" AND @start IS NOT NULL AND m.date_creation<@start GROUP BY l.produit_id",args,tx)).ToDictionary(x=>(int)x.produitId,x=>(decimal)x.quantity);
   string date=entries?"m.date_reception":"m.date_creation";
   var moves=(await db.QueryAsync<DrReportMovement>("SELECT m.id,l.produit_id produitId,l.id lotId,m.cycle_id cycleId,m.revision,p.reference,p.nom,p.unite,l.lot,l.peremption,m.nature,m.bon,m.auteur,m.quantite,m.date_creation dateCreation,m.date_reception dateReception"+join+" WHERE "+scope+$" AND (@start IS NULL OR {date}>=@start) AND (@end IS NULL OR {date}<@end)"+(entries?" AND m.nature='Entree'":"")+$" ORDER BY {date},m.id LIMIT 20001",args,tx)).ToArray();
   if(moves.Length>20000)throw new RuleException("Document trop volumineux : réduisez la période ou filtrez le produit.",409);
   var table=entries?Table(r,"Entrées magasin","Réception","Bon magasin","Produit / référence","Lot","Péremption","Quantité","Unité","Utilisateur","Enregistrement UTC"):Table(r,"Journal brut des mouvements","Enregistrement UTC","Nature","Produit / référence","Lot","Bon / cycle / révision","Entrée","Sortie","Solde produit","Unité","Auteur");
   var balance=products.ToDictionary(p=>p.Id,p=>opening.GetValueOrDefault(p.Id));var totals=new Dictionary<string,decimal>();
   foreach(var m in moves){balance[m.ProduitId]+=m.Quantite;if(!string.IsNullOrWhiteSpace(f.Nature)&&m.Nature!=f.Nature)continue;
    if(entries){table.Rows.Add([D(m.DateReception),m.Bon,m.Nom+" / "+m.Reference,m.Lot,D(m.Peremption),N(m.Quantite),m.Unite,m.Auteur,I(m.DateCreation)]);totals[m.Unite]=totals.GetValueOrDefault(m.Unite)+m.Quantite;}
    else table.Rows.Add([I(m.DateCreation),m.Nature,m.Nom+" / "+m.Reference,m.Lot,m.CycleId.HasValue?$"Cycle {m.CycleId} / v{m.Revision}":m.Bon,N(Math.Max(m.Quantite,0)),N(Math.Max(-m.Quantite,0)),N(balance[m.ProduitId]),m.Unite,m.Auteur]);
   }
   if(entries)UnitTotals(r,totals,"Entrées par unité");else {
    var periodBalances=Table(r,"Soldes de la période — toutes natures","Produit / référence","Unité","Stock initial","Stock final");foreach(var p in products)periodBalances.Rows.Add([p.Nom+" / "+p.Reference,p.Unite,N(opening.GetValueOrDefault(p.Id)),N(balance[p.Id])]);
   }
  }
  if(r.Tables.All(t=>t.Rows.Count==0))r.Notes.Add("Aucun mouvement pour la période et les filtres.");
  await tx.CommitAsync();ReportLog(r,c,user);return r;
 }
 static void UnitTotals(DrReport r,Dictionary<string,decimal> totals,string title){var t=Table(r,title,"Unité","Quantité");foreach(var pair in totals.OrderBy(p=>p.Key))t.Rows.Add([pair.Key,N(pair.Value)]);}
}
