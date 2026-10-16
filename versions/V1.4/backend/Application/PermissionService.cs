using Dapper;
using System.Security.Claims;
using MySqlConnector;
namespace Vitasouss;
public record ModulePermission(string Module, bool View, bool Add, bool Modify, bool Delete);
public sealed class PermissionService(Connections connections)
{
    public static readonly string[] Modules = ["dashboard","adherent","verger","parcelle","hierarchy","culture","grpvar","variete","souvar","partenaire","destination","pays","grpemb","groupart","defaut","typeecart","declaration_verger","receptions","caisserie","versements","export","ecarts","drencher","assistant","compare","sync","journal"];
    public static readonly string[] ReadOnly = ["dashboard","hierarchy","receptions","caisserie","versements","export","ecarts","drencher","assistant","compare","journal"];
    public async Task<ModulePermission[]> For(ClaimsPrincipal user)
    {
        if (user.IsInRole("Admin")) return Modules.Select(m => new ModulePermission(m,true,!ReadOnly.Contains(m),!ReadOnly.Contains(m),!ReadOnly.Contains(m)&&m!="sync")).ToArray();
        await using var db = await connections.Admin();
        try { return (await db.QueryAsync<ModulePermission>("SELECT module Module,can_view View,can_add `Add`,can_modify Modify,can_delete `Delete` FROM app_module_permissions WHERE user_id=@uid", new {uid=user.FindFirstValue(ClaimTypes.NameIdentifier)})).Select(p=>user.IsInRole("Consultation")?p with {Add=false,Modify=false,Delete=false}:p).ToArray(); }
        catch(MySqlException e) when(e.Number==1146) { return []; } // Fail closed until the explicit admin migration is installed.
    }
    public async Task Demand(ClaimsPrincipal user,string module,string action="view")
    {
        if(!Modules.Contains(module)) throw new RuleException("Module non autorisé.",403);
        if(user.IsInRole("Admin"))return;
        var p=(await For(user)).FirstOrDefault(p=>p.Module==module);
        if(p is null || !p.View || (action!="view" && user.IsInRole("Consultation")) || !(action switch {"view"=>p.View,"add"=>p.Add,"modify"=>p.Modify,"delete"=>p.Delete,_=>false})) throw new RuleException("Accès refusé : permission du module insuffisante.",403);
    }
    public static async Task Defaults(MySqlConnection db,long uid,string role,MySqlTransaction? tx=null)
    {
        foreach(var module in Modules)await db.ExecuteAsync("INSERT IGNORE INTO app_module_permissions(user_id,module,can_view,can_add,can_modify,can_delete) VALUES(@uid,@module,1,@write,@write,@delete)",new{uid,module,write=role!="Consultation"&&!ReadOnly.Contains(module),delete=role!="Consultation"&&!ReadOnly.Contains(module)&&module!="sync"},tx);
    }
    public async Task CheckRequest(HttpContext ctx)
    {
        var parts=ctx.Request.Path.Value!.Split('/',StringSplitOptions.RemoveEmptyEntries);
        if(parts.Length<2 || parts[0]!="api" || parts[1] is "auth" or "admin" or "permissions" or "catalog" || parts[1]=="contexts" && parts.Length==2)return;
        if(parts[1]=="assistant"){await Demand(ctx.User,"assistant");return;}
        if(parts[1]=="sync") {
            await Demand(ctx.User,"sync",ctx.Request.Method=="GET"?"view":"modify");
            if(parts.Length>2){await using var db=await connections.Admin();var job=await db.QuerySingleOrDefaultAsync("SELECT c.entity,c.operation FROM app_sync_jobs j JOIN app_changes c ON c.id=j.change_id WHERE j.id=@id",new{id=parts[2]});if(job is not null)await Demand(ctx.User,(string)job.entity,ctx.Request.Method=="GET"?"view":(string)job.operation=="CompareCreate"?"add":"modify");}return;
        }
        if(parts[1]!="contexts"||parts.Length<4)return;
        var segment=parts[3]; string module=segment switch {"entities" or "pilot" or "boards" or "lookups"=>parts.Length>4?parts[4]:"", "comparison" or "comparison-targets"=>"compare","synchronization"=>"sync","vergers"=>"verger",_=>segment};
        var action=ctx.Request.Method=="GET"?"view":ctx.Request.Method=="DELETE"||parts.Contains("delete")||parts.Contains("delete-batch")?"delete":ctx.Request.Method=="POST"&&segment=="pilot"?"add":"modify";
        if(parts.Contains("delete-preview"))action="delete";
        if(ReadOnly.Contains(module)) action="view";
        if(segment=="entities" && ctx.Request.Method=="PUT")action="view"; // Save validates add vs modify from its typed request.
        if(segment=="entities" && ctx.Request.Method=="POST" && parts.Length==5)action="add";
        if(parts.Contains("delete-batch-preview"))action="delete";
        if(segment=="entities"&&parts.Contains("comparison"))await Demand(ctx.User,"compare");
        await Demand(ctx.User,module,action);
        if(segment=="comparison"&&ctx.Request.Query.TryGetValue("name",out var entity))await Demand(ctx.User,entity.ToString());
        if(segment=="assistant"&&parts.Length>5&&parts[4]=="tools") {
            var linked=parts[5] switch {"adherent"=>"adherent","parcelles-adherent"=>"parcelle",_=>parts[5]};await Demand(ctx.User,linked);
            if(parts[5] is "adherent" or "parcelles-adherent"){await Demand(ctx.User,"verger");await Demand(ctx.User,"parcelle");}
        }
    }
}
public record PermissionRequest(ModulePermission[] Permissions);
