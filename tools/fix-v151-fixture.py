from pathlib import Path
p=Path('tools/prepare-v151-anomalies.py');s=p.read_text(encoding='utf-8');s=s.replace("input=q.encode('utf-8')", "input=(\"SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO';\"+q).encode('utf-8')")
a=s.index('if sql("SELECT COUNT(*) FROM information_schema.SCHEMATA');b=s.index("print('Fixture",a)
s=s[:a]+'''sql('CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'%target)
for table in ['entreprise','reception','caisserie','variete','verger','adherent','culture','grpvar','typecaisse','parcelle']:
 sql(f'CREATE TABLE IF NOT EXISTS `{target}`.`{table}` LIKE `{source}`.`{table}`;')
 if sql(f'SELECT COUNT(*) FROM `{target}`.`{table}`')=='0':sql(f'INSERT INTO `{target}`.`{table}` SELECT * FROM `{source}`.`{table}`;')
sql(f"UPDATE `{target}`.caisserie SET nbrcai=-10,typmvt='X' WHERE numcai=2;UPDATE `{target}`.caisserie SET refver=20 WHERE numcai=1;GRANT SELECT ON `{target}`.* TO 'vitasouss_test'@'127.0.0.1';")
''' +s[b:]
p.write_text(s,encoding='utf-8')
