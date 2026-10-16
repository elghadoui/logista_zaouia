using Dapper;
using System.Security.Claims;
namespace Vitasouss;
public record DrPaletteSelection(int? CycleId,int[] Ids,int? AjouterLot);
public sealed partial class DrencherService
{
 async Task PalettePermissions(ClaimsPrincipal user){
  var rights=await permissions.For(user);
  // Lookup data stays bounded by the Drencher's station/context and existing SELECT whitelist.
  // Granting cycle entry or quality correction authorizes its own palette selection, not other modules.
  if(DrencherPermissionPolicy.CycleLookups(user,rights))return;
  foreach(var m in new[]{"receptions","variete","verger","adherent"})await permissions.Demand(user,m);
 }
 const string ChoiceSelect="SELECT p.numpal Numpal,p.numrec Numrec,p.codvar Codvar,v.nomvar Variete,p.refver Refver,g.nomver Verger,p.refadh Refadh,a.nomadh Adherent,p.pdsfru Poids,t.cycle_id CycleTraite,b.cycle_id CycleAffecte,c.statut EtatCycle ";
 const string ChoiceFrom=PaletteFrom+" LEFT JOIN vit_dr_palette_reservee b ON b.numpal=p.numpal LEFT JOIN vit_dr_cycle c ON c.id=b.cycle_id";
 public async Task<object> Choices(ContextInfo context,ClaimsPrincipal user,string? search,int? reception,int? numpal,int? codvar,int? refadh,int? refver,int page,int pageSize){
  await PalettePermissions(user);await using var db=await Open(context);await EnsureReservations(db);await HistoricalSchema(db);
  page=Math.Clamp(page,1,100000);pageSize=pageSize==25?25:50;
  var args=new{sta=context.LocalRefsta,q="%"+DrMath.Text(search,100,"Recherche",false)+"%",reception,numpal,codvar,refadh,refver,offset=(page-1)*pageSize,pageSize};
  const string where=" WHERE r.refsta=@sta AND (@reception IS NULL OR p.numrec=@reception) AND (@numpal IS NULL OR p.numpal=@numpal) AND (@codvar IS NULL OR p.codvar=@codvar) AND (@refadh IS NULL OR p.refadh=@refadh) AND (@refver IS NULL OR p.refver=@refver) AND (CAST(p.numpal AS CHAR) LIKE @q OR CAST(p.numrec AS CHAR) LIKE @q OR v.nomvar LIKE @q OR g.nomver LIKE @q OR a.nomadh LIKE @q)";
  return new{page,pageSize,total=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) "+ChoiceFrom+where,args),rows=await db.QueryAsync<DrPaletteChoix>(ChoiceSelect+ChoiceFrom+where+" ORDER BY p.numrec DESC,p.numpal LIMIT @pageSize OFFSET @offset",args)};
 }
 public async Task<object> Selection(ContextInfo context,DrPaletteSelection r,ClaimsPrincipal user){
  await PalettePermissions(user);if(r.Ids is null||r.Ids.Length>2000||r.Ids.Distinct().Count()!=r.Ids.Length)throw new RuleException("Sélection limitée à 2000 identifiants distincts.");await using var db=await Open(context);await HistoricalSchema(db);await using var tx=await db.BeginTransactionAsync();await Lock(db,tx,user);await EnsureReservations(db,tx);
  var ids=r.Ids.ToHashSet();var skipped=0;
  if(r.AjouterLot is int lot){var available=(await db.QueryAsync<int>("SELECT p.numpal "+ChoiceFrom+" WHERE r.refsta=@sta AND p.numrec=@lot AND (b.cycle_id IS NULL OR b.cycle_id=@CycleId) ORDER BY p.numpal LIMIT 2001",new{sta=context.LocalRefsta,lot,r.CycleId},tx)).ToArray();foreach(var n in available)ids.Add(n);if(ids.Count>2000)throw new RuleException("Sélection de plus de 2000 palettes : choisir un sous-ensemble.");skipped=await db.ExecuteScalarAsync<int>("SELECT COUNT(*) "+ChoiceFrom+" WHERE r.refsta=@sta AND p.numrec=@lot AND b.cycle_id IS NOT NULL AND (@CycleId IS NULL OR b.cycle_id<>@CycleId)",new{sta=context.LocalRefsta,lot,r.CycleId},tx);}
  await CheckOwners(db,tx,ids,r.CycleId??0);
  var rows=ids.Count==0?[]:(await db.QueryAsync<DrPaletteChoix>(ChoiceSelect+ChoiceFrom+" WHERE p.numpal IN @ids AND r.refsta=@sta ORDER BY p.numpal",new{ids=ids.ToArray(),sta=context.LocalRefsta},tx)).ToArray();
  if(rows.Length!=ids.Count)throw new RuleException("Palette absente ou réception d'une autre station.",409);
  var groups=rows.GroupBy(p=>new{p.Codvar,p.Variete,p.Refadh,p.Adherent,p.Refver,p.Verger}).Select(g=>new{g.Key.Codvar,g.Key.Variete,g.Key.Refadh,g.Key.Adherent,g.Key.Refver,g.Key.Verger,count=g.Count(),poids=g.All(p=>p.Poids.HasValue)?g.Sum(p=>p.Poids):null}).ToArray();
  await tx.CommitAsync();return new{ids=rows.Select(p=>p.Numpal).ToArray(),count=rows.Length,poids=rows.All(p=>p.Poids.HasValue)?rows.Sum(p=>p.Poids):null,receptions=rows.Select(p=>p.Numrec).Distinct().Count(),groups,skipped};
 }
 public async Task<object> ChoiceFilters(ContextInfo context,ClaimsPrincipal user){await PalettePermissions(user);await using var db=await Open(context);await HistoricalSchema(db);var args=new{sta=context.LocalRefsta};return new{
  varietes=await db.QueryAsync("SELECT DISTINCT p.codvar value,COALESCE(v.nomvar,CAST(p.codvar AS CHAR)) label "+PaletteFrom+" WHERE r.refsta=@sta AND p.codvar IS NOT NULL ORDER BY label",args),
  adherents=await db.QueryAsync("SELECT DISTINCT p.refadh value,COALESCE(a.nomadh,CAST(p.refadh AS CHAR)) label "+PaletteFrom+" WHERE r.refsta=@sta AND p.refadh IS NOT NULL ORDER BY label",args),
  vergers=await db.QueryAsync("SELECT DISTINCT p.refver value,COALESCE(g.nomver,CAST(p.refver AS CHAR)) label "+PaletteFrom+" WHERE r.refsta=@sta AND p.refver IS NOT NULL ORDER BY label",args)};}
}
