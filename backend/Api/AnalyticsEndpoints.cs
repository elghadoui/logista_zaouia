using System.Security.Claims;
namespace Vitasouss;
public static class AnalyticsEndpoints
{
    public static void MapAnalytics(this RouteGroupBuilder api)
    {
        api.MapGet("/contexts/{contextId:int}/analytics/{module}",async(int contextId,string module,HttpRequest request,AnalyticsService service,ClaimsPrincipal user,CancellationToken ct)=>{var q=AnalyticsQuery.Parse(request.Query);return AnalyticsService.Response(await service.Read(contextId,module,q,user,ct:ct),q);});
        api.MapGet("/contexts/{contextId:int}/analytics/{module}/export",async(int contextId,string module,HttpRequest request,AnalyticsService service,ClaimsPrincipal user,CancellationToken ct)=>{var q=AnalyticsQuery.Parse(request.Query);return Results.File(AnalyticsExcel.Create(await service.Read(contextId,module,q,user,true,ct),q,module),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",$"VITASOUSS-{module}-{DateTime.UtcNow:yyyyMMdd}.xlsx");});
        api.MapGet("/contexts/{contextId:int}/analytics/caisserie/producers",async(int contextId,HttpRequest request,AnalyticsService service,ClaimsPrincipal user,CancellationToken ct)=>await service.ProducerSituation(contextId,AnalyticsQuery.Parse(request.Query),user,ct));
        api.MapGet("/contexts/{contextId:int}/analytics/caisserie/producers/export",async(int contextId,HttpRequest request,AnalyticsService service,ClaimsPrincipal user,CancellationToken ct)=>{
            var q=AnalyticsQuery.Parse(request.Query);var page=await service.ProducerSituation(contextId,q,user,ct,true);
            return Results.File(AnalyticsExcel.CreateCrateSituation(page,q),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",$"VITASOUSS-caisserie-producteurs-{DateTime.UtcNow:yyyyMMdd}.xlsx");
        });
    }
}
