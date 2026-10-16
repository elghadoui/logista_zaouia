import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
const base = process.env.VITASOUSS_TEST_URL ?? 'http://127.0.0.1:5080/api';
if (!/^http:\/\/127\.0\.0\.1:\d+\/api$/.test(base) || !process.env.VITASOUSS_TEST_PASSWORD || !process.env.VITASOUSS_TEST_MYSQL_PASSWORD) throw Error('Tests locaux et secrets temporaires obligatoires');
const mysql = path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
function sql(query, root = false) { return execFileSync(mysql, ['--host=127.0.0.1', '--port=33307', `--user=${root ? 'root' : 'vitasouss_test'}`, '--batch', '--skip-column-names', '--execute', (root ? "SET SESSION sql_mode=''; " : '') + query], { encoding: 'utf8', env: { ...process.env, MYSQL_PWD: root ? '' : process.env.VITASOUSS_TEST_MYSQL_PASSWORD } }).trim(); }
const results = [];
function check(name, condition) { assert.ok(condition, name); results.push({ name, passed: true }); console.log('PASS ' + name); }
async function login(username) { const r = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: process.env.VITASOUSS_TEST_PASSWORD }) }); assert.equal(r.status, 200); const data = await r.json(); return { cookie: r.headers.get('set-cookie').split(';')[0], csrf: data.csrf }; }
const admin = await login('admin');
async function call(uri, method = 'GET', body, actor = admin, csrf = true) { const r = await fetch(base + uri, { method, headers: { Cookie: actor.cookie, 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': actor.csrf } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) }); return { status: r.status, data: await r.json() }; }
async function ok(...args) { const r = await call(...args); assert.equal(r.status, 200, JSON.stringify(r.data)); return r.data; }
const contextList = await ok('/contexts'), archive = contextList.find(c => c.databaseName === 'vitasouss_test_zaouia' && c.readOnly);
const configuration = await ok('/admin/configuration');
const catalog = await ok('/catalog');
const key = (name, row) => Object.fromEntries(catalog.find(e => e.name === name).keys.map(k => [k, row[k]]));
const currentReceiptCount = sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.reception_d');
const db = 'vitasouss_test_v121_' + Date.now();
assert.match(db, /^vitasouss_test_v121_\d+$/);
assert.equal(sql(`SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${db}'`), '0');
// Préparation d'une NOUVELLE copie isolée. Aucune donnée reception_d existante n'est modifiée.
sql(`CREATE DATABASE ${db} CHARACTER SET latin1`, true);
for (const table of sql('SHOW TABLES FROM vitasouss_test_zaouia_v1', true).split(/\r?\n/)) {
  assert.match(table, /^[a-zA-Z0-9_]+$/);
  sql(`CREATE TABLE ${db}.${table} LIKE vitasouss_test_zaouia_v1.${table}; INSERT INTO ${db}.${table} SELECT * FROM vitasouss_test_zaouia_v1.${table}`, true);
}
sql(`INSERT INTO ${db}.adherent(refadh,nomadh) VALUES(32021,'V121 propriétaire'),(32022,'V121 libre'),(32023,'V121 autre référence');
INSERT INTO ${db}.verger(refver,nomver,refadh,refsta) VALUES ${Array.from({ length: 10 }, (_, i) => `(${32021 + i},'V121 verger ${i}',32021,7816)`).join(',')};
INSERT INTO ${db}.parcelle(refpar,numcul,refver,codvar,codsvar,suppar) VALUES('V121BLOCK',999,32021,104,21,1),('V121FREE1',999,32022,104,21,2),('V121FREE2',999,32022,104,21,3),('V121MIX',999,32021,104,21,4),('V121BLOCK',998,32022,104,21,5),('V121BLOCK',999,32023,104,21,6);
INSERT INTO ${db}.reception_d(numrec,refpar,numcul,refver,refsta) VALUES(2000001211,'V121BLOCK',999,32021,1234),(2000001212,'V121BLOCK',999,32021,7702);
CREATE TABLE ${db}.v121_refadh_guard(id INT PRIMARY KEY,refadh SMALLINT); INSERT INTO ${db}.v121_refadh_guard VALUES(1,32023);
GRANT SELECT,LOCK TABLES ON ${db}.* TO 'vitasouss_test'@'127.0.0.1';
GRANT INSERT,UPDATE,DELETE ON ${db}.parcelle TO 'vitasouss_test'@'127.0.0.1';
GRANT INSERT,UPDATE,DELETE ON ${db}.verger TO 'vitasouss_test'@'127.0.0.1';
GRANT INSERT,UPDATE,DELETE ON ${db}.adherent TO 'vitasouss_test'@'127.0.0.1';`, true);
const receiptImage = () => sql(`SELECT CONCAT_WS('|',numrec,refpar,numcul,refver,refsta,typcai,nbrcai,pdsfru,certif) FROM ${db}.reception_d ORDER BY numrec`, true);
const receiptsBefore = receiptImage();
await ok('/admin/contexts', 'POST', { stationId: configuration.stations.find(s => s.code === 'ZAOUIA').id, databaseName: db, label: 'TEST ISOLÉ V1.2.1', readOnly: false, localRefsta: 7816 });
const context = (await ok('/contexts')).find(c => c.databaseName === db), pre = `/contexts/${context.id}`;
const actors = {}, users = [];
const record = async (name, row) => ok(`${pre}/entities/${name}/record?key=${encodeURIComponent(JSON.stringify(key(name, row)))}`);
const removeBody = (name, row) => ({ key: key(name, row), before: row, confirmation: 'SUPPRIMER' });
const preview = (name, row) => ok(`${pre}/entities/${name}/delete-preview?key=${encodeURIComponent(JSON.stringify(key(name, row)))}`);
const batch = (name, rows, actor = admin) => call(`${pre}/entities/${name}/delete-batch`, 'POST', { confirmation: 'SUPPRIMER', items: rows.map(r => removeBody(name, r)) }, actor);
try {
  for (const role of ['Consultation', 'Gestionnaire']) {
    const username = 'v121_' + role.toLowerCase();
    let user = (await ok('/admin/configuration')).users.find(u => u.username === username);
    if (!user) { await ok('/admin/users', 'POST', { username, displayName: 'Validation V121 ' + role, role, password: process.env.VITASOUSS_TEST_PASSWORD, contextIds: [context.id] }); user = (await ok('/admin/configuration')).users.find(u => u.username === username); }
    else await ok(`/admin/users/${user.id}/access`, 'PUT', { role, enabled: true, contextIds: [context.id] });
    users.push({ id: user.id, role }); actors[role] = await login(username);
  }
  check('Version livrée 1.2.1', (await ok('/health')).version === (process.env.VITASOUSS_EXPECTED_VERSION ?? '1.2.1'));
  const rows = (await ok(pre + '/entities/parcelle?search=V121&pageSize=100')).rows;
  const blocked = await record('parcelle', rows.find(r => r.refpar === 'V121BLOCK' && r.refver === 32021));
  const sameCultureOther = await record('parcelle', rows.find(r => r.refpar === 'V121BLOCK' && r.refver === 32022));
  const sameVergerOther = await record('parcelle', rows.find(r => r.refpar === 'V121BLOCK' && r.refver === 32023));
  const blockedPreview = await preview('parcelle', blocked);
  check('Réceptions : tuple complet et 2 références toutes stations', !blockedPreview.canDelete && blockedPreview.dependencies.find(d => d.table === 'reception_d').count === 2);
  check('Message métier réceptions compréhensible', blockedPreview.reason.includes('réceptions'));
  check('Même refpar, autre culture : suppression autorisée', (await preview('parcelle', sameCultureOther)).canDelete);
  check('Même refpar et culture, autre verger : suppression autorisée', (await preview('parcelle', sameVergerOther)).canDelete);
  check('API directe : parcelle réception refusée', (await call(pre + '/entities/parcelle/delete', 'POST', removeBody('parcelle', blocked))).status === 409);
  check('Parcelle protégée conservée', (await record('parcelle', blocked)).idparcelle === blocked.idparcelle);
  check('Parcelle libre : suppression individuelle autorisée', (await ok(pre + '/entities/parcelle/delete', 'POST', removeBody('parcelle', sameCultureOther), actors.Gestionnaire)).status === 'Applied');
  const free = await Promise.all(rows.filter(r => r.refpar.startsWith('V121FREE')).map(r => record('parcelle', r)));
  check('Lot : clés en double refusées', (await batch('parcelle', [free[0], free[0]])).status === 400);
  check('Lot : vide refusé', (await batch('parcelle', [])).status === 400);
  check('Lot : items null refusés', (await call(pre + '/entities/parcelle/delete-batch', 'POST', { confirmation: 'SUPPRIMER', items: null })).status === 400);
  check('Précontrôle : clés null refusées', (await call(pre + '/entities/parcelle/delete-batch-preview', 'POST', { keys: null })).status === 400);
  check('Lot : adhérents interdits', (await batch('adherent', [await record('adherent', { refadh: 32022 })])).status === 409);
  check('Lot : 26 lignes refusées', (await call(pre + '/entities/parcelle/delete-batch-preview', 'POST', { keys: Array.from({ length: 26 }, (_, i) => ({ ...key('parcelle', free[0]), idparcelle: i + 100000 })) })).status === 400);
  check('Lot : Consultation refusée', (await batch('parcelle', free, actors.Consultation)).status === 403);
  check('Précontrôle : Consultation refusée', (await call(pre + '/entities/parcelle/delete-batch-preview', 'POST', { keys: free.map(r => key('parcelle', r)) }, actors.Consultation)).status === 403);
  check('Lot : archive refusée', (await call(`/contexts/${archive.id}/entities/parcelle/delete-batch`, 'POST', { confirmation: 'SUPPRIMER', items: free.map(r => removeBody('parcelle', r)) })).status === 403);
  check('Lot : CSRF requis', (await call(pre + '/entities/parcelle/delete-batch', 'POST', { confirmation: 'SUPPRIMER', items: free.map(r => removeBody('parcelle', r)) }, admin, false)).status === 403);
  check('Lot : confirmation requise', (await call(pre + '/entities/parcelle/delete-batch', 'POST', { confirmation: '', items: free.map(r => removeBody('parcelle', r)) })).status === 400);
  const reviewed = await ok(pre + '/entities/parcelle/delete-batch-preview', 'POST', { keys: free.map(r => key('parcelle', r)) });
  check('Précontrôle : snapshots complets par fiche', reviewed.every(p => p.before.idparcelle && p.inspection.canDelete));
  const all = await batch('parcelle', free, actors.Gestionnaire);
  check('Lot 100 % libre : 2 suppressions confirmées', all.status === 200 && all.data.deleted === 2 && all.data.refused === 0 && all.data.unconfirmed === 0);
  check('Lot libre : données réellement supprimées', sql(`SELECT COUNT(*) FROM ${db}.parcelle WHERE refpar IN('V121FREE1','V121FREE2')`) === '0');
  const mix = await record('parcelle', rows.find(r => r.refpar === 'V121MIX'));
  const mixed = await batch('parcelle', [blocked, mix]);
  check('Lot mixte : 1 supprimée, 1 refusée', mixed.status === 200 && mixed.data.deleted === 1 && mixed.data.refused === 1);
  check('Lot mixte : raison et clé exactes', mixed.data.items.find(i => i.status === 'Refused').key.idparcelle === blocked.idparcelle && mixed.data.items.find(i => i.status === 'Refused').message.includes('reception_d : 2'));
  check('Lot mixte : protégé conservé, libre supprimé', sql(`SELECT COUNT(*) FROM ${db}.parcelle WHERE idparcelle=${blocked.idparcelle}`) === '1' && sql(`SELECT COUNT(*) FROM ${db}.parcelle WHERE idparcelle=${mix.idparcelle}`) === '0');
  const refusedOnly = await batch('parcelle', [blocked]);
  check('Lot entièrement protégé : résultat explicite sans suppression', refusedOnly.status === 200 && refusedOnly.data.refused === 1 && refusedOnly.data.deleted === 0);
  const owner = await record('verger', { refver: 32021 }), empty = await record('verger', { refver: 32024 });
  const vlot = await batch('verger', [owner, empty], actors.Gestionnaire);
  check('Vergers : lot partiel sans cascade', vlot.status === 200 && vlot.data.deleted === 1 && vlot.data.refused === 1 && sql(`SELECT COUNT(*) FROM ${db}.parcelle WHERE refver=32021`) === '1');
  const vfree = await Promise.all([32025,32026].map(refver => record('verger', { refver })));
  const vfreeResult = await batch('verger', vfree);
  check('Vergers : lot entièrement libre supprimé', vfreeResult.status === 200 && vfreeResult.data.deleted === 2 && vfreeResult.data.refused === 0);
  const stale = await record('verger', { refver: 32028 }), fresh = await record('verger', { refver: 32029 });
  sql(`UPDATE ${db}.verger SET nomver='V121 modifié après aperçu' WHERE refver=32028`);
  const staleLot = await batch('verger', [stale, fresh]);
  check('Snapshot obsolète : refus individuel, lot poursuit', staleLot.data.refused === 1 && staleLot.data.deleted === 1 && staleLot.data.items[0].message.includes('changé'));
  const producteur = await record('adherent', { refadh: 32021 }), libre = await record('adherent', { refadh: 32022 }), other = await record('adherent', { refadh: 32023 });
  check('Producteur : vergers détectés et message explicite', !(await preview('adherent', producteur)).canDelete && (await preview('adherent', producteur)).reason.includes('verger'));
  check('Producteur : API directe refuse les dépendances', (await call(pre + '/entities/adherent/delete', 'POST', removeBody('adherent', producteur))).status === 409);
  check('Producteur : autre table refadh détectée', (await preview('adherent', other)).dependencies.some(d => d.table === 'v121_refadh_guard' && d.count === 1));
  check('Producteur : autre référence interdit suppression', (await call(pre + '/entities/adherent/delete', 'POST', removeBody('adherent', other))).status === 409);
  check('Producteur : Consultation interdite', (await call(pre + '/entities/adherent/delete', 'POST', removeBody('adherent', libre), actors.Consultation)).status === 403);
  check('Producteur : archive interdite', (await call(`/contexts/${archive.id}/entities/adherent/delete`, 'POST', removeBody('adherent', libre))).status === 403);
  check('Producteur : confirmation obligatoire', (await call(pre + '/entities/adherent/delete', 'POST', { ...removeBody('adherent', libre), confirmation: '' })).status === 400);
  check('Producteur : CSRF obligatoire', (await call(pre + '/entities/adherent/delete', 'POST', removeBody('adherent', libre), admin, false)).status === 403);
  const adhDeleted = await ok(pre + '/entities/adherent/delete', 'POST', removeBody('adherent', libre), actors.Gestionnaire);
  check('Producteur sans dépendance : suppression confirmée', adhDeleted.status === 'Applied' && sql(`SELECT COUNT(*) FROM ${db}.adherent WHERE refadh=32022`) === '0');
  const journal = await ok(pre + '/journal');
  check('Journal : producteur supprimé tracé', journal.some(j => j.id === adhDeleted.id && j.operation === 'Delete' && j.entity === 'adherent' && j.status === 'Applied'));
  check('Journal : refus réception tracé', journal.some(j => j.status === 'Blocked' && j.entity === 'parcelle' && j.error.includes('reception_d')));
  check('Journal : refus producteur tracé', journal.some(j => j.status === 'Blocked' && j.entity === 'adherent'));
  check('Journal : état obsolète tracé', journal.some(j => j.status === 'Blocked' && j.entity === 'verger' && j.error.includes('changé')));
  check('Suppressions : aucun travail DIAF créé', (await ok(pre + '/sync')).length === 0);
  check('reception_d : toutes données de fixture intactes', receiptImage() === receiptsBefore);
  check('reception_d : compte applicatif ne peut pas supprimer', (() => { try { sql(`DELETE FROM ${db}.reception_d WHERE numrec=-1`); return false; } catch { return true; } })());
  check('reception_d originale : aucune donnée modifiée', sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.reception_d') === currentReceiptCount);
  for (const name of ['adherent', 'verger', 'parcelle']) check('KPI après suppressions : ' + name, (await ok(`${pre}/entities/${name}/kpis`)).metrics.count === Number(sql(`SELECT COUNT(*) FROM ${db}.${name}`)));
  check('Clés complètes : clé parcelle incomplète refusée', (await call(pre + '/entities/parcelle/delete-batch-preview', 'POST', { keys: [{ refpar: 'V121BLOCK' }] })).status === 400);
} finally {
  for (const user of users) await ok(`/admin/users/${user.id}/access`, 'PUT', { role: user.role, enabled: false, contextIds: [] });
  sql(`UPDATE referentiels_admin.app_contexts SET enabled=0 WHERE id=${context.id} AND database_name='${db}' AND label='TEST ISOLÉ V1.2.1'`, true);
}
writeFileSync('docs/api-verification-v121.json', JSON.stringify({ testedAt: new Date().toISOString(), mysql: '5.7.44', base, fixtureDatabase: db, receiptRule: 'refpar + numcul + refver, toutes stations, même exercice', results }, null, 2));
console.log(`${results.length} vérifications V1.2.1 réussies.`);


