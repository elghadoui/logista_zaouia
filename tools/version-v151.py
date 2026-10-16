from pathlib import Path
p=Path('backend/Program.cs');s=p.read_text(encoding='utf-8');a=s.index('api.MapGet("/contexts",');b=s.index('api.MapGet("/contexts/{contextId:int}/dashboard"',a);s=s[:a]+'api.MapGet("/contexts", (Connections connections, ClaimsPrincipal user) => ContextVisibility.Select(connections,user));\n'+s[b:];s=s.replace('version = "1.5.0"','version = "1.5.1"');p.write_text(s,encoding='utf-8')
p=Path('backend/Vitasouss.Api.csproj');p.write_text(p.read_text().replace('<Version>1.5.0</Version>','<Version>1.5.1</Version>'),encoding='utf-8')
p=Path('backend/Application/AnalyticsExcel.cs');p.write_text(p.read_text().replace('VITASOUSS 1.5.0','VITASOUSS 1.5.1'),encoding='utf-8')
import json
for name in ['frontend/package.json','frontend/package-lock.json']:
 p=Path(name);data=json.loads(p.read_text());data['version']='1.5.1'
 if 'packages' in data:data['packages']['']['version']='1.5.1'
 p.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
