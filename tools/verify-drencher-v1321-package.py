from pathlib import Path
from zipfile import ZipFile
import hashlib,json,re,shutil
root=Path.cwd();zip_path=root/'VITASOUSS-DRENCHER-V1.3.2.1-IIS.zip';stage=root/'release/VITASOUSS-DRENCHER-V1.3.2.1';results=[]
def check(name,valid):
 assert valid,name
 results.append(dict(name=name,passed=True));print('PASS '+name)
with ZipFile(zip_path) as z:
 names=[n.replace('\\','/') for n in z.namelist()]
 check('Archive intègre',z.testzip() is None)
 check('Backend/frontend et SQL séparé présents',all(n in names for n in ['update/Vitasouss.Api.dll','update/wwwroot/index.html','sql/012_drencher_permissions_v1321.sql']))
 check('Aucun SQL métier dans update',not any(n.startswith('update/') and n.endswith('.sql') for n in names))
 check('Configurations, secrets, clés et web.config exclus',not any(re.search(r'(^|/)(appsettings[^/]*\.json|web\.config|keys|secrets|logs|assistant-audit)(/|$)',n,re.I) for n in names))
 check('Aucune clé OpenAI dans textes',not any(re.search(rb'sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{45,}',z.read(n)) for n in z.namelist() if n.endswith(('.json','.js','.md','.txt','.sql'))))
 summary=json.loads((stage/'docs/tests-drencher-v1321-summary.json').read_text(encoding='utf-8-sig'))
 check('Tests API/MySQL et version finale attestés',summary['apiMySqlValidated'] and summary['drencherVersion']=='1.3.2.1' and summary['failed']==0)
 check('DLL testée identique dans ZIP',hashlib.sha256(z.read(next(n for n in z.namelist() if n.replace('\\','/')=='update/Vitasouss.Api.dll'))).hexdigest().upper()==summary['assemblySha256'])
 manifest=json.loads((stage/'docs/update-manifest.json').read_text(encoding='utf-8-sig'))
 check('Tous fichiers update correspondent au manifeste',all(hashlib.sha256((stage/'update'/m['path'].replace('\\','/')).read_bytes()).hexdigest().upper()==m['sha256'] for m in manifest))
 check('PDF, modèles et dépendances non remplacés',not any(n.startswith('update/') and (n.endswith('.pdf') or '/pdf-assets/' in n or n.endswith('.dll') and not n.endswith('/Vitasouss.Api.dll')) for n in names))
 target=root/'output/verification-package-v1321';target.mkdir(exist_ok=True)
 protected={'appsettings.Local.json':b'LOCAL FICTIF','web.config':b'IIS FICTIF','keys/key.xml':b'DP FICTIVE','secrets/openai.protected':b'OPENAI FICTIF','secrets/mysql.protected':b'MYSQL FICTIF'}
 for name,value in protected.items():p=target/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(value)
 shutil.copytree(stage/'update',target,dirs_exist_ok=True)
 check('Copie additive préserve config IIS, DP, OpenAI et MySQL fictifs',all((target/n).read_bytes()==v for n,v in protected.items()))
(root/'docs/tests-drencher-v1321-package.json').write_text(json.dumps(dict(passed=len(results),failed=0,productionDeploy=False,results=results),indent=2,ensure_ascii=False),encoding='utf-8')
