import { writeFileSync } from 'node:fs';
const base = process.env.VITASOUSS_TEST_URL ?? 'http://127.0.0.1:5080/api';
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+\/api$/.test(base)) throw new Error('Ce test est limité à une API locale.');
const password = process.env.VITASOUSS_TEST_PASSWORD;
if (!password) throw new Error('VITASOUSS_TEST_PASSWORD requis');
const results = [];
async function session(username, password) {
  const response = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  const data = await response.json(); if (!response.ok) throw new Error(data.title);
  return { cookie: response.headers.get('set-cookie').split(';')[0], csrf: data.csrf };
}
async function call(path, method = 'GET', body, actor = admin, csrf = true) {
  const response = await fetch(base + path, { method, headers: { Cookie: actor.cookie, 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': actor.csrf } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = response.status === 204 ? null : await response.json();
  return { status: response.status, data };
}
function check(name, condition, detail = '') { results.push({ name, passed: !!condition, detail }); console.log(`${condition ? 'PASS' : 'FAIL'} ${name}${detail ? ': ' + detail : ''}`); if (!condition) throw new Error(name); }
async function ok(path, method = 'GET', body) { const r = await call(path, method, body); if (r.status >= 400) throw new Error(`${path}: ${r.data.title}`); return r.data; }
const admin = await session('admin', password);
check('Authentification administrateur', !!admin.csrf);
let config = await ok('/admin/configuration');
if (!config.servers.length) {
  const mysqlPassword = process.env.VITASOUSS_TEST_MYSQL_PASSWORD;
  if (!mysqlPassword) throw new Error('VITASOUSS_TEST_MYSQL_PASSWORD requis pour configurer la copie');
  for (const label of ['Source locale', 'Destination locale']) await ok('/admin/servers', 'POST', { label, host: '127.0.0.1', port: 33307, username: 'vitasouss_test', password: mysqlPassword, sslMode: 'None' });
  await ok('/admin/stations', 'POST', { code: 'ZAOUIA', label: 'ZAOUIA', serverId: 1, isMaster: true });
  await ok('/admin/stations', 'POST', { code: 'DIAF', label: 'DIAF', serverId: 2, isMaster: false });
  await ok('/admin/contexts', 'POST', { stationId: 1, databaseName: 'vitasouss_test_zaouia_v1', label: 'Copie dump — validation V1', readOnly: false, localRefsta: 7702 });
  await ok('/admin/contexts', 'POST', { stationId: 2, databaseName: 'vitasouss_test_diaf_v1', label: 'Copie DIAF — validation V1', readOnly: false, localRefsta: 1234 });
  await ok('/admin/contexts', 'POST', { stationId: 1, databaseName: 'vitasouss_test_zaouia', label: 'Archive de test', readOnly: true, localRefsta: 7702 });
  config = await ok('/admin/configuration');
}
check('Secrets absents des réponses', !JSON.stringify(config).includes('protected_password') && !JSON.stringify(config).includes('LocalTestingOnly'));
const contexts = await ok('/contexts');
const source = contexts.find(c => c.databaseName === 'vitasouss_test_zaouia_v1');
const target = contexts.find(c => c.databaseName === 'vitasouss_test_diaf_v1');
const archive = contexts.find(c => c.readOnly && c.station === 'ZAOUIA');
if (!source || !target || !archive) throw new Error('Contextes de test absents');
const prefix = `/contexts/${source.id}`;
const catalog = await ok('/catalog');
check('Schéma réel : clé parcelle composée', catalog.find(e => e.name === 'parcelle').keys.join(',') === 'idparcelle,refpar,numcul,refver');
const dashboard = await ok(prefix + '/dashboard');
check('Dashboard sur les données du dump', dashboard.counts.adherent === 78 && dashboard.counts.verger === 119 && dashboard.counts.parcelle === 1014, JSON.stringify(dashboard.counts));
check('Tri SQL non autorisé refusé', (await call(prefix + '/entities/verger?sort=nomver%3BDROP%20TABLE')).status === 400);
const adherents = await ok(prefix + '/entities/adherent?pageSize=5');
check('Pagination adhérents', adherents.rows.length === 5 && adherents.total === 78);
const vergers = await ok(prefix + '/entities/verger?pageSize=1');
const original = vergers.rows[0]; const key = { refver: original.refver }; const keyString = encodeURIComponent(JSON.stringify(key));
const uri = prefix + `/entities/verger/record?key=${keyString}`;
const record = await ok(uri);
check('Fiche verger et champs historiques', record.refver === original.refver && 'refsta' in record && 'UpdatedAt' in record);
check('Archive bloquée côté serveur', (await call(`/contexts/${archive.id}/entities/verger/record`, 'PUT', { key, before: record, values: { nomver: record.nomver }, synchronize: false })).status === 403);
check('Jeton CSRF obligatoire', (await call(prefix + '/entities/verger/record', 'PUT', { key, before: record, values: {} }, admin, false)).status === 403);
check('Clé historique immuable', (await call(prefix + '/entities/verger/record', 'PUT', { key, before: record, values: { refver: 99999 }, synchronize: false })).status === 400);
check('Suppression physique refusée', (await call(prefix + '/entities/verger/record', 'DELETE')).status === 409);
const parcel = (await ok(prefix + '/entities/parcelle?pageSize=1')).rows[0];
const subs = await ok(prefix + `/entities/souvar?pageSize=100&filter=codvar&value=${parcel.codvar ?? 0}`);
check('Sous-variétés filtrées par codvar', subs.rows.every(s => s.codvar === parcel.codvar));
const wrongSubs = (await ok(prefix + '/entities/souvar?pageSize=100')).rows.find(s => s.codvar !== parcel.codvar && s.codsvar !== 0);
if (wrongSubs) {
  const parcelKey = Object.fromEntries(catalog.find(e => e.name === 'parcelle').keys.map(k => [k, parcel[k]]));
  const r = await call(prefix + '/entities/parcelle/record', 'PUT', { key: parcelKey, before: parcel, values: { codsvar: wrongSubs.codsvar }, synchronize: false });
  check('Sous-variété d’une autre variété refusée', r.status === 400 && r.data.title.includes('sous-variété'), r.data.title);
}
if (!config.routes.length) await ok('/admin/routes', 'POST', { sourceContextId: source.id, targetContextId: target.id });
const targetConfig = config.contexts.find(c => c.id === target.id); const targetStation = config.stations.find(s => s.id === targetConfig.station_id); const targetServer = config.servers.find(s => s.id === targetStation.server_id);
const targetBefore = await ok(`/contexts/${target.id}/entities/verger/record?key=${keyString}`);
const newName = `${String(record.nomver).slice(0, 32)} · V1`;
const saved = await ok(prefix + '/entities/verger/record', 'PUT', { key, before: record, values: { nomver: newName, refsta: record.refsta === null ? 7702 : null }, synchronize: true });
check('ZAOUIA enregistré et synchronisation journalisée', saved.synchronization === 'Pending' && (await ok(uri)).nomver === newName);
check('DIAF ne change pas silencieusement', (await ok(`/contexts/${target.id}/entities/verger/record?key=${keyString}`)).nomver === targetBefore.nomver);
check('Conflit de consultation refusé', (await call(prefix + '/entities/verger/record', 'PUT', { key, before: record, values: { nomver: 'Conflit' }, synchronize: false })).status === 409);
const job = (await ok(prefix + '/sync')).find(j => j.change_id === saved.id);
if (targetServer.id !== config.stations.find(s => s.code === 'ZAOUIA').server_id) {
  await ok(`/admin/servers/${targetServer.id}`, 'PUT', { label: targetServer.label, host: targetServer.host, port: 33308, username: targetServer.username, password: null, sslMode: targetServer.ssl_mode });
  const unreachable = await call(`/sync/${job.id}/preview`);
  check('DIAF inaccessible : source conservée, attente visible', unreachable.status === 409 && (await ok(uri)).nomver === newName);
  await ok(`/admin/servers/${targetServer.id}`, 'PUT', { label: targetServer.label, host: targetServer.host, port: 33307, username: targetServer.username, password: null, sslMode: targetServer.ssl_mode });
}
const preview = await ok(`/sync/${job.id}/preview`);
check('Aperçu DIAF exclut refsta', preview.differences.some(d => d.field === 'nomver') && preview.differences.every(d => d.field !== 'refsta'));
await ok(`/sync/${job.id}/apply`, 'POST', preview.before);
const afterTarget = await ok(`/contexts/${target.id}/entities/verger/record?key=${keyString}`);
check('Application DIAF : modification et conservation refsta', afterTarget.nomver === newName && afterTarget.refsta === targetBefore.refsta && afterTarget.refsta !== record.refsta);
const current = await ok(uri); const restored = await ok(prefix + '/entities/verger/record', 'PUT', { key, before: current, values: { nomver: record.nomver, refsta: record.refsta }, synchronize: true });
const restoreJob = (await ok(prefix + '/sync')).find(j => j.change_id === restored.id); const restorePreview = await ok(`/sync/${restoreJob.id}/preview`); await ok(`/sync/${restoreJob.id}/apply`, 'POST', restorePreview.before);
check('Valeurs métier restaurées après test', (await ok(uri)).nomver === record.nomver);
const parcelKey = Object.fromEntries(catalog.find(e => e.name === 'parcelle').keys.map(k => [k, parcel[k]]));
const parcelUri = prefix + '/entities/parcelle/record?key=' + encodeURIComponent(JSON.stringify(parcelKey));
const parcelCurrent = await ok(parcelUri);
await ok(prefix + '/entities/parcelle/record', 'PUT', { key: parcelKey, before: parcelCurrent, values: { estimation: Number(parcelCurrent.estimation ?? 0) + 0.125 }, synchronize: false });
check('Parcelle : écriture avec clé composée et dates historiques', (await ok(parcelUri)).estimation === Number(parcelCurrent.estimation ?? 0) + 0.125);
await ok(prefix + '/entities/parcelle/record', 'PUT', { key: parcelKey, before: await ok(parcelUri), values: { estimation: parcelCurrent.estimation }, synchronize: false });
check('Parcelle : superficie hors précision SQL refusée', (await call(prefix + '/entities/parcelle/record', 'PUT', { key: parcelKey, before: await ok(parcelUri), values: { suppar: 99999999 }, synchronize: false })).status === 400);
check('Parcelle : clé partielle refusée', (await call(prefix + '/entities/parcelle/record?key=' + encodeURIComponent(JSON.stringify({ idparcelle: parcel.idparcelle })))).status === 400);
const journal = await ok(prefix + '/journal');check('Audit avant/après et utilisateur', journal.some(c => c.id === saved.id && c.status === 'Applied' && c.before_json && c.after_json && c.userName));
check('Dates du journal sérialisées pour le frontend', typeof journal[0].created_at === 'string' && !Number.isNaN(Date.parse(journal[0].created_at)));
for (const role of ['Consultation', 'Gestionnaire']) {
  const username = `verification_${role.toLowerCase()}`;
  const existing = config.users.find(u => u.username === username);
  if (!existing) await ok('/admin/users', 'POST', { username, displayName: `Vérification ${role}`, role, password, contextIds: role === 'Gestionnaire' ? [] : [source.id] });
  else if(!existing.enabled) await ok(`/admin/users/${existing.id}/access`, 'PUT', { role, enabled: true, contextIds: role === 'Gestionnaire' ? [] : [source.id] });
  const actor = await session(username, password);
  const r = await call(prefix + '/entities/verger/record', 'PUT', { key, before: await ok(uri), values: { nomver: 'Non autorisé' }, synchronize: false }, actor);
  check(role === 'Consultation' ? 'Consultation : écriture interdite' : 'Contexte sans attribution : accès interdit', r.status === 403);
  const updatedConfig=await ok('/admin/configuration'); const testUser=updatedConfig.users.find(u=>u.username===username);
  await ok(`/admin/users/${testUser.id}/access`, 'PUT', { role, enabled: false, contextIds: [] });
}
writeFileSync('docs/api-verification.json', JSON.stringify({ mysql: '5.7.44', data: 'Copie locale du dump fourni', results }, null, 2));
console.log(`${results.length} vérifications réussies.`);
