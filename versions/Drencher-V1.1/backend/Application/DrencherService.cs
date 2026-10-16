using Dapper;
using MySqlConnector;
using System.Security.Claims;
using System.Text.Json;

namespace Vitasouss;

public sealed partial class DrencherService(Connections connections, PermissionService permissions, IConfiguration configuration, ILogger<DrencherService> logger)
{
 static readonly string[] Tables=["vit_traitement_produit","vit_dr_programme","vit_dr_programme_revision","vit_dr_mutex","vit_dr_stock_lot","vit_dr_cycle","vit_dr_revision","vit_dr_palette_validee","vit_dr_mouvement","vit_dr_admin_historique"];
 static readonly Lazy<DrSchemaColumn[]> ExpectedColumns=new(()=>Deserialize<DrSchemaColumn[]>(File.ReadAllText(Path.Combine(AppContext.BaseDirectory,"drencher-schema.json"))));
 static string Actor(ClaimsPrincipal u)=>DrMath.Text(u.Identity?.Name,120,"Utilisateur");
 static int Uid(ClaimsPrincipal u)=>int.Parse(u.FindFirstValue(ClaimTypes.NameIdentifier)!);
 static string Serialize(object v)=>JsonSerializer.Serialize(v,Json.Options);
 static T Deserialize<T>(string s)=>JsonSerializer.Deserialize<T>(s,Json.Options)??throw new RuleException("Historique Drencher illisible.",409);
 public async Task<ContextInfo> Context(int id,ClaimsPrincipal user,bool write=false,string module="drencher",string action="view") {
  await permissions.Demand(user,"drencher"); await permissions.Demand(user,module,action);
  var c=await connections.Resolve(id,user,write);
  if(c.Station!="ZAOUIA" || c.LocalRefsta is null) throw new RuleException("Le Drencher V1 est réservé au contexte ZAOUIA avec station locale configurée.",403);
  var mode=JsonSerializer.SerializeToElement(await Mode(c),Json.Options).GetProperty("mode").GetString();
  if(mode=="Recette")AdminOnly(user);
  if(mode=="Configuration invalide")throw new RuleException("Identité du mode Recette incohérente : accès Drencher bloqué, contactez l'administrateur.",409);
  return c;
 }
 async Task<MySqlConnection> Open(ContextInfo c) {
  var db=await connections.Business(c);
  try {
   var metadata=(await db.QueryAsync("SELECT TABLE_NAME n,ENGINE e FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN @Tables",new{Tables})).ToArray();
   if(metadata.Length!=Tables.Length||metadata.Any(t=>(string)t.e!="InnoDB"))throw new RuleException("Module Drencher non installé ou schéma incompatible. Installer et vérifier le script SQL métier.",409);
   var claims=await db.QueryAsync<string>("SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='vit_dr_palette_validee' AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION");
   if(!claims.SequenceEqual(["numpal"]))throw new RuleException("Unicité des palettes Drencher absente.",409);
   var columns=(await db.QueryAsync("SELECT TABLE_NAME t,COLUMN_NAME n,COLUMN_TYPE ty,IS_NULLABLE nu,EXTRA ex FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN @Tables",new{Tables})).ToArray();
   if(columns.Length!=ExpectedColumns.Value.Length||ExpectedColumns.Value.Any(e=>!columns.Any(c=>(string)c.t==e.Table&&(string)c.n==e.Name&&(string)c.ty==e.Type&&(string)c.nu==e.Nullable&&(string)c.ex==e.Extra)))throw new RuleException("Colonnes Drencher incompatibles : vérifier le script SQL et les précisions décimales.",409);
   foreach(var table in Tables)if(!await SchemaGuard.CanInspectTriggers(db,table))throw new RuleException("Inspection des déclencheurs Drencher indisponible : faire vérifier les droits TRIGGER par le DBA.",409);
   if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=DATABASE() AND EVENT_OBJECT_TABLE IN @Tables",new{Tables})>0)throw new RuleException("Déclencheur inattendu sur une table Drencher : vérification administrateur obligatoire.",409);
   return db;
  }catch{await db.DisposeAsync();throw;}
 }
 static async Task Lock(MySqlConnection db,MySqlTransaction tx,ClaimsPrincipal? user=null) {
  if(await db.QuerySingleOrDefaultAsync<int?>("SELECT id FROM vit_dr_mutex WHERE id=1 FOR UPDATE",transaction:tx)!=1)throw new RuleException("Verrou transactionnel Drencher absent.",409);
  // Recontrôle après le verrou : l'inscription Recette peut avoir changé pendant l'attente.
  var name=await db.ExecuteScalarAsync<string>("SELECT DATABASE()",transaction:tx);
  if(user is not null&&!user.IsInRole("Admin")&&RecetteName(name!)&&await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='vit_dr_recette_identite'",transaction:tx)==1&&await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_recette_identite WHERE id=1 AND contexte_inscrit IS NOT NULL",transaction:tx)==1)AdminOnly(user);
 }
 static async Task Audit(MySqlConnection db,MySqlTransaction tx,string objet,int id,object? before,object after,ClaimsPrincipal u)=>
  await db.ExecuteAsync("INSERT INTO vit_dr_admin_historique(objet,objet_id,avant,apres,auteur,date_creation) VALUES(@objet,@id,@avant,@apres,@auteur,UTC_TIMESTAMP())",new{objet,id,avant=before is null?null:Serialize(before),apres=Serialize(after),auteur=Actor(u)},tx);
 public async Task<object> Catalog(ContextInfo c) {
  await using var db=await Open(c);
  var products=await db.QueryAsync<DrProduct>("SELECT id,reference,nom,unite,actif FROM vit_traitement_produit ORDER BY nom");
  var rows=await db.QueryAsync("SELECT p.id,p.version,r.contenu FROM vit_dr_programme p JOIN vit_dr_programme_revision r ON r.programme_id=p.id AND r.version=p.version ORDER BY p.nom");
  var programs=rows.Select(r=>Deserialize<DrProgram>((string)r.contenu));
  var lots=await db.QueryAsync("SELECT l.id,l.produit_id produitId,l.lot,l.peremption,l.solde,p.nom,p.unite FROM vit_dr_stock_lot l JOIN vit_traitement_produit p ON p.id=l.produit_id ORDER BY p.nom,l.lot");
  return new{produits=products,programmes=programs,lots,unitePoids=configuration["Drencher:PaletteWeightUnit"]??"kg"};
 }
 public async Task<object> Stock(ContextInfo c,int page,string? search=null,int? produitId=null,string? nature=null) {
  await using var db=await Open(c);page=Math.Clamp(page,1,100000);
  var args=new{offset=(page-1)*25,q="%"+DrMath.Text(search,100,"Recherche",false)+"%",produitId,nature=string.IsNullOrWhiteSpace(nature)?null:nature};
  const string join=" FROM vit_dr_mouvement m JOIN vit_dr_stock_lot l ON l.id=m.lot_id JOIN vit_traitement_produit p ON p.id=l.produit_id";
  const string where=" WHERE (@produitId IS NULL OR p.id=@produitId) AND (@nature IS NULL OR m.nature=@nature) AND (p.nom LIKE @q OR p.reference LIKE @q OR l.lot LIKE @q OR m.bon LIKE @q)";
  return new{total=await db.ExecuteScalarAsync<int>("SELECT COUNT(*)"+join+where,args),page,
   rows=await db.QueryAsync("SELECT m.id,m.cycle_id cycleId,m.nature,m.quantite,m.bon,m.date_reception dateReception,m.date_creation dateCreation,m.auteur,l.lot,p.nom,p.unite"+join+where+" ORDER BY m.id DESC LIMIT 25 OFFSET @offset",args)};
 }
 public async Task<object> Products(ContextInfo c,DrProduct r,ClaimsPrincipal user) {
  r=r with{Reference=DrMath.Text(r.Reference,40,"Référence"),Nom=DrMath.Text(r.Nom,120,"Nom")};
  if(r.Unite is not("L" or "kg" or "g" or "mL"))throw new RuleException("Unité autorisée : L, kg, g, mL.");
  await using var db=await Open(c);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);
  var before=await db.QuerySingleOrDefaultAsync<DrProduct>("SELECT * FROM vit_traitement_produit WHERE id=@Id",r,tx);
  if(r.Id!=0 && before is null)throw new RuleException("Produit introuvable.",404);
  if(before is not null && (before.Unite!=r.Unite||before.Reference!=r.Reference))throw new RuleException("Référence et unité immuables : créer un autre produit.",409);
  if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_traitement_produit WHERE reference=@Reference AND id<>@Id",r,tx)>0)throw new RuleException("Référence produit déjà enregistrée.",409);
  var id=r.Id;
  if(id==0){await db.ExecuteAsync("INSERT INTO vit_traitement_produit(reference,nom,unite,actif) VALUES(@Reference,@Nom,@Unite,@Actif)",r,tx);id=await db.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()",transaction:tx);}
  else await db.ExecuteAsync("UPDATE vit_traitement_produit SET nom=@Nom,actif=@Actif WHERE id=@Id",r,tx);
  await Audit(db,tx,"Produit",id,before,r with{Id=id},user);await tx.CommitAsync();logger.LogInformation("Drencher produit {Id}, utilisateur {Uid}",id,Uid(user));return new{id};
 }
 public async Task<object> Program(ContextInfo c,DrProgramRequest r,ClaimsPrincipal user) {
  var name=DrMath.Text(r.Nom,120,"Programme");
  if(r.Produits is null||r.Produits.Length is <1 or >30||r.Produits.Select(p=>p.ProduitId).Distinct().Count()!=r.Produits.Length)throw new RuleException("Programme : 1 à 30 produits distincts.");
  await using var db=await Open(c);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);
  foreach(var p in r.Produits){DrMath.Quantity(p.Dose,"Dosage");if(p.Dose==0||await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_traitement_produit WHERE id=@ProduitId AND (actif=1 OR @inactif=1)",new{p.ProduitId,inactif=!r.Actif},tx)!=1)throw new RuleException("Produit actif pour un programme actif, et dosage positif obligatoires.");}
  var previous=await db.QuerySingleOrDefaultAsync("SELECT * FROM vit_dr_programme WHERE id=@Id",r,tx);
  if(r.Id!=0&&(previous is null||(int)previous.version!=r.Version))throw new RuleException("Programme modifié par un autre utilisateur. Rechargez.",409);
  if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_programme WHERE nom=@name AND id<>@Id",new{name,r.Id},tx)>0)throw new RuleException("Nom de programme déjà utilisé.",409);
  var id=r.Id;var version=r.Version+1;
  if(id==0){version=1;await db.ExecuteAsync("INSERT INTO vit_dr_programme(nom,actif,version) VALUES(@name,@Actif,1)",new{name,r.Actif},tx);id=await db.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()",transaction:tx);}
  else await db.ExecuteAsync("UPDATE vit_dr_programme SET nom=@name,actif=@Actif,version=@version WHERE id=@id",new{name,r.Actif,version,id},tx);
  var snapshot=new DrProgram(id,version,name,r.Actif,r.Produits);
  await db.ExecuteAsync("INSERT INTO vit_dr_programme_revision(programme_id,version,contenu,auteur,date_creation) VALUES(@id,@version,@contenu,@auteur,UTC_TIMESTAMP())",new{id,version,contenu=Serialize(snapshot),auteur=Actor(user)},tx);
  await Audit(db,tx,"Programme",id,previous,snapshot,user);await tx.CommitAsync();return new{id,version};
 }
 public async Task<object> Receive(ContextInfo c,DrStockRequest r,ClaimsPrincipal user) {
  var lot=DrMath.Text(r.Lot,100,"Lot fabricant");var bon=DrMath.Text(r.Bon,100,"Bon magasin");var date=DrMath.Date(r.Date);DateTime? expiry=string.IsNullOrWhiteSpace(r.Peremption)?null:DrMath.Date(r.Peremption);
  DrMath.Quantity(r.Quantite,"Entrée");if(r.Quantite==0)throw new RuleException("Quantité reçue positive obligatoire.");
  await using var db=await Open(c);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);
  if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_traitement_produit WHERE id=@ProduitId AND actif=1",r,tx)!=1)throw new RuleException("Produit actif introuvable.");
  var existing=await db.QuerySingleOrDefaultAsync("SELECT id,peremption FROM vit_dr_stock_lot WHERE produit_id=@ProduitId AND lot=@lot",new{r.ProduitId,lot},tx);
  if(existing is not null && (DateTime?)existing.peremption!=expiry)throw new RuleException("Péremption différente pour le même lot fabricant.",409);
  int id;
  if(existing is null){await db.ExecuteAsync("INSERT INTO vit_dr_stock_lot(produit_id,lot,peremption,solde) VALUES(@ProduitId,@lot,@expiry,0)",new{r.ProduitId,lot,expiry},tx);id=await db.ExecuteScalarAsync<int>("SELECT LAST_INSERT_ID()",transaction:tx);}else id=(int)existing.id;
  if(await db.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM vit_dr_mouvement WHERE lot_id=@id AND bon=@bon AND nature='Entree'",new{id,bon},tx)>0)throw new RuleException("Ce bon et lot ont déjà été réceptionnés.",409);
  await db.ExecuteAsync("UPDATE vit_dr_stock_lot SET solde=solde+@Quantite WHERE id=@id",new{r.Quantite,id},tx);
  await db.ExecuteAsync("INSERT INTO vit_dr_mouvement(lot_id,nature,quantite,bon,date_reception,auteur,date_creation) VALUES(@id,'Entree',@Quantite,@bon,@date,@auteur,UTC_TIMESTAMP())",new{id,r.Quantite,bon,date,auteur=Actor(user)},tx);
  await tx.CommitAsync();return new{id};
 }
 public async Task<object> Palettes(ContextInfo c,ClaimsPrincipal user,string? search,int? reception,int page) {
  foreach(var m in new[]{"receptions","variete","verger","adherent"})await permissions.Demand(user,m);
  await using var db=await Open(c);await HistoricalSchema(db);
  page=Math.Clamp(page,1,100000);var args=new{sta=c.LocalRefsta,q="%"+DrMath.Text(search,100,"Recherche",false)+"%",reception,offset=(page-1)*50};
  const string where=" WHERE r.refsta=@sta AND (@reception IS NULL OR p.numrec=@reception) AND (CAST(p.numpal AS CHAR) LIKE @q OR CAST(p.numrec AS CHAR) LIKE @q OR v.nomvar LIKE @q OR g.nomver LIKE @q OR a.nomadh LIKE @q)";
  return new{page,pageSize=50,total=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) "+PaletteFrom+where,args),rows=await db.QueryAsync<DrPalette>(PaletteSelect+PaletteFrom+where+" ORDER BY p.numrec DESC,p.numpal LIMIT 50 OFFSET @offset",args)};
 }
 const string PaletteSelect="SELECT p.numpal Numpal,p.numrec Numrec,p.codvar Codvar,v.nomvar Variete,p.refver Refver,g.nomver Verger,p.refadh Refadh,a.nomadh Adherent,p.pdsfru Poids,t.cycle_id CycleTraite ";
 const string PaletteFrom="FROM palbrut p JOIN reception r ON r.numrec=p.numrec LEFT JOIN variete v ON v.codvar=p.codvar LEFT JOIN verger g ON g.refver=p.refver LEFT JOIN adherent a ON a.refadh=p.refadh LEFT JOIN vit_dr_palette_validee t ON t.numpal=p.numpal";
 static async Task HistoricalSchema(MySqlConnection db) {
  foreach(var (table,key,fields) in new[]{("palbrut","numpal",new[]{"numpal","numrec","codvar","refver","refadh","pdsfru"}),("reception","numrec",new[]{"numrec","refsta"}),("variete","codvar",new[]{"codvar","nomvar"}),("verger","refver",new[]{"refver","nomver"}),("adherent","refadh",new[]{"refadh","nomadh"})}) {
   var cols=(await db.QueryAsync<string>("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@table",new{table})).ToHashSet();
   var keys=await db.QueryAsync<string>("SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=@table AND CONSTRAINT_NAME='PRIMARY' ORDER BY ORDINAL_POSITION",new{table});
   if(fields.Any(f=>!cols.Contains(f))||!keys.SequenceEqual([key]))throw new RuleException("Relation Logista non vérifiée : "+table+". Aucune écriture effectuée.",409);
  }
 }
}
