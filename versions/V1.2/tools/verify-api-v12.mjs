import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const base=process.env.VITASOUSS_TEST_URL??'http://127.0.0.1:5080/api';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+\/api$/.test(base))throw new Error('URL locale obligatoire');
if(!process.env.VITASOUSS_TEST_PASSWORD || !process.env.VITASOUSS_TEST_MYSQL_PASSWORD)throw new Error('Secrets de test requis dans les variables temporaires');
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
function sql(query,setup=false){return execFileSync(mysql,['--host=127.0.0.1','--port=33307',`--user=${setup?(process.env.VITASOUSS_TEST_SETUP_USER??'vitasouss_test'):'vitasouss_test'}`,'--batch','--skip-column-names','--execute',query],{encoding:'utf8',env:{...process.env,MYSQL_PWD:setup?(process.env.VITASOUSS_TEST_SETUP_PASSWORD??''):process.env.VITASOUSS_TEST_MYSQL_PASSWORD}}).trim();}
const results=[];
function check(name,value){assert.ok(value,name);results.push({name,passed:true});console.log('PASS '+name);}
async function session(username,password){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});assert.equal(r.status,200);const data=await r.json();return{cookie:r.headers.get('set-cookie').split(';')[0],csrf:data.csrf};}
const admin=await session('admin',process.env.VITASOUSS_TEST_PASSWORD);
async function call(uri,method='GET',body,actor=admin,csrf=true){const r=await fetch(base+uri,{method,headers:{Cookie:actor.cookie,'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':actor.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,data:await r.json()};}
async function ok(uri,method='GET',body,actor=admin){const r=await call(uri,method,body,actor);assert.equal(r.status,200,uri+': '+JSON.stringify(r.data));return r.data;}
const contexts=await ok('/contexts'),source=contexts.find(c=>c.databaseName==='vitasouss_test_zaouia_v1'),target=contexts.find(c=>c.databaseName==='vitasouss_test_diaf_v1'),archive=contexts.find(c=>c.databaseName==='vitasouss_test_zaouia'&&c.readOnly);assert.ok(source&&target&&archive);
const pre=`/contexts/${source.id}`,dst=`/contexts/${target.id}`;
const catalog=await ok('/catalog');
const key=(name,row)=>Object.fromEntries(catalog.find(e=>e.name===name).keys.map(k=>[k,row[k]]));
const qkey=(name,row)=>encodeURIComponent(JSON.stringify(key(name,row)));
const record=(name,row,context=pre)=>ok(`${context}/entities/${name}/record?key=${qkey(name,row)}`);
const original=await record('verger',{refver:7602});const originalTarget=await record('verger',{refver:7602},dst);
const other=(await ok(pre+'/entities/adherent?pageSize=100')).rows.find(r=>r.refadh!==original.refadh);
const parcelsBefore=await ok(pre+'/entities/parcelle?filter=refver&value=7602&pageSize=100');
const dashboardBefore=await ok(pre+'/dashboard');
const fixtureIds=[32001,32002,32003];
assert.equal(Number(sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.verger WHERE refver IN (32001,32002,32003)')),0,'Références réservées au test déjà utilisées');
const ddl=JSON.parse(readFileSync('docs/historical-schema.json','utf8'));
sql('USE vitasouss_test_zaouia_v1;'+ddl.reception_d.ddl+ddl.parccertificat.ddl,true);
const actors={};const testUsers=[];
let foreignFixture=false;
const incomplete='vitasouss_test_v12_archive_missing';
try{
 for(const role of ['Consultation','Gestionnaire']){const username='v12_'+role.toLowerCase();const config=await ok('/admin/configuration');let user=config.users.find(u=>u.username===username);
  if(!user){await ok('/admin/users','POST',{username,displayName:'Validation V1.2 '+role,role,password:process.env.VITASOUSS_TEST_PASSWORD,contextIds:[source.id,target.id]});user=(await ok('/admin/configuration')).users.find(u=>u.username===username);}else await ok(`/admin/users/${user.id}/access`,'PUT',{role,enabled:true,contextIds:[source.id,target.id]});
  testUsers.push({id:user.id,role});actors[role]=await session(username,process.env.VITASOUSS_TEST_PASSWORD);
 }
 const transferBody={key:key('verger',original),before:original,newAdherent:other.refadh,synchronize:true};
 check('Consultation : transfert refusé',(await call(pre+'/vergers/transfer','POST',transferBody,actors.Consultation)).status===403);
 check('Archive : transfert refusé',(await call(`/contexts/${archive.id}/vergers/transfer`,'POST',transferBody)).status===403);
 check('Transfert : CSRF requis',(await call(pre+'/vergers/transfer','POST',transferBody,admin,false)).status===403);
 check('Nouvel adhérent inexistant refusé',(await call(pre+'/vergers/transfer','POST',{...transferBody,newAdherent:32767,synchronize:false})).status===400);
 const changed=await ok(pre+'/vergers/transfer','POST',transferBody,actors.Gestionnaire);
 let current=await record('verger',original);
 check('Gestionnaire : transfert réel A → B',current.refadh===other.refadh);
 check('Transfert : refver et autres données conservés',catalog.find(e=>e.name==='verger').columns.filter(c=>c.name!=='refadh'&&!c.generated).every(c=>JSON.stringify(current[c.name])===JSON.stringify(original[c.name])));
 check('Transfert : parcelles et clés inchangées',JSON.stringify((await ok(pre+'/entities/parcelle?filter=refver&value=7602&pageSize=100')).rows)===JSON.stringify(parcelsBefore.rows));
 const journal=(await ok(pre+'/journal')).find(c=>c.id===changed.id);
 check('Transfert : journal utilisateur/date/contexte/avant/après',journal.operation==='Transfer'&&journal.status==='Applied'&&journal.userName.includes('Gestionnaire')&&journal.context_id===source.id&&journal.created_at&&JSON.parse(journal.before_json).refadh===original.refadh&&JSON.parse(journal.after_json).refadh===other.refadh);
 check('Transfert : source obsolète refusée',(await call(pre+'/vergers/transfer','POST',transferBody)).status===409);
 check('DIAF : aucune écriture implicite',(await record('verger',original,dst)).refadh===originalTarget.refadh&&changed.synchronization==='Pending');
 const job=(await ok(pre+'/sync')).find(j=>j.change_id===changed.id);const preview=await ok(`/sync/${job.id}/preview`);
 check('DIAF : transfert préparé, refsta exclu',preview.differences.some(d=>d.field==='refadh')&&preview.differences.every(d=>d.field!=='refsta'));
 await ok(`/sync/${job.id}/apply`,'POST',preview.before,actors.Gestionnaire);
 const targetAfter=await record('verger',original,dst);
 check('DIAF : transfert confirmé et refsta conservé',targetAfter.refadh===other.refadh&&targetAfter.refsta===originalTarget.refsta);
 for(const entity of ['adherent','verger','parcelle']){
  const kpi=(await ok(`${pre}/entities/${entity}/kpis`)).metrics;
  check(`KPI ${entity} : total SQL`,kpi.count===Number(sql(`SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.${entity}`)));
  check(`KPI ${entity} : indépendants de la pagination`,JSON.stringify(kpi)===JSON.stringify((await ok(`${pre}/entities/${entity}/kpis?page=7&pageSize=1`)).metrics));
 }
 const pk=(await ok(pre+'/entities/parcelle/kpis')).metrics;
 const globalAdh=(await ok(pre+'/entities/adherent/kpis')).metrics;
 check('KPI adhérents : totaux complets, lignes orphelines incluses',globalAdh.vergers===Number(sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.verger'))&&globalAdh.parcelles===Number(sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.parcelle'))&&Math.abs(globalAdh.surface-Number(sql('SELECT SUM(suppar) FROM vitasouss_test_zaouia_v1.parcelle')))<1e-8);
 const ownedCount=Number(sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.parcelle p JOIN vitasouss_test_zaouia_v1.verger v ON v.refver=p.refver JOIN vitasouss_test_zaouia_v1.adherent a ON a.refadh=v.refadh'));
 check('KPI adhérents : moyenne sur relations réelles',Math.abs(globalAdh.meanParcelles-ownedCount/globalAdh.count)<1e-8);
 const direct=sql('SELECT SUM(suppar),AVG(suppar),COUNT(DISTINCT v.codvar),COUNT(DISTINCT c.codcul) FROM vitasouss_test_zaouia_v1.parcelle p LEFT JOIN vitasouss_test_zaouia_v1.variete v ON v.codvar=p.codvar LEFT JOIN vitasouss_test_zaouia_v1.culture c ON c.codcul=v.codcul').split('\t').map(Number);
 check('KPI parcelles : somme, moyenne, variétés et cultures SQL',Math.abs(pk.surface-direct[0])<1e-8&&Math.abs(pk.meanSurface-direct[1])<1e-8&&pk.varieties===direct[2]&&pk.cultures===direct[3]);
 const filtered=(await ok(pre+'/entities/parcelle/kpis?filter=refver&value=7602')).metrics;
 check('KPI filtrés : toutes les parcelles du verger',filtered.count===Number(sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.parcelle WHERE refver=7602'))&&Math.abs(filtered.surface-Number(sql('SELECT SUM(suppar) FROM vitasouss_test_zaouia_v1.parcelle WHERE refver=7602')))<1e-8);
 const adh=(await ok(`${pre}/entities/adherent/kpis?filter=refadh&value=${other.refadh}`)).metrics;
 const adhSql=sql(`SELECT COUNT(*),SUM(p.suppar) FROM vitasouss_test_zaouia_v1.parcelle p JOIN vitasouss_test_zaouia_v1.verger v ON v.refver=p.refver WHERE v.refadh=${other.refadh}`).split('\t');
 check('KPI adhérent : relation transférée et superficie SQL',adh.count===1&&adh.parcelles===Number(adhSql[0])&&Math.abs(adh.surface-Number(adhSql[1]))<1e-8);
 const vk=(await ok(pre+'/entities/verger/kpis')).metrics;
 const vdirect=sql('SELECT SUM(supver),AVG(supver) FROM vitasouss_test_zaouia_v1.verger').split('\t').map(Number);
 check('KPI vergers : surface déclarée et moyenne SQL',Math.abs(vk.surface-vdirect[0])<1e-8&&Math.abs(vk.meanSurface-vdirect[1])<1e-8);
 check('KPI destination : contexte DIAF indépendant',(await ok(dst+'/entities/parcelle/kpis')).metrics.count===Number(sql('SELECT COUNT(*) FROM vitasouss_test_diaf_v1.parcelle')));
 for(const refver of fixtureIds)await ok(pre+'/entities/verger','POST',{values:{refver,refadh:original.refadh,nomver:'TEST LOCAL V12 '+refver,refsta:source.localRefsta}});
 const free=await record('verger',{refver:32003});
 const freeBody={key:key('verger',free),before:free,confirmation:'SUPPRIMER'};
 check('Suppression : Consultation refusée',(await call(pre+'/entities/verger/delete','POST',freeBody,actors.Consultation)).status===403);
 check('Suppression : archive refusée',(await call(`/contexts/${archive.id}/entities/verger/delete`,'POST',freeBody)).status===403);
 check('Suppression : CSRF requis',(await call(pre+'/entities/verger/delete','POST',freeBody,admin,false)).status===403);
 check('Suppression : confirmation finale requise',(await call(pre+'/entities/verger/delete','POST',{...freeBody,confirmation:''})).status===400);
 check('Suppression : snapshot incomplet refusé',(await call(pre+'/entities/verger/delete','POST',{...freeBody,before:{refver:32003}})).status===409);
 check('Verger isolé : aperçu autorisé',(await ok(pre+`/entities/verger/delete-preview?key=${qkey('verger',free)}`)).canDelete);
 const deleted=await ok(pre+'/entities/verger/delete','POST',freeBody,actors.Gestionnaire);
 check('Verger sans dépendance : suppression réelle',deleted.status==='Applied'&&Number(sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.verger WHERE refver=32003'))===0);
 check('Suppression réussie : audit durable',(await ok(pre+'/journal')).some(j=>j.id===deleted.id&&j.operation==='Delete'&&j.status==='Applied'&&JSON.parse(j.before_json).refver===32003&&JSON.parse(j.after_json)===null));
 for(const [refver,refpar] of [[32001,'V12FREE'],[32002,'V12DEP']])await ok(pre+'/entities/parcelle','POST',{values:{refver,refpar,numcul:'999',codvar:104,codsvar:21,suppar:1.2345}});
 let pfree=(await ok(pre+'/entities/parcelle?filter=refver&value=32001')).rows[0];pfree=await record('parcelle',pfree);
 let pdep=(await ok(pre+'/entities/parcelle?filter=refver&value=32002')).rows[0];pdep=await record('parcelle',pdep);
 check('Parcelle isolée : aperçu autorisé',(await ok(pre+`/entities/parcelle/delete-preview?key=${qkey('parcelle',pfree)}`)).canDelete);
 const pd=await ok(pre+'/entities/parcelle/delete','POST',{key:key('parcelle',pfree),before:pfree,confirmation:'SUPPRIMER'},actors.Gestionnaire);
 check('Parcelle sans dépendance : suppression réelle',pd.status==='Applied'&&Number(sql(`SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.parcelle WHERE idparcelle=${pfree.idparcelle}`))===0);
 assert.equal(Number(sql("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='vitasouss_test_zaouia_v1' AND TABLE_NAME='v12_fk_guard'")),0,'Table de test FK déjà présente');
 sql('USE vitasouss_test_zaouia_v1; CREATE TABLE v12_fk_guard(id INT PRIMARY KEY, parent_verger INT, FOREIGN KEY(parent_verger) REFERENCES verger(refver) ON DELETE CASCADE) ENGINE=InnoDB',true);foreignFixture=true;
 sql('INSERT INTO vitasouss_test_zaouia_v1.v12_fk_guard VALUES(12000001,32001)');
 const fkParent=await record('verger',{refver:32001});const fkBlock=await call(pre+'/entities/verger/delete','POST',{key:key('verger',fkParent),before:fkParent,confirmation:'SUPPRIMER'});
 check('Clé étrangère à nom différent : suppression bloquée',fkBlock.status===409&&fkBlock.data.title.includes('v12_fk_guard'));
 check('Cascade historique : aucune donnée dépendante supprimée',Number(sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.v12_fk_guard WHERE id=12000001'))===1);
 sql('DROP TABLE vitasouss_test_zaouia_v1.v12_fk_guard',true);foreignFixture=false;
 const parent=await record('verger',{refver:32002});const blockedParent=await call(pre+'/entities/verger/delete','POST',{key:key('verger',parent),before:parent,confirmation:'SUPPRIMER'});
 check('Verger avec parcelle : refus sans cascade',blockedParent.status===409&&Number(sql(`SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.parcelle WHERE idparcelle=${pdep.idparcelle}`))===1);
 const checked=await ok(pre+`/entities/parcelle/delete-preview?key=${qkey('parcelle',pdep)}`);check('Contrôle initial sans dépendance',checked.canDelete);
 sql(`INSERT INTO vitasouss_test_zaouia_v1.parccertificat(idpar,idcert) VALUES(${pdep.idparcelle},32000)`);
 const blocked=await call(pre+'/entities/parcelle/delete','POST',{key:key('parcelle',pdep),before:pdep,confirmation:'SUPPRIMER'});
 check('Dépendance ajoutée après aperçu : refus par revérification',blocked.status===409&&blocked.data.title.includes('parccertificat'));
 check('Alias idpar : parcelle conservée',Number(sql(`SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.parcelle WHERE idparcelle=${pdep.idparcelle}`))===1);
 check('Tentative bloquée : journal tracé',(await ok(pre+'/journal')).some(j=>j.operation==='Delete'&&j.status==='Blocked'&&JSON.parse(j.before_json).idparcelle===pdep.idparcelle&&j.error.includes('parccertificat')));
 sql(`DELETE FROM vitasouss_test_zaouia_v1.parccertificat WHERE idpar=${pdep.idparcelle} AND idcert=32000; INSERT INTO vitasouss_test_zaouia_v1.reception_d(numrec,refpar,numcul,refver) VALUES(2000000001,'V12DEP',999,32002)`);
 const withReception=await ok(pre+`/entities/parcelle/delete-preview?key=${qkey('parcelle',pdep)}`);
 check('Réception : clé parcelle composée détectée',!withReception.canDelete&&withReception.dependencies.some(d=>d.table==='reception_d'));
 sql("DELETE FROM vitasouss_test_zaouia_v1.reception_d WHERE numrec=2000000001 AND refver=32002 AND refpar='V12DEP'");
 await ok(pre+'/entities/parcelle/delete','POST',{key:key('parcelle',pdep),before:pdep,confirmation:'SUPPRIMER'});
 for(const refver of [32001,32002]){const r=await record('verger',{refver});await ok(pre+'/entities/verger/delete','POST',{key:key('verger',r),before:r,confirmation:'SUPPRIMER'});}
 check('Autres référentiels : suppression toujours désactivée',(await call(pre+'/entities/culture/delete','POST',{key:{codcul:100},before:{},confirmation:'SUPPRIMER'})).status===409);
 sql(`CREATE DATABASE IF NOT EXISTS ${incomplete}; CREATE TABLE IF NOT EXISTS ${incomplete}.parcelle LIKE vitasouss_test_zaouia_v1.parcelle; CREATE TABLE IF NOT EXISTS ${incomplete}.variete LIKE vitasouss_test_zaouia_v1.variete; CREATE TABLE IF NOT EXISTS ${incomplete}.culture LIKE vitasouss_test_zaouia_v1.culture;`,true);
 if(Number(sql(`SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${incomplete}' AND TABLE_NAME='parcelle' AND COLUMN_NAME='suppar'`)))sql(`ALTER TABLE ${incomplete}.parcelle DROP COLUMN suppar`,true);
 let missing=(await ok('/admin/configuration')).contexts.find(c=>c.database_name===incomplete);
 if(!missing){const config=await ok('/admin/configuration');const station=config.stations.find(s=>s.code==='ZAOUIA');await ok('/admin/contexts','POST',{stationId:station.id,databaseName:incomplete,label:'TEST V12 archive sans superficie',readOnly:true,localRefsta:7816});missing=(await ok('/contexts')).find(c=>c.databaseName===incomplete);}
 sql(`UPDATE referentiels_admin.app_contexts SET enabled=1 WHERE id=${missing.id} AND database_name='${incomplete}' AND label='TEST V12 archive sans superficie'`,true);
 const absent=await ok(`/contexts/${missing.id}/entities/parcelle/kpis`);
 check('Archive ancienne : superficie absente non inventée',absent.metrics.surface===null&&absent.metrics.meanSurface===null&&absent.warnings.some(w=>w.includes('parcelle')));
 check('KPI archive : total SQL réel',(await ok(`/contexts/${archive.id}/entities/parcelle/kpis`)).metrics.count===Number(sql('SELECT COUNT(*) FROM vitasouss_test_zaouia.parcelle')));
}finally{
 sql(`UPDATE referentiels_admin.app_contexts SET enabled=0 WHERE database_name='${incomplete}' AND label='TEST V12 archive sans superficie'`,true);
 if(foreignFixture)sql('DROP TABLE vitasouss_test_zaouia_v1.v12_fk_guard',true);
 for(const context of [pre,dst]){const current=await record('verger',original,context);const owner=context===pre?original.refadh:originalTarget.refadh;if(current.refadh!==owner)await ok(context+'/vergers/transfer','POST',{key:key('verger',current),before:current,newAdherent:owner,synchronize:false});}
 sql("DELETE FROM vitasouss_test_zaouia_v1.reception_d WHERE numrec=2000000001 AND refver=32002 AND refpar='V12DEP'; DELETE FROM vitasouss_test_zaouia_v1.parccertificat WHERE idcert=32000 AND idpar IN (SELECT idparcelle FROM vitasouss_test_zaouia_v1.parcelle WHERE refver IN(32001,32002,32003)); DELETE FROM vitasouss_test_zaouia_v1.parcelle WHERE refver IN(32001,32002,32003) AND refpar IN('V12FREE','V12DEP'); DELETE FROM vitasouss_test_zaouia_v1.verger WHERE refver IN(32001,32002,32003) AND nomver LIKE 'TEST LOCAL V12 %';");
 for(const user of testUsers)await ok(`/admin/users/${user.id}/access`,'PUT',{role:user.role,enabled:false,contextIds:[]});
}
check('Données métier et volumes restaurés après tests',JSON.stringify((await ok(pre+'/dashboard')).counts)===JSON.stringify(dashboardBefore.counts)&&(await record('verger',original)).refadh===original.refadh&&(await record('verger',original,dst)).refsta===originalTarget.refsta);
writeFileSync('docs/api-verification-v12.json',JSON.stringify({testedAt:new Date().toISOString(),mysql:'5.7.44',base,results},null,2));
console.log(`${results.length} vérifications V1.2 réussies.`);
