from pathlib import Path
import subprocess,json
root=Path(__file__).resolve().parent.parent
cfg=json.loads((root/'backend/appsettings.Local.json').read_text(encoding='utf-8-sig'))['Admin']
assert cfg['Host']=='127.0.0.1' and cfg['Port']==33307
name=cfg['Database'];assert name=='referentiels_admin'
args=[str(root/'.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe'),'--protocol=TCP','--host=127.0.0.1','--port=33307','--user=root','--default-character-set=utf8mb4',name]
for attempt in range(2):
 for filename in ['013-context-visibility.sql','014-crate-openings-admin.sql']:
  p=subprocess.run(args,input=(root/'sql'/filename).read_bytes(),capture_output=True)
  if p.returncode:raise RuntimeError(p.stderr.decode(errors='replace'))
print('013 et 014 vérifiées deux fois dans l’administration locale uniquement ; aucune table métier modifiée.')
