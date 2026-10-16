using System.Security.Claims;
namespace Vitasouss;
public static class DrencherEndpoints
{
 public static void Map(RouteGroupBuilder api) {
  var g=api.MapGroup("/contexts/{contextId:int}/drencher");
  g.MapGet("/catalog",async(int contextId,DrencherService s,ClaimsPrincipal u)=>await s.Catalog(await s.Context(contextId,u)));
  g.MapGet("/stock",async(int contextId,int? page,DrencherService s,ClaimsPrincipal u)=>await s.Stock(await s.Context(contextId,u),page??1));
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
