import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
if(!process.env.VITASOUSS_TEST_PASSWORD)throw Error('Recette locale uniquement');
const base='http://127.0.0.1:5080/api',mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
const sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--batch','--skip-column-names','--execute',q],{encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
const report=JSON.parse(readFileSync('docs/api-verification-v141.json','utf8'));
const db=report.sourceDb;assert.match(db,/^vitasouss_test_v141_src_\d+$/);
const contextId=Number(sql(`SELECT id FROM referentiels_admin.app_contexts WHERE database_name='${db}';`));assert.ok(contextId);
const previous=Number(sql(`SELECT enabled FROM referentiels_admin.app_contexts WHERE id=${contextId};`));
const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:process.env.VITASOUSS_TEST_PASSWORD})});assert.equal(r.status,200);const auth=await r.json();const actor=r.headers.get('set-cookie').split(';')[0];
async function get(uri){const r=await fetch(base+uri,{headers:{Cookie:actor}});assert.equal(r.status,200,await r.clone().text());return r.json();}
const config=await get('/admin/configuration');const ctx=config.contexts.find(c=>c.id===contextId);const station=config.stations.find(s=>s.id===ctx.station_id);const server=config.servers.find(s=>s.id===station.server_id);assert.equal(server.host,'127.0.0.1');assert.equal(server.port,33307);
const results=[];const check=(name,ok)=>{assert.ok(ok,name);results.push({name,passed:true});console.log('PASS '+name);};
let failure;
sql(`UPDATE referentiels_admin.app_contexts SET enabled=1 WHERE id=${contextId};`);
try {
 const pre=`/contexts/${contextId}`;
 for(const [module,table] of [['receptions','reception'],['caisserie','caisserie'],['versements','versement'],['export','dossier'],['ecarts','ecart_e']]){
  const data=await get(pre+'/boards/'+module);check('Opérations '+module+' : cardinalité réelle',data.available&&data.total===Number(sql(`SELECT COUNT(*) FROM ${db}.${table};`))&&data.rows.length<=25&&!data.canWrite);
 }
 const receptions=await get(pre+'/boards/receptions?from=2026-01-10&to=2026-01-10');
 check('Période inclusive des réceptions',receptions.total===1&&receptions.evolution[0].count===1);
 check('Réception affiche le verger réel par son nom',receptions.displayRows[0].refverreel.includes('VERGER TEST A'));
 const exports=await get(pre+'/boards/export');
 check('Dossier affiche exportateur et transitaire',exports.displayRows[0].refexp==='EXP CORRIGE'&&exports.displayRows[0].refte==='TRANSIT TEST');
 check('Dossier affiche transporteurs',exports.displayRows[0].reftrp==='TRANSPORT TEST'&&exports.displayRows[0].reftm==='MARITIME TEST');
 const defects=await get(pre+'/pilot/defaut');
 check('Famille de défaut demeure un texte libre',defects.displayRows.find(d=>d.coddef===2).famdef==='FAMILLE NOUVELLE');
 check('Culture de défaut affiche son nom',defects.displayRows.find(d=>d.coddef===2).culture==='AVOCAT TEST');
 sql(`UPDATE ${db}.defaut SET famdef='' WHERE coddef=2;`);
 try{check('Famille vide ne devient pas une fausse relation absente',(await get(pre+'/pilot/defaut')).displayRows.find(d=>d.coddef===2).famdef==='');}
 finally{sql(`UPDATE ${db}.defaut SET famdef='FAMILLE NOUVELLE' WHERE coddef=2;`);}
 if(sql(`SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='${db}' AND TABLE_NAME='destination' AND INDEX_NAME='test_label_unique';`)==='0')sql(`ALTER TABLE ${db}.destination ADD UNIQUE KEY test_label_unique(vildes);`);
 sql(`CREATE TABLE IF NOT EXISTS ${db}.test_label_dependency(id INT PRIMARY KEY,destination_name CHAR(30),CONSTRAINT test_label_fk FOREIGN KEY(destination_name) REFERENCES ${db}.destination(vildes) ON UPDATE CASCADE ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=latin1;INSERT INTO ${db}.test_label_dependency(id,destination_name)VALUES(1,'DEST CORRIGEE');`);
 try {
  const raw=(await get(pre+'/pilot/destination')).rows.find(r=>r.coddes===1);
  const changed=await fetch(base+pre+'/pilot/destination',{method:'PUT',headers:{Cookie:actor,'Content-Type':'application/json','X-CSRF-Token':auth.csrf},body:JSON.stringify({key:{coddes:1},before:raw,values:{vildes:'REFUS CASCADE'}})});
  check('Contrainte SQL supplémentaire : UPDATE cascade refusé',changed.status===409);
  check('Aucun UPDATE cascade exécuté',sql(`SELECT destination_name FROM ${db}.test_label_dependency WHERE id=1;`)==='DEST CORRIGEE');
 }finally{sql(`DELETE FROM ${db}.test_label_dependency WHERE id=1;`);}
 sql(`REVOKE SELECT ON ${db}.* FROM 'vitasouss_test'@'127.0.0.1';GRANT SELECT ON ${db}.grpemb TO 'vitasouss_test'@'127.0.0.1';GRANT SELECT ON ${db}.groupart TO 'vitasouss_test'@'127.0.0.1';`);
 try {
  const denied=await fetch(base+pre+'/pilot/grpemb',{method:'POST',headers:{Cookie:actor,'Content-Type':'application/json','X-CSRF-Token':auth.csrf},body:JSON.stringify({key:{},before:{},values:{nomgre:'REFUS METADATA'}})});
  check('Visibilité partielle du schéma : écriture protégée',denied.status===409&&(await denied.json()).title.includes('Inspection complète'));
 }finally{sql(`GRANT SELECT ON ${db}.* TO 'vitasouss_test'@'127.0.0.1';`);}
 const contextList=await get('/contexts'),source=contextList.find(c=>c.databaseName===db);check('Contexte utilisé identifié',source.station==='ZAOUIA'&&source.isMaster);
}catch(e){failure=e;results.push({name:e.message,passed:false});console.error(e);}
finally {sql(`UPDATE referentiels_admin.app_contexts SET enabled=${previous} WHERE id=${contextId};`);writeFileSync('docs/boards-verification-v141.json',JSON.stringify({date:new Date().toISOString(),sourceDb:db,data:'Données synthétiques du test V1.4.1',passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,results},null,2));}
if(failure)process.exitCode=1;
