import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const base='http://127.0.0.1:5080/api';
if(!process.env.VITASOUSS_TEST_PASSWORD||!process.env.VITASOUSS_TEST_MYSQL_PASSWORD)throw Error('Secrets de test locaux requis');
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
const sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--batch','--skip-column-names','--execute',"SET SESSION sql_mode=''; "+q],{encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
const results=[];const check=(name,ok)=>{assert.ok(ok,name);results.push({name,passed:true});console.log('PASS '+name)};
async function login(username='admin'){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:process.env.VITASOUSS_TEST_PASSWORD})});assert.equal(r.status,200,await r.clone().text());const d=await r.json();return{cookie:r.headers.get('set-cookie').split(';')[0],csrf:d.csrf};}
const admin=await login();
async function call(uri,method='GET',body,actor=admin,csrf=true){const r=await fetch(base+uri,{method,headers:{Cookie:actor.cookie,'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':actor.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,data:await r.json().catch(()=>null)}}
async function ok(...args){const r=await call(...args);assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
const config=await ok('/admin/configuration');const server=config.servers.find(s=>s.host==='127.0.0.1'&&s.port===33307);assert.ok(server);
const master=config.stations.find(s=>s.code==='ZAOUIA'),diaf=config.stations.find(s=>s.code==='DIAF');assert.ok(master&&diaf);for(const station of [master,diaf]){const host=config.servers.find(s=>s.id===station.server_id);assert.equal(host.host,'127.0.0.1');assert.equal(host.port,33307);}
const prototype=config.contexts.find(c=>c.enabled&&c.database_name.startsWith('vitasouss_test_v13_src_'));assert.ok(prototype);
const stamp=Date.now(),src='vitasouss_test_v14_src_'+stamp,dst='vitasouss_test_v14_dst_'+stamp;
for(const db of [src,dst]){
 assert.match(db,/^vitasouss_test_v14_(src|dst)_\d+$/);assert.equal(sql(`SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${db}'`),'0');sql(`CREATE DATABASE ${db} CHARACTER SET latin1`);
 for(const table of sql('SHOW TABLES FROM '+prototype.database_name).split(/\r?\n/)){assert.match(table,/^[a-zA-Z0-9_]+$/);sql(`CREATE TABLE ${db}.${table} LIKE ${prototype.database_name}.${table}; INSERT INTO ${db}.${table} SELECT * FROM ${prototype.database_name}.${table}`);}
 sql(`DELETE FROM ${db}.grpemb; INSERT INTO ${db}.grpemb(codgre,nomgre) VALUES(1,'CAISSE BOIS');UPDATE ${db}.groupart SET type='PEG307',codgre=1 WHERE codgrp=1; GRANT SELECT,LOCK TABLES ON ${db}.* TO 'vitasouss_test'@'127.0.0.1'`);
 for(const table of ['partenaire','destination','pays','grpemb','groupart','defaut','typeecart','declaration_verger'])sql(`GRANT INSERT,UPDATE,TRIGGER ON ${db}.${table} TO 'vitasouss_test'@'127.0.0.1'`);
 sql(`GRANT DELETE ON ${db}.grpemb TO 'vitasouss_test'@'127.0.0.1'`);
}
for(const [stationId,db] of [[master.id,src],[diaf.id,dst]])await ok('/admin/contexts','POST',{stationId,databaseName:db,label:'TEST V1.4 '+db,readOnly:false,localRefsta:stationId===master.id?7816:7702});
const refreshed=await ok('/admin/configuration');const source=refreshed.contexts.find(c=>c.database_name===src),target=refreshed.contexts.find(c=>c.database_name===dst);const pre=`/contexts/${source.id}`;
await ok('/admin/routes','POST',{sourceContextId:source.id,targetContextId:target.id});
const users=[];
async function createUser(role){const username='test_v14_'+role.toLowerCase()+'_'+stamp;await ok('/admin/users','POST',{username,displayName:'TEST V14 '+role,password:process.env.VITASOUSS_TEST_PASSWORD,role,contextIds:[source.id,target.id]});const c=await ok('/admin/configuration');const user=c.users.find(u=>u.username===username);users.push(user);return{user,actor:await login(username)}}
async function read(name,ctx=source){return ok(`/contexts/${ctx.id}/pilot/${name}`)}
function body(name,row,values){const e=definitions.find(e=>e.name===name);return{key:Object.fromEntries(e.keys.map(k=>[k,row[k]])),before:row,values}}
const definitions=JSON.parse(readFileSync('backend/pilot-schema.json','utf8').replace(/^\uFEFF/,''));
try{
 const manager=await createUser('Gestionnaire'),reader=await createUser('Consultation');
 check('Version 1.4',(await ok('/health')).version==='1.4');
 check('Matrice Admin complète',(await ok('/permissions')).length===27);
 check('Consultation sans écriture',(await ok('/permissions','GET',undefined,reader.actor)).every(p=>!p.add&&!p.modify&&!p.delete));
 const matrix=await ok(`/admin/users/${manager.user.id}/permissions`);
 const limited=matrix.map(p=>p.module==='partenaire'?{...p,view:false,add:false,modify:false,delete:false}:p.module==='grpemb'?{...p,modify:false,delete:false}:p);
 await ok(`/admin/users/${manager.user.id}/permissions`,'PUT',{permissions:limited});
 check('Modification droits révoque la session',(await call(pre+'/pilot/grpemb','GET',undefined,manager.actor)).status===401);
 manager.actor=await login(manager.user.username);
 check('API directe interdite retourne 403',(await call(pre+'/pilot/partenaire','GET',undefined,manager.actor)).status===403);
 const group=(await read('grpemb')).rows[0];
 check('Modifier sans permission refusé',(await call(pre+'/pilot/grpemb','PUT',body('grpemb',group,{nomgre:'REFUS'}),manager.actor)).status===403);
 check('Supprimer sans permission refusé',(await call(pre+'/pilot/grpemb/delete','POST',body('grpemb',group,{}),manager.actor)).status===403);
 check('Consultation ne crée pas',(await call(pre+'/pilot/pays','POST',{key:{},before:{},values:{nompay:'REFUS'}},reader.actor)).status===403);
 const families=await read('grpemb');check('Nombre articles liés',families.displayRows[0].articlesCount===1);
 const articles=await ok(pre+'/pilot/grpemb/articles?codgre=1');check('Fiche groupe affiche articles',articles[0].type==='PEG307');
 const opts=await ok(pre+'/pilot/groupart/options');check('Combo groupe par libellé',opts.codgre[0].label==='CAISSE BOIS'&&opts.codgre[0].value==='1');
 const article=(await read('groupart')).rows[0];check('Liste article affiche groupe',(await read('groupart')).displayRows[0].codgre==='CAISSE BOIS');
 const used=await call(pre+'/pilot/grpemb/delete','POST',body('grpemb',group,{}));check('Suppression groupe utilisé refusée',used.status===409&&used.data.title.includes('1 articles'));
 check('Correction libellé groupe utilisée autorisée',(await ok(pre+'/pilot/grpemb','PUT',body('grpemb',group,{nomgre:'CAISSE BOIS CORRIGEE'}))).status==='Applied');
 const added=await ok(pre+'/pilot/grpemb','POST',{key:{},before:{},values:{nomgre:'GROUPE VIDE'}});check('Création attribue code côté maître',added.status==='Applied'&&added.key.codgre>1);
 const empty=(await read('grpemb')).rows.find(r=>r.nomgre==='GROUPE VIDE');check('Suppression groupe inutilisé contrôlée',(await ok(pre+'/pilot/grpemb/delete','POST',body('grpemb',empty,{}))).status==='Applied');
 check('Relation existante structurelle protégée',(await call(pre+'/pilot/groupart','PUT',body('groupart',article,{codgre:2}))).status===400);
 check('Correction référence article autorisée',(await ok(pre+'/pilot/groupart','PUT',body('groupart',article,{type:'PEG307 CORRIGE'}))).status==='Applied');
 check('Groupe absent refusé',(await call(pre+'/pilot/groupart','POST',{key:{},before:{},values:{type:'REFUS',codgre:999}})).status===409);
 check('Code groupe SQL injecté refusé',(await call(pre+'/pilot/groupart','POST',{key:{},before:{},values:{type:'REFUS',codgre:'1;DELETE'}})).status===400);
 check('Nouveau référentiel DIAF direct refusé',(await call(`/contexts/${target.id}/pilot/pays`,'POST',{key:{},before:{},values:{nompay:'REFUS'}})).status===403);
 const rawVariety=await ok(pre+'/entities/variete/record?key='+encodeURIComponent(JSON.stringify({codvar:104})));
 const groupChoice=JSON.parse(readFileSync('backend/schema.json','utf8').replace(/^\uFEFF/,'')).find(e=>e.name==='grpvar');assert.ok(groupChoice);
 const availableGroups=(await ok(pre+'/entities/grpvar?pageSize=100')).rows;const anotherGroup=availableGroups.find(r=>r.codgrv!==rawVariety.codgrv);assert.ok(anotherGroup);
 check('Relation historique utilisée protégée',(await call(pre+'/entities/variete/record','PUT',{key:{codvar:104},before:rawVariety,values:{codgrv:anotherGroup.codgrv},synchronize:false})).status===409);
 const declarationOptions=await ok(pre+'/pilot/declaration_verger/options');check('Déclarations : sélections métier',Object.keys(declarationOptions).length===4&&declarationOptions.refver_reel[0].label.includes('/'));
 const values={refver_reel:7602,refver_nreel:7602,codvar:104,refstat:7702};
 check('Déclaration verger réel égal déclaré autorisée',(await ok(pre+'/pilot/declaration_verger','POST',{key:{},before:{},values})).status==='Applied');
 const declaration=(await read('declaration_verger')).rows.find(r=>r.refver_reel===7602&&r.refver_nreel===7602);
 check('Déclaration affiche libellés',(await read('declaration_verger')).displayRows.some(r=>typeof r.refver_reel==='string'&&r.refver_reel.includes('/')));
 check('Déclaration modification protégée',(await call(pre+'/pilot/declaration_verger','PUT',body('declaration_verger',declaration,{refver_nreel:6503}))).status===409);
 check('Déclaration suppression protégée',(await call(pre+'/pilot/declaration_verger/delete','POST',body('declaration_verger',declaration,{}))).status===409);
 for(const [name,label]of[['pays','nompay'],['destination','vildes'],['partenaire','nom'],['defaut','intdef'],['typeecart','destype']]){
  const created=await ok(pre+'/pilot/'+name,'POST',{key:{},before:{},values:{[label]:'V14 '+name}});check('Création '+name+' sûre',created.status==='Applied');
  const row=(await read(name)).rows.find(r=>r[label]==='V14 '+name);assert.ok(row);
  check('Libellé '+name+' corrigeable',(await ok(pre+'/pilot/'+name,'PUT',body(name,row,{[label]:'V14 '+name+' MOD'}))).status==='Applied');
  check('Suppression '+name+' non prouvée protégée',(await call(pre+'/pilot/'+name+'/delete','POST',body(name,row,{}))).status===409);
 }
 const country=(await read('pays')).rows.find(r=>r.nompay==='V14 pays MOD');
 check('Même libellé autre code maître interdit',(await call(pre+'/pilot/pays','POST',{key:{},before:{},values:{nompay:'V14 pays MOD'}})).status===409);
 check('Correction abréviation seule autorisée',(await ok(pre+'/pilot/pays','PUT',body('pays',country,{abrpay:'VT'}))).status==='Applied');
 Object.assign(country,(await read('pays')).rows.find(r=>r.codpay===country.codpay));
 const dest=await ok(pre+'/pilot/destination','POST',{key:{},before:{},values:{vildes:'ROTTERDAM V14',codpay:country.codpay}});
 const destination=(await read('destination')).rows.find(r=>r.vildes==='ROTTERDAM V14');assert.ok(destination);
 const compare=await ok(`${pre}/comparison?targetId=${target.id}&name=destination`);check('Comparaison complémentaire absente DIAF',compare.rows.some(r=>r.key.coddes===destination.coddes&&r.status==='SourceOnly'));
 const request={name:'destination',targetId:target.id,items:[{key:{coddes:destination.coddes},source:destination,target:null}]};
 const blocked=await ok(pre+'/comparison/prepare','POST',request);check('Parent pays manquant protège réplication',blocked.items[0].status==='Refused');
 async function replicate(name,row){const entity=definitions.find(e=>e.name===name);const key=Object.fromEntries(entity.keys.map(k=>[k,row[k]]));const tgt=(await read(name,target)).rows.find(r=>entity.keys.every(k=>String(r[k])===String(row[k])));const prep=await ok(pre+'/comparison/prepare','POST',{name,targetId:target.id,items:[{key,source:row,target:tgt??null}]});assert.equal(prep.items[0].status,'Prepared',JSON.stringify(prep));const preview=await ok(`/sync/${prep.items[0].jobId}/preview`);check('Aperçu humain '+name,preview.preservesRefsta);const apply=await ok(`/sync/${prep.items[0].jobId}/apply`,'POST',preview.before);assert.equal(apply.status,'Applied');return prep.items[0].jobId;}
 await replicate('pays',country);await replicate('destination',destination);
 check('Identifiant maître conservé',sql(`SELECT coddes FROM ${dst}.destination WHERE vildes='ROTTERDAM V14'`)==String(destination.coddes));
 const same=await ok(`${pre}/comparison?targetId=${target.id}&name=destination`);check('Référence synchronisée devient identique',!same.rows.some(r=>r.key.coddes===destination.coddes));
 const sourceGroup=(await read('grpemb')).rows.find(r=>r.codgre===1);await replicate('grpemb',sourceGroup);check('Groupe sans PK formelle synchronisable',sql(`SELECT nomgre FROM ${dst}.grpemb WHERE codgre=1`)==='CAISSE BOIS CORRIGEE');
 sql(`INSERT INTO ${src}.destination(coddes,vildes) VALUES(32500,'CONFLIT V14');INSERT INTO ${dst}.destination(coddes,vildes) VALUES(32501,'CONFLIT V14')`);
 const conflict=await ok(`${pre}/comparison?targetId=${target.id}&name=destination&status=Conflict`);check('Même libellé autre code détecté',conflict.rows.some(r=>r.key.coddes===32500&&r.status==='Conflict'));
 check('Codes DIAF du conflit explicitement retournés',conflict.rows.find(r=>r.key.coddes===32500).conflictingKeys.some(k=>String(k.coddes)==='32501'));
 const collision=(await read('destination')).rows.find(r=>r.coddes===32500);const refusal=await ok(pre+'/comparison/prepare','POST',{name:'destination',targetId:target.id,items:[{key:{coddes:32500},source:collision,target:null}]});check('Conflit bloque synchronisation',refusal.items[0].status==='Refused'&&refusal.items[0].message.includes('Conflit'));
 const targetBefore=sql(`SELECT COUNT(*) FROM ${dst}.destination`);await ok(`${pre}/comparison?targetId=${target.id}&name=destination`);check('Aucune suppression DIAF',sql(`SELECT COUNT(*) FROM ${dst}.destination`)===targetBefore&&sql(`SELECT COUNT(*) FROM ${dst}.destination WHERE coddes=32501`)==='1');
 const archive=(await ok('/contexts')).find(c=>c.readOnly);assert.ok(archive);check('Archive toujours en lecture seule',(await call(`/contexts/${archive.id}/pilot/pays`,'POST',{key:{},before:{},values:{nompay:'REFUS'}})).status===403);
 const status=await ok('/assistant');check('Assistant conservé strictement lecture seule',!status.mutations&&!status.sqlGeneration);
 const badMatrix=(await ok(`/admin/users/${reader.user.id}/permissions`)).map(p=>p.module==='pays'?{...p,add:true}:p);check('Impossible augmenter rôle Consultation',(await call(`/admin/users/${reader.user.id}/permissions`,'PUT',{permissions:badMatrix})).status===400);
 const permissionCount=sql('SELECT COUNT(*) FROM referentiels_admin.app_module_permissions');sql('USE referentiels_admin; SOURCE C:/logista_zaouia/sql/002_permissions_v14.sql;');check('Migration permissions idempotente',sql('SELECT COUNT(*) FROM referentiels_admin.app_module_permissions')===permissionCount);
 check('Droits personnalisés conservés à migration',sql(`SELECT can_view FROM referentiels_admin.app_module_permissions WHERE user_id=${manager.user.id} AND module='partenaire'`)==='0');
 check('Schéma Logista sans nouvelle PK',sql(`SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA='${src}' AND TABLE_NAME='grpemb' AND CONSTRAINT_TYPE='PRIMARY KEY'`)==='0');
} finally {
 for(const u of users)await ok(`/admin/users/${u.id}/access`,'PUT',{role:u.role,enabled:false,contextIds:[]});
 sql(`UPDATE referentiels_admin.app_contexts SET enabled=0 WHERE database_name IN('${src}','${dst}');UPDATE referentiels_admin.app_sync_routes SET enabled=0 WHERE source_context_id=${source.id} AND target_context_id=${target.id}`);
}
writeFileSync('docs/api-verification-v14.json',JSON.stringify({testedAt:new Date().toISOString(),sourceDb:src,targetDb:dst,realOpenAiCalls:0,results},null,2));console.log(results.length+' contrôles V1.4 réussis');

