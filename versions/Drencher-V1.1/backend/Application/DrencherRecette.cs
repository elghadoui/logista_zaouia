using Dapper;
using MySqlConnector;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace Vitasouss;
public record DrRecetteActivation(string Confirmation);
public record DrRecettePreview(string Operation,int? CycleId);
public record DrRecetteApply(string Ticket,string Confirmation,string Motif);
public sealed partial class DrencherService
{
 static bool RecetteName(string name)=>Regex.IsMatch(name,"^vitasouss_recette_drencher_[a-f0-9]{32}$",RegexOptions.CultureInvariant);
 static void AdminOnly(ClaimsPrincipal user){if(!user.IsInRole("Admin"))throw new RuleException("Mode Recette et nettoyages réservés aux administrateurs.",403);}
 public async Task<object> Mode(ContextInfo c) {
  await using var admin=await connections.Admin();
  dynamic? registration;
  try{registration=await admin.QuerySingleOrDefaultAsync("SELECT * FROM app_drencher_recette WHERE context_id=@Id",c);}
  catch(MySqlException e)when(e.Number==1146){return new{mode="Production",registered=false,eligible=RecetteName(c.DatabaseName),installation=false};}
  if(registration is null)return new{mode="Production",registered=false,eligible=RecetteName(c.DatabaseName),installation=true};
  if(!RecetteName(c.DatabaseName)||(int)registration.server_id!=c.ServerId||(string)registration.database_name!=c.DatabaseName)return new{mode="Configuration invalide",registered=false,eligible=false,installation=true};
  await using var db=await connections.Business(c);
  var identity=await Identity(db,c,false);
  var valid=identity is not null&&(string)identity.identite==(string)registration.identite&&(int?)identity.contexte_inscrit==c.Id;
  return new{mode=valid?"Recette":"Configuration invalide",registered=valid,eligible=false,installation=true};
 }
 static async Task<dynamic?> Identity(MySqlConnection db,ContextInfo c,bool required=true) {
  if(!RecetteName(c.DatabaseName)||(await db.ExecuteScalarAsync<string>("SELECT DATABASE()"))!=c.DatabaseName){if(required)throw new RuleException("Nettoyage interdit : base de production ou nom de recette non autorisé.",403);return null;}
  if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('vit_dr_recette_identite','vit_dr_recette_operation') AND ENGINE='InnoDB'")!=2){if(required)throw new RuleException("Identité de la base de recette absente.",409);return null;}
  foreach(var t in new[]{"vit_dr_recette_identite","vit_dr_recette_operation"})if(!await SchemaGuard.CanInspectTriggers(db,t)||await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE=@t",new{t})!=0)throw new RuleException("Inspection de l'identité de recette non validée.",409);
  var marker=await db.QuerySingleOrDefaultAsync("SELECT * FROM vit_dr_recette_identite WHERE id=1");
  if(marker is null ||(string)marker.database_name!=c.DatabaseName||(string)marker.identite!=c.DatabaseName["vitasouss_recette_drencher_".Length..]){if(required)throw new RuleException("Identité de recette incompatible.",409);return null;}
  return marker;
 }
 public async Task<object> ActivateRecette(ContextInfo c,DrRecetteActivation r,ClaimsPrincipal user) {
  AdminOnly(user);if(!RecetteName(c.DatabaseName)||c.DatabaseName.Equals("logista",StringComparison.OrdinalIgnoreCase))throw new RuleException("Activation Recette interdite sur cette base. Créer une base isolée neuve.",403);
  if(r.Confirmation!="ACTIVER RECETTE")throw new RuleException("Saisissez ACTIVER RECETTE pour confirmer.");
  await using var db=await Open(c);var identity=await Identity(db,c);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);
  if((int?)identity!.contexte_inscrit is int bound&&bound!=c.Id)throw new RuleException("Cette base est déjà liée à un autre contexte.",409);
  foreach(var table in Tables.Where(t=>t!="vit_dr_mutex"))if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM `"+table+"`",transaction:tx)>0)throw new RuleException("Activation refusée : des données Drencher existent déjà. Elles ne sont pas considérées comme des tests.",409);
  await using var admin=await connections.Admin();
  if(await admin.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_drencher_recette WHERE context_id=@Id",c)>0)throw new RuleException("Mode Recette déjà inscrit.",409);
  await db.ExecuteAsync("UPDATE vit_dr_recette_identite SET contexte_inscrit=@Id WHERE id=1 AND identite=@identity",new{c.Id,identity=(string)identity.identite},tx);
  // L'inscription administrative est préparée avant la validation du marqueur métier.
  // Une panne laisse un mode invalide et aucun droit de nettoyage, jamais une promotion implicite.
  await admin.ExecuteAsync("INSERT INTO app_drencher_recette(context_id,server_id,database_name,identite,auteur,date_creation) VALUES(@Id,@ServerId,@DatabaseName,@identite,@auteur,UTC_TIMESTAMP())",new{c.Id,c.ServerId,c.DatabaseName,identite=(string)identity.identite,auteur=Actor(user)});
  await tx.CommitAsync();return new{message="Mode Recette activé sur la base isolée. Accès réservé aux administrateurs."};
 }
 async Task<MySqlConnection> RecetteDb(ContextInfo c,ClaimsPrincipal user) {
  AdminOnly(user);if(!RecetteName(c.DatabaseName)||c.ReadOnly)throw new RuleException("Nettoyage interdit hors d'une base de recette isolée accessible en écriture.",403);
  var db=await Open(c);
  try{
   var identity=await Identity(db,c);await using var admin=await connections.Admin();
   if(await admin.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM app_drencher_recette WHERE context_id=@Id AND server_id=@ServerId AND database_name=@DatabaseName AND identite=@identite",new{c.Id,c.ServerId,c.DatabaseName,identite=(string)identity!.identite})!=1||(int?)identity.contexte_inscrit!=c.Id)throw new RuleException("Base de recette non inscrite ou identité modifiée.",403);
   await InspectCleanupDependencies(db,c);
   return db;
  }catch{await db.DisposeAsync();throw;}
 }
 static async Task InspectCleanupDependencies(MySqlConnection db,ContextInfo c,MySqlTransaction? tx=null) {
   var account=await db.ExecuteScalarAsync<string>("SELECT CURRENT_USER()",transaction:tx);var split=account!.LastIndexOf('@');
   var grantee="'"+account[..split].Replace("'","''")+"'@'"+account[(split+1)..].Replace("'","''")+"'";
   if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.USER_PRIVILEGES WHERE GRANTEE=@grantee AND PRIVILEGE_TYPE='PROCESS'",new{grantee},tx)==0)throw new RuleException("Nettoyage bloqué : droit PROCESS requis pour vérifier toutes les dépendances, y compris hors de la recette.",409);
   // PROCESS donne accès à l'inventaire GLOBAL des FK InnoDB, y compris hors de la base.
   // Sans cet inventaire, aucun DELETE : une dépendance cachée pourrait déclencher une cascade.
   dynamic[] foreign;
   try{foreign=(await db.QueryAsync("SELECT FOR_NAME enfant,REF_NAME parent FROM information_schema.INNODB_SYS_FOREIGN WHERE REF_NAME IN @names",new{names=Tables.Select(t=>c.DatabaseName+"/"+t).ToArray()},tx)).ToArray();}
   catch(MySqlException){throw new RuleException("Inspection globale des dépendances indisponible. Le DBA doit autoriser PROCESS au compte de recette avant nettoyage.",409);}
   if(foreign.Any(f=>!Tables.Contains(((string)f.enfant).StartsWith(c.DatabaseName+"/",StringComparison.Ordinal)?((string)f.enfant)[(c.DatabaseName.Length+1)..]:"")))throw new RuleException("Nettoyage bloqué : dépendance extérieure au module Drencher.",409);
   if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE UNIQUE_CONSTRAINT_SCHEMA=DATABASE() AND REFERENCED_TABLE_NAME IN @Tables AND (DELETE_RULE NOT IN ('RESTRICT','NO ACTION') OR UPDATE_RULE NOT IN ('RESTRICT','NO ACTION'))",new{Tables},tx)>0)throw new RuleException("Nettoyage bloqué : cascade ou modification automatique de dépendance non autorisée.",409);
 }
 static readonly Dictionary<string,string> Order=new(){["vit_traitement_produit"]="id",["vit_dr_programme"]="id",["vit_dr_programme_revision"]="programme_id,version",["vit_dr_stock_lot"]="id",["vit_dr_cycle"]="id",["vit_dr_revision"]="cycle_id,version",["vit_dr_palette_validee"]="numpal",["vit_dr_mouvement"]="id"};
 static async Task<(string Hash,Dictionary<string,int> Counts)> CleanupState(MySqlConnection db,MySqlTransaction tx) {
  var counts=new Dictionary<string,int>();using var hash=IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
  foreach(var (table,order)in Order){var rows=(await db.QueryAsync("SELECT * FROM `"+table+"` ORDER BY "+order+" LIMIT 50001",transaction:tx)).ToArray();if(rows.Length>50000)throw new RuleException("Volume de recette trop important : nettoyage à examiner par le DBA.",409);counts[table]=rows.Length;hash.AppendData(Encoding.UTF8.GetBytes(table+Serialize(rows)));}
  return(Convert.ToHexString(hash.GetHashAndReset()),counts);
 }
 public async Task<object> PreviewCleanup(ContextInfo c,DrRecettePreview r,ClaimsPrincipal user) {
  if(r.Operation is not("Cycle" or "CyclesStock" or "Tout"))throw new RuleException("Opération de nettoyage inconnue.");
  await using var db=await RecetteDb(c,user);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);
  object? cycle=null;
  if(r.Operation=="Cycle"){if(r.CycleId is not >0)throw new RuleException("Cycle de test requis.");cycle=await db.QuerySingleOrDefaultAsync("SELECT id,version,statut FROM vit_dr_cycle WHERE id=@CycleId",r,tx)??throw new RuleException("Cycle introuvable.",404);}
  var state=await CleanupState(db,tx);var ticket=Guid.NewGuid().ToString("N");var phrase=r.Operation=="Cycle"?"SUPPRIMER CYCLE "+r.CycleId:r.Operation=="Tout"?"EFFACER TOUS LES TESTS":"EFFACER CYCLES ET STOCK";
  var affected=state.Counts;
  object[] restitutions=[];
  if(r.Operation=="Cycle"){
   affected=new Dictionary<string,int>();foreach(var table in new[]{"vit_dr_cycle","vit_dr_revision","vit_dr_mouvement","vit_dr_palette_validee"})affected[table]=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM `"+table+"` WHERE "+(table=="vit_dr_cycle"?"id":"cycle_id")+"=@CycleId",r,tx);
   restitutions=(await db.QueryAsync("SELECT p.nom,p.unite,l.lot,-SUM(m.quantite) quantiteRestituee,l.solde soldeAvant,l.solde-SUM(m.quantite) soldeApres FROM vit_dr_mouvement m JOIN vit_dr_stock_lot l ON l.id=m.lot_id JOIN vit_traitement_produit p ON p.id=l.produit_id WHERE m.cycle_id=@CycleId GROUP BY p.nom,p.unite,l.lot,l.solde",r,tx)).Cast<object>().ToArray();
  }else if(r.Operation=="CyclesStock")affected=state.Counts.Where(k=>k.Key is not("vit_dr_programme" or "vit_dr_programme_revision" or "vit_traitement_produit")).ToDictionary(k=>k.Key,k=>k.Value);
  var details=new{database=c.DatabaseName,r.Operation,r.CycleId,cycle,counts=affected,restitutions,programmesProduitsConserves=r.Operation!="Tout",historiqueAdministratifConserve=true};
  await using var admin=await connections.Admin();await admin.ExecuteAsync("INSERT INTO app_drencher_nettoyage(id,context_id,utilisateur_id,auteur,operation,cycle_id,empreinte,confirmation,etat,motif,details,date_creation) VALUES(@ticket,@Id,@uid,@auteur,@Operation,@CycleId,@hash,@phrase,'Apercu','',@details,UTC_TIMESTAMP())",new{ticket,c.Id,uid=Uid(user),auteur=Actor(user),r.Operation,CycleId=r.Operation=="Cycle"?r.CycleId:null,hash=state.Hash,phrase,details=Serialize(details)});
  await tx.CommitAsync();return new{ticket,confirmation=phrase,details,expiresMinutes=10};
 }
 public async Task<object> ApplyCleanup(ContextInfo c,DrRecetteApply r,ClaimsPrincipal user) {
  AdminOnly(user);var motif=DrMath.Text(r.Motif,1000,"Motif du nettoyage");if(!Regex.IsMatch(r.Ticket??"","^[a-f0-9]{32}$"))throw new RuleException("Aperçu requis.");
  await using var db=await RecetteDb(c,user);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);await using var admin=await connections.Admin();
  var ticket=await admin.QuerySingleOrDefaultAsync("SELECT * FROM app_drencher_nettoyage WHERE id=@Ticket AND context_id=@Id AND utilisateur_id=@uid AND etat='Apercu' AND date_creation>=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 10 MINUTE)",new{r.Ticket,c.Id,uid=Uid(user)})??throw new RuleException("Aperçu expiré, utilisé ou non autorisé. Refaire l'aperçu.",409);
  if((string)ticket.operation is not("Cycle" or "CyclesStock" or "Tout"))throw new RuleException("Opération administrative invalide.",409);
  if(r.Confirmation!=(string)ticket.confirmation)throw new RuleException("Confirmation incorrecte. Recopier la phrase de l'aperçu.");
  var state=await CleanupState(db,tx);await InspectCleanupDependencies(db,c,tx);if(state.Hash!=(string)ticket.empreinte)throw new RuleException("Les données ont changé depuis l'aperçu. Refaire l'aperçu avant suppression.",409);
  if(await admin.ExecuteAsync("UPDATE app_drencher_nettoyage SET etat='Prepare',motif=@motif WHERE id=@Ticket AND etat='Apercu'",new{r.Ticket,motif})!=1)throw new RuleException("Aperçu déjà utilisé.",409);
  var committed=false;
  try{
   var deleted=new Dictionary<string,int>();
   if((string)ticket.operation=="Cycle")await DeleteTestCycle(db,tx,(int)ticket.cycle_id,deleted);
   else{
    foreach(var table in new[]{"vit_dr_mouvement","vit_dr_palette_validee","vit_dr_revision","vit_dr_cycle","vit_dr_stock_lot"})deleted[table]=await db.ExecuteAsync("DELETE FROM `"+table+"` WHERE "+Order[table].Split(',')[0]+">=0",transaction:tx);
    if((string)ticket.operation=="Tout")foreach(var table in new[]{"vit_dr_programme_revision","vit_dr_programme","vit_traitement_produit"})deleted[table]=await db.ExecuteAsync("DELETE FROM `"+table+"` WHERE "+Order[table].Split(',')[0]+">=0",transaction:tx);
    foreach(var (table,count)in deleted)if(count!=state.Counts[table])throw new RuleException("Nombre de lignes incohérent : nettoyage annulé.",409);
   }
   var result=new{database=c.DatabaseName,operation=(string)ticket.operation,cycleId=(int?)ticket.cycle_id,deleted,historiqueAdministratifConserve=true};
   await db.ExecuteAsync("INSERT INTO vit_dr_recette_operation(id,resultat,date_execution) VALUES(@Ticket,@result,UTC_TIMESTAMP())",new{r.Ticket,result=Serialize(result)},tx);
   await tx.CommitAsync();committed=true;
   await admin.ExecuteAsync("UPDATE app_drencher_nettoyage SET etat='Applique',date_execution=UTC_TIMESTAMP(),details=@result WHERE id=@Ticket AND etat='Prepare'",new{r.Ticket,result=Serialize(result)});
   return result;
  }catch{
   if(!committed){await tx.RollbackAsync();await admin.ExecuteAsync("UPDATE app_drencher_nettoyage SET etat='Echec' WHERE id=@Ticket AND etat='Prepare'",r);}
   else throw new RuleException("Nettoyage effectué, finalisation du journal à vérifier. Consulter l'historique ; ne pas répéter l'opération.",503);
   throw;
  }
 }
 static async Task DeleteTestCycle(MySqlConnection db,MySqlTransaction tx,int id,Dictionary<string,int> deleted) {
  var cycle=await db.QuerySingleAsync("SELECT * FROM vit_dr_cycle WHERE id=@id",new{id},tx);
  var snapshot=Deserialize<DrSnapshot>(await db.QuerySingleAsync<string>("SELECT contenu FROM vit_dr_revision WHERE cycle_id=@id AND version=@version",new{id,version=(int)cycle.version},tx));
  var ledger=(await db.QueryAsync("SELECT lot_id, SUM(quantite) quantite FROM vit_dr_mouvement WHERE cycle_id=@id GROUP BY lot_id",new{id},tx)).ToDictionary(r=>(int)r.lot_id,r=>(decimal)r.quantite);
  var claims=(await db.QueryAsync<int>("SELECT numpal FROM vit_dr_palette_validee WHERE cycle_id=@id ORDER BY numpal",new{id},tx)).ToArray();
  var expected=Allocations(snapshot);
  if((string)cycle.statut=="Validé"){
   if(!claims.SequenceEqual(snapshot.Palettes.Select(p=>p.Numpal).Order())||ledger.Any(l=>l.Value!=-expected.GetValueOrDefault(l.Key))||expected.Any(l=>ledger.GetValueOrDefault(l.Key)!=-l.Value))throw new RuleException("Registre stock/palettes incohérent : suppression annulée.",409);
  }else if(ledger.Count!=0||claims.Length!=0)throw new RuleException("Un cycle non validé possède des mouvements : suppression annulée.",409);
  foreach(var (lotId,quantity)in ledger)if(await db.ExecuteAsync("UPDATE vit_dr_stock_lot SET solde=solde-@quantity WHERE id=@lotId AND solde-@quantity>=0",new{lotId,quantity},tx)!=1)throw new RuleException("Restauration du stock impossible.",409);
  deleted["vit_dr_mouvement"]=await db.ExecuteAsync("DELETE FROM vit_dr_mouvement WHERE cycle_id=@id",new{id},tx);
  deleted["vit_dr_palette_validee"]=await db.ExecuteAsync("DELETE FROM vit_dr_palette_validee WHERE cycle_id=@id",new{id},tx);
  deleted["vit_dr_revision"]=await db.ExecuteAsync("DELETE FROM vit_dr_revision WHERE cycle_id=@id",new{id},tx);
  deleted["vit_dr_cycle"]=await db.ExecuteAsync("DELETE FROM vit_dr_cycle WHERE id=@id AND version=@version",new{id,version=(int)cycle.version},tx);
  if(deleted["vit_dr_cycle"]!=1)throw new RuleException("Cycle modifié : suppression annulée.",409);
 }
 public async Task<object> CleanupHistory(ContextInfo c,ClaimsPrincipal user) {
  AdminOnly(user);await using var db=await RecetteDb(c,user);await using var admin=await connections.Admin();
  var pending=await admin.QueryAsync<string>("SELECT id FROM app_drencher_nettoyage WHERE context_id=@Id AND etat='Prepare'",c);
  foreach(var id in pending){var receipt=await db.QuerySingleOrDefaultAsync("SELECT resultat,date_execution FROM vit_dr_recette_operation WHERE id=@id",new{id});if(receipt is not null)await admin.ExecuteAsync("UPDATE app_drencher_nettoyage SET etat='Applique',date_execution=@date,details=@details WHERE id=@id AND etat='Prepare'",new{id,date=(DateTime)receipt.date_execution,details=(string)receipt.resultat});}
  return await admin.QueryAsync("SELECT id,operation,cycle_id cycleId,etat,motif,details,auteur,date_creation dateCreation,date_execution dateExecution FROM app_drencher_nettoyage WHERE context_id=@Id ORDER BY date_creation DESC LIMIT 50",c);
 }
 public async Task<object> ProgramVersions(ContextInfo c,int id) {
  await using var db=await Open(c);
  var versions=await db.QueryAsync("SELECT version,contenu,auteur,date_creation dateCreation FROM vit_dr_programme_revision WHERE programme_id=@id ORDER BY version DESC",new{id});
  return versions.Select(v=>new{version=(int)v.version,auteur=(string)v.auteur,dateCreation=(DateTime)v.dateCreation,programme=Deserialize<DrProgram>((string)v.contenu)});
 }
}
