"""Inspect the supplied offline dump only; never execute its SQL."""
from pathlib import Path
import zipfile,re,json,hashlib,sys,subprocess
root=Path(__file__).resolve().parent.parent
source=Path(r'F:\diafbacukup\logista_audit_20261015.sql.zip')
with zipfile.ZipFile(source) as z:
 names=[n for n in z.namelist() if n.lower().endswith('.sql')]
 assert len(names)==1
 raw=z.read(names[0])
sql=raw.decode('utf-8-sig').replace('\r','')
tables={}
for m in re.finditer(r'CREATE TABLE(?: IF NOT EXISTS)? `([^`]+)`[\s\S]*?;',sql):tables[m[1]]=m[0]
out=root/'output/audit-v160';out.mkdir(parents=True,exist_ok=True)
(out/'schema-offline.json').write_text(json.dumps(tables,ensure_ascii=False,indent=2),encoding='utf-8')
selected={'palette','palette_d','tpalette','bdq','bdq_d','dossier','transport','lotchg','emballage','destination','partenaire','pays','variete','culture','grpvar','entreprise','station','groupart','grpemb'}
if '--import-local' in sys.argv:
 db='vitasouss_test_export_audit_20261015'
 args=[str(root/'.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe'),'--protocol=TCP','--host=127.0.0.1','--port=33307','--user=root','--default-character-set=utf8mb4','--batch','--raw']
 def run(q):
  p=subprocess.run(args,input=q.encode(),capture_output=True)
  if p.returncode:raise RuntimeError(p.stderr.decode(errors='replace'))
  return p.stdout.decode('utf-8',errors='replace')
 assert run('SELECT @@port').strip().endswith('33307')
 if run("SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='"+db+"'").strip().endswith('0'):
  parts=[f'CREATE DATABASE `{db}` CHARACTER SET utf8mb4; USE `{db}`;',"SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO';"]
  for table in sorted(selected):
   assert 'ENGINE=' in tables[table],table
   parts.append(tables[table]);parts.extend(m[0] for m in re.finditer(r'^INSERT INTO `'+table+r'` .*?;\s*$',sql,re.M|re.S))
  run('\n'.join(parts))
 queries={
  'counts':' UNION ALL '.join(f"SELECT '{t}' table_name,COUNT(*) row_count FROM `{t}`" for t in sorted(selected)),
  'status':'SELECT codmaj,COUNT(*) n,MIN(dtedep) first_departure,MAX(dtedep) last_departure,SUM(dtdepsta IS NOT NULL AND dtdepsta<>0) station_departure FROM dossier GROUP BY codmaj',
  'bdq':'SELECT refsta,COUNT(*) n,COUNT(DISTINCT numdos) dossiers,SUM(nbrpal) pallets,SUM(nbrcol) packages,SUM(pdscom) commercial_kg,SUM(pdsnet) net_kg,SUM(pdspse) weighed_kg FROM bdq GROUP BY refsta',
  'palette':'SELECT COUNT(*) n,COUNT(DISTINCT numbdq) bdq,SUM(colpal) packages,SUM(pdscom) commercial_kg,SUM(pdsfru) fruit_kg,SUM(pdspes) weighed_kg FROM palette',
  'details':'SELECT COUNT(*) n,COUNT(DISTINCT numpal) palettes,SUM(nbrcol) packages,SUM(pdscom) commercial_kg,SUM(pdsfru) fruit_kg,SUM(poids) weight FROM palette_d',
  'bdq_links':'SELECT COUNT(*) n,SUM(d.numdos IS NULL) missing_dossier,SUM(d.codmaj=2) confirmed_2 FROM bdq b LEFT JOIN dossier d ON d.numdos=b.numdos',
  'palette_links':'SELECT COUNT(*) n,SUM(b.numbdq IS NULL) missing_bdq FROM palette p LEFT JOIN bdq b ON b.numbdq=p.numbdq',
 }
 result={'database':db,'host':'127.0.0.1','port':33307,'sourceSha256':hashlib.sha256(raw).hexdigest(),'queries':{}}
 for key,q in queries.items():result['queries'][key]={'sql':q,'result':run('USE '+db+'; SET TRANSACTION READ ONLY; START TRANSACTION; '+q+'; ROLLBACK;')}
 (out/'audit-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps({k:v['result'] for k,v in result['queries'].items()},ensure_ascii=True,indent=2));sys.exit(0)
for name,ddl in tables.items():
 if name in selected:print('\n'+ddl.replace('\r',''))
for name in ['vw_dossier_exp','rpt_registrechargement','vw_palette_stock','vexport','vw_exp_var']:
 for line in sql.splitlines():
  if 'VIEW' in line and ('`'+name+'`') in line:print(line[:14000])
