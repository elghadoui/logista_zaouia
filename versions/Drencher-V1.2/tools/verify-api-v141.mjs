import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const base='http://127.0.0.1:5080/api';
if(!process.env.VITASOUSS_TEST_PASSWORD)throw Error('Mot de passe de recette locale requis');
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
const sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--batch','--skip-column-names'],{input:"SET SESSION sql_mode='';\n"+q,encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
const results=[];const check=(name,ok)=>{assert.ok(ok,name);results.push({name,passed:true});console.log('PASS '+name);};
async function login(username='admin'){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:process.env.VITASOUSS_TEST_PASSWORD})});assert.equal(r.status,200,await r.clone().text());const d=await r.json();return{cookie:r.headers.get('set-cookie').split(';')[0],csrf:d.csrf};}
const admin=await login();
async function call(uri,method='GET',body,actor=admin,csrf=true){const r=await fetch(base+uri,{method,headers:{Cookie:actor.cookie,'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':actor.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,data:await r.json().catch(()=>null)}}
async function ok(...args){const r=await call(...args);assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
const config=await ok('/admin/configuration');
const master=config.stations.find(s=>s.code==='ZAOUIA'),diaf=config.stations.find(s=>s.code==='DIAF');
for(const station of [master,diaf]){const server=config.servers.find(s=>s.id===station.server_id);assert.equal(server.host,'127.0.0.1');assert.equal(server.port,33307);}
const stamp=Date.now(),src='vitasouss_test_v141_src_'+stamp,dst='vitasouss_test_v141_dst_'+stamp;
const definitions=JSON.parse(readFileSync('backend/pilot-schema.json','utf8').replace(/^\uFEFF/,''));
const core=JSON.parse(readFileSync('backend/schema.json','utf8').replace(/^\uFEFF/,''));
const dump=readFileSync('F:/diafbacukup/logista_zaouia_051026.sql','utf8');
const ddl=[...dump.matchAll(/CREATE TABLE IF NOT EXISTS `([^`]+)` \(([\s\S]*?)\) ENGINE=[^;]+;/g)].map(m=>({name:m[1],body:m[2],sql:m[0]}));
const carriers=['coddes','codpay','codgre','codgrp','coddef','codtype','codmar','refexp','refte','reftrp','reftm','codexp'];
const needed=ddl.filter(t=>[...core,...definitions].some(e=>e.name===t.name)||['station','agreage','palette','tpalette','reception_d'].includes(t.name)||carriers.some(c=>t.body.includes('`'+c+'`')));
const refs=['destination','partenaire','pays','marche','grpemb','groupart','defaut','typeecart','declaration_verger'];
for(const db of [src,dst]){
 assert.match(db,/^vitasouss_test_v141_(src|dst)_\d+$/);assert.equal(sql(`SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${db}';`),'0');
 sql(`CREATE DATABASE ${db} CHARACTER SET latin1;USE ${db};SET FOREIGN_KEY_CHECKS=0;`+needed.map(t=>t.sql).join('\n')+'SET FOREIGN_KEY_CHECKS=1;'+
 `GRANT SELECT,LOCK TABLES ON ${db}.* TO 'vitasouss_test'@'127.0.0.1';`+
 [...core.map(e=>e.name),...refs].map(t=>`GRANT INSERT,UPDATE,DELETE,TRIGGER ON ${db}.${t} TO 'vitasouss_test'@'127.0.0.1';`).join('\n'));
 sql(`USE ${db};
 INSERT INTO adherent(refadh,nomadh) VALUES(1,'Adherent TEST A'),(2,'Adherent TEST B');
 INSERT INTO culture(codcul,nomcul) VALUES(100,'AGRUMES TEST'),(200,'AVOCAT TEST');
 INSERT INTO grpvar(codgrv,nomgrv) VALUES(1,'GROUPE TEST'),(2,'AUTRE GROUPE');
 INSERT INTO variete(codvar,nomvar,codcul,codgrv) VALUES(104,'VARIETE TEST',100,1),(105,'AUTRE VARIETE',100,1);
 INSERT INTO verger(refver,nomver,refadh,refsta) VALUES(1001,'VERGER TEST A',1,${db===src?7816:7702}),(1002,'VERGER TEST B',1,${db===src?7816:7702}),(1003,'VERGER TEST C',2,${db===src?7816:7702});
 INSERT INTO station(refsta,nomsta) VALUES(7816,'ZAOUIA TEST'),(7702,'DIAF TEST');
 INSERT INTO marche(codmar,nommar,gest) VALUES(1,'EU TEST','PA'),(2,'LIBRE TEST','NS'),(3,'AUTRE TEST','MF');
 INSERT INTO pays(codpay,nompay,abrpay,codmar) VALUES(1,'PAYS UTILISE','PU',1),(2,'PAYS PARTENAIRE','PP',1),(3,'PAYS LIBRE','PL',2);
 INSERT INTO destination(coddes,vildes,codpay) VALUES(1,'DEST UTILISEE',1),(2,'DEST LIBRE',NULL);
 INSERT INTO partenaire(ref,nom,type,codpay,rep,pays) VALUES(10,'EXP TEST','EXPORTATEUR',2,'7816','Texte libre'),(11,'TRANSIT TEST','TRANSITAIRE',2,'7702','Texte libre'),(12,'TRANSPORT TEST','T.MAROC',2,NULL,NULL),(13,'MARITIME TEST','T.ETRANGER',2,NULL,NULL),(14,'PALETTE EXP TEST','EXPORTATEUR',2,NULL,NULL),(15,'PARTENAIRE LIBRE','EXPORTATEUR',2,NULL,NULL);
 INSERT INTO dossier(numdos,coddes,refexp,refte,reftrp,reftm) VALUES(1,1,10,11,12,13);
 INSERT INTO grpemb(codgre,nomgre) VALUES(1,'GROUPE UTILISE'),(2,'GROUPE AUTRE');
 INSERT INTO groupart(codgrp,type,codgre) VALUES(101,'PEG310',1),(102,'PHG123',2);
 INSERT INTO palette(numpal,codexp,codgrp) VALUES(1,14,101);
 INSERT INTO tpalette(codtyp,codgrp) VALUES('TYPE TEST',101);
 INSERT INTO defaut(coddef,intdef,famdef,culture,lier,catdef) VALUES(1,'DEFAUT UTILISE','FAMILLE TEST',100,'1','1'),(2,'DEFAUT LIBRE','FAMILLE TEST',100,'1','1');
 INSERT INTO agreage(numrec,coddef,refsta) VALUES(1,1,7816);
 INSERT INTO typeecart(codtype,destype) VALUES(1,'ECART UTILISE'),(2,'ECART LIBRE');
 INSERT INTO ecart_e(numpal,codtype) VALUES(1,1);
 INSERT INTO declaration_verger(id,refver_reel,refver_nreel,codvar,refstat) VALUES(1,1001,1002,104,7816),(2,1003,1002,105,7816);
 INSERT INTO reception(numrec,refverreel,refver,codvar,refsta,dterec) VALUES(1,1001,1002,104,7816,'2026-01-10'),(2,1003,1002,105,7702,'2026-02-10');`);
}
for(const [stationId,db]of[[master.id,src],[diaf.id,dst]])await ok('/admin/contexts','POST',{stationId,databaseName:db,label:'TEST SYNTHETIQUE V1.4.1 '+db,readOnly:false,localRefsta:stationId===master.id?7816:7702});
const refreshed=await ok('/admin/configuration'),source=refreshed.contexts.find(c=>c.database_name===src),target=refreshed.contexts.find(c=>c.database_name===dst),pre=`/contexts/${source.id}`;
await ok('/admin/routes','POST',{sourceContextId:source.id,targetContextId:target.id});
const users=[];
async function user(role){const username='test_v141_'+role.toLowerCase()+'_'+stamp;await ok('/admin/users','POST',{username,displayName:'TEST V141 '+role,password:process.env.VITASOUSS_TEST_PASSWORD,role,contextIds:[source.id,target.id]});const config=await ok('/admin/configuration');const row=config.users.find(u=>u.username===username);users.push(row);return{row,actor:await login(username)};}
async function read(name,ctx=source){return ok(`/contexts/${ctx.id}/pilot/${name}`);}
async function row(name,id,ctx=source){const e=definitions.find(e=>e.name===name);const result=await read(name,ctx);const found=result.rows.find(r=>String(r[e.keys[0]])===String(id));assert.ok(found,'fiche '+name+'/'+id);return found;}
function body(name,r,values={}){const e=definitions.find(e=>e.name===name);return{key:Object.fromEntries(e.keys.map(k=>[k,r[k]])),before:r,values};}
async function update(name,id,values,actor=admin){return call(pre+'/pilot/'+name,'PUT',body(name,await row(name,id),values),actor);}
async function remove(name,id,actor=admin){return call(pre+'/pilot/'+name+'/delete','POST',body(name,await row(name,id)),actor);}
async function create(name,values){return call(pre+'/pilot/'+name,'POST',{key:{},before:{},values});}
function applied(result){return result.status===200&&result.data?.status==='Applied';}
async function replicate(name,id){const e=definitions.find(e=>e.name===name);const sourceRow=await row(name,id);const targetRow=(await read(name,target)).rows.find(r=>String(r[e.keys[0]])===String(id));const prepared=await ok(pre+'/comparison/prepare','POST',{name,targetId:target.id,items:[{key:{[e.keys[0]]:sourceRow[e.keys[0]]},source:sourceRow,target:targetRow??null}]});return prepared.items[0];}
let failure;
try{
 check('Version V1.4.1 compilée',(await ok('/health')).version==='1.4.1');
 check('Matrice Admin 28 modules',(await ok('/permissions')).length===28);
 const manager=await user('Gestionnaire'),reader=await user('Consultation');
 check('Consultation conserve uniquement la lecture',(await ok('/permissions','GET',undefined,reader.actor)).every(p=>!p.add&&!p.modify&&!p.delete));
 check('CSRF exigé pour les CRUD',(await call(pre+'/pilot/pays','POST',{key:{},before:{},values:{nompay:'REFUS'}},admin,false)).status===403);
 check('Rôle Consultation ne modifie pas',(await update('destination',1,{adresse:'REFUS'},reader.actor)).status===403);
 check('Rôle Consultation ne supprime pas',(await remove('destination',2,reader.actor)).status===403);
 check('Destination utilisée : pays protégé',(await update('destination',1,{codpay:2})).status===409);
 check('Destination utilisée : désignation et adresses corrigibles',applied(await update('destination',1,{vildes:'DEST CORRIGEE',adresse:'ADRESSE TEST',adresse2:'SUITE TEST'})));
 check('Destination utilisée : suppression bloquée',(await remove('destination',1)).status===409);
 check('Identifiant destination immutable',(await update('destination',2,{coddes:99})).status===400);
 check('Destination inutilisée : pays corrigeable',applied(await update('destination',2,{codpay:3})));
 check('Destination : pays absent refusé',(await update('destination',2,{codpay:30000})).status===409);
 check('Pays utilisé uniquement par partenaire reste modifiable',applied(await update('pays',2,{nompay:'PAYS PART CORRIGE',abrpay:'PC',codmar:3})));
 check('Pays destination : tout changement bloqué',(await update('pays',1,{abrpay:'XX'})).status===409);
 check('Pays destination : suppression bloquée',(await remove('pays',1)).status===409);
 check('Pays partenaire : suppression bloquée',(await remove('pays',2)).status===409);
 for(const id of [10,11,12,13,14])check('Partenaire utilisé '+id+' : type protégé',(await update('partenaire',id,{type:id===11?'T.MAROC':'TRANSITAIRE'})).status===409);
 check('Partenaire utilisé : coordonnées et pays corrigibles',applied(await update('partenaire',10,{nom:'EXP CORRIGE',codpay:3,rep:'7702',rue:'RUE TEST',adresse:'ADRESSE TEST',ville:'VILLE TEST',pays:'TEXTE LIBRE',cp:'80000',tel:'TEST TEL',fax:'TEST FAX',coment:'TEST COMMENTAIRE'})));
 check('Code rep ne référence pas partenaire.ref',(await row('partenaire',10)).rep==='7702');
 check('Partenaire inutilisé : type corrigeable',applied(await update('partenaire',15,{type:'T.MAROC'})));
 check('Partenaire utilisé palette.codexp : suppression bloquée',(await remove('partenaire',14)).status===409);
 check('Partenaire inutilisé : suppression permise',applied(await remove('partenaire',15)));
 check('Marché CHAR(2) : valeur SU acceptée',applied(await update('marche',2,{gest:'SU'})));
 check('Marché CHAR(2) : autre valeur acceptée',applied(await update('marche',3,{gest:'XY'})));
 check('Marché : valeur trop longue refusée',(await update('marche',2,{gest:'LONG'})).status===400);
 check('Marché utilisé : suppression bloquée',(await remove('marche',1)).status===409);
 check('Pays affiche le nom du marché',(await read('pays')).displayRows.some(r=>r.codmar==='EU TEST'));
 check('Groupes articles affichent famille',(await read('groupart')).displayRows[0].codgre==='GROUPE UTILISE');
 check('Groupe utilisé : modification bloquée',(await update('grpemb',1,{nomgre:'REFUS'})).status===409);
 check('Groupe utilisé : suppression bloquée',(await remove('grpemb',1)).status===409);
 check('Article tpalette : toute modification bloquée',(await update('groupart',101,{type:'REFUS',codgre:2})).status===409);
 check('Article tpalette : suppression bloquée',(await remove('groupart',101)).status===409);
 check('Article inutilisé : relation modifiable',applied(await update('groupart',102,{type:'PCB105',codgre:1})));
 check('Défaut agréage : intitulé protégé',(await update('defaut',1,{intdef:'REFUS'})).status===409);
 check('Défaut agréage : famille protégée',(await update('defaut',1,{famdef:'REFUS'})).status===409);
 check('Défaut agréage : suppression bloquée',(await remove('defaut',1)).status===409);
 check('Défaut libre : culture et famille corrigeables',applied(await update('defaut',2,{culture:200,famdef:'FAMILLE NOUVELLE',intdef:'DEFAUT CORRIGE'})));
 const defect=await create('defaut',{coddef:5,intdef:'NOUVEAU DEFAUT',famdef:'FAMILLE TEST',culture:100});
 check('Création défaut contrôlée',applied(defect));const createdDefect=await row('defaut',5);
 check('Défaut : lier et catdef imposés à 1',createdDefect.lier==='1'&&createdDefect.catdef==='1');
 check('Défaut : champs techniques API refusés',(await create('defaut',{intdef:'REFUS',culture:100,catdef:'2'})).status===400);
 check('Défaut : culture absente refusée',(await create('defaut',{intdef:'REFUS',culture:999})).status===409);
 check('Combo famille contient les valeurs distinctes',(await ok(pre+'/pilot/defaut/options')).famdef.some(f=>f.value==='FAMILLE NOUVELLE'));
 check('Type écart utilisé : modification bloquée',(await update('typeecart',1,{destype:'REFUS'})).status===409);
 check('Type écart utilisé : suppression bloquée',(await remove('typeecart',1)).status===409);
 check('Type écart libre : modification permise',applied(await update('typeecart',2,{destype:'TYPE CORRIGE'})));
 check('Déclaration utilisée : changement station ne contourne pas le blocage',(await update('declaration_verger',1,{refstat:7702})).status===409);
 check('Déclaration utilisée : suppression bloquée',(await remove('declaration_verger',1)).status===409);
 check('Déclaration autre station : trois correspondances ne bloquent pas',applied(await update('declaration_verger',2,{refver_reel:1002,refver_nreel:1003,codvar:104,refstat:7702})));
 check('Déclaration libre : quatre valeurs modifiables',(await row('declaration_verger',2)).refver_reel===1002&&(await row('declaration_verger',2)).refstat===7702);
 const equal=await create('declaration_verger',{refver_reel:1003,refver_nreel:1003,codvar:104,refstat:7816});
 check('Déclaration réel égal déclaré autorisée',applied(equal));
 check('Déclaration doublon refusée',(await create('declaration_verger',{refver_reel:1003,refver_nreel:1003,codvar:104,refstat:7816})).status===409);
 check('Déclaration doublon en modification refusé',(await update('declaration_verger',2,{refver_reel:1003,refver_nreel:1003,codvar:104,refstat:7816})).status===409);
 check('Déclaration station absente refusée',(await update('declaration_verger',2,{refstat:9999})).status===409);
 const originalDeclaration=await row('declaration_verger',2);sql(`INSERT INTO ${src}.reception(numrec,refverreel,refver,codvar,refsta)VALUES(3,1002,1003,104,7702);`);
 check('Déclaration original utilisée : modification API directe refusée',(await call(pre+'/pilot/declaration_verger','PUT',body('declaration_verger',originalDeclaration,{refver_reel:1001,refver_nreel:1001,codvar:105,refstat:7816}))).status===409);
 check('Déclaration libre : suppression autorisée',applied(await remove('declaration_verger',equal.data.key.id)));
 for(const [name,values] of [
  ['destination',{coddes:500,vildes:'DEST A SUPPRIMER'}],['partenaire',{ref:'500',nom:'PART A SUPPRIMER',type:'EXPORTATEUR',rep:'7816'}],
  ['pays',{codpay:500,nompay:'PAYS A SUPPRIMER',codmar:3}],['marche',{codmar:500,nommar:'TEST LIBRE',gest:'NS'}],
  ['grpemb',{codgre:500,nomgre:'GROUPE LIBRE'}],['groupart',{codgrp:500,type:'REF LIBRE',codgre:1}],
  ['defaut',{coddef:500,intdef:'DEFAUT A SUPPRIMER',famdef:'TEST',culture:100}],['typeecart',{codtype:500,destype:'TYPE A SUPPRIMER'}]]){
  check('CRUD '+name+' : création identifiant explicite',applied(await create(name,values)));
  check('CRUD '+name+' : doublon identifiant refusé',(await create(name,values)).status===409);
  const label=definitions.find(e=>e.name===name).label;
  check('CRUD '+name+' : modification référence inutilisée',applied(await update(name,500,{[label]:name==='marche'?'MOD TEST':'MOD '+name})));
  check('CRUD '+name+' : suppression référence inutilisée',applied(await remove(name,500)));
 }
 sql(`INSERT INTO ${src}.grpemb(codgre,nomgre)VALUES(999,'DOUBLON'),(999,'DOUBLON BIS');`);
 check('Identifiant grpemb ambigu protège toutes écritures',(await update('grpemb',2,{nomgre:'REFUS'})).status===409);sql(`DELETE FROM ${src}.grpemb WHERE codgre=999;`);
 sql(`INSERT INTO ${src}.grpemb(codgre,nomgre)VALUES(NULL,'NULL');`);
 check('Identifiant nul protège toutes écritures',(await update('grpemb',2,{nomgre:'REFUS'})).status===409);sql(`DELETE FROM ${src}.grpemb WHERE codgre IS NULL;`);
 const original=await row('destination',2);await update('destination',2,{adresse:'NOUVELLE'});
 check('État périmé refusé',(await call(pre+'/pilot/destination','PUT',body('destination',original,{adresse2:'REFUS'}))).status===409);
 check('Injection SQL dans une relation refusée',(await update('destination',2,{codpay:'3;DROP TABLE pays'})).status===400);
 sql(`CREATE TABLE ${src}.test_dependency(id INT PRIMARY KEY,coddes SMALLINT);INSERT INTO ${src}.test_dependency VALUES(1,2);`);
 check('Dépendance supplémentaire détectée avant suppression',(await remove('destination',2)).status===409);
 sql(`CREATE TABLE ${src}.test_fk_dependency(id INT PRIMARY KEY,dest SMALLINT,CONSTRAINT test_fk_dest FOREIGN KEY(dest) REFERENCES ${src}.destination(coddes) ON DELETE CASCADE);INSERT INTO ${src}.test_fk_dependency VALUES(1,2);`);
 check('Clé étrangère avec cascade : suppression bloquée',(await remove('destination',2)).status===409);
 check('Aucune cascade exécutée',sql(`SELECT COUNT(*) FROM ${src}.test_fk_dependency WHERE dest=2;`)==='1');
 sql(`DELETE FROM ${src}.test_fk_dependency;`);
 sql(`DELETE FROM ${src}.test_dependency;ALTER TABLE ${src}.tpalette RENAME TO ${src}.test_tpalette_absent;`);
 check('Table dépendante manquante protège écriture',(await update('groupart',102,{type:'REFUS'})).status===409);
 sql(`ALTER TABLE ${src}.test_tpalette_absent RENAME TO ${src}.tpalette;`);
 const protection=await ok(pre+'/pilot/destination/protection?key='+encodeURIComponent(JSON.stringify({coddes:1})));
 check('Protection formulaire reflète API : pays bloqué, adresse permise',!protection.editable.includes('codpay')&&protection.editable.includes('adresse')&&!protection.deleteAllowed);
 const targets=await ok(pre+'/synchronization/targets');check('Formulaire propose seulement une route autorisée',targets.some(t=>t.id===target.id));
 const form=await ok(pre+'/synchronization/prepare','POST',{name:'destination',targetId:target.id,key:{coddes:1}});
 check('Préparation formulaire sans écriture DIAF',form.items[0].status==='Prepared'&&sql(`SELECT vildes FROM ${dst}.destination WHERE coddes=1;`)==='DEST UTILISEE');
 const preview=await ok('/sync/'+form.items[0].jobId+'/preview');
 check('Aperçu liste désignation et adresses autorisées',preview.differences.some(d=>d.field==='adresse')&&!preview.differences.some(d=>d.field==='coddes'));
 check('Application après confirmation', (await ok('/sync/'+form.items[0].jobId+'/apply','POST',preview.before)).status==='Applied');
 check('DIAF conserve identifiant maître',sql(`SELECT coddes FROM ${dst}.destination WHERE vildes='DEST CORRIGEE';`)==='1');
 check('Application répétée bloquée',(await call('/sync/'+form.items[0].jobId+'/apply','POST',preview.before)).status===409);
 check('Pays destination : synchronisation protégée sur cible',(await replicate('pays',2)).status==='Prepared');
 // Target destination usage now blocks any country update, irrespective of source usage.
 sql(`INSERT INTO ${dst}.destination(coddes,vildes,codpay)VALUES(90,'DEST CIBLE',2);`);
 const blockedCountry=await replicate('pays',2);check('DIAF : pays utilisé dans destination bloque synchronisation',blockedCountry.status==='Refused');
 check('DIAF : groupe utilisé bloque synchronisation',await (async()=>{sql(`UPDATE ${src}.grpemb SET nomgre='SOURCE CORRIGEE' WHERE codgre=1;`);return(await replicate('grpemb',1)).status==='Refused';})());
 await create('marche',{codmar:600,nommar:'NOUVEAU',gest:'NS'});await create('pays',{codpay:600,nompay:'NOUVEAU PAYS',codmar:600});await create('destination',{coddes:600,vildes:'NOUVELLE DEST',codpay:600});
 check('Ordre dépendances : destination refusée avant pays',(await replicate('destination',600)).status==='Refused');
 check('Ordre dépendances : pays refusé avant marché',(await replicate('pays',600)).status==='Refused');
 for(const name of ['marche','pays','destination']){const item=await replicate(name,600);assert.equal(item.status,'Prepared',JSON.stringify(item));const p=await ok('/sync/'+item.jobId+'/preview');check('Ordre dépendances : réplication '+name,(await ok('/sync/'+item.jobId+'/apply','POST',p.before)).status==='Applied');}
 check('Marché/pays/destination : mêmes identifiants',sql(`SELECT codmar FROM ${dst}.marche WHERE codmar=600;`)==='600'&&sql(`SELECT codpay FROM ${dst}.destination WHERE coddes=600;`)==='600');
 await create('grpemb',{codgre:600,nomgre:'FAMILLE NOUVELLE'});await create('groupart',{codgrp:600,type:'PCB600',codgre:600});
 check('Ordre dépendances : article refusé avant famille',(await replicate('groupart',600)).status==='Refused');
 for(const name of ['grpemb','groupart']){const item=await replicate(name,600);assert.equal(item.status,'Prepared',JSON.stringify(item));const p=await ok('/sync/'+item.jobId+'/preview');check('Ordre dépendances : réplication '+name,(await ok('/sync/'+item.jobId+'/apply','POST',p.before)).status==='Applied');}
 sql(`INSERT INTO ${src}.destination(coddes,vildes)VALUES(700,'CONFLIT CODE');INSERT INTO ${dst}.destination(coddes,vildes)VALUES(701,'CONFLIT CODE');`);
 const conflict=await ok(pre+`/comparison?targetId=${target.id}&name=destination&status=Conflict`);
 check('Comparaison détecte conflit libellé autre code',conflict.rows.some(r=>r.key.coddes===700&&r.conflictingKeys.some(k=>k.coddes==='701')));
 check('Conflit interdit réplication',(await replicate('destination',700)).status==='Refused');
 sql(`INSERT INTO ${src}.destination(coddes,vildes)VALUES(800,NULL);INSERT INTO ${dst}.destination(coddes,vildes)VALUES(801,NULL);`);
 const nulls=await ok(pre+`/comparison?targetId=${target.id}&name=destination`);
 check('Null libellé ne crée pas un faux conflit',nulls.rows.filter(r=>r.key.coddes===800||r.key.coddes===801).every(r=>r.status!=='Conflict'));
 sql(`INSERT INTO ${src}.grpemb(codgre,nomgre)VALUES(NULL,NULL);`);
 check('Comparaison clé nulle : ambiguïté explicite',(await ok(pre+`/comparison?targetId=${target.id}&name=grpemb&status=Ambiguous`)).rows.some(r=>r.key.codgre===null));sql(`DELETE FROM ${src}.grpemb WHERE codgre IS NULL;`);
 const huge='9007199254740993';check('Partenaire BIGINT créé sans perte',applied(await create('partenaire',{ref:huge,nom:'BIGINT TEST',type:'EXPORTATEUR'})));
 check('Partenaire BIGINT API renvoie chaîne exacte',(await row('partenaire',huge)).ref===huge);
 const bigJob=await replicate('partenaire',huge);assert.equal(bigJob.status,'Prepared',JSON.stringify(bigJob));const bp=await ok('/sync/'+bigJob.jobId+'/preview');
 check('BIGINT transmis exactement à DIAF',(await ok('/sync/'+bigJob.jobId+'/apply','POST',bp.before)).status==='Applied'&&sql(`SELECT ref FROM ${dst}.partenaire WHERE ref=${huge};`)===huge);
 const beforeCount=sql(`SELECT COUNT(*) FROM ${dst}.destination;`);await ok(pre+`/comparison?targetId=${target.id}&name=destination`);
 check('Comparaison ne modifie ni ne supprime DIAF',sql(`SELECT COUNT(*) FROM ${dst}.destination;`)===beforeCount);
 const snapshot=await row('destination',2);await update('destination',2,{adresse:'FORM SOURCE'});const prepare=await replicate('destination',2);assert.equal(prepare.status,'Prepared');
 sql(`ALTER TABLE ${dst}.destination RENAME TO ${dst}.test_destination_absent;`);
 check('Échec DIAF : application non confirmée proprement',(await call('/sync/'+prepare.jobId+'/apply','POST',snapshot)).status===409);
 check('Échec DIAF : ZAOUIA conservé',(await row('destination',2)).adresse==='FORM SOURCE');sql(`ALTER TABLE ${dst}.test_destination_absent RENAME TO ${dst}.destination;`);
 const recovery=await ok('/sync/'+prepare.jobId+'/preview');check('Reprise contrôlée après retour DIAF',(await ok('/sync/'+prepare.jobId+'/apply','POST',recovery.before)).status==='Applied');
 await update('destination',2,{adresse2:'PANNE CONNEXION'});const outage=await replicate('destination',2);assert.equal(outage.status,'Prepared');const outagePreview=await ok('/sync/'+outage.jobId+'/preview');
 await ok('/admin/servers','POST',{label:'TEST INDISPONIBLE '+stamp,host:'127.0.0.1',port:33308,username:'unreachable_test_only',password:'UNREACHABLE-TEST-ONLY',sslMode:'None'});
 const outageServer=(await ok('/admin/configuration')).servers.find(s=>s.label==='TEST INDISPONIBLE '+stamp);
 assert.equal(outageServer.host,'127.0.0.1');assert.equal(outageServer.port,33308);
 sql(`UPDATE referentiels_admin.app_stations SET server_id=${outageServer.id} WHERE id=${diaf.id};`);
 try {
  check('Connexion DIAF indisponible : erreur propre',(await call('/sync/'+outage.jobId+'/apply','POST',outagePreview.before)).status===503);
  check('Connexion DIAF indisponible : erreur journalisée et reprenable',sql(`SELECT status FROM referentiels_admin.app_sync_jobs WHERE id='${outage.jobId}';`)==='Error');
  check('Connexion DIAF indisponible : maître conservé',(await row('destination',2)).adresse2==='PANNE CONNEXION');
 }finally{sql(`UPDATE referentiels_admin.app_stations SET server_id=${diaf.server_id} WHERE id=${diaf.id};`);}
 const resumed=await ok('/sync/'+outage.jobId+'/preview');check('Connexion DIAF rétablie : reprise après aperçu',(await ok('/sync/'+outage.jobId+'/apply','POST',resumed.before)).status==='Applied');
 const matrix=await ok(`/admin/users/${manager.row.id}/permissions`);await ok(`/admin/users/${manager.row.id}/permissions`,'PUT',{permissions:matrix.map(p=>p.module==='partenaire'?{...p,view:false,add:false,modify:false,delete:false}:p)});
 check('Changement permissions révoque session',(await call(pre+'/pilot/partenaire','GET',undefined,manager.actor)).status===401);manager.actor=await login(manager.row.username);
 check('API directe module refusé',(await call(pre+'/pilot/partenaire','GET',undefined,manager.actor)).status===403);
 check('Comparaison respecte permission du référentiel',(await call(pre+`/comparison?targetId=${target.id}&name=partenaire`,'GET',undefined,manager.actor)).status===403);
 check('Synchronisation formulaire respecte permission',(await call(pre+'/synchronization/prepare','POST',{name:'partenaire',targetId:target.id,key:{ref:10}},manager.actor)).status===403);
 check('Assistant toujours en lecture seule',await (async()=>{const s=await ok('/assistant');return !s.mutations&&!s.sqlGeneration;})());
 sql(`USE referentiels_admin;`+readFileSync('sql/003_permissions_v141.sql','utf8'));const permissionCount=sql('SELECT COUNT(*) FROM referentiels_admin.app_module_permissions;');sql(`USE referentiels_admin;`+readFileSync('sql/003_permissions_v141.sql','utf8'));
 check('Migration permissions idempotente',permissionCount===sql('SELECT COUNT(*) FROM referentiels_admin.app_module_permissions;'));
 const archive=(await ok('/contexts')).find(c=>c.readOnly);assert.ok(archive);
 check('Archives bloquent créations',(await call(`/contexts/${archive.id}/pilot/marche`,'POST',{key:{},before:{},values:{nommar:'REFUS',gest:'NS'}})).status===403);
 check('DIAF CRUD direct toujours interdit',(await call(`/contexts/${target.id}/pilot/partenaire`,'PUT',body('partenaire',await row('partenaire',10,target),{nom:'REFUS'}))).status===403);
}catch(e){failure=e;results.push({name:e.message,passed:false});console.error(e);}
finally{
 sql(`UPDATE referentiels_admin.app_contexts SET enabled=0 WHERE id IN(${source.id},${target.id});`);
 if(users.length)sql(`UPDATE referentiels_admin.app_users SET enabled=0,auth_version=auth_version+1 WHERE id IN(${users.map(u=>u.id).join(',')});`);
 writeFileSync('docs/api-verification-v141.json',JSON.stringify({date:new Date().toISOString(),sourceDb:src,targetDb:dst,host:'127.0.0.1',port:33307,data:'DDL réel et données entièrement synthétiques ; aucun accès production',passed:results.filter(r=>r.passed).length,failed:results.filter(r=>!r.passed).length,results},null,2));
}
if(failure)process.exitCode=1;
