"""Reproducible additive IIS patch and clean application source delivery. No deployment."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import json,hashlib,shutil,sys,re,datetime
root=Path(__file__).resolve().parent.parent
candidate='--candidate' in sys.argv
stage=root/'release/VITASOUSS-V1.5.0'
published=root/'publish-v150-tests'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest().upper()
def check(value,message):
 if not value:raise RuntimeError(message)
names=['service','ui','excel','drencher-ui','drencher-permissions','assistant']
if not candidate:names+=['api','drencher-api','drencher-guard']
results=[]
for name in names:
 report=read(root/f'docs/tests-v150-{name}.json')
 check(report.get('failed',0)==0 and report.get('success',True),f'Suite failed: {name}')
 for test in report['results']:
  check(test['passed'],f'Failed assertion in {name}')
  results.append(dict(suite=name,**test))
baseline=read(root/'output/audit-v150/baseline/drencher-hashes.json')
check(all(sha(root/p['path'])==p['sha256'] for p in baseline),'Drencher source conservation failed')
policy=read(root/'docs/tests-v150-drencher-permissions.json')
check(sha(published/'Vitasouss.Api.dll')==policy['assemblySha256'],'Published binary differs from tested permission binary')
old=read(root/'publish-v1321-ready/Vitasouss.Api.deps.json');new=read(published/'Vitasouss.Api.deps.json')
check({k:v for k,v in old['libraries'].items() if not k.startswith('Vitasouss.Api/')}=={k:v for k,v in new['libraries'].items() if not k.startswith('Vitasouss.Api/')},'Dependency change: additive main-DLL patch insufficient')
lock=read(root/'frontend/package-lock.json');oldlock=read(root/'release/VITASOUSS-DRENCHER-V1.3.2-SOURCES/frontend/package-lock.json')
check({k:v for k,v in lock['packages'].items() if k}=={k:v for k,v in oldlock['packages'].items() if k},'Frontend dependencies changed')
summary=dict(date=datetime.datetime.now(datetime.timezone.utc).isoformat(),version='1.5.0',drencherVersion='1.3.2.1',candidate=candidate,passed=len(results),failed=0,httpValidated=not candidate,productionAccess=False,productionDeploy=False,realDiafVerified=False,realArchivesVerified=False,assemblySha256=sha(published/'Vitasouss.Api.dll'),results=results)
(root/'docs/tests-v150-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
for part in ['update/wwwroot/assets','docs','sql']:(stage/part).mkdir(parents=True,exist_ok=True)
for name in ['Vitasouss.Api.dll','Vitasouss.Api.pdb','Vitasouss.Api.deps.json','Vitasouss.Api.runtimeconfig.json']:shutil.copy2(published/name,stage/'update'/name)
shutil.copy2(root/'frontend/dist/index.html',stage/'update/wwwroot/index.html')
assets=list((root/'frontend/dist/assets').iterdir())
check(len(assets)==2 and all(p.suffix in ['.js','.css'] for p in assets),'Unexpected frontend asset set')
old_manifest=stage/'docs/update-manifest.json'
known={v['path']:v['sha256'] for v in read(old_manifest)} if old_manifest.exists() else {}
for p in (stage/'update/wwwroot/assets').iterdir():
 if p.name not in {a.name for a in assets}:
  rel=p.relative_to(stage/'update').as_posix()
  check(p.is_file() and re.fullmatch(r'wwwroot/assets/index-[a-f0-9]+\.(js|css)',rel) and known.get(rel)==sha(p),'Unrecognized staged asset: no cleanup performed')
  check(p.resolve().is_relative_to((root/'release/VITASOUSS-V1.5.0/update/wwwroot/assets').resolve()),'Staged path outside expected release directory')
  p.unlink() # Only individually verified, previously generated staging assets; no recursive deletion.
for p in assets:shutil.copy2(p,stage/'update/wwwroot/assets'/p.name)
for p in (root/'docs').iterdir():
 if p.is_file() and (p.name.startswith('V1.5.0-') or p.name.startswith('tests-v150-')):shutil.copy2(p,stage/'docs'/p.name)
shutil.copy2(root/'sql/V1.5.0-LIRE.md',stage/'sql/V1.5.0-LIRE.md')
manifest=[dict(path=p.relative_to(stage/'update').as_posix(),sha256=sha(p)) for p in sorted((stage/'update').rglob('*')) if p.is_file()]
check(len(manifest)==7,'Unexpected stale assets in release staging; inspect without automatic deletion')
(stage/'docs/update-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(stage/'LIRE-AVANT-INSTALLATION.txt').write_text(('CANDIDAT : tests HTTP locaux restant à terminer.\n' if candidate else '')+'VITASOUSS V1.5.0 depuis V1.4.1 + Drencher V1.3.2.1 uniquement. Lire docs/V1.5.0-MISE-A-JOUR.md, AUDIT-SQL et LIMITATIONS. Aucune migration SQL, aucune permission réinitialisée, aucun déploiement automatique. Caisserie : flux vérifiés, soldes de propriété et physiques non déterminables. Estimations partielles non rattachées campagne. Configurations/IIS/secrets/keys exclus. Copie additive seulement.\n',encoding='utf-8')
def archive(path,files):
 with ZipFile(path,'w',ZIP_DEFLATED) as z:
  for source,name in files:z.write(source,name)
 with ZipFile(path) as z:
  check(z.testzip() is None,'Corrupt ZIP')
  check(not any(re.search(r'(^|/)(appsettings\.Local[^/]*|web\.config|keys|secrets|node_modules|\.env)(/|$)',n,re.I) for n in z.namelist()),'Private configuration in package')
 path.with_suffix(path.suffix+'.sha256').write_text(sha(path)+'  '+path.name+'\n',encoding='ascii')
iis=root/('VITASOUSS-V1.5.0-IIS'+('-CANDIDAT' if candidate else '')+'.zip')
archive(iis,[(p,p.relative_to(stage).as_posix()) for p in sorted(stage.rglob('*')) if p.is_file()])
# Complete application sources, not historical builds or the private imported audit dataset.
files=[]
skip={'node_modules','bin','obj','keys','secrets','logs','assistant-audit','dist','.build-low-memory','.test-v1321','.test-v150'}
for directory in ['backend','frontend','tests','sql']:
 for p in sorted((root/directory).rglob('*')):
  rel=p.relative_to(root)
  if not p.is_file() or any(part in skip or part.startswith('.test-') for part in rel.parts):continue
  if p.name.startswith('appsettings') and p.name!='appsettings.json':continue
  if p.name in ['web.config','tsconfig.tsbuildinfo','vite.low-memory.config.ts'] or p.name.startswith('.env') or p.suffix in ['.log','.zip','.protected','.pfx','.user']:continue
  files.append((p,rel.as_posix()))
for name in ['audit-v150.py','prepare-v150-fixtures.py','verify-v150-api.mjs','verify-v150-ui.mjs','verify-v150-excel.py','pack-v150.py','verify-v150-package.py','finalize-v150-docs.py','verify-drencher-v1321-ui.mjs','verify-drencher-v1321-api.mjs','verify-drencher-v1321-final-api.mjs','verify-drencher-v150-api.mjs','verify-drencher-v150-guard.mjs','build-frontend-low-memory.mjs','Start-VitasoussV150-ApiTests.ps1']:
 files.append((root/'tools'/name,'tools/'+name))
for p in (stage/'docs').iterdir():
 if p.is_file():files.append((p,'docs/'+p.name))
for name in ['README.md','CHANGELOG.md','.editorconfig','.gitignore']:files.append((root/name,name))
sources=root/'VITASOUSS-V1.5.0-SOURCES.zip';archive(sources,files)
print(json.dumps(dict(iis=str(iis),sources=str(sources),passed=len(results),candidate=candidate,filesUpdate=len(manifest)),indent=2))
