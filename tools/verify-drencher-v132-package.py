from pathlib import Path
from zipfile import ZipFile
import hashlib,json,re,shutil
root=Path.cwd();release=root/'release/VITASOUSS-DRENCHER-V1.3.2-CANDIDAT';zip_path=root/'VITASOUSS-DRENCHER-V1.3.2-IIS-CANDIDAT.zip';results=[]
def check(name,yes):
 assert yes,name
 results.append(dict(name=name,passed=True));print('PASS '+name)
for source,name in [(zip_path,'IIS'),(root/'VITASOUSS-DRENCHER-V1.3.2-SOURCES.zip','Sources')]:
 with ZipFile(source) as z:
  names=[n.replace('\\','/') for n in z.namelist()]
  check(name+' : configurations privées et clés exclues',not any(re.search(r'(^|/)(appsettings\.Local\.json|appsettings\.Development\.json|web\.config|keys|secrets|logs|assistant-audit)(/|$)',n,re.I) for n in names))
  check(name+' : aucune clé OpenAI réelle en texte',not any(re.search(rb'sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{45,}',z.read(n)) for n in z.namelist() if n.endswith(('.json','.js','.ts','.tsx','.cs','.md','.ps1','.mjs','.sql','.txt'))))
  check(name+' : archive intègre',z.testzip() is None)
with ZipFile(zip_path) as z:
 names=[n.replace('\\','/') for n in z.namelist()]
 check('Paquet contient backend, frontend, logo F04 et SQL séparé',all(x in names for x in ['update/Vitasouss.Api.dll','update/wwwroot/index.html','update/pdf-assets/f04-zaouia.png','sql/011_drencher_v132.sql']))
 check('SQL absent du dossier update',not any(n.startswith('update/') and n.endswith('.sql') for n in names))
 summary=json.loads(z.read(next(n for n in z.namelist() if n.replace('\\','/')=='docs/tests-drencher-v132-summary.json')).decode('utf-8-sig'))
 check('Candidat explicitement sans validation API/MySQL',summary['apiMySqlValidated'] is False and 'Candidat' in summary['status'])
 check('DLL emballée identique à la DLL vérifiée',hashlib.sha256(z.read(next(n for n in z.namelist() if n.replace('\\','/')=='update/Vitasouss.Api.dll'))).hexdigest().upper()==summary['assemblySha256'])
 manifest=json.loads((release/'docs/update-manifest.json').read_text(encoding='utf-8-sig'))
 check('Manifest exact de tous fichiers update',all(hashlib.sha256((release/'update'/p['path'].replace('\\','/')).read_bytes()).hexdigest().upper()==p['sha256'] for p in manifest))
 test=root/'output/verification-package-v132';test.mkdir(exist_ok=True)
 protected={'appsettings.Local.json':b'CONFIGURATION FICTIVE','web.config':b'IIS FICTIF','keys/cle-fictive.xml':b'CLE FICTIVE','secrets/openai.protected':b'SECRET FICTIF','secrets/mysql.protected':b'MYSQL FICTIF'}
 for n,b in protected.items():p=test/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b)
 shutil.copytree(release/'update',test,dirs_exist_ok=True)
 check('Copie additive : config IIS, DP et secrets fictifs conservés',all((test/n).read_bytes()==b for n,b in protected.items()))
 check('Trois PDF de démonstration livrés',all(f'docs/exemples-f04/F04-V06-V1.3.2-{mode}.pdf' in names for mode in ['REEL','THEORIQUE','MACHINE']))
(root/'docs/tests-drencher-v132-package.json').write_text(json.dumps(dict(passed=len(results),failed=0,productionDeploy=False,results=results),indent=2,ensure_ascii=False),encoding='utf-8')
