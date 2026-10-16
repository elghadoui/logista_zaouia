using Dapper;
using MySqlConnector;
using System.Security.Claims;

namespace Vitasouss;
public sealed partial class DrencherService
{
 public async Task<object> Cycles(ContextInfo c,string? search,string? status,string? from,string? to,int page) {
  await using var db=await Open(c);page=Math.Clamp(page,1,100000);
  DateTime? start=string.IsNullOrWhiteSpace(from)?null:DrMath.Date(from),end=string.IsNullOrWhiteSpace(to)?null:DrMath.Date(to);
  var args=new{q="%"+DrMath.Text(search,100,"Recherche",false)+"%",status=string.IsNullOrWhiteSpace(status)?null:status,start,end,offset=(page-1)*25};
  const string join=" FROM vit_dr_cycle c JOIN vit_dr_revision r ON r.cycle_id=c.id AND r.version=c.version";
  const string where=" WHERE c.statut<>'Supprimé' AND (@status IS NULL OR c.statut=@status) AND (@start IS NULL OR c.date_traitement>=@start) AND (@end IS NULL OR c.date_traitement<=@end) AND (CAST(c.id AS CHAR) LIKE @q OR r.contenu LIKE @q)";
  var rows=await db.QueryAsync("SELECT c.*,r.contenu"+join+where+" ORDER BY c.id DESC LIMIT 25 OFFSET @offset",args);
  var result=rows.Select(r=>new{id=(int)r.id,version=(int)r.version,statut=(string)r.statut,date=(DateTime)r.date_traitement,auteur=(string)r.auteur,validateur=(string?)r.validateur,dateValidation=(DateTime?)r.date_validation,snapshot=Deserialize<DrSnapshot>((string)r.contenu)}).ToArray();
  return new{rows=result,total=await db.ExecuteScalarAsync<int>("SELECT COUNT(*)"+join+where,args),page,
   summary=new{cycles=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_cycle WHERE statut<>'Supprimé'"),attente=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_cycle WHERE statut='En attente de validation'"),palettes=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_palette_validee"),consommations=await db.QueryAsync("SELECT p.nom,p.unite,-SUM(m.quantite) quantite FROM vit_dr_mouvement m JOIN vit_dr_stock_lot l ON l.id=m.lot_id JOIN vit_traitement_produit p ON p.id=l.produit_id WHERE m.cycle_id IS NOT NULL GROUP BY p.id,p.nom,p.unite")}};
 }
 public async Task<object> Detail(ContextInfo c,int id,ClaimsPrincipal user) {
  await using var db=await Open(c);
  var cycle=await db.QuerySingleOrDefaultAsync("SELECT * FROM vit_dr_cycle WHERE id=@id",new{id})??throw new RuleException("Cycle introuvable.",404);
  if((string)cycle.statut=="Supprimé")AdminOnly(user);
  var rows=await db.QueryAsync("SELECT version,action,motif,auteur,date_creation dateCreation,contenu FROM vit_dr_revision WHERE cycle_id=@id ORDER BY version DESC",new{id});
  return new{id,version=(int)cycle.version,statut=(string)cycle.statut,auteur=(string)cycle.auteur,canEditDraft=DrencherPermissionPolicy.OwnDraft(user,(int)cycle.auteur_id),dateCreation=(DateTime)cycle.date_creation,validateur=(string?)cycle.validateur,dateValidation=(DateTime?)cycle.date_validation,
   revisions=rows.Select(r=>new{version=(int)r.version,action=(string)r.action,motif=(string)r.motif,auteur=(string)r.auteur,dateCreation=(DateTime)r.dateCreation,snapshot=Deserialize<DrSnapshot>((string)r.contenu)})};
 }
 async Task<DrSnapshot> Build(MySqlConnection db,MySqlTransaction tx,ContextInfo c,DrCycleRequest r,DrSnapshot? old=null) {
  DrMath.Date(r.Date);DrMath.Time(r.Debut,r.Fin);DrMath.Quantity(r.EauInitiale,"Eau initiale");DrMath.Quantity(r.EauConsommee,"Eau consommée");
  if(r.EauInitiale==0||r.EauConsommee==0)throw new RuleException("Les deux quantités d'eau doivent être positives.");
  var observations=DrMath.Text(r.Observations,2000,"Observations",false);
  if(r.Palettes is null || r.Palettes.Length is <1 or >2000 || r.Palettes.Distinct().Count()!=r.Palettes.Length)throw new RuleException("Sélectionnez 1 à 2000 palettes distinctes.");
  if(r.Produits is null||r.Produits.Length is <1 or >30||r.Produits.Select(p=>p.ProduitId).Distinct().Count()!=r.Produits.Length)throw new RuleException("Sélectionnez 1 à 30 produits distincts.");
  var pr=await db.QuerySingleOrDefaultAsync("SELECT p.actif,p.version,r.contenu FROM vit_dr_programme p JOIN vit_dr_programme_revision r ON r.programme_id=p.id AND r.version=@ProgrammeVersion WHERE p.id=@ProgrammeId",r,tx)??throw new RuleException("Version du programme introuvable.");
  if((old is null||old.ProgrammeId!=r.ProgrammeId||old.ProgrammeVersion!=r.ProgrammeVersion) && (!Convert.ToBoolean(pr.actif)||(int)pr.version!=r.ProgrammeVersion))throw new RuleException("Programme inactif ou modifié : rechargez les programmes.",409);
  var program=Deserialize<DrProgram>((string)pr.contenu);
  if(program.Produits.Any(p=>!r.Produits.Any(u=>u.ProduitId==p.ProduitId)))throw new RuleException("Conservez les produits du programme ; saisir 0 si non consommé et expliquer l'écart.");
  var palettes=(await db.QueryAsync<DrPalette>(PaletteSelect+PaletteFrom+" WHERE p.numpal IN @ids AND r.refsta=@sta ORDER BY p.numpal LOCK IN SHARE MODE",new{ids=r.Palettes,sta=c.LocalRefsta},tx)).ToArray();
  if(palettes.Length!=r.Palettes.Length)throw new RuleException("Palette absente ou réception d'une autre station.",409);
  var products=new List<DrUsageSnapshot>();
  foreach(var u in r.Produits) {
   var product=await db.QuerySingleOrDefaultAsync<DrProduct>(ProductRead+" WHERE p.id=@ProduitId",u,tx)??throw new RuleException("Produit inconnu.");
   if(!product.Actif&&!((old?.Produits.Any(p=>p.ProduitId==u.ProduitId))??false))throw new RuleException("Produit inactif.");
   DrMath.Quantity(u.Dose,"Dosage");if(u.Machine is decimal m)DrMath.Quantity(m,"Consommation machine");if(u.Reel is decimal real)DrMath.Quantity(real,"Consommation réelle");
   if(u.Lots is null||u.Lots.Length>30||u.Lots.Select(l=>l.LotId).Distinct().Count()!=u.Lots.Length)throw new RuleException("Lots fabricants : maximum 30 lots distincts par produit.");
   var lots=new List<DrLotSnapshot>();
   foreach(var allocation in u.Lots) {
    DrMath.Quantity(allocation.Quantite,"Quantité par lot");
    var lot=await db.QuerySingleOrDefaultAsync("SELECT * FROM vit_dr_stock_lot WHERE id=@LotId AND produit_id=@ProduitId",new{allocation.LotId,u.ProduitId},tx)??throw new RuleException("Lot fabricant absent du stock de ce produit.");
    lots.Add(new(allocation.LotId,(string)lot.lot,DrDates.Value((object?)lot.peremption),allocation.Quantite));
   }
   if(u.Reel is not null && lots.Sum(l=>l.Quantite)!=u.Reel)throw new RuleException("La répartition par lots fabricants doit égaler la consommation réelle.");
   var prescribed=program.Produits.FirstOrDefault(p=>p.ProduitId==u.ProduitId)?.Dose;
   var initial=DrMath.Amount(r.EauInitiale,u.Dose);var final=DrMath.Amount(r.EauConsommee,u.Dose);
   DrMath.Quantity(initial,"Quantité initiale calculée");DrMath.Quantity(final,"Quantité finale calculée");
   var historical=old?.Produits.FirstOrDefault(p=>p.ProduitId==u.ProduitId);
   products.Add(new(u.ProduitId,product.Reference,product.Nom,product.Unite,u.Dose,prescribed,initial,final,u.Machine,u.Reel,u.Reel-final,u.Reel-u.Machine,prescribed is null,prescribed is not null&&u.Dose!=prescribed,lots.ToArray(),historical is not null?historical.MatiereActive:product.MatiereActive,historical is not null?historical.AfficherF04:product.AfficherF04));
  }
  var weight=configuration["Drencher:PaletteWeightUnit"]??"kg";if(weight is not("kg" or "t"))weight="";
  return new(r.Date,r.Debut,r.Fin,program.Id,program.Version,program.Nom,r.EauInitiale,r.EauConsommee,weight,palettes,products.ToArray(),observations);
 }
 static void Complete(DrSnapshot s) {
  if(s.Palettes.Length==0)throw new RuleException("Sélectionnez des palettes avant soumission.");
  if(s.Produits.Any(p=>p.Reel is null||p.Machine is null||p.Reel>0&&p.Lots.Length==0))throw new RuleException("Renseignez consommation machine, consommation réelle et répartition des lots avant soumission/validation.");
 }
 static async Task Revision(MySqlConnection db,MySqlTransaction tx,int id,int version,DrSnapshot snapshot,string action,string motif,ClaimsPrincipal user)=>
  await db.ExecuteAsync("INSERT INTO vit_dr_revision(cycle_id,version,contenu,action,motif,auteur,date_creation) VALUES(@id,@version,@contenu,@action,@motif,@auteur,UTC_TIMESTAMP())",new{id,version,contenu=Serialize(snapshot),action,motif,auteur=Actor(user)},tx);
 public async Task<object> Save(ContextInfo c,int id,DrCycleRequest r,ClaimsPrincipal user,bool correction=false) {
  await PalettePermissions(user);
  await using var db=await Open(c);await HistoricalSchema(db);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);await EnsureReservations(db,tx);
  var cycle=await db.QuerySingleOrDefaultAsync("SELECT * FROM vit_dr_cycle WHERE id=@id",new{id},tx);
  DrSnapshot? old=null;
  if(id!=0) {
   if(cycle is null)throw new RuleException("Cycle introuvable.",404);
   if((int)cycle.version!=r.Version)throw new RuleException("Cycle modifié par un autre utilisateur. Rechargez.",409);
   string state=(string)cycle.statut;
   if(state=="Supprimé"||correction&&state is not("Validé" or "En attente de validation")||!correction&&state!="Brouillon")throw new RuleException("Cycle verrouillé après soumission : correction réservée à la qualité.",409);
   if(!correction)DrencherPermissionPolicy.DemandOwnDraft(user,(int)cycle.auteur_id);
   if(correction)await permissions.Demand(user,"drencher_quality","modify");
   old=Deserialize<DrSnapshot>(await db.QuerySingleAsync<string>("SELECT contenu FROM vit_dr_revision WHERE cycle_id=@id AND version=@Version",new{id,r.Version},tx));
  }else if(correction)throw new RuleException("Cycle inexistant.");
  await CheckOwners(db,tx,r.Palettes??[],id);
  if(cycle is not null)await Accounting(db,tx,cycle);
  var snapshot=await Build(db,tx,c,r,old);var version=r.Version+1;var motif=DrMath.Text(r.Motif,1000,"Motif",correction);
  if(old is not null && old.Produits.Any(p=>p.Reel>0&&!snapshot.Produits.Any(n=>n.ProduitId==p.ProduitId)))throw new RuleException("Conservez toute utilisation réelle déjà enregistrée et expliquez la correction ; l'historique reste visible.",409);
  if(correction) {
   Complete(snapshot);
   if(!old!.Palettes.Select(p=>p.Numpal).Order().SequenceEqual(snapshot.Palettes.Select(p=>p.Numpal).Order()))throw new RuleException("Une correction conserve les palettes validées. Faire examiner une erreur de sélection par l'administrateur.",409);
   if(old.Produits.Any(p=>p.Reel>0&&!snapshot.Produits.Any(n=>n.ProduitId==p.ProduitId)))throw new RuleException("Une utilisation réelle ne peut être retirée : conservez le produit et documentez la correction.",409);
   await Accounting(db,tx,cycle!);
   await StockDifference(db,tx,id,version,snapshot,user,"Correction consommation","Correction restitution");
   await db.ExecuteAsync("UPDATE vit_dr_cycle_v132 SET stock_comptabilise=1,politique='V1.3.2' WHERE cycle_id=@id",new{id},tx);
  }
  if(id==0){version=1;await db.ExecuteAsync("INSERT INTO vit_dr_cycle(statut,version,date_traitement,debut,fin,auteur_id,auteur,date_creation) VALUES('Brouillon',1,@date,@Debut,@Fin,@uid,@auteur,UTC_TIMESTAMP())",new{date=DrMath.Date(r.Date),r.Debut,r.Fin,uid=Uid(user),auteur=Actor(user)},tx);id=await db.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()",transaction:tx);}
  else await db.ExecuteAsync("UPDATE vit_dr_cycle SET version=@version,date_traitement=@date,debut=@Debut,fin=@Fin,statut=@status WHERE id=@id",new{version,date=DrMath.Date(r.Date),r.Debut,r.Fin,status=correction?(string)cycle!.statut:"Brouillon",id},tx);
  if(cycle is null)await db.ExecuteAsync("INSERT INTO vit_dr_cycle_v132(cycle_id,politique,stock_comptabilise) VALUES(@id,'V1.3.2',0)",new{id},tx);
  await db.ExecuteAsync("DELETE FROM vit_dr_palette_reservee WHERE cycle_id=@id",new{id},tx);foreach(var p in snapshot.Palettes)await db.ExecuteAsync("INSERT INTO vit_dr_palette_reservee(numpal,cycle_id) VALUES(@Numpal,@id)",new{p.Numpal,id},tx);
  await Revision(db,tx,id,version,snapshot,correction?"Correction":"Enregistrement",motif,user);await tx.CommitAsync();logger.LogInformation("Drencher cycle {Id} revision {Version} par {Uid}",id,version,Uid(user));return new{id,version,statut=correction?(string)cycle!.statut:"Brouillon"};
 }
 public async Task<object> Transition(ContextInfo c,int id,DrTransition r,ClaimsPrincipal user,bool validate) {
  await using var db=await Open(c);await HistoricalSchema(db);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);
  var cycle=await db.QuerySingleOrDefaultAsync("SELECT * FROM vit_dr_cycle WHERE id=@id",new{id},tx)??throw new RuleException("Cycle introuvable.",404);
  if((int)cycle.version!=r.Version || (string)cycle.statut!=(validate?"En attente de validation":"Brouillon"))throw new RuleException("Version ou état du cycle incompatible. Rechargez ; aucune nouvelle sortie de stock.",409);
  if(!validate)DrencherPermissionPolicy.DemandOwnDraft(user,(int)cycle.auteur_id);
  var snapshot=Deserialize<DrSnapshot>(await db.QuerySingleAsync<string>("SELECT contenu FROM vit_dr_revision WHERE cycle_id=@id AND version=@Version",new{id,r.Version},tx));Complete(snapshot);await CheckOwnReservations(db,tx,id,snapshot);
  var accounting=await Accounting(db,tx,cycle);
  if(!validate||!Convert.ToBoolean(accounting.stock_comptabilise)) {
   await StockDifference(db,tx,id,r.Version+1,snapshot,user,validate?"Consommation":"Soumission consommation","Correction restitution");
   await db.ExecuteAsync("UPDATE vit_dr_cycle_v132 SET stock_comptabilise=1,politique='V1.3.2' WHERE cycle_id=@id",new{id},tx);
  } else if(!SameAmounts(await Ledger(db,tx,id),Allocations(snapshot)))throw new RuleException("Consommation comptabilisée incohérente : validation bloquée.",409);
  if(validate) {
   // Relecture des identifiants et de la station, sans aucune mutation de Logista.
   var ids=snapshot.Palettes.Select(p=>p.Numpal).ToArray();
   var current=(await db.QueryAsync<DrPalette>(PaletteSelect+PaletteFrom+" WHERE p.numpal IN @ids AND r.refsta=@sta ORDER BY p.numpal LOCK IN SHARE MODE",new{ids,sta=c.LocalRefsta},tx)).ToArray();
   if(current.Length!=ids.Length || current.Any(p=>p.CycleTraite is not null)||!Serialize(current.Select(p=>p with{CycleTraite=null})).Equals(Serialize(snapshot.Palettes.Select(p=>p with{CycleTraite=null}))))throw new RuleException("Palette déjà traitée ou données Logista modifiées depuis la saisie. Recharger le cycle.",409);
   foreach(var p in snapshot.Palettes)await db.ExecuteAsync("INSERT INTO vit_dr_palette_validee(numpal,cycle_id) VALUES(@Numpal,@id)",new{p.Numpal,id},tx);
  }
  var version=r.Version+1;var status=validate?"Validé":"En attente de validation";
  await db.ExecuteAsync("UPDATE vit_dr_cycle SET version=@version,statut=@status,validateur=IF(@validate,@auteur,validateur),date_validation=IF(@validate,UTC_TIMESTAMP(),date_validation) WHERE id=@id",new{version,status,validate,auteur=Actor(user),id},tx);
  await Revision(db,tx,id,version,snapshot,validate?"Validation":"Soumission",DrMath.Text(r.Motif,1000,"Observations qualité",false),user);
  await tx.CommitAsync();logger.LogInformation("Drencher {Action} cycle {Id} par {Uid}",status,id,Uid(user));return new{id,version,statut=status};
 }
 static Dictionary<int,decimal> Allocations(DrSnapshot? s)=>s?.Produits.SelectMany(p=>p.Lots).GroupBy(l=>l.LotId).ToDictionary(g=>g.Key,g=>g.Sum(l=>l.Quantite))??[];
}
