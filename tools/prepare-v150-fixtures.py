from pathlib import Path
import subprocess,re
root=Path(__file__).resolve().parent.parent
args=[str(root/'.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe'),'--protocol=TCP','--host=127.0.0.1','--port=33307','--user=root','--default-character-set=utf8mb4','--batch','--skip-column-names']
def sql(q):
 p=subprocess.run(args,input=q.encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if p.returncode: raise RuntimeError(p.stderr.decode(errors='replace'))
 return p.stdout.decode().strip()
assert sql('SELECT @@port')=='33307'
dump=(root/'output/audit-v150/logista-audit.sql').read_text(encoding='utf-8-sig')
tables=['reception','reception_d','caisserie','typecaisse','parcelle','variete','culture','grpvar','verger','adherent','entreprise']
for suffix,station,year,factor in [('z',7816,2026,1),('d',7702,2026,1),('pz',7816,2025,.5),('pd',7702,2025,.5)]:
 db='vitasouss_test_v150_'+suffix
 if sql("SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='%s'"%db)=='1': continue
 ddl='\n'.join(re.search(r'^CREATE TABLE IF NOT EXISTS `'+t+r'` \(.*?;\s*$',dump,re.M|re.S).group() for t in tables)
 base=f"CREATE DATABASE `{db}`;USE `{db}`;SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO';"+ddl
 base+=f"INSERT INTO entreprise(refent,lier,camp,dtDebut,dtFin) VALUES('TEST','1','{year%100}-{year%100+1}','{year}-09-01','{year+1}-08-31');"
 base+="INSERT INTO culture(codcul,nomcul) VALUES(1,'AGRUMES'),(2,'LEGUMES');INSERT INTO grpvar(codgrv,nomgrv) VALUES(1,'CLEMENTINES'),(2,'TOMATES');INSERT INTO variete(codvar,nomvar,codcul,codgrv) VALUES(1,'CLEMENTINE TEST',1,1),(2,'TOMATE TEST',2,2);INSERT INTO adherent(refadh,nomadh) VALUES(1,'PRODUCTEUR TEST A'),(2,'PRODUCTEUR TEST B');INSERT INTO typecaisse(typcai,nomcai) VALUES(1,'CAISSE'),(2,'BOX');"
 base+=f"INSERT INTO verger(refver,refadh,nomver,refsta) VALUES(10,1,'VERGER TEST A',{station}),(20,2,'VERGER TEST B',{station});"
 rows=[(1,'10-15',1000,1,10),(2,'10-15',1500,2,20),(3,'10-14',2000,1,10),(4,'10-01',500,1,10),(5,'09-01',100,1,10),(6,'01-01',300,1,10),(7,'12-31',400,1,10)] if suffix in ['z','pz'] else [(1,'10-15',3000,1,10),(2,'10-14',500,1,10)]
 for number,day,weight,var,orch in rows:
  y=year+1 if day=='01-01' else year
  base+=f"INSERT INTO reception(numrec,refsta,codvar,refver,dterec,netrec,brurec,tarrec,typcai,nbrcai) VALUES({number},{station},{var},{orch},'{y}-{day}',{weight*factor},9999,111,1,100);"
 base+="INSERT INTO parcelle(refpar,numcul,refver,codvar,nbrarb,estimation) VALUES('P1',1,10,1,100,20),('AMBIG',1,10,1,100,10),('AMBIG',1,10,1,100,50),('MISSING',1,20,2,NULL,NULL);"
 base+=f"INSERT INTO reception_d(numrec,refpar,numcul,refver,refsta,pdsfru) VALUES(1,'P1',1,10,{station},600),(1,'AMBIG',1,10,{station},400);"
 base+=f"INSERT INTO caisserie(numcai,refsta,refadh,refver,dtecai,typcai,nbrcai,typmvt) VALUES(1,{station},1,10,'{year}-10-15',1,100,'E'),(2,{station},1,10,'{year}-10-15',2,200,'S');"
 if suffix=='d':base+=f"INSERT INTO reception(numrec,refsta,dterec,netrec) VALUES(99,7816,'{year}-10-15',99999);"
 base+=f"GRANT SELECT ON `{db}`.* TO 'vitasouss_test'@'127.0.0.1';"
 sql(base)
print('Four isolated synthetic databases ready; imported audit database unchanged.')
for suffix,origin in [('null','z'),('bad','d'),('pagez','z'),('paged','d')]:
 target='vitasouss_test_v150_'+suffix+'2'
 if sql("SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='%s'"%target)=='1':continue
 source='vitasouss_test_v150_'+origin
 commands=f"SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO';CREATE DATABASE `{target}`;"
 for table in tables:commands+=f'CREATE TABLE `{target}`.`{table}` LIKE `{source}`.`{table}`;INSERT INTO `{target}`.`{table}` SELECT * FROM `{source}`.`{table}`;'
 commands+=f'USE `{target}`;'
 if suffix=='null':commands+="INSERT INTO reception(numrec,refsta,codvar,refver,dterec,netrec) VALUES(100,7816,999,999,'2026-10-15',NULL),(101,7816,1,10,NULL,100);"
 if suffix=='bad':commands+="UPDATE entreprise SET camp='27-28',dtDebut='2027-09-01',dtFin='2028-08-31';"
 if suffix.startswith('page'):
  sta=7816 if origin=='z' else 7702
  commands+='INSERT INTO reception(numrec,refsta,codvar,refver,dterec,netrec) VALUES'+','.join(f"({100+i},{sta},1,10,'2026-10-15',{i})" for i in range(60))+';'
 commands+=f"GRANT SELECT ON `{target}`.* TO 'vitasouss_test'@'127.0.0.1';"
 sql(commands)
print('Null, incompatible campaign and multi-source pagination fixtures ready.')
