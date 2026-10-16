from pathlib import Path
from zipfile import ZipFile
import json,hashlib,re
root=Path(__file__).resolve().parent.parent
results=[]
def check(name,ok):
 assert ok,name
 results.append(dict(name=name,passed=True));print('PASS '+name)
summary=json.loads((root/'docs/tests-v160-summary.json').read_text(encoding='utf-8'))
with ZipFile(root/'VITASOUSS-V1.6.0-IIS-CANDIDAT.zip') as z:
 names=z.namelist();update=[n for n in names if n.startswith('update/') and not n.endswith('/')]
 check('IIS archive intègre',z.testzip() is None)
 check('Sept fichiers additifs uniquement',len(update)==7)
 check('Configurations, clés et secrets exclus',not any(re.search(r'(^|/)(appsettings[^/]*|web\.config|keys|secrets|logs)(/|$)',n,re.I) for n in names))
 check('Aucun SQL métier, migration nouvelle ou PDF dans update',not any(n.startswith('update/') and n.endswith(('.sql','.pdf','.png','.ttf')) for n in names))
 check('DLL livrée identique à la DLL testée',hashlib.sha256(z.read('update/Vitasouss.Api.dll')).hexdigest().upper()==summary['assemblySha256'])
 manifest=json.loads(z.read('docs/update-manifest.json'));check('Manifeste de sept empreintes exactes',len(manifest)==7 and all(hashlib.sha256(z.read('update/'+v['path'])).hexdigest().upper()==v['sha256'] for v in manifest))
 check('Audit, tests, guide et indicateurs présents',all('docs/'+n in names for n in ['V1.6.0-AUDIT-EXPORT.md','V1.6.0-INDICATEURS-EXPORT.md','V1.6.0-MISE-A-JOUR.md','V1.6.0-TESTS.md']))
 check('Statut candidat et limites métier explicites',summary['candidate'] and not summary['businessDefinitionProvisional'] and not summary['productionDeploy'] and not summary['visualValidated'])
 target=root/'output/verification-package-v160';target.mkdir(parents=True,exist_ok=True)
 protected={'appsettings.Local.json':b'CONFIG FICTIVE','web.config':b'IIS FICTIF','keys/key.xml':b'DP FICTIF','secrets/mysql.protected':b'SECRET FICTIF','secrets/openai.protected':b'SECRET FICTIF'}
 for name,data in protected.items():p=target/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
 for name in update:
  p=(target/Path(name).relative_to('update')).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(z.read(name))
 check('Simulation additive préserve les fichiers protégés',all((target/n).read_bytes()==data for n,data in protected.items()))
with ZipFile(root/'VITASOUSS-V1.6.0-SOURCES-CANDIDAT.zip') as z:
 names=z.namelist();check('Sources intègres et modules Export/tests présents',z.testzip() is None and all(n in names for n in ['backend/Application/ExportAnalyticsService.cs','backend/Api/ExportAnalyticsEndpoints.cs','frontend/src/ExportDashboard.tsx','tests/ExportV160Tests/Program.cs']))
 check('Sources sans configuration privée ou base importée',not any('appsettings.Local' in n or '/keys/' in n or '/node_modules/' in n or '/bin/' in n or '/obj/' in n or 'logista_audit' in n for n in names))
 baseline=json.loads((root/'output/audit-v150/baseline/drencher-hashes.json').read_text(encoding='utf-8-sig'));check('Drencher et documents sources identiques',all(hashlib.sha256(z.read(v['path'].replace('\\','/'))).hexdigest().upper()==v['sha256'] for v in baseline))
for kind in ['IIS','SOURCES']:
 p=root/f'VITASOUSS-V1.6.0-{kind}-CANDIDAT.zip';check(kind+' empreinte externe exacte',hashlib.sha256(p.read_bytes()).hexdigest().upper()==p.with_suffix('.zip.sha256').read_text().split()[0])
(root/'docs/tests-v160-package.json').write_text(json.dumps(dict(passed=len(results),failed=0,productionDeploy=False,results=results),ensure_ascii=False,indent=2),encoding='utf-8')
