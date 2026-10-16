import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const base=process.env.VITASOUSS_TEST_URL??'http://127.0.0.1:5080/api';
if(!/^http:\/\/127\.0\.0\.1:\d+\/api$/.test(base)||!process.env.VITASOUSS_TEST_PASSWORD||!process.env.VITASOUSS_TEST_MYSQL_PASSWORD)throw Error('Copie locale et secrets temporaires obligatoires');
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
const sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--batch','--skip-column-names','--execute',"SET SESSION sql_mode=''; "+q],{encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
const results=[];function check(name,condition){assert.ok(condition,name);results.push({name,passed:true});console.log('PASS '+name);}
async function login(username){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:process.env.VITASOUSS_TEST_PASSWORD})});assert.equal(r.status,200);const d=await r.json();return{cookie:r.headers.get('set-cookie').split(';')[0],csrf:d.csrf};}
const admin=await login('admin');
async function call(uri,method='GET',body,actor=admin,csrf=true){const r=await fetch(base+uri,{method,headers:{Cookie:actor.cookie,'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':actor.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,data:await r.json()};}
async function ok(...args){const r=await call(...args);assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
const config=await ok('/admin/configuration'),catalog=await ok('/catalog');
const stamp=Date.now(),sourceDb='vitasouss_test_v13_src_'+stamp,targetDb='vitasouss_test_v13_dst_'+stamp;
const definitions=JSON.parse(readFileSync('backend/pilot-schema.json','utf8').replace(/^\uFEFF/,''));
for(const db of [sourceDb,targetDb]){
 assert.match(db,/^vitasouss_test_v13_(src|dst)_\d+$/);assert.equal(sql(`SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${db}'`),'0');sql(`CREATE DATABASE ${db} CHARACTER SET latin1`);
 for(const table of sql('SHOW TABLES FROM vitasouss_test_zaouia_v1').split(/\r?\n/)){assert.match(table,/^[a-zA-Z0-9_]+$/);sql(`CREATE TABLE ${db}.${table} LIKE vitasouss_test_zaouia_v1.${table}; INSERT INTO ${db}.${table} SELECT * FROM vitasouss_test_zaouia_v1.${table}`);}
 for(const entity of definitions)sql('USE '+db+';'+entity.ddl);
 sql(`INSERT INTO ${db}.pays(codpay,nompay,abrpay) VALUES(32001,'PAYS TEST','PT');INSERT INTO ${db}.typeecart(codtype,destype) VALUES(32001,'TYPE TEST');INSERT INTO ${db}.defaut(coddef,intdef) VALUES(32001,'DEFAUT TEST');INSERT INTO ${db}.destination(coddes,vildes,codpay) VALUES(32001,'VILLE TEST',32001);INSERT INTO ${db}.grpemb(codgre,nomgre) VALUES(1,'GROUPE A'),(1,'DOUBLON HISTORIQUE');INSERT INTO ${db}.groupart(codgrp,type,codgre) VALUES(1,'ARTICLE TEST',1);INSERT INTO ${db}.partenaire(ref,nom,codpay) VALUES(9007199254740993,'PARTENAIRE TEST',32001);INSERT INTO ${db}.declaration_verger(refver_reel,refver_nreel,codvar,refstat) VALUES(7602,6503,104,7816);`);
 sql(`INSERT INTO ${db}.reception(numrec,dterec,refver,codvar,refsta,netrec) VALUES(2000001301,'2026-10-01',7602,104,7816,100),(2000001302,'2026-10-02',7602,104,7816,200);INSERT INTO ${db}.caisserie(numcai,dtecai,refadh,refver,refsta) VALUES(2000001301,'2026-10-01',76,7602,7816);INSERT INTO ${db}.versement(numver,datver,refver,codvar,refsta) VALUES(2000001301,'2026-10-01',7602,104,7816);INSERT INTO ${db}.dossier(numdos,dtedep,coddes) VALUES(2000001301,'2026-10-01',32001);INSERT INTO ${db}.ecart_e(numpal,dtepal,codtype,codvar) VALUES(2000001301,'2026-10-01',32001,104);`);
 sql(`GRANT SELECT,LOCK TABLES ON ${db}.* TO 'vitasouss_test'@'127.0.0.1'`);
 for(const table of ['adherent','verger','parcelle','culture','grpvar','variete','pays','defaut','typeecart','partenaire','destination','groupart'])sql(`GRANT INSERT,UPDATE,TRIGGER ON ${db}.${table} TO 'vitasouss_test'@'127.0.0.1'`);
}
sql(`UPDATE ${targetDb}.verger SET refsta=1234 WHERE refver=7602;UPDATE ${sourceDb}.verger SET nomver='V13 ORIGINE SOURCE' WHERE refver=7602;UPDATE ${targetDb}.verger SET nomver='V13 DESTINATION' WHERE refver=7602;INSERT INTO ${sourceDb}.culture(codcul,nomcul) VALUES(32001,'CULTURE PILOTE');`);
for(const [db,station]of[[sourceDb,'ZAOUIA'],[targetDb,'DIAF']])await ok('/admin/contexts','POST',{stationId:config.stations.find(s=>s.code===station).id,databaseName:db,label:'TEST ISOLÉ V13 '+station,readOnly:false,localRefsta:station==='DIAF'?1234:7816});
const contexts=await ok('/contexts'),source=contexts.find(c=>c.databaseName===sourceDb),target=contexts.find(c=>c.databaseName===targetDb),archive=contexts.find(c=>c.databaseName==='vitasouss_test_zaouia'&&c.readOnly),pre=`/contexts/${source.id}`;
await ok('/admin/routes','POST',{sourceContextId:source.id,targetContextId:target.id});
const users=[],actors={};
const key=(name,row)=>Object.fromEntries(catalog.find(e=>e.name===name).keys.map(k=>[k,row[k]]));
const record=(name,row,id=source.id)=>ok(`/contexts/${id}/entities/${name}/record?key=${encodeURIComponent(JSON.stringify(key(name,row)))}`);
try{
 for(const role of ['Consultation','Gestionnaire']){const username='v13_'+role.toLowerCase();let user=(await ok('/admin/configuration')).users.find(u=>u.username===username);if(!user){await ok('/admin/users','POST',{username,displayName:'Test V13 '+role,role,password:process.env.VITASOUSS_TEST_PASSWORD,contextIds:[source.id,target.id]});user=(await ok('/admin/configuration')).users.find(u=>u.username===username);}else await ok(`/admin/users/${user.id}/access`,'PUT',{role,enabled:true,contextIds:[source.id,target.id]});users.push({id:user.id,role});actors[role]=await login(username);}
 check('Version pilote 1.3',(await ok('/health')).version===(process.env.VITASOUSS_EXPECTED_VERSION??'1.4'));
 check('Catalogue V1.2.1 conservé',catalog.length===7);
 check('Huit référentiels complémentaires',(await ok('/pilot/catalog')).length===8);
 const filters=encodeURIComponent(JSON.stringify({refadh:76,refver:7602}));
 const list=await ok(pre+'/entities/verger?filters='+filters),kpi=await ok(pre+'/entities/verger/kpis?filters='+filters);
 check('Filtres combinés liste et KPI identiques',list.total===1&&kpi.metrics.count===1&&list.rows[0].refver===7602);
 check('Filtres et pagination cohérents',(await ok(pre+'/entities/verger?filters='+filters+'&page=2')).total===1);
 check('Filtres et recherche cohérents',(await ok(pre+'/entities/verger?filters='+filters+'&search=INTROUVABLE')).total===0);
 check('Filtre SQL arbitraire interdit',(await call(pre+'/entities/verger?filters='+encodeURIComponent(JSON.stringify({'refver` OR 1=1':1})))).status===400);
 check('Filtres JSON invalides refusés',(await call(pre+'/entities/verger?filters=INVALID')).status===400);
 for(const name of ['declaration_verger','partenaire','destination','pays','grpemb','groupart','defaut','typeecart']){const result=await ok(pre+'/pilot/'+name);check('Liste pilote '+name+' : volume SQL réel',result.available&&result.total===Number(sql(`SELECT COUNT(*) FROM ${sourceDb}.${name}`)));}
 const partner=await ok(pre+'/pilot/partenaire');check('Bigint partenaire sans perte de précision',partner.rows[0].ref==='9007199254740993'&&partner.canWrite);
 check('Partenaire : libellé modifié avec bigint exact',(await ok(pre+'/pilot/partenaire','PUT',{key:{ref:partner.rows[0].ref},before:partner.rows[0],values:{nom:'PARTENAIRE MODIFIÉ'}})).status==='Applied'&&(await ok(pre+'/pilot/partenaire')).rows[0].nom==='PARTENAIRE MODIFIÉ'&&sql(`SELECT COUNT(*) FROM ${sourceDb}.partenaire WHERE ref=9007199254740993`)==='1');
 for(const [name,keyField,label]of[['destination','coddes','vildes'],['groupart','codgrp','type']]){const row=(await ok(pre+'/pilot/'+name)).rows[0];check(name+' : modification de libellé sur clé unique',(await ok(pre+'/pilot/'+name,'PUT',{key:{[keyField]:row[keyField]},before:row,values:{[label]:'LIBELLÉ PILOTE'}})).status==='Applied');}
 const declaration=await ok(pre+'/pilot/declaration_verger');check('Déclaration MyISAM : lecture protégée',!declaration.canWrite&&declaration.rows[0].refver_nreel===6503);
 check('Groupes sans clé unique : écriture protégée',!(await ok(pre+'/pilot/grpemb')).canWrite&&(await call(pre+'/pilot/grpemb','POST',{key:{},before:{},values:{codgre:2,nomgre:'REFUS'}})).status===409);
 const country=(await ok(pre+'/pilot/pays')).rows[0];
 const update={key:{codpay:country.codpay},before:country,values:{nompay:'NOM MODIFIÉ'}};
 check('Pilote : Consultation ne modifie pas',(await call(pre+'/pilot/pays','PUT',update,actors.Consultation)).status===403);
 check('Pilote : archive ne modifie pas',(await call(`/contexts/${archive.id}/pilot/pays`,'PUT',update)).status===403);
 check('Pilote : CSRF obligatoire',(await call(pre+'/pilot/pays','PUT',update,admin,false)).status===403);
 const countryChange=await ok(pre+'/pilot/pays','PUT',update,actors.Gestionnaire);
 check('Pays : modification de libellé contrôlée',countryChange.status==='Applied');
 assert.match(countryChange.id,/^[a-f0-9-]{36}$/);sql(`UPDATE referentiels_admin.app_changes SET status='Prepared' WHERE id='${countryChange.id}' AND context_id=${source.id}`);
 check('Nouveau référentiel : réconciliation du journal existante',(await ok(`/admin/changes/${countryChange.id}/reconcile`,'POST',{})).message.includes('réconcilié'));
 check('Pays : ancien snapshot refusé',(await call(pre+'/pilot/pays','PUT',update)).status===409);
 check('Pays : relations non validées immuables',(await call(pre+'/pilot/pays','PUT',{...update,values:{codmar:1}})).status===400);
 check('Types écart : création avec clé explicite',(await ok(pre+'/pilot/typeecart','POST',{key:{},before:{},values:{codtype:32002,destype:'NOUVEAU TYPE'}})).status==='Applied');
 check('Partenaire : identifiant bigint hors limites refusé',(await call(pre+'/pilot/partenaire','POST',{key:{},before:{},values:{ref:'9223372036854775808',nom:'REFUS'}})).status===400);
 check('Libellé vide : refus avant écriture',(await call(pre+'/pilot/typeecart','POST',{key:{},before:{},values:{codtype:32003,destype:''}})).status===400);
 check('Nouvelle suppression : protégée côté API',(await call(pre+'/pilot/typeecart/delete','POST',{})).status===409);
 sql(`REVOKE TRIGGER ON ${sourceDb}.typeecart FROM 'vitasouss_test'@'127.0.0.1'`);
 try{check('Déclencheurs masqués : écriture protégée',!(await ok(pre+'/pilot/typeecart')).canWrite&&(await call(pre+'/pilot/typeecart','POST',{key:{},before:{},values:{codtype:32003,destype:'REFUS SANS INSPECTION'}})).status===409);}finally{sql(`GRANT TRIGGER ON ${sourceDb}.typeecart TO 'vitasouss_test'@'127.0.0.1'`);}
 const archiveResult=await ok(`/contexts/${archive.id}/pilot/pays`);check('Archive sans table : non disponible sans panne',!archiveResult.available&&archiveResult.total===null);
 for(const [module,table]of[['receptions','reception'],['caisserie','caisserie'],['versements','versement'],['export','dossier'],['ecarts','ecart_e']]){const result=await ok(pre+'/boards/'+module);check('Dashboard '+module+' : total SQL et détail paginé',result.available&&result.total===Number(sql(`SELECT COUNT(*) FROM ${sourceDb}.${table}`))&&result.rows.length<=25);}
 const period=await ok(pre+'/boards/receptions?from=2026-10-01&to=2026-10-01');check('Dashboard : période et évolution cohérentes',period.total===1&&period.evolution.length===1&&period.evolution[0].count===1);
 check('Dashboard : filtre verger réel',(await ok(pre+'/boards/receptions?filters='+encodeURIComponent(JSON.stringify({refver:7602})))).total===2);
 check('Dashboard : date invalide refusée',(await call(pre+'/boards/receptions?from=INVALIDE')).status===400);
 check('Dashboard : module inconnu refusé',(await call(pre+'/boards/sql_libre')).status===403);
 const src=await record('verger',{refver:7602}),dst=await record('verger',{refver:7602},target.id);
 const request={name:'verger',targetId:target.id,items:[{key:key('verger',src),source:src,target:dst}]};
 check('Comparaison appliquée : Consultation refusée',(await call(pre+'/comparison/prepare','POST',request,actors.Consultation)).status===403);
 check('Comparaison appliquée : archive refusée',(await call(`/contexts/${archive.id}/comparison/prepare`,'POST',request)).status===403);
 check('Comparaison appliquée : CSRF obligatoire',(await call(pre+'/comparison/prepare','POST',request,admin,false)).status===403);
 const prepared=await ok(pre+'/comparison/prepare','POST',request,actors.Gestionnaire),item=prepared.items[0];
 check('Comparaison : demande durable sans écriture source',item.status==='Prepared'&&(await record('verger',{refver:7602})).nomver===src.nomver);
 check('Comparaison : DIAF inchangé avant confirmation',(await record('verger',{refver:7602},target.id)).nomver===dst.nomver);
 const preview=await ok(`/sync/${item.jobId}/preview`);check('Comparaison : patch sans refsta',preview.differences.some(d=>d.field==='nomver')&&preview.differences.every(d=>d.field!=='refsta'));
 await ok(`/sync/${item.jobId}/apply`,'POST',item.before,actors.Gestionnaire);
 const applied=await record('verger',{refver:7602},target.id);check('Comparaison : UPDATE DIAF confirmé, refsta local préservé',applied.nomver===src.nomver&&applied.refsta===1234);
 check('Comparaison : ancien aperçu cible refusé',(await ok(pre+'/comparison/prepare','POST',request)).items[0].status==='Refused');
 const culture=await record('culture',{codcul:32001});
 const creation=await ok(pre+'/comparison/prepare','POST',{name:'culture',targetId:target.id,items:[{key:key('culture',culture),source:culture,target:null}]});
 const cjob=creation.items[0];check('Comparaison : création sûre préparée, pas implicite',cjob.status==='Prepared'&&sql(`SELECT COUNT(*) FROM ${targetDb}.culture WHERE codcul=32001`)==='0');
 const cpreview=await ok(`/sync/${cjob.jobId}/preview`);check('Création DIAF : aperçu explicite sans refsta',Object.keys(cpreview.before).length===0&&cpreview.differences.every(d=>d.field!=='refsta'));
 await ok(`/sync/${cjob.jobId}/apply`,'POST',{},actors.Gestionnaire);check('Création DIAF : identité explicite conservée',(await record('culture',{codcul:32001},target.id)).nomcul===culture.nomcul);
 check('Création dépendante : protégée sans demande aveugle',(await ok(pre+'/comparison/prepare','POST',{name:'verger',targetId:target.id,items:[{key:key('verger',src),source:src,target:null}]})).items[0].status==='Refused');
 const sub=await record('souvar',{codsvar:21,codvar:104}),tsub=await record('souvar',{codsvar:21,codvar:104},target.id);
 check('Comparaison : sous-variété MyISAM sans PK protégée',(await ok(pre+'/comparison/prepare','POST',{name:'souvar',targetId:target.id,items:[{key:key('souvar',sub),source:sub,target:tsub}]})).items[0].status==='Refused');
 check('File : opérations comparaison journalisées',(await ok(pre+'/journal')).some(j=>j.operation==='CompareUpdate')&&(await ok(pre+'/journal')).some(j=>j.operation==='CompareCreate'));
 const assistant=await ok('/assistant');check('Assistant sans provider : état sûr et build fonctionnel',!assistant.configured&&!assistant.sqlGeneration&&!assistant.mutations);
 check('Assistant : outil adhérent contrôlé',(await ok(pre+'/assistant/tools/adherent?refadh=76', 'GET',undefined,actors.Consultation)).record.refadh===76);
 const parcels=await ok(pre+'/assistant/tools/parcelles-adherent?refadh=76');check('Assistant : parcelles liées et limite SQL',parcels.total>=12&&parcels.rows.length<=25);
 check('Assistant : SQL libre refusé',(await call(pre+'/assistant/tools/DELETE')).status===403);
 check('Assistant : contexte non attribué refusé',(await call(`/contexts/${archive.id}/assistant/tools/receptions`,'GET',undefined,actors.Consultation)).status===403);
 const unavailableChat=await call(pre+'/assistant/chat','POST',{question:'Quelle variété ?'});
 check('Assistant : chat non configuré explicite',unavailableChat.status===200&&!unavailableChat.data.available&&unavailableChat.data.message==='Assistant IA indisponible');
 check('Aucune mutation reception_d',(sql(`SELECT COUNT(*) FROM ${sourceDb}.reception_d`)==='0')&&(sql(`SELECT COUNT(*) FROM ${targetDb}.reception_d`)==='0'));
}finally{for(const u of users)await ok(`/admin/users/${u.id}/access`,'PUT',{role:u.role,enabled:false,contextIds:[]});sql(`UPDATE referentiels_admin.app_contexts SET enabled=0 WHERE database_name IN('${sourceDb}','${targetDb}') AND label LIKE 'TEST ISOLÉ V13 %'`);sql(`UPDATE referentiels_admin.app_sync_routes SET enabled=0 WHERE source_context_id=${source.id} AND target_context_id=${target.id}`);}
writeFileSync('docs/api-verification-v13.json',JSON.stringify({testedAt:new Date().toISOString(),mysql:'5.7.44',base,sourceDb,targetDb,results},null,2));console.log(`${results.length} vérifications V1.3 réussies.`);



