"""Package a V1.5.1 candidate. Never deploy or execute SQL. Final mode requires HTTP and visual evidence."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import json,hashlib,datetime,re,shutil,sys
root=Path(__file__).resolve().parent.parent
final='--final' in sys.argv
stage=root/('release/VITASOUSS-V1.5.1' if final else 'release/VITASOUSS-V1.5.1-CANDIDAT')
published=root/'publish-v151-candidate'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest().upper()
def check(ok,message):
 if not ok:raise RuntimeError(message)
results=[]
names=['service','ui','excel','drencher-permissions','drencher-ui','assistant']
for name in ['api','drencher-api','drencher-guard']:
 report=root/f'docs/tests-v151-{name}.json'
 # Historical HTTP reports are not evidence for a newly compiled backend.
 if report.exists() and read(report).get('assemblySha256')==sha(published/'Vitasouss.Api.dll'):names.append(name)
 elif final:raise RuntimeError(f'Current published assembly lacks matching HTTP evidence: {name}')
visual=root/'docs/tests-v151-visual.json'
if visual.exists():names.append('visual')
elif final:raise RuntimeError('Real visual evidence is required for a final package')
for name in names:
 r=read(root/f'docs/tests-v151-{name}.json')
 check(r.get('failed',0)==0 and r.get('success',True),f'Failed suite: {name}')
 for t in r['results']:
  check(t['passed'],f'Failed test: {name}')
  results.append(dict(suite=name,**t))
check(all(sha(root/v['path'])==v['sha256'] for v in read(root/'output/audit-v150/baseline/drencher-hashes.json')),'Drencher source changed')
check(sha(published/'Vitasouss.Api.dll')==read(root/'docs/tests-v151-drencher-permissions.json')['assemblySha256'],'Published assembly differs from tested assembly')
old=read(root/'publish-v150-tests/Vitasouss.Api.deps.json');new=read(published/'Vitasouss.Api.deps.json')
check({k:v for k,v in old['libraries'].items() if not k.startswith('Vitasouss.Api/')}=={k:v for k,v in new['libraries'].items() if not k.startswith('Vitasouss.Api/')},'Backend dependencies changed')
lock=read(root/'frontend/package-lock.json');oldlock=read(root/'release/VITASOUSS-DRENCHER-V1.3.2-SOURCES/frontend/package-lock.json')
check({k:v for k,v in lock['packages'].items() if k}=={k:v for k,v in oldlock['packages'].items() if k},'Frontend dependencies changed')
summary=dict(date=datetime.datetime.now(datetime.timezone.utc).isoformat(),version='1.5.1',drencherVersion='1.3.2.1',candidate=not final,passed=len(results),failed=0,httpValidated='api' in names,visualValidated='visual' in names,drencherHttpValidated=all(n in names for n in ['drencher-api','drencher-guard']),productionAccess=False,productionDeploy=False,realDiafVerified=False,realArchivesVerified=False,assemblySha256=sha(published/'Vitasouss.Api.dll'),results=results)
(root/'docs/tests-v151-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
counts={n:sum(r['suite']==n for r in results) for n in names}
report='''# VITASOUSS V1.5.1 — Rapport de tests\n\nStatut : %s. Aucun déploiement ni modification de production.\n\n## Résultats réellement obtenus\n\n.NET 10 Release publié, TypeScript compilé et frontend de production construit. Tests locaux MySQL 5.7.44 (127.0.0.1:33307), composants React/Mantine réels rendus en SSR, classeur Excel relu avec openpyxl.\n\n'''%('VALIDATION LOCALE TERMINÉE' if final else 'CANDIDAT VALIDÉ EN HTTP ; PRÉREQUIS PRODUCTION EN ATTENTE' if 'api' in names else 'CANDIDAT COMPILÉ ; VALIDATION HTTP EN ATTENTE')
report+='| Suite | Assertions réussies |\n|---|---:|\n'+''.join(f'| {k} | {v} |\n' for k,v in counts.items())+f'| Total | {len(results)} |\n\n'
report+='''Les tests de service réexécutent les calculs Réceptions V1.5.0, la consolidation et les archives synthétiques, les refus de droits station/module/exercice, les anomalies, exports et pagination. Ils vérifient aussi la variation E−S auditée de −41 010, les types distincts, sens inconnu/quantité négative, incohérence producteur/verger, les inventaires révisés, confirmations, limites, concurrence, références, archives et refus Consultation/Gestionnaire. Masquage/réaffichage : sélecteurs filtrés, résolution directe autorisée maintenue, grants conservés, autre station toujours refusée.\n\nSQL013 et SQL014 ont été exécutés deux fois sur l’administration LOCALE uniquement. Les lignes d’inventaire des tests restent dans l’administration locale, sur des contextes synthétiques désactivés en fin de suite. Aucune ouverture de production n’est préremplie.\n\nDrencher : 67 contrôles de politique réelle et 14 vérifications de ses composants React. Conservation SHA-256 de toutes les sources Drencher et SQL010/011 par rapport à la référence V1.5.0 ; les services PDF et cinq documents de stock sont inchangés. Lorsque les suites drencher-api et drencher-guard figurent dans le tableau ci-dessus, leurs 93 et 12 contrôles HTTP transactionnels ont aussi été réexécutés sur la V1.5.1 : soumissions, concurrence, corrections différentielles, réservations, archives, trois modes PDF F04, cinq documents de stock et refus de contournement PUT /cycles/0. Les 33 vérifications Assistant utilisent un faux fournisseur, zéro appel OpenAI réel. Les dépendances backend/frontend sont identiques au socle précédent.\n\nLes alertes NuGet NU1902/NU1903 déjà présentes sur la dépendance transitive Pkcs 8.0.1 subsistent ; aucune mise à niveau de dépendance n’est incluse dans ce correctif.\n\n## Vérifications restant nécessaires\n\n'''
if not final and 'api' not in names:report+='''- Vérification HTTP des endpoints de situation et export Caisserie : à exécuter sur cette publication locale avant de revendiquer la validation API. Le processus déjà ouvert sur 127.0.0.1:5080 n’a pas été arrêté ou remplacé durant cette passe ; tools/verify-v151-api.mjs cible la publication présente dans le candidat.\n- Revue visuelle et captures bureau, compact, mobile et thèmes : le navigateur intégré reste refusé par la préférence enregistrée. Aucun contournement ni capture fabriquée. La compatibilité responsive est préparée dans le code mais ne constitue pas un test visuel réel.\n- Non-régression transactionnelle HTTP Drencher sur la publication révisée : à exécuter si le processus de test est relancé, en plus des contrôles de politique/UI réussis et des empreintes de sources conservées.\n\n'''
if not final and 'api' in names:report+='''- Les 46 contrôles HTTP de la publication candidate sont réussis. L'acceptation visuelle est confirmée par l'utilisateur dans sa mission d'installation finale; aucune capture de l'agent n'est revendiquée.\n- Les suites HTTP transactionnelles Drencher historiques ne portent pas l'empreinte de la nouvelle DLL et sont exclues du total. Les contrôles de politique et de rendu React, ainsi que les empreintes des sources Drencher, restent vérifiés.\n- L'accès d'administration à VM-APPS reste à établir pour vérifier les sauvegardes restaurables, l'état de SQL013/014, IIS et NTFS avant installation. La lecture HTTP de production a retourné V1.5.0/Drencher 1.3.2.1; les commandes WinRM ont été refusées par la configuration d'authentification. Aucun paramètre de sécurité n'a été modifié.\n\n'''
report+='''Les VM et IIS de production ne sont pas testés. DIAF et archives réelles restent à valider sur des périodes connues. Les soldes certifiés attendent la preuve de nature/propriété/exhaustivité ; des inventaires déclarés ne suffisent pas. Les estimations restent partielles et non rattachées à une campagne dans le schéma historique.\n\nLes rapports JSON joints énumèrent les assertions. L’état de reprise docs/V1.5.1-ETAT-REPRISE.md permet de poursuivre sans reconstruire le projet.\n'''
(root/'docs/V1.5.1-TESTS.md').write_text(report,encoding='utf-8')
for part in ['update/wwwroot/assets','docs','sql']:(stage/part).mkdir(parents=True,exist_ok=True)
for name in ['Vitasouss.Api.dll','Vitasouss.Api.pdb','Vitasouss.Api.deps.json','Vitasouss.Api.runtimeconfig.json']:shutil.copy2(published/name,stage/'update'/name)
shutil.copy2(root/'frontend/dist/index.html',stage/'update/wwwroot/index.html')
assets=list((root/'frontend/dist/assets').iterdir());check(len(assets)==2 and all(p.suffix in ['.js','.css'] for p in assets),'Unexpected frontend build')
# No recursive deletion: remove only previously generated assets whose hash and confined path are verified.
manifest_path=stage/'docs/update-manifest.json'
known={v['path']:v['sha256'] for v in read(manifest_path)} if manifest_path.exists() else {}
for p in (stage/'update/wwwroot/assets').iterdir():
 if p.name not in {a.name for a in assets}:
  rel=p.relative_to(stage/'update').as_posix()
  check(p.resolve().is_relative_to((stage/'update/wwwroot/assets').resolve()) and p.is_file() and re.fullmatch(r'wwwroot/assets/index-[a-f0-9]+\.(js|css)',rel) and known.get(rel)==sha(p),'Unrecognized staging file; no cleanup performed')
  p.unlink()
for p in assets:shutil.copy2(p,stage/'update/wwwroot/assets'/p.name)
for p in (root/'docs').iterdir():
 if p.is_file() and (p.name.startswith('V1.5.1-') or p.name.startswith('tests-v151-')):shutil.copy2(p,stage/'docs'/p.name)
for name in ['013-context-visibility.sql','014-crate-openings-admin.sql']:shutil.copy2(root/'sql'/name,stage/'sql'/name)
if final:
 visual=read(root/'docs/tests-v151-visual.json')
 screenshots=visual.get('screenshots',[]);check(len(screenshots)>=3,'Real screenshots missing')
 for name in screenshots:
  p=(root/name).resolve();check(p.is_relative_to((root/'docs').resolve()) and p.is_file(),'Invalid screenshot path')
  dest=stage/p.relative_to(root);dest.parent.mkdir(exist_ok=True,parents=True);shutil.copy2(p,dest)
manifest=[dict(path=p.relative_to(stage/'update').as_posix(),sha256=sha(p)) for p in sorted((stage/'update').rglob('*')) if p.is_file()]
check(len(manifest)==7,'Unexpected update file count')
manifest_path.write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(stage/'LIRE-AVANT-INSTALLATION.txt').write_text(('CANDIDAT : NE PAS INSTALLER EN PRODUCTION AVANT FIN DE LA VALIDATION VISUELLE.\n' if not final else '')+'VITASOUSS V1.5.1 depuis V1.5.0 + Drencher V1.3.2.1 uniquement. SQL013/014 séparés et manuels dans referentiels_admin ; aucun SQL métier. Lire docs/V1.5.1-MISE-A-JOUR.md, IMPACTS-ET-REGLES et TESTS. Copie additive update/ uniquement. Configurations/secrets/keys/web.config exclus. Aucun déploiement automatique.\n',encoding='utf-8')
def archive(path,files):
 with ZipFile(path,'w',ZIP_DEFLATED) as z:
  for source,name in files:z.write(source,name)
 with ZipFile(path) as z:
  check(z.testzip() is None,'Invalid ZIP')
  check(not any(re.search(r'(^|/)(appsettings\.Local[^/]*|web\.config|keys|secrets|node_modules|\.env)(/|$)',n,re.I) for n in z.namelist()),'Private file in archive')
 path.with_suffix(path.suffix+'.sha256').write_text(sha(path)+'  '+path.name+'\n',encoding='ascii')
suffix='' if final else '-CANDIDAT'
iis=root/f'VITASOUSS-V1.5.1-IIS{suffix}.zip'
archive(iis,[(p,p.relative_to(stage).as_posix()) for p in sorted(stage.rglob('*')) if p.is_file()])
files=[];skip={'node_modules','bin','obj','keys','secrets','logs','assistant-audit','dist','.build-low-memory'}
for directory in ['backend','frontend','tests']:
 for p in sorted((root/directory).rglob('*')):
  rel=p.relative_to(root)
  if directory=='backend' and 'wwwroot' in rel.parts:continue
  if not p.is_file() or any(part in skip or part.startswith('.test-') for part in rel.parts):continue
  if p.name.startswith('appsettings') and p.name!='appsettings.json':continue
  if p.name in ['web.config','tsconfig.tsbuildinfo','vite.low-memory.config.ts'] or p.name.startswith('.env') or p.suffix in ['.log','.zip','.protected','.pfx','.user']:continue
  files.append((p,rel.as_posix()))
for p in (root/'frontend/dist').rglob('*'):
 if p.is_file():files.append((p,'backend/wwwroot/'+p.relative_to(root/'frontend/dist').as_posix()))
for p in (root/'sql').glob('*.sql'):
 if re.match(r'^\d{3}[-_]',p.name):files.append((p,'sql/'+p.name))
for name in ['audit-v150.py','prepare-v150-fixtures.py','prepare-v151-local.py','prepare-v151-anomalies.py','cleanup-v151-local-fixtures.py','verify-v151-api.mjs','verify-v151-ui.mjs','verify-v151-excel.py','pack-v151.py','verify-v151-package.py','verify-drencher-v1321-ui.mjs','verify-drencher-v151-api.mjs','verify-drencher-v151-guard.mjs','build-frontend-low-memory.mjs','Restart-VitasoussV151-ApiTests.ps1','Verify-VitasoussV151-HttpTests.ps1']:
 files.append((root/'tools'/name,'tools/'+name))
for p in (stage/'docs').rglob('*'):
 if p.is_file():files.append((p,'docs/'+p.relative_to(stage/'docs').as_posix()))
for name in ['V1.5.0-AUDIT-SQL.md','V1.5.0-INDICATEURS.md','V1.5.0-LIMITATIONS.md']:files.append((root/'docs'/name,'docs/'+name))
for name in ['README.md','CHANGELOG.md','.editorconfig','.gitignore']:files.append((root/name,name))
sources=root/f'VITASOUSS-V1.5.1-SOURCES{suffix}.zip';archive(sources,files)
print(json.dumps(dict(iis=str(iis),sources=str(sources),passed=len(results),candidate=not final,filesUpdate=len(manifest)),indent=2))
