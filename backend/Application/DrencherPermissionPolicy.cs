using System.Security.Claims;
namespace Vitasouss;
public static class DrencherPermissionPolicy {
 public const string Products="drencher_products",Programs="drencher_programs",Stock="drencher_stock";
 public static bool CycleLookups(ClaimsPrincipal user,IEnumerable<ModulePermission> rows)=>PermissionService.Allows(user,"drencher","view",rows)&&(PermissionService.Allows(user,"drencher","add",rows)||PermissionService.Allows(user,"drencher","modify",rows)||PermissionService.Allows(user,"drencher_quality","modify",rows));
 public static bool OwnDraft(ClaimsPrincipal user,int authorId)=>user.IsInRole("Admin")||int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier),out var id)&&id==authorId;
 public static void DemandOwnDraft(ClaimsPrincipal user,int authorId) {if(!OwnDraft(user,authorId))throw new RuleException("Seul l'auteur peut modifier ou soumettre son brouillon ; l'administrateur conserve son accès exceptionnel.",403);}
}
