import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
const base='http://127.0.0.1:5080/api',password=process.env.VITASOUSS_TEST_PASSWORD;
assert.ok(password,'Mot de passe de test local requis via variable environnement');
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
const sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--default-character-set=utf8mb4','--batch','--raw','--skip-column-names'],{input:"SET SESSION sql_mode='';\n"+q,encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
const results=[];function check(name,value){assert.ok(value,name);results.push({name,passed:true});console.log('PASS '+name);}
async function login(username='admin'){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});assert.equal(r.status,200,await r.clone().text());const d=await r.json();return{cookie:r.headers.get('set-cookie').split(';')[0],csrf:d.csrf};}
const admin=await login();
async function call(uri,method='GET',body,actor=admin,csrf=true){const r=await fetch(base+uri,{method,headers:{Cookie:actor.cookie,'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':actor.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,data:await r.json().catch(()=>null)};}
async function ok(...args){const r=await call(...args);assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
const cfg=await ok('/admin/configuration'),station=cfg.stations.find(s=>s.code==='ZAOUIA'),server=cfg.servers.find(s=>s.id===station.server_id);
assert.equal(server.host,'127.0.0.1');assert.equal(server.port,33307);
const nonce=randomUUID().replaceAll('-',''),db='vitasouss_test_dr1321_'+nonce;
assert.match(db,/^vitasouss_test_dr1321_[a-f0-9]{32}$/);assert.equal(sql(`SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${db}'`),'0');
const dump=readFileSync(process.env.VITASOUSS_TEST_DDL_DUMP??'tests/DrencherV132Tests/fixtures/logista-schema-only.sql','utf8');
const ddl=[...dump.matchAll(/CREATE TABLE IF NOT EXISTS `([^`]+)` \(([\s\S]*?)\) ENGINE=[^;]+;/g)].filter(m=>['palbrut','reception','variete','verger','adherent'].includes(m[1])).map(m=>m[0]);assert.equal(ddl.length,5);
const extensions=['vit_dr_produit_document','vit_dr_cycle_v132'];
const tables=['vit_traitement_produit','vit_dr_programme','vit_dr_programme_revision','vit_dr_mutex','vit_dr_stock_lot','vit_dr_cycle','vit_dr_revision','vit_dr_palette_validee','vit_dr_mouvement','vit_dr_admin_historique','vit_dr_palette_reservee','vit_dr_reservation_etat',...extensions];
const migration=['004_drencher_business.sql','010_drencher_reservations.sql','011_drencher_v132.sql'].map(f=>readFileSync('sql/'+f,'utf8')).join('\n');
sql(`CREATE DATABASE ${db} CHARACTER SET latin1;USE ${db};`+ddl.join('\n')+migration+`GRANT SELECT ON ${db}.* TO 'vitasouss_test'@'127.0.0.1';`+tables.map(t=>`GRANT INSERT,UPDATE,DELETE,TRIGGER ON ${db}.${t} TO 'vitasouss_test'@'127.0.0.1';`).join('\n'));
const contexts=[],users=[];let success=false;
async function context(name,label,readOnly=false){await ok('/admin/contexts','POST',{stationId:station.id,databaseName:name,label,readOnly,localRefsta:7816});const c=(await ok('/admin/configuration')).contexts.find(c=>c.database_name===name&&c.label===label);contexts.push(c.id);return c.id;}
const cid=await context(db,'TEST LOCAL V1321 '+nonce),pre=`/contexts/${cid}/drencher`;
const archive=await context(db+'_archive','ARCHIVE SYNTHETIQUE '+nonce,true);
async function makeUser(label,role,flags){const username='dr1321_'+label+'_'+nonce;await ok('/admin/users','POST',{username,displayName:'TEST V1321 '+label,password,role,contextIds:[cid,archive]});const u=(await ok('/admin/configuration')).users.find(u=>u.username===username);users.push(u);const permissions=await ok('/admin/users/'+u.id+'/permissions');await ok('/admin/users/'+u.id+'/permissions','PUT',{permissions:permissions.map(p=>({...p,view:!!flags[p.module]?.view,add:!!flags[p.module]?.add,modify:!!flags[p.module]?.modify,delete:false}))});return login(username);}
const views={drencher:{view:true}};
const fingerprint=()=>sql(`USE ${db};CHECKSUM TABLE palbrut,reception,variete,verger,adherent;`);
const scalar=q=>sql(`USE ${db};`+q);
try {
 await ok(pre+'/reservations/initialize','POST',{confirmation:'INITIALISER RESERVATIONS'});
 sql(`USE ${db};INSERT INTO adherent(refadh,nomadh) VALUES(1,'FICTIF');INSERT INTO verger(refver,nomver,refadh) VALUES(101,'FICTIF',1);INSERT INTO variete(codvar,nomvar) VALUES(104,'FICTIVE');INSERT INTO reception(numrec,refsta,codvar,refver,dterec) VALUES(1,7816,104,101,'2026-10-14');INSERT INTO palbrut(numpal,numrec,codvar,refver,refadh,pdsfru) VALUES(1,1,104,101,1,500),(2,1,104,101,1,500),(3,1,104,101,1,500);`);
 const op=await makeUser('own_hicham','Gestionnaire',{drencher:{view:true,add:true,modify:true}}),uid=users[0].id;
 const product=await ok(pre+'/products','POST',{id:0,reference:'OWN',nom:'PRODUIT FICTIF',unite:'L',actif:true});
 const program=await ok(pre+'/programs','POST',{id:0,version:0,nom:'PROGRAMME FICTIF',actif:true,produits:[{produitId:product.id,dose:1}]});
 const request={version:0,date:'2026-10-14',debut:'08:00',fin:'09:00',programmeId:program.id,programmeVersion:1,eauInitiale:1000,eauConsommee:1000,palettes:[1],produits:[{produitId:product.id,dose:1,machine:0,reel:0,lots:[]}],observations:'Brouillon FICTIF',motif:''};
 const draft=await ok(pre+'/cycles','POST',request,op);
 check('Hicham seul droit saisie crée son brouillon réel',Number(scalar(`SELECT auteur_id FROM vit_dr_cycle WHERE id=${draft.id}`))===uid);
 const updated=await ok(`${pre}/cycles/${draft.id}`,'PUT',{...request,version:1,observations:'Modifié par propriétaire FICTIF'},op);
 check('Hicham modifie son brouillon en API',updated.version===2&&scalar(`SELECT version FROM vit_dr_cycle WHERE id=${draft.id}`)==='2');
 const detail=await ok(`${pre}/cycles/${draft.id}`,'GET',undefined,op);
 check('Édition de son brouillon visible',detail.canEditDraft===true&&detail.revisions[0].snapshot.observations==='Modifié par propriétaire FICTIF');
 const other=await ok(pre+'/cycles','POST',{...request,palettes:[2]});
 check('Brouillon autre auteur modification refusée',(await call(`${pre}/cycles/${other.id}`,'PUT',{...request,palettes:[2],version:1},op)).status===403);
 check('Brouillon autre auteur soumission refusée',(await call(`${pre}/cycles/${other.id}/submit`,'POST',{version:1,motif:''},op)).status===403);
 await ok(`${pre}/cycles/${draft.id}/submit`,'POST',{version:2,motif:''},op);
 check('Propriétaire peut soumettre son brouillon',(await ok(`${pre}/cycles/${draft.id}`)).statut==='En attente de validation');
 check('Après soumission son propre brouillon est verrouillé',(await call(`${pre}/cycles/${draft.id}`,'PUT',{...request,version:3},op)).status===409);
 check('Aucune écriture sur stock pour consommations réelles zéro',scalar('SELECT COUNT(*) FROM vit_dr_mouvement')==='0');
 const modifyOnly=await makeUser('modifier_seul','Gestionnaire',{drencher:{view:true,modify:true}});
 const cycleCount=scalar('SELECT COUNT(*) FROM vit_dr_cycle');
 const malicious={...request,palettes:[3],version:0};
 check('Ajouter absent : création POST refusée',(await call(pre+'/cycles','POST',malicious,modifyOnly)).status===403);
 check('PUT cycles/0 ne contourne pas Ajouter',(await call(pre+'/cycles/0','PUT',malicious,modifyOnly)).status===400);
 check('PUT cycle négatif refusé',(await call(pre+'/cycles/-1','PUT',malicious,modifyOnly)).status===400);
 check('Aucun cycle créé par contournement',scalar('SELECT COUNT(*) FROM vit_dr_cycle')===cycleCount&&scalar('SELECT COUNT(*) FROM vit_dr_mouvement')==='0');
 success=true;
} finally {
 for(const u of users)await call('/admin/users/'+u.id,'PUT',{displayName:u.display_name,role:u.role,active:false});
 for(const id of contexts)await call('/admin/contexts/'+id+'/disable','POST');
 writeFileSync('docs/tests-drencher-v1321-final-api.json',JSON.stringify({date:new Date().toISOString(),success,database:db,host:'127.0.0.1',port:33307,productionAccess:false,results},null,2));
}
