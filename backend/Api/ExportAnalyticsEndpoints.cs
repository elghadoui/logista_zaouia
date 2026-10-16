using System.Security.Claims;
namespace Vitasouss;
public static class ExportAnalyticsEndpoints
{
    public static void MapExportAnalytics(this RouteGroupBuilder api)
    {
        api.MapGet("/contexts/{contextId:int}/analytics/export",async(int contextId,HttpRequest request,ExportAnalyticsService service,ClaimsPrincipal user,CancellationToken ct)=>await service.Read(contextId,ExportQuery.Parse(request.Query),user,ct:ct));
        api.MapGet("/contexts/{contextId:int}/analytics/export/export",async(int contextId,HttpRequest request,ExportAnalyticsService service,ClaimsPrincipal user,CancellationToken ct)=>{
            var q=ExportQuery.Parse(request.Query);var result=await service.Read(contextId,q,user,true,ct);
            return Results.File(ExportAnalyticsService.Excel(result,q),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","VITASOUSS-Export-dossiers-"+DateTime.UtcNow.ToString("yyyyMMdd")+".xlsx");
        });
    }
}
