// Extrait uniquement des DDL et INSERT des tables vérifiées. Ne lance aucune connexion SQL.
import { readFileSync, writeFileSync } from 'node:fs';
const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: node tools/prepare-local-copy.mjs dump.sql sortie.sql');
const dump = readFileSync(input, 'utf8');
const tables = ['adherent', 'verger', 'parcelle', 'culture', 'grpvar', 'variete', 'souvar', 'station', 'reception', 'palbrut', 'versement'];
const source = 'vitasouss_test_zaouia_v1'; const target = 'vitasouss_test_diaf_v1';
const sql = ['SET NAMES utf8mb4;', "SET SESSION sql_mode='NO_AUTO_VALUE_ON_ZERO';", `CREATE DATABASE IF NOT EXISTS ${source} CHARACTER SET utf8 COLLATE utf8_bin;`, `USE ${source};`];
function statement(start) {
  let quote = null;
  for (let i = start; i < dump.length; i++) {
    const c = dump[i];
    if (quote) {
      if (c === '\\') { i++; continue; }
      if (c === quote) { if (dump[i + 1] === quote) i++; else quote = null; }
    } else if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c === ';') return dump.slice(start, i + 1);
  }
  throw new Error('Instruction SQL non terminée');
}
for (const table of tables) {
  const ddl = new RegExp('CREATE TABLE IF NOT EXISTS `' + table + '` \\(').exec(dump);
  if (!ddl) throw new Error(`DDL absent: ${table}`);
  sql.push(statement(ddl.index));
  const inserts = new RegExp('^INSERT INTO `' + table + '` ', 'gm');
  let match;
  while ((match = inserts.exec(dump))) sql.push(statement(match.index));
}
sql.push(`CREATE DATABASE IF NOT EXISTS ${target} CHARACTER SET utf8 COLLATE utf8_bin;`);
for (const table of tables.slice(0, 8)) {
  sql.push(`CREATE TABLE IF NOT EXISTS ${target}.${table} LIKE ${source}.${table};`);
  sql.push(`INSERT INTO ${target}.${table} SELECT * FROM ${source}.${table};`);
}
// Différence locale intentionnelle uniquement dans la copie de test, pour vérifier sa conservation.
sql.push(`UPDATE ${target}.verger SET refsta=1234;`);
writeFileSync(output, sql.join('\n'), 'utf8');
console.log('Copie locale préparée : ' + source + ' / ' + target + '. Aucun DROP, DELETE ou appel réseau.');
