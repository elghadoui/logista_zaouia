from pathlib import Path
import subprocess
root=Path(__file__).resolve().parent.parent
args=[str(root/'.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe'),'--protocol=TCP','--host=127.0.0.1','--port=33307','--user=root','--batch','--skip-column-names']
def sql(q):
 p=subprocess.run(args,input=("SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO';"+q).encode('utf-8'),capture_output=True)
 if p.returncode:raise RuntimeError(p.stderr.decode(errors='replace'))
 return p.stdout.decode('utf-8').strip()
assert sql('SELECT @@port')=='33307'
target='vitasouss_test_v151_invalid';source='vitasouss_test_v150_z'
sql('CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'%target)
for table in ['entreprise','reception','caisserie','variete','verger','adherent','culture','grpvar','typecaisse','parcelle']:
 sql(f'CREATE TABLE IF NOT EXISTS `{target}`.`{table}` LIKE `{source}`.`{table}`;')
 if sql(f'SELECT COUNT(*) FROM `{target}`.`{table}`')=='0':sql(f'INSERT INTO `{target}`.`{table}` SELECT * FROM `{source}`.`{table}`;')
sql(f"UPDATE `{target}`.caisserie SET nbrcai=-10,typmvt='X' WHERE numcai=2;UPDATE `{target}`.caisserie SET refver=20 WHERE numcai=1;GRANT SELECT ON `{target}`.* TO 'vitasouss_test'@'127.0.0.1';")
print('Fixture anomalies V1.5.1 isolée disponible.')
