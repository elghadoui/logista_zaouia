"""Local, allowlisted extraction; never execute the HeidiSQL dump directly."""
from pathlib import Path
import re, subprocess, json, hashlib
root=Path(__file__).resolve().parent.parent
source=root/'output/audit-v150/logista-audit.sql'
text=source.read_text(encoding='utf-8-sig')
database='vitasouss_test_audit_20261015'
mysql=root/'.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe'
args=[str(mysql),'--protocol=TCP','--host=127.0.0.1','--port=33307','--user=root','--default-character-set=utf8mb4','--batch','--raw']
def run(sql):
 p=subprocess.run(args,input=sql.encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if p.returncode: raise RuntimeError(p.stderr.decode(errors='replace'))
 return p.stdout.decode('utf-8',errors='replace')
assert run('SELECT @@port').strip().endswith('33307')
tables=['reception','reception_d','reception_t','caisserie','typecaisse','parcelle','variete','culture','grpvar','verger','adherent','entreprise','station']
exists=run("SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='%s'"%database).strip().endswith('1')
if not exists:
 parts=[f'CREATE DATABASE `{database}` CHARACTER SET utf8mb4; USE `{database}`;',"SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO';"]
 for table in tables:
  ddl=re.search(r'^CREATE TABLE IF NOT EXISTS `'+table+r'` \(.*?;\s*$',text,re.M|re.S)
  if not ddl: raise RuntimeError('Missing DDL '+table)
  parts.append(ddl.group())
  parts.extend(m.group() for m in re.finditer(r'^INSERT INTO `'+table+r'` .*?;\s*$',text,re.M|re.S))
 run('\n'.join(parts))
queries={
 'counts':' UNION ALL '.join(f"SELECT '{t}' table_name,COUNT(*) rows_count FROM `{t}`" for t in tables),
 'campaign':'SELECT refsta1,refsta2,camp,dtDebut,dtFin,lier FROM entreprise',
 'stations':'SELECT refsta,nomsta FROM station',
 'receptions':'SELECT refsta,COUNT(*) lots,MIN(dterec) first_day,MAX(dterec) last_day,SUM(netrec) net_kg,SUM(netrec IS NULL) missing_net,SUM(dterec IS NULL OR dterec=0) missing_date,SUM(ABS(netrec-(brurec-tarrec))>0.01) unequal_gross_tare FROM reception GROUP BY refsta',
 'movements':'SELECT refsta,typmvt,typcai,COUNT(*) movements,SUM(nbrcai) crates,SUM(numrec<>0) linked_reception,SUM(numtrf<>0) linked_transfer,SUM(refadh IS NULL OR refadh=0) missing_adherent,MIN(dtecai) first_day,MAX(dtecai) last_day FROM caisserie GROUP BY refsta,typmvt,typcai',
 'crate_types':'SELECT * FROM typecaisse',
 'movement_link':'SELECT c.typmvt,COUNT(*) movements,SUM(c.refadh<>v.refadh) different_adherent,SUM(c.typcai<>r.typcai) different_type,SUM(c.nbrcai=r.nbrcai) equal_crates,SUM(c.nbrcai=r.nbrcailiv) equal_delivered_crates FROM caisserie c JOIN reception r ON r.numrec=c.numrec LEFT JOIN verger v ON v.refver=r.refver GROUP BY c.typmvt',
 'parcels':'SELECT COUNT(*) parcels,SUM(nbrarb>0 AND estimation>0) usable,SUM(CASE WHEN nbrarb>0 AND estimation>0 THEN nbrarb*estimation END) estimated_kg,MIN(estimation) min_kg_tree,MAX(estimation) max_kg_tree FROM parcelle',
 'parcel_ambiguity':'SELECT COUNT(*) ambiguous_identities FROM (SELECT refver,refpar,numcul,COUNT(*) n FROM parcelle GROUP BY refver,refpar,numcul HAVING n>1) x',
 'detail_coverage':'SELECT COUNT(DISTINCT r.numrec) lots,COUNT(*) detail_rows,SUM(d.pdsfru) detail_kg FROM reception r JOIN reception_d d ON d.numrec=r.numrec',
 'orphans':'SELECT SUM(v.refver IS NULL) missing_orchard,SUM(a.refadh IS NULL) missing_producer,SUM(t.codvar IS NULL) missing_variety,SUM(r.refverreel IS NOT NULL AND r.refverreel<>0 AND r.refverreel<>r.refver) declared_differs_real FROM reception r LEFT JOIN verger v ON v.refver=r.refver LEFT JOIN adherent a ON a.refadh=v.refadh LEFT JOIN variete t ON t.codvar=r.codvar',
 'real_orphans':'SELECT COUNT(*) missing_real_orchard FROM reception r LEFT JOIN verger v ON v.refver=r.refverreel WHERE r.refverreel>0 AND v.refver IS NULL',
 'indexes':"SELECT TABLE_NAME,INDEX_NAME,NON_UNIQUE,GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) columns_list FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() GROUP BY TABLE_NAME,INDEX_NAME,NON_UNIQUE",
}
result={'database':database,'host':'127.0.0.1','port':33307,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'queries':{}}
for key,sql in queries.items(): result['queries'][key]={'sql':sql,'result':run(f'USE `{database}`;'+sql)}
out=root/'output/audit-v150/audit-results.json'
out.write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8')
print(json.dumps({k:v['result'] for k,v in result['queries'].items() if k!='indexes'},ensure_ascii=False,indent=2))
