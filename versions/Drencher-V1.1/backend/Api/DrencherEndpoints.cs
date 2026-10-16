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
  g.MapGet("/catalog",async(int contextId,DrencherService s,ClaimsPrincipal u)=>await s.Catalog(await s.Context(contextId,u)));
  g.MapGet("/stock",async(int contextId,int? page,string? search,int? produitId,string? nature,DrencherService s,ClaimsPrincipal u)=>await s.Stock(await s.Context(contextId,u),page??1,search,produitId,nature));
  g.MapGet("/palettes",async(int contextId,string? search,int? reception,int? page,DrencherService s,ClaimsPrincipal u)=>await s.Palettes(await s.Context(contextId,u),u,search,reception,page??1));
  g.MapGet("/cycles",async(int contextId,string? search,string? status,string? from,string? to,int? page,DrencherService s,ClaimsPrincipal u)=>await s.Cycles(await s.Context(contextId,u),search,status,from,to,page??1));
  g.MapGet("/cycles/{id:int}",async(int contextId,int id,DrencherService s,ClaimsPrincipal u)=>await s.Detail(await s.Context(contextId,u),id));
  g.MapPost("/products",async(int contextId,DrProduct r,DrencherService s,ClaimsPrincipal u)=>await s.Products(await s.Context(contextId,u,true,"drencher_manage",r.Id==0?"add":"modify"),r,u));
  g.MapPost("/programs",async(int contextId,DrProgramRequest r,DrencherService s,ClaimsPrincipal u)=>await s.Program(await s.Context(contextId,u,true,"drencher_manage",r.Id==0?"add":"modify"),r,u));
  g.MapPost("/stock",async(int contextId,DrStockRequest r,DrencherService s,ClaimsPrincipal u)=>await s.Receive(await s.Context(contextId,u,true,"drencher_manage","add"),r,u));
  g.MapPost("/cycles",async(int contextId,DrCycleRequest r,DrencherService s,ClaimsPrincipal u)=>await s.Save(await s.Context(contextId,u,true,"drencher","add"),0,r,u));
  g.MapPut("/cycles/{id:int}",async(int contextId,int id,DrCycleRequest r,DrencherService s,ClaimsPrincipal u)=>await s.Save(await s.Context(contextId,u,true,"drencher","modify"),id,r,u));
  g.MapPost("/cycles/{id:int}/submit",async(int contextId,int id,DrTransition r,DrencherService s,ClaimsPrincipal u)=>await s.Transition(await s.Context(contextId,u,true,"drencher","modify"),id,r,u,false));
  g.MapPost("/cycles/{id:int}/validate",async(int contextId,int id,DrTransition r,DrencherService s,ClaimsPrincipal u)=>await s.Transition(await s.Context(contextId,u,true,"drencher_quality","modify"),id,r,u,true));
  g.MapPost("/cycles/{id:int}/correct",async(int contextId,int id,DrCycleRequest r,DrencherService s,ClaimsPrincipal u)=>await s.Save(await s.Context(contextId,u,true,"drencher_quality","modify"),id,r,u,true));
 }
}
