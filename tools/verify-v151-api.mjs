import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {randomUUID,createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// Resolve local fixtures and reports from the script location, regardless of the caller's folder.
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const base='http://127.0.0.1:5080/api',password=process.env.VITASOUSS_TEST_PASSWORD;
const assemblySha256=createHash('sha256').update(readFileSync('publish-v151-candidate/Vitasouss.Api.dll')).digest('hex').toUpperCase();
assert.ok(password,'Mot de passe applicatif de test requis uniquement par variable environnement');
const cfg=JSON.parse(readFileSync('backend/appsettings.Local.json','utf8').replace(/^\uFEFF/,''));
assert.equal(cfg.Admin.Host,'127.0.0.1');assert.equal(cfg.Admin.Port,33307);assert.match(cfg.Admin.Database,/^[a-zA-Z0-9_]+$/);
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
const sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--default-character-set=utf8mb4','--batch','--raw','--skip-column-names'],{input:q,encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
assert.equal(sql('SELECT @@port'),'33307');
const results=[];function check(name,ok){assert.ok(ok,name);results.push({name,passed:true});console.log('PASS '+name);}
async function login(username='admin'){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});assert.equal(r.status,200,await r.clone().text());const d=await r.json();return {cookie:r.headers.get('set-cookie').split(';')[0],csrf:d.csrf};}
const admin=await login();
async function call(url,actor=admin,method='GET',body){return fetch(base+url,{method,headers:{Cookie:actor.cookie,'X-CSRF-Token':actor.csrf,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});}
async function ok(url,actor=admin,method='GET',body){const r=await call(url,actor,method,body);assert.equal(r.status,200,await r.clone().text());return r.json();}
const configuration=await ok('/admin/configuration');
for(const station of configuration.stations.filter(s=>['ZAOUIA','DIAF'].includes(s.code))){const server=configuration.servers.find(s=>s.id===station.server_id);assert.equal(server.host,'127.0.0.1');assert.equal(server.port,33307);}
const nonce=randomUUID().replaceAll('-',''),contextIds=[],users=[];
const getContext=name=>{const c=configuration.contexts.find(c=>c.database_name===name);assert.ok(c&&name.startsWith('vitasouss_test_'));contextIds.push(c.id);sql(`USE ${cfg.Admin.Database};UPDATE app_contexts SET enabled=1 WHERE id=${Number(c.id)} AND database_name='${name}';`);return c.id;};
const z=getContext('vitasouss_test_v150_z'),d=getContext('vitasouss_test_v150_d'),pz=getContext('vitasouss_test_v150_pz'),pd=getContext('vitasouss_test_v150_pd'),audit=getContext('vitasouss_test_audit_20261015'),missing=getContext('vitasouss_test_v150_missing');
const endpoint=(id,module='receptions')=>`/contexts/${id}/analytics/${module}`;
async function user(label,contextIds,modules,role='Consultation'){const username='v150_'+label+'_'+nonce;await ok('/admin/users',admin,'POST',{username,displayName:'TEST V150 '+label,role,password,contextIds});const c=await ok('/admin/configuration');const u=c.users.find(u=>u.username===username);users.push(u.id);const rows=await ok(`/admin/users/${u.id}/permissions`);await ok(`/admin/users/${u.id}/permissions`,admin,'PUT',{permissions:rows.map(p=>({...p,view:modules.includes(p.module),add:false,modify:false,delete:false}))});return login(username);}
const before=sql('CHECKSUM TABLE vitasouss_test_audit_20261015.reception,vitasouss_test_audit_20261015.caisserie,vitasouss_test_audit_20261015.parcelle,vitasouss_test_v150_z.reception;');
let success=false;
try {
 check('Version HTTP V1.5.1 et Drencher 1.3.2.1',(await ok('/health')).version==='1.5.1'&&(await ok('/health')).drencherVersion==='1.3.2.1');
 const op=await user('one_station',[z],['receptions']),both=await user('two_stations',[z,d,pz,pd,audit],['receptions','caisserie']),none=await user('none',[z],[]);
 check('Accès anonyme refusé',(await fetch(base+endpoint(z))).status===401);
 check('Module absent refusé',(await call(endpoint(z),none)).status===403);
 const q=await ok(endpoint(z),op);check('Consultation avec filtres par défaut',q.complete&&q.sources[0].available&&q.total>0&&q.rows.length<=25);
 check('Autre station non autorisée refusée',(await call(endpoint(z)+`?otherContext=${d}`,op)).status===403);
 check('Archive non autorisée refusée',(await call(endpoint(z)+`?previousContext=${pz}`,op)).status===403);
 check('Caisserie sans permission refusée',(await call(endpoint(z,'caisserie'),op)).status===403);
 check('Export sans droit module refusé',(await call(endpoint(z)+'/export',none)).status===403);
 const consolidated=await ok(endpoint(z)+`?otherContext=${d}&period=custom&from=2026-10-15&to=2026-10-15`,both);check('HTTP consolidation 5,5 tonnes, trois lots sans collision',consolidated.complete&&consolidated.totalKg===5500&&consolidated.rows.length===3);
 const archive=await ok(endpoint(z)+`?otherContext=${d}&previousContext=${pz}&previousOtherContext=${pd}`,both);check('HTTP comparaison quatre contextes autorisés',archive.sources.length===4&&archive.sources.every(s=>s.available)&&archive.evolution===100);
 const partial=await ok(endpoint(z)+`?otherContext=${missing}`);check('HTTP source indisponible : total global NULL et alerte',!partial.complete&&partial.totalKg===null&&!partial.sources[1].available);
 check('Paramètre SQL libre refusé',(await call(endpoint(z)+'?sql=DELETE%20FROM%20reception')).status===400);
 check('Tri arbitraire refusé',(await call(endpoint(z)+'?sort=netrec%3BDROP')).status===400);
 check('Paramètres répétés refusés',(await call(endpoint(z)+'?page=1&page=2')).status===400);
 check('Page négative refusée',(await call(endpoint(z)+'?page=-1')).status===400);
 check('Date invalide refusée',(await call(endpoint(z)+'?period=custom&from=invalid&to=2026-10-15')).status===400);
 check('Recherche malveillante reste paramétrée',(await ok(endpoint(z)+"?search=%27%20OR%201%3D1%20--")).total===0);
 for(const method of ['POST','PUT','DELETE'])check('Aucune mutation analytique '+method,[404,405].includes((await call(endpoint(z),admin,method,{})).status));
 const exported=await call(endpoint(audit)+'/export',both);const bytes=Buffer.from(await exported.arrayBuffer());check('Export HTTP Excel valide, noms et type de contenu',exported.status===200&&bytes.subarray(0,2).toString()==='PK'&&exported.headers.get('content-type').includes('spreadsheetml')&&exported.headers.get('content-disposition').includes('.xlsx'));writeFileSync('output/audit-v151/receptions-export-http.xlsx',bytes);
 const crates=await ok(endpoint(audit,'caisserie')+'?movement=E',both);check('HTTP caisserie filtrée : 213 mouvements E',crates.total===213&&crates.sources[0].movements[0].quantity===95208);
 check('HTTP audit officiel 1809,096 tonnes',(await ok(endpoint(audit),both)).totalKg===1809096);
 const inventoryPath=`/admin/contexts/${z}/crate-openings`;
 check('Inventaires : Consultation refusée en accès direct',(await call(inventoryPath,op)).status===403);
 const manager=await user('inventory_manager',[z],['caisserie'],'Gestionnaire');
 check('Inventaires : Gestionnaire sans Admin refusé',(await call(inventoryPath,manager)).status===403);
 const inventories=await ok(inventoryPath);
 check('Inventaires : migration et types réels exposés à Admin',inventories.installed&&inventories.types.length===2&&Array.isArray(inventories.revisions));
 const type=1,revision=inventories.revisions.find(r=>r.crate_type===type)?.revision??0;
 const opening={crateType:type,openingDate:'2026-09-01',ownedTotal:1000,physicalQuantity:600,dues:[{producerId:1,orchardId:10,quantity:300}],note:'Inventaire HTTP synthétique '+nonce,confirmed:true,expectedRevision:revision};
 check('Inventaire sans confirmation refusé API',(await call(inventoryPath,admin,'POST',{...opening,confirmed:false})).status===400);
 check('Inventaire physique excessif refusé API',(await call(inventoryPath,admin,'POST',{...opening,physicalQuantity:1001})).status===400);
 check('Inventaire création interdite Gestionnaire API',(await call(inventoryPath,manager,'POST',opening)).status===403);
 const saved=await ok(inventoryPath,admin,'POST',opening);
 check('Inventaire enregistré dans administration et historisé',typeof saved.id==='number'&&(await ok(inventoryPath)).rows.some(r=>r.id===saved.id&&r.revision===revision+1));
 check('Révision périmée refusée API',(await call(inventoryPath,admin,'POST',opening)).status===409);
 check('Aucune suppression d’inventaire fournie',[404,405].includes((await call(inventoryPath+'/'+saved.id,admin,'DELETE')).status));
 const fixture=configuration.contexts.find(c=>c.id===z);
 const contextBody={stationId:fixture.station_id,databaseName:fixture.database_name,label:fixture.label,readOnly:!!fixture.read_only,localRefsta:fixture.local_refsta,showInSelectors:false};
 try {
  await ok(`/admin/contexts/${z}`,admin,'PUT',contextBody);
  check('Masquage API : sélecteurs Admin et Consultation filtrés',!(await ok('/contexts')).some(c=>c.id===z)&&!(await ok('/contexts',op)).some(c=>c.id===z));
  check('Masquage API : droits directs conservés',(await call(endpoint(z),op)).status===200);
  check('Masquage API : configuration administrative conservée',(await ok('/admin/configuration')).contexts.some(c=>c.id===z&&!c.show_in_selectors));
  check('Masquage non attribuable par utilisateur non Admin',(await call(`/admin/contexts/${z}`,op,'PUT',contextBody)).status===403);
 } finally {await ok(`/admin/contexts/${z}`,admin,'PUT',{...contextBody,showInSelectors:true});}
 check('Réaffichage sans réattribution de droits',(await ok('/contexts',op)).some(c=>c.id===z));
 const physical=await ok(endpoint(audit,'caisserie'),both);
 check('HTTP variation physique E−S = −41 010 par type, aucune dette',physical.sources[0].crateFlows.some(f=>f.scope==='type'&&f.crateType===1&&f.physicalVariation===-41010&&f.producerDebt===null));
 const producerSituation=await ok(endpoint(audit,'caisserie')+'/producers?sort=exits',both);
 const producer75=producerSituation.rows.find(r=>r.producerId===75&&r.crateType===1);
 check('HTTP situation producteur 75 et balances caisses/palettes',producerSituation.complete&&producer75?.entries===5079&&producer75?.exits===6660&&producer75?.crateBalance===1581&&producer75?.entriesPallets===110&&producer75?.exitsPallets===120&&producer75?.palletBalance===10);
 const producerSearch=await ok(endpoint(audit,'caisserie')+'/producers?search=75',both);
 check('HTTP recherche producteur par code',producerSearch.rows.length===1&&producerSearch.rows[0].producerId===75);
 const producerPage=await ok(endpoint(audit,'caisserie')+'/producers?page=2',both);
 check('HTTP pagination de situation sans perte de total',producerPage.page===2&&producerPage.pageSize===25&&producerPage.rows.length<=25&&producerPage.total>25);
 check('HTTP balance producteur ignore le filtre E/S', (await ok(endpoint(audit,'caisserie')+'/producers?movement=E',both)).totals.some(t=>t.entries===95208&&t.exits===136218));
 check('HTTP situation producteur sans permission refusée',(await call(endpoint(audit,'caisserie')+'/producers',none)).status===403);
 const situationXlsx=await call(endpoint(audit,'caisserie')+'/producers/export?sort=exits',both,'GET');
 const situationBytes=Buffer.from(await situationXlsx.arrayBuffer());check('HTTP export Excel situation complet',situationXlsx.status===200&&situationBytes.subarray(0,2).toString()==='PK'&&situationXlsx.headers.get('content-type').includes('spreadsheetml'));writeFileSync('output/audit-v151/caisserie-producers-http.xlsx',situationBytes);
 check('HTTP export situation sans permission refusé',(await call(endpoint(audit,'caisserie')+'/producers/export',none,'GET')).status===403);
 check('Empreintes métier inchangées après toutes lectures/exports',sql('CHECKSUM TABLE vitasouss_test_audit_20261015.reception,vitasouss_test_audit_20261015.caisserie,vitasouss_test_audit_20261015.parcelle,vitasouss_test_v150_z.reception;')===before);
 success=true;
} finally {
 if(users.length)sql(`USE ${cfg.Admin.Database};UPDATE app_users SET enabled=0,auth_version=auth_version+1 WHERE id IN (${users.map(Number).join(',')}) AND username LIKE 'v150_%';`);
 if(contextIds.length)sql(`USE ${cfg.Admin.Database};UPDATE app_contexts SET enabled=0 WHERE id IN (${contextIds.map(Number).join(',')}) AND database_name LIKE 'vitasouss_test_%';`);
 writeFileSync('docs/tests-v151-api.json',JSON.stringify({date:new Date().toISOString(),passed:results.length,failed:success?0:1,success,productionAccess:false,assemblySha256,results},null,2));
}
