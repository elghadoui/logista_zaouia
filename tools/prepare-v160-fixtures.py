"""Synthetic local fixtures only. No DROP, no production connections, no audit row changes."""
from pathlib import Path
import subprocess,re
root=Path(__file__).resolve().parent.parent
mysql=root/'.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe'
args=[str(mysql),'--protocol=TCP','--host=127.0.0.1','--port=33307','--user=root','--batch','--raw','--skip-column-names','--default-character-set=utf8mb4']
def run(q):
 p=subprocess.run(args,input=q.encode(),capture_output=True)
 if p.returncode:raise RuntimeError(p.stderr.decode(errors='replace'))
 return p.stdout.decode().strip()
assert run('SELECT @@port')=='33307'
source='vitasouss_test_export_audit_20261015'
tables=run("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='"+source+"' AND TABLE_TYPE='BASE TABLE'").splitlines()
assert len(tables)==19 and all(re.fullmatch('[a-z_]+',t) for t in tables)
run(f"GRANT SELECT ON `{source}`.* TO 'vitasouss_test'@'127.0.0.1'")
for name in ['z','d','pz','pd','null','ambiguous','page','confirmed','official_null','confirmed_d','confirmed_pz','confirmed_pd','status_null']:
 db='vitasouss_test_export_v160_'+name
 if run("SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='"+db+"'")=='0':
  sql=f"CREATE DATABASE `{db}` CHARACTER SET utf8mb4; USE `{db}`; SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO';\n"
  sql+='\n'.join(f'CREATE TABLE `{t}` LIKE `{source}`.`{t}`; INSERT INTO `{t}` SELECT * FROM `{source}`.`{t}`;' for t in tables)
  if name in ['d','pd','confirmed_d','confirmed_pd']:sql+='UPDATE bdq SET refsta=7702;'
  if name in ['pz','pd','confirmed_pz','confirmed_pd']:sql+="UPDATE entreprise SET dtDebut='2025-09-01',dtFin='2026-08-31',camp='25-26'; UPDATE dossier SET dtedep=DATE_SUB(dtedep,INTERVAL 1 YEAR),dtdepsta=DATE_SUB(dtdepsta,INTERVAL 1 YEAR);"
  if name in ['confirmed','official_null','confirmed_d','confirmed_pz','confirmed_pd','status_null']:
   sql+='UPDATE dossier SET codmaj=CASE numdos WHEN 1 THEN 2 WHEN 2 THEN 1 WHEN 3 THEN 0 ELSE 9 END;'
   sql+='INSERT INTO bdq(numbdq,refsta,numdos,codtyp,codvar,nbrpal,nbrcol,pdsnet,pdscom,pdspse) SELECT 100,refsta,numdos,codtyp,codvar,1,2,10,11,12 FROM bdq WHERE numbdq=1;'
   if name=='status_null':sql+='UPDATE dossier SET codmaj=NULL WHERE numdos=4;'
   if name=='official_null':sql+='UPDATE bdq SET pdscom=NULL WHERE numbdq=1;'
  if name=='null':sql+='UPDATE bdq SET pdsnet=NULL,nbrpal=-1 WHERE numbdq=1;'
  if name=='ambiguous':sql+='INSERT INTO bdq(numbdq,refsta,numdos) VALUES(1,7702,1);'
  if name=='z':sql+='INSERT INTO bdq(numbdq,refsta,numdos,nbrpal,nbrcol,pdsnet,pdscom,pdspse) VALUES(99999,7702,1,999,999,999999,999999,999999);'
  if name=='page':sql+=''.join(f'INSERT INTO bdq(numbdq,refsta,numdos,codtyp,codvar,nbrpal,nbrcol,pdsnet,pdscom,pdspse) SELECT {i},refsta,numdos,codtyp,codvar,1,2,10,11,12 FROM bdq WHERE numbdq=1;' for i in range(100,130))
  run(sql)
 run(f"GRANT SELECT ON `{db}`.* TO 'vitasouss_test'@'127.0.0.1'")
 print('READY '+db)
