using Dapper;
using MySqlConnector;
using System.Security.Claims;
namespace Vitasouss;
public record DrReservationInitialize(string Confirmation);
public record DrArbitrage(int CycleId,int Version,int[] Retirer,string Confirmation,string Motif);
public record DrExistingCycle(int Id,int Version,string Statut,DrSnapshot Snapshot);
public record DrPaletteChoix:DrPalette {public int? CycleAffecte{get;init;} public string? EtatCycle{get;init;}}
public sealed partial class DrencherService
{
 const string ReserveTable="vit_dr_palette_reservee";
 static async Task<bool> ReservationInstalled(MySqlConnection db,MySqlTransaction? tx=null)=>await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('vit_dr_palette_reservee','vit_dr_reservation_etat') AND ENGINE='InnoDB'",transaction:tx)==2;
 static async Task EnsureReservations(MySqlConnection db,MySqlTransaction? tx=null){
  if(!await ReservationInstalled(db,tx)||await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_reservation_etat WHERE id=1 AND initialise=1",transaction:tx)!=1)throw new RuleException("Réservations V1.2 non initialisées : l'administrateur doit exécuter le diagnostic et la migration avant la saisie.",409);
 }
 public async Task<object> ReservationStatus(ContextInfo c){await using var db=await Open(c);var installed=await ReservationInstalled(db);return new{installed,ready=installed&&await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_reservation_etat WHERE id=1 AND initialise=1")==1};}
 static async Task<DrExistingCycle[]> ExistingCycles(MySqlConnection db,MySqlTransaction tx){
  var rows=await db.QueryAsync("SELECT c.id,c.version,c.statut,r.contenu FROM vit_dr_cycle c LEFT JOIN vit_dr_revision r ON r.cycle_id=c.id AND r.version=c.version WHERE c.statut<>'Supprimé' ORDER BY c.id",transaction:tx);
  var list=new List<DrExistingCycle>();
  foreach(var r in rows){if(r.contenu is null)throw new RuleException("Diagnostic : révision manquante du cycle "+r.id+". Faire vérifier sans suppression automatique.",409);DrSnapshot s;try{s=Deserialize<DrSnapshot>((string)r.contenu);}catch{throw new RuleException("Diagnostic : instantané illisible du cycle "+r.id,409);}if(s.Palettes is null||s.Palettes.Any(p=>p.Numpal<=0)||s.Palettes.Select(p=>p.Numpal).Distinct().Count()!=s.Palettes.Length)throw new RuleException("Diagnostic : identifiants de palettes invalides dans le cycle "+r.id,409);list.Add(new((int)r.id,(int)r.version,(string)r.statut,s));}
  return list.ToArray();
 }
 static object[] Conflicts(DrExistingCycle[] cycles)=>cycles.SelectMany(c=>c.Snapshot.Palettes.Select(p=>new{p.Numpal,cycleId=c.Id,version=c.Version,statut=c.Statut})).GroupBy(p=>p.Numpal).Where(g=>g.Count()>1).Select(g=>(object)new{numpal=g.Key,cycles=g.Select(p=>new{p.cycleId,p.version,p.statut}).ToArray()}).ToArray();
 public async Task<object> ReservationDiagnostic(ContextInfo c,ClaimsPrincipal user){AdminOnly(user);await using var db=await Open(c);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);var cycles=await ExistingCycles(db,tx);var installed=await ReservationInstalled(db,tx);var conflicts=Conflicts(cycles);await tx.CommitAsync();return new{installed,conflicts,cycles=cycles.Length,palettes=cycles.Sum(c=>c.Snapshot.Palettes.Length),message=conflicts.Length==0?"Aucun conflit ; initialisation possible après installation du SQL.":"Arbitrage explicite requis : aucun cycle modifié automatiquement."};}
 public async Task<object> InitializeReservations(ContextInfo c,DrReservationInitialize r,ClaimsPrincipal user){
  AdminOnly(user);if(r.Confirmation!="INITIALISER RESERVATIONS")throw new RuleException("Saisir INITIALISER RESERVATIONS.");await using var db=await Open(c);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);
  if(!await ReservationInstalled(db,tx))throw new RuleException("Installer le script SQL 010 après le diagnostic.",409);
  var shape=(await db.QueryAsync("SELECT TABLE_NAME t,COLUMN_NAME n,COLUMN_TYPE ty FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('vit_dr_palette_reservee','vit_dr_reservation_etat')",transaction:tx)).ToArray();
  var expected=new[]{(t:ReserveTable,n:"numpal",ty:"int(11)"),(t:ReserveTable,n:"cycle_id",ty:"int(11)"),(t:"vit_dr_reservation_etat",n:"id",ty:"int(11)"),(t:"vit_dr_reservation_etat",n:"initialise",ty:"tinyint(4)"),(t:"vit_dr_reservation_etat",n:"date_initialisation",ty:"datetime")};
  if(shape.Length!=expected.Length||expected.Any(e=>!shape.Any(a=>(string)a.t==e.t&&(string)a.n==e.n&&(string)a.ty==e.ty)))throw new RuleException("Schéma des réservations incompatible avec SQL 010.",409);
  foreach(var table in new[]{ReserveTable,"vit_dr_reservation_etat"})if(!await SchemaGuard.CanInspectTriggers(db,table,tx)||await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE=@table",new{table},tx)!=0)throw new RuleException("Inspection des nouvelles tables non autorisée ou déclencheur inattendu.",409);
  var pk=await db.QueryAsync<string>("SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@ReserveTable AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION",new{ReserveTable},tx);if(!pk.SequenceEqual(["numpal"]))throw new RuleException("Unicité SQL des réservations absente.",409);
  if(await db.ExecuteScalarAsync<int>("SELECT initialise FROM vit_dr_reservation_etat WHERE id=1",transaction:tx)==1)throw new RuleException("Réservations déjà initialisées.",409);
  var cycles=await ExistingCycles(db,tx);if(Conflicts(cycles).Length>0)throw new RuleException("Palettes présentes dans plusieurs cycles : effectuer l'arbitrage avant initialisation. Aucun cycle modifié.",409);
  if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_palette_reservee",transaction:tx)>0)throw new RuleException("Registre non vide et non initialisé : vérification DBA requise.",409);
  foreach(var c0 in cycles)foreach(var p in c0.Snapshot.Palettes)await db.ExecuteAsync("INSERT INTO vit_dr_palette_reservee(numpal,cycle_id) VALUES(@Numpal,@id)",new{p.Numpal,id=c0.Id},tx);
  await db.ExecuteAsync("UPDATE vit_dr_reservation_etat SET initialise=1,date_initialisation=UTC_TIMESTAMP() WHERE id=1",transaction:tx);await Audit(db,tx,"Reservations V1.2",0,null,new{cycles=cycles.Length,palettes=cycles.Sum(c=>c.Snapshot.Palettes.Length)},user);await tx.CommitAsync();return new{message="Réservations initialisées sans réécrire les cycles existants."};
 }
 public async Task<object> Arbitrate(ContextInfo c,DrArbitrage r,ClaimsPrincipal user){
  AdminOnly(user);if(r.Confirmation!="ARBITRER CYCLE "+r.CycleId)throw new RuleException("Confirmation d'arbitrage incorrecte.");var motif=DrMath.Text(r.Motif,1000,"Motif d'arbitrage");if(r.Retirer is null||r.Retirer.Length==0)throw new RuleException("Palettes en conflit requises.");
  await using var db=await Open(c);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);
  if(await ReservationInstalled(db,tx)&&await db.ExecuteScalarAsync<int>("SELECT initialise FROM vit_dr_reservation_etat WHERE id=1",transaction:tx)==1)throw new RuleException("Migration terminée : utiliser la modification normale du brouillon.",409);
  var all=await ExistingCycles(db,tx);var cycle=all.SingleOrDefault(c0=>c0.Id==r.CycleId)??throw new RuleException("Cycle introuvable.",404);
  if(cycle.Version!=r.Version||cycle.Statut!="Brouillon")throw new RuleException("Cycle soumis ou validé, ou version périmée : arbitrage refusé.",409);
  var duplicate=all.SelectMany(c0=>c0.Snapshot.Palettes.Select(p=>p.Numpal)).GroupBy(n=>n).Where(g=>g.Count()>1).Select(g=>g.Key).ToHashSet();
  if(r.Retirer.Any(n=>!duplicate.Contains(n)||!cycle.Snapshot.Palettes.Any(p=>p.Numpal==n)))throw new RuleException("Retirer uniquement des palettes réellement en conflit dans ce cycle.",409);
  var snapshot=cycle.Snapshot with{Palettes=cycle.Snapshot.Palettes.Where(p=>!r.Retirer.Contains(p.Numpal)).ToArray()};var version=cycle.Version+1;
  await db.ExecuteAsync("UPDATE vit_dr_cycle SET version=@version,statut='Brouillon' WHERE id=@CycleId",new{version,r.CycleId},tx);await Revision(db,tx,r.CycleId,version,snapshot,"Arbitrage V1.2",motif,user);await tx.CommitAsync();return new{message="Arbitrage tracé ; anciennes révisions conservées. Compléter la sélection avant soumission.",version};
 }
 static async Task CheckOwners(MySqlConnection db,MySqlTransaction tx,IEnumerable<int> ids,int cycleId){
  var numbers=ids.ToArray();if(numbers.Length==0)return;
  var conflict=await db.QueryFirstOrDefaultAsync("SELECT b.numpal,b.cycle_id,c.statut FROM vit_dr_palette_reservee b JOIN vit_dr_cycle c ON c.id=b.cycle_id WHERE b.numpal IN @numbers AND b.cycle_id<>@cycleId ORDER BY b.numpal LIMIT 1",new{numbers,cycleId},tx);
  if(conflict is not null)throw new RuleException($"La palette {conflict.numpal} est déjà affectée au cycle n° {conflict.cycle_id} ({conflict.statut}). Retirez-la de la sélection ou modifiez le cycle concerné.",409);
 }
 static async Task CheckOwnReservations(MySqlConnection db,MySqlTransaction tx,int id,DrSnapshot s){await EnsureReservations(db,tx);await CheckOwners(db,tx,s.Palettes.Select(p=>p.Numpal),id);var rows=(await db.QueryAsync<int>("SELECT numpal FROM vit_dr_palette_reservee WHERE cycle_id=@id ORDER BY numpal",new{id},tx)).ToArray();if(!rows.SequenceEqual(s.Palettes.Select(p=>p.Numpal).Order()))throw new RuleException("Réservations du cycle incohérentes : vérification administrateur requise.",409);}
}
