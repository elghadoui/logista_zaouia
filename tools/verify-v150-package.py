from pathlib import Path
from zipfile import ZipFile
import json,hashlib,re
root=Path(__file__).resolve().parent.parent
stage=root/'release/VITASOUSS-V1.5.0'
summary=json.loads((stage/'docs/tests-v150-summary.json').read_text(encoding='utf-8-sig'))
name='VITASOUSS-V1.5.0-IIS'+('-CANDIDAT' if summary['candidate'] else '')+'.zip'
results=[]
def check(name,ok):
 assert ok,name
 results.append(dict(name=name,passed=True));print('PASS '+name)
with ZipFile(root/name) as z:
 names=z.namelist();check('Archive IIS intègre',z.testzip() is None)
 update=[n for n in names if n.startswith('update/') and not n.endswith('/')]
 check('Correctif additif : sept fichiers uniquement',len(update)==7)
 check('Configurations et clés exclues',not any(re.search(r'(^|/)(appsettings[^/]*|web\.config|keys|secrets|logs)(/|$)',n,re.I) for n in names))
 check('Aucun SQL de migration dans update',not any(n.startswith('update/') and n.endswith('.sql') for n in names))
 check('Aucun PDF ou ressource F04 remplacé',not any(n.startswith('update/') and (n.endswith(('.pdf','.png','.ttf')) or '/pdf-assets/' in n) for n in names))
 check('DLL principale seulement, dépendances existantes conservées',[n for n in update if n.endswith('.dll')]==['update/Vitasouss.Api.dll'])
 check('DLL livrée identique à la DLL testée',hashlib.sha256(z.read('update/Vitasouss.Api.dll')).hexdigest().upper()==summary['assemblySha256'])
 manifest=json.loads(z.read('docs/update-manifest.json').decode('utf-8-sig'))
 check('Manifeste complet exact',len(manifest)==7 and all(hashlib.sha256(z.read('update/'+m['path'])).hexdigest().upper()==m['sha256'] for m in manifest))
 check('Guides audit, calculs, limites, mise à jour et tests présents',all('docs/'+n in names for n in ['V1.5.0-AUDIT-SQL.md','V1.5.0-INDICATEURS.md','V1.5.0-LIMITATIONS.md','V1.5.0-MISE-A-JOUR.md','V1.5.0-TESTS.md']))
 check('Statut HTTP honnête et Drencher conservé',summary['httpValidated']==(not summary['candidate']) and summary['drencherVersion']=='1.3.2.1' and summary['failed']==0)
 check('Aucune clé OpenAI dans les fichiers texte',not any(re.search(rb'sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{45,}',z.read(n)) for n in names if n.endswith(('.md','.txt','.json','.js'))))
 target=root/'output/verification-package-v150';target.mkdir(exist_ok=True)
 protected={'appsettings.Local.json':b'LOCAL FAKE','web.config':b'IIS FAKE','keys/key.xml':b'DP FAKE','secrets/openai.protected':b'OPENAI FAKE','secrets/mysql.protected':b'MYSQL FAKE'}
 for n,v in protected.items():p=target/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
 for n in update:
  rel=Path(n).relative_to('update');check_path=(target/rel).resolve();assert check_path.is_relative_to(target.resolve());check_path.parent.mkdir(parents=True,exist_ok=True);check_path.write_bytes(z.read(n))
 check('Simulation de copie préserve IIS, DP, MySQL et OpenAI fictifs',all((target/n).read_bytes()==v for n,v in protected.items()))
with ZipFile(root/'VITASOUSS-V1.5.0-SOURCES.zip') as z:
 names=z.namelist();check('Sources complètes application et tests',all(n in names for n in ['backend/Program.cs','backend/Application/AnalyticsService.cs','backend/Application/DrencherCycles.cs','frontend/src/AnalyticsDashboard.tsx','frontend/src/Drencher.tsx','frontend/package-lock.json','tests/AnalyticsTests/Program.cs']))
 check('Sources sans bases importées, binaires locaux ou configurations privées',not any('node_modules/' in n or '/bin/' in n or '/obj/' in n or '/keys/' in n or 'appsettings.Local' in n or 'logista-audit.sql' in n for n in names))
 baseline=json.loads((root/'output/audit-v150/baseline/drencher-hashes.json').read_text(encoding='utf-8-sig'))
 check('Drencher livré dans les sources identique au départ',all(hashlib.sha256(z.read(v['path'].replace('\\','/'))).hexdigest().upper()==v['sha256'] for v in baseline))
(root/'docs/tests-v150-package.json').write_text(json.dumps(dict(passed=len(results),failed=0,productionDeploy=False,results=results),ensure_ascii=False,indent=2),encoding='utf-8')
