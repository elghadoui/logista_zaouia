"""Disable only explicitly identified V1.5.1 local HTTP fixtures. Preserve their data for inspection."""
from pathlib import Path
import json,re,subprocess
root=Path(__file__).resolve().parent.parent
cfg=json.loads((root/'backend/appsettings.Local.json').read_text(encoding='utf-8-sig'))['Admin']
assert cfg['Host']=='127.0.0.1' and cfg['Port']==33307 and re.fullmatch('[a-zA-Z0-9_]+',cfg['Database'])
databases={'vitasouss_test_dr1321_866d2e8020ba4c6f86f7751975f24396'} # The local run interrupted by login rate limiting.
for name in ['tests-v151-drencher-api.json','tests-v151-drencher-guard.json']:
 p=root/'docs'/name
 if p.exists():databases.add(json.loads(p.read_text(encoding='utf-8-sig'))['database'])
args=[str(root/'.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe'),'--protocol=TCP','--host=127.0.0.1','--port=33307','--user=root',cfg['Database']]
for database in databases:
 assert re.fullmatch('vitasouss_test_dr1321_[a-f0-9]{32}',database)
 nonce=database[-32:]
 q=f"UPDATE app_users SET enabled=0,auth_version=auth_version+1 WHERE enabled=1 AND LEFT(username,7)='dr1321_' AND RIGHT(username,32)='{nonce}';UPDATE app_contexts SET enabled=0 WHERE database_name IN ('{database}','{database}_archive');"
 r=subprocess.run(args,input=q.encode('utf-8'),capture_output=True)
 if r.returncode:raise RuntimeError(r.stderr.decode(errors='replace'))
print('Fixtures HTTP V1.5.1 désactivées ; comptes existants et données métier conservés.')
