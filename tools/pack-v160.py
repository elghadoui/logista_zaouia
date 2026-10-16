"""Build local candidate archives. Does not deploy, connect to a VM or execute SQL."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import json,hashlib,re,shutil,datetime
root=Path(__file__).resolve().parent.parent
published=root/'publish-v160-candidate';stage=root/'release/VITASOUSS-V1.6.0-CANDIDAT'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest().upper()
def ensure(ok,message):
 if not ok:raise RuntimeError(message)
suites=['export','ui','excel','regression-analytics','regression-drencher','regression-ui'];results=[]
for suite in suites:
 r=read(root/f'docs/tests-v160-{suite}.json');ensure(r.get('success',True) and r.get('failed',0)==0,'Failed '+suite)
 for test in r['results']:
  ensure(test['passed'],'Failed assertion '+suite);results.append(dict(suite=suite,**test))
ensure(sha(published/'Vitasouss.Api.dll')==read(root/'docs/tests-v160-export.json')['assemblySha256'],'Published assembly was not tested')
ensure(all(sha(root/v['path'])==v['sha256'] for v in read(root/'output/audit-v150/baseline/drencher-hashes.json')),'Drencher source changed')
old=read(root/'publish-v151-candidate/Vitasouss.Api.deps.json');new=read(published/'Vitasouss.Api.deps.json')
ensure({k:v for k,v in old['libraries'].items() if not k.startswith('Vitasouss.Api/')}=={k:v for k,v in new['libraries'].items() if not k.startswith('Vitasouss.Api/')},'Backend dependencies changed')
with ZipFile(root/'VITASOUSS-V1.5.1-SOURCES-CANDIDAT.zip') as baseline:
 oldlock=json.loads(baseline.read('frontend/package-lock.json'));newlock=read(root/'frontend/package-lock.json')
 ensure({k:v for k,v in oldlock['packages'].items() if k}=={k:v for k,v in newlock['packages'].items() if k},'Frontend dependencies changed')
 preserved=[n for n in baseline.namelist() if n.startswith('sql/') or n.startswith('backend/Application/Assistant') or n in ['backend/Application/PermissionService.cs','backend/Infrastructure/Connections.cs','frontend/src/AnalyticsDashboard.tsx']]
 ensure(all((root/n).read_bytes()==baseline.read(n) for n in preserved),'Existing security, business, Assistant or SQL sources changed')
summary=dict(date=datetime.datetime.now(datetime.timezone.utc).isoformat(),version='1.6.0',drencherVersion='1.3.2.1',candidate=True,passed=len(results),failed=0,productionAccess=False,productionDeploy=False,visualValidated=False,realDiafVerified=False,realArchivesVerified=False,businessDefinitionProvisional=False,assemblySha256=sha(published/'Vitasouss.Api.dll'),results=results)
(root/'docs/tests-v160-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
counts={s:sum(t['suite']==s for t in results) for s in suites}
report='# VITASOUSS V1.6.0 — Rapport de tests\n\nStatut : CANDIDAT, règles métier confirmées (codmaj 2, bdq.pdscom, client destination.vildes). Aucun déploiement.\n\n'
report+='| Suite exécutée | Assertions réussies |\n|---|---:|\n'+''.join(f'| {s} | {n} |\n' for s,n in counts.items())+f'| Total | {len(results)} |\n\n'
report+='''Backend .NET 10 Release, TypeScript et frontend de production compilés. Tests MySQL 5.7.44 sur 127.0.0.1:33307 seulement. Les assertions Export incluent les calculs, droits, filtre calibre, périodes ISO, consolidation, archives synthétiques, anomalies, pagination, Excel et HTTP. Le test HTTP ouvre un Kestrel éphémère loopback avec les vrais endpoints/services; identités synthétiques uniquement dans le harnais de test. Il ne revendique pas un test de connexion cookie dans le site complet. L’API locale déjà ouverte n’est ni arrêtée ni remplacée.

Les exports service et HTTP sont relus avec openpyxl : audit réel : 4 lignes codmaj 0, aucun export officiel; poids secondaires 21158.40 kg nets, 21858 kg commerciaux tous statuts. Fixture clôturée : deux BDQ, un dossier, 7739 kg commerciaux officiels, 9 palettes et 3362 colis; dates numériques, colonnes séparées et aucune formule. Les empreintes des quatre tables audit sont inchangées après tests. Les contextes/comptes de test sont désactivés en fin de suite; aucune suppression de base.

La régression Réceptions/Caisserie a été réexécutée car le générateur XLSX reçoit des arguments optionnels supplémentaires. Ses 73 contrôles et les 34 contrôles de rendu React passent. Drencher : 67 tests de politique sur l’assembly courant, sources/PDF/SQL010/011 identiques aux empreintes de référence. Les sources Assistant et les permissions/connexions existantes sont identiques à V1.5.1; aucune requête OpenAI réelle. Les dépendances restent identiques. Alertes NuGet NU1902/NU1903 Pkcs 8.0.1 préexistantes conservées, sans changement de dépendance.

## Limites de validation

- Règles confirmées appliquées : codmaj 0/1/2, autres inconnus; officiel bdq.pdscom et client destination.vildes. dtedep est une date enregistrée, sans preuve physique de départ. Le poids brut reste indisponible. Avec filtre calibre, poids officiel non ventilé : NULL, aucun prorata.
- ZAOUIA : données de la copie fournie. DIAF et archives : fixtures synthétiques, pas des validations de campagnes réelles.
- Rendu React testé en SSR, pas de revue navigateur interactive ni captures fabriquées. Responsive et thèmes préparés; vérification réelle bureau/tablette/mobile encore nécessaire.
- Pas de test IIS, NTFS, session cookie complète ni charge de production. Aucun accès VM, aucune migration nouvelle, aucun déploiement.
'''
(root/'docs/V1.6.0-TESTS.md').write_text(report,encoding='utf-8')
for name in ['update/wwwroot/assets','docs','sql']:(stage/name).mkdir(parents=True,exist_ok=True)
for name in ['Vitasouss.Api.dll','Vitasouss.Api.pdb','Vitasouss.Api.deps.json','Vitasouss.Api.runtimeconfig.json']:shutil.copy2(published/name,stage/'update'/name)
shutil.copy2(root/'frontend/dist-v160/index.html',stage/'update/wwwroot/index.html')
assets=list((root/'frontend/dist-v160/assets').iterdir());ensure(len(assets)==2 and {p.suffix for p in assets}=={'.js','.css'},'Unexpected frontend assets')
oldmanifest=stage/'docs/update-manifest.json';known={v['path']:v['sha256'] for v in read(oldmanifest)} if oldmanifest.exists() else {}
for p in (stage/'update/wwwroot/assets').iterdir():
 if p.name not in {a.name for a in assets}:
  rel=p.relative_to(stage/'update').as_posix();ensure(p.is_file() and p.resolve().is_relative_to((stage/'update/wwwroot/assets').resolve()) and known.get(rel)==sha(p),'Unknown staging asset; no deletion performed');p.unlink()
for p in assets:shutil.copy2(p,stage/'update/wwwroot/assets'/p.name)
for p in (root/'docs').iterdir():
 if p.is_file() and (p.name.startswith('V1.6.0-') or p.name.startswith('tests-v160-')):shutil.copy2(p,stage/'docs'/p.name)
manifest=[dict(path=p.relative_to(stage/'update').as_posix(),sha256=sha(p)) for p in sorted((stage/'update').rglob('*')) if p.is_file()];ensure(len(manifest)==7,'Unexpected update files')
oldmanifest.write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(stage/'sql/LIRE.txt').write_text('Aucune nouvelle migration SQL pour V1.6.0. Base requise V1.5.1 avec SQL013/014 déjà appliqués. Ne pas relancer les migrations Drencher.\n',encoding='utf-8')
(stage/'LIRE-AVANT-INSTALLATION.txt').write_text('CANDIDAT V1.6.0 depuis V1.5.1. Règles confirmées : codmaj=2, bdq.pdscom, Client destination.vildes. Lire docs/V1.6.0-AUDIT-EXPORT.md et MISE-A-JOUR.md. Copie additive update/ uniquement après autorisation. Configurations, secrets, web.config, clés et PDF exclus. Aucun déploiement automatique.\n',encoding='utf-8')
def archive(path,files):
 with ZipFile(path,'w',ZIP_DEFLATED) as z:
  for p,name in files:z.write(p,name)
 with ZipFile(path) as z:
  ensure(z.testzip() is None,'Corrupt ZIP');ensure(not any(re.search(r'(^|/)(appsettings\.Local[^/]*|web\.config|keys|secrets|node_modules|\.env)(/|$)',n,re.I) for n in z.namelist()),'Private path in ZIP')
 path.with_suffix(path.suffix+'.sha256').write_text(sha(path)+'  '+path.name+'\n',encoding='ascii')
iis=root/'VITASOUSS-V1.6.0-IIS-CANDIDAT.zip';archive(iis,[(p,p.relative_to(stage).as_posix()) for p in sorted(stage.rglob('*')) if p.is_file()])
files=[];skip={'node_modules','bin','obj','keys','secrets','logs','assistant-audit','dist','dist-v160','.build-low-memory'}
for directory in ['backend','frontend','tests']:
 for p in sorted((root/directory).rglob('*')):
  rel=p.relative_to(root)
  if not p.is_file() or any(part in skip or part.startswith('.test-') for part in rel.parts):continue
  if directory=='backend' and 'wwwroot' in rel.parts:continue
  if p.name.startswith('appsettings') and p.name!='appsettings.json':continue
  if p.name in ['web.config','tsconfig.tsbuildinfo','vite.low-memory.config.ts'] or p.name.startswith('.env') or p.suffix in ['.log','.zip','.protected','.pfx','.user']:continue
  files.append((p,rel.as_posix()))
for p in (root/'frontend/dist-v160').rglob('*'):
 if p.is_file():files.append((p,'backend/wwwroot/'+p.relative_to(root/'frontend/dist-v160').as_posix()))
for p in (root/'sql').glob('*.sql'):
 if re.match(r'^\d{3}[-_]',p.name):files.append((p,'sql/'+p.name))
for name in ['audit-v160-export.py','prepare-v160-fixtures.py','verify-v160-ui.mjs','verify-v160-excel.py','pack-v160.py','verify-v160-package.py','build-frontend-low-memory.mjs']:files.append((root/'tools'/name,'tools/'+name))
for p in (stage/'docs').rglob('*'):
 if p.is_file():files.append((p,'docs/'+p.relative_to(stage/'docs').as_posix()))
for name in ['README.md','CHANGELOG.md','.editorconfig','.gitignore']:files.append((root/name,name))
sources=root/'VITASOUSS-V1.6.0-SOURCES-CANDIDAT.zip';archive(sources,files)
print(json.dumps(dict(iis=str(iis),sources=str(sources),passed=len(results),candidate=True,filesUpdate=len(manifest)),indent=2))
