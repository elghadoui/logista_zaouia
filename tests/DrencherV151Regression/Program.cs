using System.Security.Claims;
using System.Text.Json;
using System.Security.Cryptography;
using Vitasouss;
var results=new List<object>();
void Check(string name,bool valid){if(!valid)throw new Exception(name);results.Add(new{name,passed=true});Console.WriteLine("PASS "+name);}
ClaimsPrincipal User(string role,int id)=>new(new ClaimsIdentity([new(ClaimTypes.Role,role),new(ClaimTypes.NameIdentifier,id.ToString())],"fixture"));
var hicham=User("Gestionnaire",1);var mbark=User("Gestionnaire",2);var samira=User("Gestionnaire",3);var admin=User("Admin",4);var consult=User("Consultation",5);
var operatorRows=new[]{new ModulePermission("drencher",true,true,true,false),new("drencher_manage",true,true,true,false)};
var qualityRows=new[]{new ModulePermission("drencher",true,false,false,false),new("drencher_quality",true,false,true,false),new("drencher_programs",true,true,true,false),new("drencher_products",true,true,true,false),new("drencher_stock",true,true,false,false)};
bool Allowed(ClaimsPrincipal u,string m,string action,ModulePermission[] rows)=>PermissionService.Allows(u,m,action,rows);
foreach(var action in new[]{"view","add","modify"})Check("Hicham saisie "+action,Allowed(hicham,"drencher",action,operatorRows));
foreach(var module in new[]{"drencher_quality","drencher_programs","drencher_products","drencher_stock"})foreach(var action in new[]{"add","modify","delete"})Check("Opérateur refus "+module+" / "+action,!Allowed(hicham,module,action,operatorRows));
foreach(var user in new[]{mbark,samira}){
 var name=user==mbark?"Mbark":"Samira";
 Check(name+" validation/correction",Allowed(user,"drencher_quality","modify",qualityRows));
 foreach(var action in new[]{"add","modify"})foreach(var module in new[]{"drencher_programs","drencher_products"})Check(name+" "+module+" / "+action,Allowed(user,module,action,qualityRows));
 Check(name+" entrée stock",Allowed(user,"drencher_stock","add",qualityRows));
 Check(name+" aucune suppression administrative",!Allowed(user,"drencher","delete",qualityRows)&&!user.IsInRole("Admin"));
 Check(name+" pas de saisie implicitement accordée",!Allowed(user,"drencher","add",qualityRows));
}
foreach(var module in new[]{"drencher","drencher_quality","drencher_programs","drencher_products","drencher_stock"})foreach(var action in new[]{"view","add","modify","delete"})Check("Admin conserve "+module+" / "+action,Allowed(admin,module,action,[]));
Check("Module absent fermé",!Allowed(hicham,"drencher_programs","add",[]));
Check("Ajouter sans Voir refusé",!Allowed(hicham,"drencher_programs","add",[new("drencher_programs",false,true,true,false)]));
Check("Consultation reste lecture seule",!Allowed(consult,"drencher","add",operatorRows)&&Allowed(consult,"drencher","view",operatorRows));
Check("Propriétaire peut modifier/soumettre son brouillon",DrencherPermissionPolicy.OwnDraft(hicham,1));
Check("Autre opérateur ne peut modifier le brouillon",!DrencherPermissionPolicy.OwnDraft(hicham,2));
Check("Admin conserve accès brouillons d'autrui",DrencherPermissionPolicy.OwnDraft(admin,1));
try{DrencherPermissionPolicy.DemandOwnDraft(hicham,2);throw new Exception("403 attendu");}catch(RuleException e){Check("Contrôle propriétaire API : 403",e.Status==403);}
var legacy=new[]{new ModulePermission("drencher",true,false,false,false),new("drencher_manage",true,true,true,false)};
var before=JsonSerializer.Serialize(legacy);var matrix=PermissionService.Matrix(legacy);
Check("Matrice complète sans migration ni écriture",matrix.Length==PermissionService.Modules.Length);
Check("Ancien droit groupé conservé à l'identique",matrix.Single(p=>p.Module=="drencher_manage")==legacy[1]);
Check("Nouveaux droits absents tous false",matrix.Where(p=>p.Module is "drencher_products" or "drencher_programs" or "drencher_stock").All(p=>!p.View&&!p.Add&&!p.Modify&&!p.Delete));
Check("Matrice ne modifie pas les données d'entrée",before==JsonSerializer.Serialize(legacy));
Check("Aucune attribution de saisie automatique",!matrix.Single(p=>p.Module=="drencher").Add);
Check("Saisie autorise les seuls lookups nécessaires au cycle",DrencherPermissionPolicy.CycleLookups(hicham,operatorRows));
Check("Qualité autorise les lookups de correction",DrencherPermissionPolicy.CycleLookups(mbark,qualityRows));
Check("Ancien Voir seul n'élargit pas les lookups",!DrencherPermissionPolicy.CycleLookups(hicham,legacy));
var programOnly=new[]{new ModulePermission("drencher",true,false,false,false),new("drencher_programs",true,true,true,false)};
Check("Programme spécifique indépendant des produits/stock",Allowed(mbark,"drencher_programs","add",programOnly)&&!Allowed(mbark,"drencher_products","add",programOnly)&&!Allowed(mbark,"drencher_stock","add",programOnly));
File.WriteAllText("docs/tests-v151-drencher-permissions.json",JsonSerializer.Serialize(new{date=DateTime.UtcNow,passed=results.Count,failed=0,productionAccess=false,assemblySha256=Convert.ToHexString(SHA256.HashData(File.ReadAllBytes(typeof(PermissionService).Assembly.Location))),scope="Politique réelle de permissions et propriété des brouillons ; aucun accès MySQL",results},new JsonSerializerOptions{WriteIndented=true}));
