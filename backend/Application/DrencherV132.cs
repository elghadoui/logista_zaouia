using Dapper;
using MySqlConnector;
using System.Security.Claims;
namespace Vitasouss;
public record DrDeleteCycle(int Version,string Confirmation,string Motif);
public record DrProgramState(int Version,bool Actif,string Confirmation);
public sealed partial class DrencherService {
 const string ProductRead="SELECT p.id,p.reference,p.nom,p.unite,p.actif,d.matiere_active MatiereActive,COALESCE(d.afficher_f04,1) AfficherF04 FROM vit_traitement_produit p LEFT JOIN vit_dr_produit_document d ON d.produit_id=p.id";
 static async Task<bool> DocumentOptionsInstalled(MySqlConnection db)=>await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='vit_dr_produit_document'")==1;
 static async Task SchemaV132(MySqlConnection db,bool readOnly=false) {
  var columns=(await db.QueryAsync("SELECT TABLE_NAME t,COLUMN_NAME n,COLUMN_TYPE ty FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('vit_dr_produit_document','vit_dr_cycle_v132')")).ToArray();
  // Archives retain their original schema. All mutation endpoints already reject ReadOnly contexts.
  if(readOnly&&columns.Length==0)return;
  var expected=new[]{("vit_dr_produit_document","produit_id","int(11)"),("vit_dr_produit_document","matiere_active","varchar(255)"),("vit_dr_produit_document","afficher_f04","tinyint(4)"),("vit_dr_cycle_v132","cycle_id","int(11)"),("vit_dr_cycle_v132","politique","varchar(30)"),("vit_dr_cycle_v132","stock_comptabilise","tinyint(4)"),("vit_dr_cycle_v132","supprime","tinyint(4)"),("vit_dr_cycle_v132","date_suppression","datetime"),("vit_dr_cycle_v132","administrateur","varchar(120)"),("vit_dr_cycle_v132","motif","varchar(1000)")};
  if(columns.Length!=expected.Length||expected.Any(e=>!columns.Any(p=>(string)p.t==e.Item1&&(string)p.n==e.Item2&&(string)p.ty==e.Item3)))throw new RuleException("Migration additive V1.3.2 requise : installer et vérifier SQL 011.",409);
  foreach(var (table,key,parent) in new[]{("vit_dr_produit_document","produit_id","vit_traitement_produit"),("vit_dr_cycle_v132","cycle_id","vit_dr_cycle")}){
   var pk=await db.QueryAsync<string>("SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@table AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION",new{table});
   if(!pk.SequenceEqual([key])||await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE k JOIN information_schema.REFERENTIAL_CONSTRAINTS r ON r.CONSTRAINT_SCHEMA=k.CONSTRAINT_SCHEMA AND r.CONSTRAINT_NAME=k.CONSTRAINT_NAME AND r.TABLE_NAME=k.TABLE_NAME WHERE k.TABLE_SCHEMA=DATABASE() AND k.TABLE_NAME=@table AND k.COLUMN_NAME=@key AND k.REFERENCED_TABLE_SCHEMA=DATABASE() AND k.REFERENCED_TABLE_NAME=@parent AND k.REFERENCED_COLUMN_NAME='id' AND r.DELETE_RULE IN ('RESTRICT','NO ACTION') AND r.UPDATE_RULE IN ('RESTRICT','NO ACTION')",new{table,key,parent})!=1)throw new RuleException("Contraintes V1.3.2 incompatibles : intervention bloquée.",409);
  }
  foreach(var t in new[]{"vit_dr_produit_document","vit_dr_cycle_v132"}){if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@t AND ENGINE='InnoDB'",new{t})!=1||!await SchemaGuard.CanInspectTriggers(db,t)||await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE=@t",new{t})!=0)throw new RuleException("Schéma V1.3.2 ou inspection des déclencheurs invalide.",409);}
 }
 async Task<dynamic> Accounting(MySqlConnection db,MySqlTransaction tx,dynamic cycle) {
  int id=(int)cycle.id;
  var state=await db.QuerySingleOrDefaultAsync("SELECT * FROM vit_dr_cycle_v132 WHERE cycle_id=@id",new{id},tx);
  var snapshot=Deserialize<DrSnapshot>(await db.QuerySingleAsync<string>("SELECT contenu FROM vit_dr_revision WHERE cycle_id=@id AND version=@version",new{id,version=(int)cycle.version},tx));
  var net=await Ledger(db,tx,id);var expected=Allocations(snapshot);
  bool any=net.Any(p=>p.Value!=0),validated=(string)cycle.statut=="Validé";
  if(state is not null){
   bool counted=Convert.ToBoolean(state.stock_comptabilise);
   if(counted&&!SameAmounts(net,expected)||!counted&&any||(string)cycle.statut=="Brouillon"&&counted)throw new RuleException("Journal, état et consommation du cycle incohérents : intervention bloquée.",409);
   return state;
  }
  if((string)cycle.statut=="Brouillon"&&any)throw new RuleException("Brouillon historique avec mouvements : vérification administrateur requise.",409);
  if(validated&&!SameAmounts(net,expected)||!validated&&any&&!SameAmounts(net,expected))throw new RuleException("Cycle historique : journal et instantané incohérents. Faire vérifier les mouvements avant intervention.",409);
  bool accounted=validated||any;
  await db.ExecuteAsync("INSERT INTO vit_dr_cycle_v132(cycle_id,politique,stock_comptabilise) VALUES(@id,@policy,@accounted)",new{id,policy=(string)cycle.statut=="En attente de validation"&&!accounted?"Legacy validation":"V1.3.2",accounted},tx);
  return await db.QuerySingleAsync("SELECT * FROM vit_dr_cycle_v132 WHERE cycle_id=@id",new{id},tx);
 }
 static bool SameAmounts(Dictionary<int,decimal> a,Dictionary<int,decimal> b)=>a.Keys.Union(b.Keys).All(k=>a.GetValueOrDefault(k)==b.GetValueOrDefault(k));
 static async Task<Dictionary<int,decimal>> Ledger(MySqlConnection db,MySqlTransaction tx,int id)=>(await db.QueryAsync("SELECT lot_id id,-SUM(quantite) q FROM vit_dr_mouvement WHERE cycle_id=@id GROUP BY lot_id",new{id},tx)).ToDictionary(p=>(int)p.id,p=>(decimal)p.q);
 static async Task StockDifference(MySqlConnection db,MySqlTransaction tx,int id,int version,DrSnapshot snapshot,ClaimsPrincipal user,string negative,string positive) {
  var old=await Ledger(db,tx,id);var next=Allocations(snapshot);
  foreach(var (lotId,delta) in DrencherStockPlan.Difference(old,next)) {
   if(delta==0)continue;
   var lot=await db.QuerySingleAsync("SELECT l.solde,l.lot,p.nom FROM vit_dr_stock_lot l JOIN vit_traitement_produit p ON p.id=l.produit_id WHERE l.id=@lotId FOR UPDATE",new{lotId},tx);
   try{DrencherStockPlan.Balance((decimal)lot.solde,delta);}catch(RuleException){throw new RuleException("Stock insuffisant ou capacité dépassée : "+(string)lot.nom+", lot "+(string)lot.lot+". Aucune soumission ou correction appliquée.",409);}
   await db.ExecuteAsync("UPDATE vit_dr_stock_lot SET solde=solde+@delta WHERE id=@lotId",new{delta,lotId},tx);
   await db.ExecuteAsync("INSERT INTO vit_dr_mouvement(lot_id,cycle_id,revision,nature,quantite,bon,auteur,date_creation) VALUES(@lotId,@id,@version,@nature,@delta,'',@author,UTC_TIMESTAMP())",new{lotId,id,version,nature=delta<0?negative:positive,delta,author=Actor(user)},tx);
  }
 }
 public async Task<object> DeleteCycle(ContextInfo c,int id,DrDeleteCycle r,ClaimsPrincipal user) {
  AdminOnly(user);if(r.Confirmation!="SUPPRIMER CYCLE "+id)throw new RuleException("Confirmation explicite requise : SUPPRIMER CYCLE "+id);
  string motif=DrMath.Text(r.Motif,1000,"Motif de suppression");
  await using var db=await Open(c);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);
  var cycle=await db.QuerySingleOrDefaultAsync("SELECT * FROM vit_dr_cycle WHERE id=@id",new{id},tx)??throw new RuleException("Cycle introuvable.",404);
  if((string)cycle.statut=="Supprimé"||(int)cycle.version!=r.Version)throw new RuleException("Cycle déjà supprimé ou modifié : aucune nouvelle restitution.",409);
  var before=Deserialize<DrSnapshot>(await db.QuerySingleAsync<string>("SELECT contenu FROM vit_dr_revision WHERE cycle_id=@id AND version=@Version",new{id,r.Version},tx));
  var accounting=await Accounting(db,tx,cycle);var ledger=await Ledger(db,tx,id);
  if(Convert.ToBoolean(accounting.stock_comptabilise)&&!SameAmounts(ledger,Allocations(before)))throw new RuleException("Journal et consommation du cycle incohérents : suppression bloquée.",409);
  var empty=before with{Produits=[]};int version=r.Version+1;
  await StockDifference(db,tx,id,version,empty,user,"Suppression sortie","Suppression restitution");
  await db.ExecuteAsync("DELETE FROM vit_dr_palette_reservee WHERE cycle_id=@id;DELETE FROM vit_dr_palette_validee WHERE cycle_id=@id",new{id},tx);
  await db.ExecuteAsync("UPDATE vit_dr_cycle SET statut='Supprimé',version=@version WHERE id=@id;UPDATE vit_dr_cycle_v132 SET supprime=1,stock_comptabilise=0,date_suppression=UTC_TIMESTAMP(),administrateur=@actor,motif=@motif WHERE cycle_id=@id",new{id,version,actor=Actor(user),motif},tx);
  await Revision(db,tx,id,version,before,"Suppression administrative",motif,user);
  await Audit(db,tx,"Suppression cycle",id,new{cycle,snapshot=before,mouvements=ledger},new{statut="Supprimé",motif,stockRestitue=ledger},user);
  await tx.CommitAsync();return new{id,version,statut="Supprimé",message="Cycle supprimé logiquement, stock restitué et palettes libérées."};
 }
 public async Task<object> DeletedCycles(ContextInfo c,ClaimsPrincipal user,int page) {
  AdminOnly(user);await using var db=await Open(c);page=Math.Clamp(page,1,100000);
  if(c.ReadOnly&&!await DocumentOptionsInstalled(db))return new{total=0,rows=Array.Empty<object>()};
  return new{total=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_cycle_v132 WHERE supprime=1"),rows=(await db.QueryAsync("SELECT c.id,c.version,c.statut,a.date_suppression,a.administrateur,a.motif FROM vit_dr_cycle c JOIN vit_dr_cycle_v132 a ON a.cycle_id=c.id WHERE a.supprime=1 ORDER BY a.date_suppression DESC,c.id DESC LIMIT 25 OFFSET @offset",new{offset=(page-1)*25})).Select(p=>DrDates.Row((object)p))};
 }
 public async Task<object> SetProgramState(ContextInfo c,int id,DrProgramState r,ClaimsPrincipal user) {
  if(!r.Actif&&r.Confirmation!="DESACTIVER PROGRAMME "+id)throw new RuleException("Confirmation de désactivation requise.");
  // Program() rechecks version, permissions in the endpoint, prescriptions and active products.
  await using var db=await Open(c);
  var json=await db.QuerySingleOrDefaultAsync<string>("SELECT contenu FROM vit_dr_programme_revision WHERE programme_id=@id AND version=@Version",new{id,r.Version})??throw new RuleException("Programme ou version introuvable.",409);
  var old=Deserialize<DrProgram>(json);return await Program(c,new(id,r.Version,old.Nom,r.Actif,old.Produits),user);
 }
}
