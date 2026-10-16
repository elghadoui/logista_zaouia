using System.Security.Claims;
namespace Vitasouss;
public static class DrencherEndpoints
{
 public static void Map(RouteGroupBuilder api) {
  var g=api.MapGroup("/contexts/{contextId:int}/drencher");
  g.MapGet("/mode",async(int contextId,DrencherService s,ClaimsPrincipal u)=>await s.Mode(await s.Context(contextId,u)));
  g.MapGet("/programs/{id:int}/versions",async(int contextId,int id,DrencherService s,ClaimsPrincipal u)=>await s.ProgramVersions(await s.Context(contextId,u),id));
  g.MapPost("/recette/activate",async(int contextId,DrRecetteActivation r,DrencherService s,ClaimsPrincipal u)=>await s.ActivateRecette(await s.Context(contextId,u,true),r,u));
  g.MapPost("/recette/preview",async(int contextId,DrRecettePreview r,DrencherService s,ClaimsPrincipal u)=>await s.PreviewCleanup(await s.Context(contextId,u,true),r,u));
  g.MapPost("/recette/apply",async(int contextId,DrRecetteApply r,DrencherService s,ClaimsPrincipal u)=>await s.ApplyCleanup(await s.Context(contextId,u,true),r,u));
  g.MapGet("/recette/history",async(int contextId,DrencherService s,ClaimsPrincipal u)=>await s.CleanupHistory(await s.Context(contextId,u),u));
  g.MapGet("/reservations/status",async(int contextId,DrencherService s,ClaimsPrincipal u)=>await s.ReservationStatus(await s.Context(contextId,u)));
  g.MapGet("/reservations/diagnostic",async(int contextId,DrencherService s,ClaimsPrincipal u)=>await s.ReservationDiagnostic(await s.Context(contextId,u),u));
  g.MapPost("/reservations/initialize",async(int contextId,DrReservationInitialize r,DrencherService s,ClaimsPrincipal u)=>await s.InitializeReservations(await s.Context(contextId,u,true),r,u));
  g.MapPost("/reservations/arbitrate",async(int contextId,DrArbitrage r,DrencherService s,ClaimsPrincipal u)=>await s.Arbitrate(await s.Context(contextId,u,true),r,u));
  g.MapGet("/palettes/choices",async(int contextId,string? search,int? reception,int? numpal,int? codvar,int? refadh,int? refver,int? page,int? pageSize,DrencherService s,ClaimsPrincipal u)=>await s.Choices(await s.Context(contextId,u),u,search,reception,numpal,codvar,refadh,refver,page??1,pageSize??50));
  g.MapGet("/palettes/filters",async(int contextId,DrencherService s,ClaimsPrincipal u)=>await s.ChoiceFilters(await s.Context(contextId,u),u));
  g.MapPost("/palettes/selection",async(int contextId,DrPaletteSelection r,DrencherService s,ClaimsPrincipal u)=>await s.Selection(await s.Context(contextId,u),r,u));
  g.MapGet("/catalog",async(int contextId,DrencherService s,ClaimsPrincipal u)=>await s.Catalog(await s.Context(contextId,u)));
  g.MapGet("/stock",async(int contextId,int? page,string? search,int? produitId,string? nature,DrencherService s,ClaimsPrincipal u)=>await s.Stock(await s.Context(contextId,u,false,DrencherPermissionPolicy.Stock),page??1,search,produitId,nature));
  g.MapGet("/reports/f04/{id:int}",async(int contextId,int id,int? revision,string? format,string? quantite,DrencherService s,ClaimsPrincipal u,HttpContext http)=>DocumentResult(await s.F04(await s.Context(contextId,u),id,revision,u,quantite),format,http));
  g.MapGet("/reports/stock",async(int contextId,string type,string? from,string? to,int? produitId,int? lotId,string? actif,string? nature,bool? detailLots,string? format,DrencherService s,ClaimsPrincipal u,HttpContext http)=>DocumentResult(await s.StockReport(await s.Context(contextId,u,false,DrencherPermissionPolicy.Stock),new(type,from,to,produitId,lotId,actif,nature,detailLots??false),u),format,http));
  g.MapGet("/palettes",async(int contextId,string? search,int? reception,int? page,DrencherService s,ClaimsPrincipal u)=>await s.Palettes(await s.Context(contextId,u),u,search,reception,page??1));
  g.MapGet("/cycles",async(int contextId,string? search,string? status,string? from,string? to,int? page,DrencherService s,ClaimsPrincipal u)=>await s.Cycles(await s.Context(contextId,u),search,status,from,to,page??1));
  g.MapGet("/cycles/{id:int}",async(int contextId,int id,DrencherService s,ClaimsPrincipal u)=>await s.Detail(await s.Context(contextId,u),id,u));
  g.MapGet("/cycles/deleted",async(int contextId,int? page,DrencherService s,ClaimsPrincipal u)=>await s.DeletedCycles(await s.Context(contextId,u),u,page??1));
  g.MapPost("/cycles/{id:int}/delete",async(int contextId,int id,DrDeleteCycle r,DrencherService s,ClaimsPrincipal u)=>await s.DeleteCycle(await s.Context(contextId,u,true),id,r,u));
  g.MapPost("/programs/{id:int}/state",async(int contextId,int id,DrProgramState r,DrencherService s,ClaimsPrincipal u)=>await s.SetProgramState(await s.Context(contextId,u,true,DrencherPermissionPolicy.Programs,"modify"),id,r,u));
  g.MapPost("/products",async(int contextId,DrProduct r,DrencherService s,ClaimsPrincipal u)=>await s.Products(await s.Context(contextId,u,true,DrencherPermissionPolicy.Products,r.Id==0?"add":"modify"),r,u));
  g.MapPost("/programs",async(int contextId,DrProgramRequest r,DrencherService s,ClaimsPrincipal u)=>await s.Program(await s.Context(contextId,u,true,DrencherPermissionPolicy.Programs,r.Id==0?"add":"modify"),r,u));
  g.MapPost("/stock",async(int contextId,DrStockRequest r,DrencherService s,ClaimsPrincipal u)=>await s.Receive(await s.Context(contextId,u,true,DrencherPermissionPolicy.Stock,"add"),r,u));
  g.MapPost("/cycles",async(int contextId,DrCycleRequest r,DrencherService s,ClaimsPrincipal u)=>await s.Save(await s.Context(contextId,u,true,"drencher","add"),0,r,u));
  g.MapPut("/cycles/{id:int}",async(int contextId,int id,DrCycleRequest r,DrencherService s,ClaimsPrincipal u)=>{if(id<=0)throw new RuleException("Modification : identifiant de cycle positif requis.");return await s.Save(await s.Context(contextId,u,true,"drencher","modify"),id,r,u);});
  g.MapPost("/cycles/{id:int}/submit",async(int contextId,int id,DrTransition r,DrencherService s,ClaimsPrincipal u)=>await s.Transition(await s.Context(contextId,u,true,"drencher","modify"),id,r,u,false));
  g.MapPost("/cycles/{id:int}/validate",async(int contextId,int id,DrTransition r,DrencherService s,ClaimsPrincipal u)=>await s.Transition(await s.Context(contextId,u,true,"drencher_quality","modify"),id,r,u,true));
  g.MapPost("/cycles/{id:int}/correct",async(int contextId,int id,DrCycleRequest r,DrencherService s,ClaimsPrincipal u)=>await s.Save(await s.Context(contextId,u,true,"drencher_quality","modify"),id,r,u,true));
 }
 static IResult DocumentResult(DrReport report,string? format,HttpContext http) {
  http.Response.Headers.CacheControl="no-store, private";
  if(format=="json")return Results.Json(report,Json.Options);
  if(format is not(null or "" or "pdf"))throw new RuleException("Format de document invalide.");
  var bytes=DrencherPdf.Render(report);
  // The PDF is fetched with the authenticated session, then displayed through a local Blob URL.
  http.Response.Headers["X-Document-Id"]=report.Id;
  return Results.File(bytes,"application/pdf",report.Reference.Replace(' ','-')+"-"+report.Id+".pdf");
 }
}
