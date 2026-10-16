import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
const base='http://127.0.0.1:5080/api',password=process.env.VITASOUSS_TEST_PASSWORD;assert.ok(password);
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
const sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--batch','--raw','--skip-column-names'],{input:"SET SESSION sql_mode='';\n"+q,encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
const results=[];function check(name,yes){assert.ok(yes,name);results.push({name,passed:true});console.log('PASS '+name);}
async function login(username='admin'){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});assert.equal(r.status,200);const d=await r.json();return{cookie:r.headers.get('set-cookie').split(';')[0],csrf:d.csrf};}
const admin=await login();async function call(uri,method='GET',body,actor=admin,csrf=true){const r=await fetch(base+uri,{method,headers:{Cookie:actor.cookie,'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':actor.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,data:await r.json().catch(()=>null)}}
async function ok(...args){const r=await call(...args);assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
const cfg=await ok('/admin/configuration'),station=cfg.stations.find(s=>s.code==='ZAOUIA'),server=cfg.servers.find(s=>s.id===station.server_id);assert.equal(server.host,'127.0.0.1');assert.equal(server.port,33307);
sql('USE referentiels_admin;'+readFileSync('sql/006_drencher_recette_admin.sql','utf8'));const adminCount=sql("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='referentiels_admin' AND TABLE_NAME IN ('app_drencher_recette','app_drencher_nettoyage')");sql('USE referentiels_admin;'+readFileSync('sql/006_drencher_recette_admin.sql','utf8'));check('Migration administrative additive et idempotente',adminCount==='2');
const nonce=randomUUID().replaceAll('-',''),db='vitasouss_recette_drencher_'+nonce;assert.match(db,/^vitasouss_recette_drencher_[a-f0-9]{32}$/);assert.equal(sql(`SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${db}'`),'0');
const drTables=['vit_traitement_produit','vit_dr_programme','vit_dr_programme_revision','vit_dr_mutex','vit_dr_stock_lot','vit_dr_cycle','vit_dr_revision','vit_dr_palette_validee','vit_dr_mouvement','vit_dr_admin_historique'];
sql(`CREATE DATABASE ${db} CHARACTER SET latin1;USE ${db};`+readFileSync('sql/008_drencher_recette_structure.sql','utf8')+readFileSync('sql/004_drencher_business.sql','utf8')+readFileSync('sql/007_drencher_recette_identite.sql','utf8')+`INSERT INTO vit_dr_recette_identite VALUES(1,'${nonce}','${db}',NULL,UTC_TIMESTAMP());GRANT SELECT ON ${db}.* TO 'vitasouss_test'@'127.0.0.1';`+
 [...drTables,'vit_dr_recette_identite','vit_dr_recette_operation'].map(t=>`GRANT INSERT,UPDATE,DELETE,TRIGGER ON ${db}.${t} TO 'vitasouss_test'@'127.0.0.1';`).join('\n')+"GRANT PROCESS ON *.* TO 'vitasouss_test'@'127.0.0.1';");
const contexts=[],users=[];await ok('/admin/contexts','POST',{stationId:station.id,databaseName:db,label:'RECETTE TEST V1.1 '+nonce,readOnly:false,localRefsta:7816});const context=(await ok('/admin/configuration')).contexts.find(c=>c.database_name===db);contexts.push(context.id);const pre=`/contexts/${context.id}/drencher`;
let existing=(await ok('/admin/configuration')).contexts.find(c=>c.station_id===station.id&&c.database_name==='logista');
if(!existing){await ok('/admin/contexts','POST',{stationId:station.id,databaseName:'logista',label:'TEST GARDE NOM PRODUCTION (aucune base ouverte)',readOnly:false,localRefsta:7816});existing=(await ok('/admin/configuration')).contexts.find(c=>c.station_id===station.id&&c.database_name==='logista');contexts.push(existing.id);}
const prod=`/contexts/${existing.id}/drencher`;
if(!existing.enabled){sql(`UPDATE referentiels_admin.app_contexts SET enabled=1 WHERE id=${existing.id};`);if(!contexts.includes(existing.id))contexts.push(existing.id);}
let success=false;
try{
 check('logista explicitement Production',(await ok(prod+'/mode')).mode==='Production');
 check('Activation Recette impossible pour logista',(await call(prod+'/recette/activate','POST',{confirmation:'ACTIVER RECETTE'})).status===403);
 check('Nettoyage impossible pour logista sans ouvrir la base',(await call(prod+'/recette/preview','POST',{operation:'Tout'})).status===403);
 check('Base neuve non automatiquement classifiée Recette',(await ok(pre+'/mode')).mode==='Production');
 check('Nettoyage impossible avant inscription',(await call(pre+'/recette/preview','POST',{operation:'Tout'})).status===403);
 check('Confirmation activation requise',(await call(pre+'/recette/activate','POST',{confirmation:'oui'})).status===400);
 await ok(pre+'/recette/activate','POST',{confirmation:'ACTIVER RECETTE'});
 check('Activation explicite et identité liée au contexte',(await ok(pre+'/mode')).mode==='Recette'&&sql(`SELECT contexte_inscrit FROM ${db}.vit_dr_recette_identite`)==String(context.id));
 check('Réactivation refusée',(await call(pre+'/recette/activate','POST',{confirmation:'ACTIVER RECETTE'})).status===409);
 const username='dr11_operator_'+nonce;await ok('/admin/users','POST',{username,displayName:'OPERATEUR TEST V11',password,role:'Gestionnaire',contextIds:[context.id]});const user=(await ok('/admin/configuration')).users.find(u=>u.username===username);users.push(user.id);const op=await login(username);
 check('Recette réservée aux Admin même si contexte attribué',(await call(pre+'/catalog','GET',undefined,op)).status===403);
 check('Appel direct nettoyage non-Admin refusé',(await call(pre+'/recette/preview','POST',{operation:'Tout'},op)).status===403);
 sql(`USE ${db};INSERT INTO adherent(refadh,nomadh) VALUES(1,'ADHERENT TEST');INSERT INTO verger(refver,nomver,refadh) VALUES(101,'VERGER TEST',1);INSERT INTO variete(codvar,nomvar) VALUES(104,'VARIETE TEST');INSERT INTO reception(numrec,refsta,codvar,refver) VALUES(1,7816,104,101);INSERT INTO palbrut(numpal,numrec,codvar,refver,refadh,pdsfru) VALUES(1,1,104,101,1,500),(2,1,104,101,1,750),(3,1,104,101,1,800);`);
 const historical=()=>sql(`USE ${db};CHECKSUM TABLE palbrut,reception,variete,verger,adherent;`),before=historical();
 const p=await ok(pre+'/products','POST',{id:0,reference:'RECETTE-A',nom:'Produit recette',unite:'L',actif:true});
 const program=await ok(pre+'/programs','POST',{id:0,version:0,nom:'Programme recette',actif:true,produits:[{produitId:p.id,dose:2.5}]});
 await ok(pre+'/programs','POST',{id:program.id,version:1,nom:'Programme recette v2',actif:true,produits:[{produitId:p.id,dose:3}]});
 const versions=await ok(pre+`/programs/${program.id}/versions`);check('Versions précédentes consultables avec dosages exacts',versions.length===2&&versions[0].programme.produits[0].dose===3&&versions[1].programme.produits[0].dose===2.5);
 await ok(pre+'/products','POST',{id:p.id,reference:'RECETTE-A',nom:'Produit recette',unite:'L',actif:false});
 check('Produit désactivé sans perdre les versions',(await ok(pre+'/catalog')).produits[0].actif===false&&(await ok(pre+`/programs/${program.id}/versions`)).length===2);
 await ok(pre+'/programs','POST',{id:program.id,version:2,nom:'Programme recette v2',actif:false,produits:[{produitId:p.id,dose:3}]});
 check('Programme désactivable même avec un produit inactif',(await ok(pre+'/catalog')).programmes[0].actif===false);
 check('Programme actif refuse produit inactif',(await call(pre+'/programs','POST',{id:program.id,version:3,nom:'Programme recette v2',actif:true,produits:[{produitId:p.id,dose:3}]})).status===400);
 await ok(pre+'/products','POST',{id:p.id,reference:'RECETTE-A',nom:'Produit recette',unite:'L',actif:true});await ok(pre+'/programs','POST',{id:program.id,version:3,nom:'Programme recette v2',actif:true,produits:[{produitId:p.id,dose:3}]});
 await ok(pre+'/stock','POST',{produitId:p.id,lot:'FABRICANT-A',peremption:null,quantite:10,bon:'BON-RECETTE-1',date:'2026-10-08'});
 const lot=(await ok(pre+'/catalog')).lots[0].id;
 check('Filtre mouvements par bon et produit',(await ok(pre+`/stock?search=BON-RECETTE-1&produitId=${p.id}&nature=Entree`)).total===1&&(await ok(pre+'/stock?search=absent')).total===0);
 const rq={version:0,date:'2026-10-08',debut:'08:00',fin:'09:00',programmeId:program.id,programmeVersion:4,eauInitiale:1200,eauConsommee:1000,palettes:[1],produits:[{produitId:p.id,dose:3,machine:3.1,reel:3.2,lots:[{lotId:lot,quantite:3.2}]}],observations:'TEST SYNTHETIQUE',motif:''};
 const cycle=await ok(pre+'/cycles','POST',rq);const draft=await ok(pre+'/cycles','POST',{...rq,palettes:[2]});
 check('Poids confirmé kg inscrit dans les nouveaux cycles',(await ok(pre+'/cycles/'+cycle.id)).revisions[0].snapshot.unitePoids==='kg');
 await ok(pre+`/cycles/${cycle.id}/submit`,'POST',{version:1,motif:''});await ok(pre+`/cycles/${cycle.id}/validate`,'POST',{version:2,motif:'Recette'});
 await ok(pre+`/cycles/${cycle.id}/correct`,'POST',{...rq,version:3,motif:'Correction recette',produits:[{...rq.produits[0],reel:3.3,lots:[{lotId:lot,quantite:3.3}]}]});
 const balance=()=>sql(`SELECT solde FROM ${db}.vit_dr_stock_lot WHERE id=${lot}`),fingerprint=()=>sql(`USE ${db};CHECKSUM TABLE ${drTables.join(',')};`);
 check('Stock réel corrigé avant suppression',balance()==='6.700000');
 let preview=await ok(pre+'/recette/preview','POST',{operation:'Cycle',cycleId:cycle.id});const untouched=fingerprint();
 check('Aperçu détaillé ciblé et restitution de stock exacts',preview.details.counts.vit_dr_cycle===1&&preview.details.restitutions[0].quantiteRestituee===3.3&&preview.details.restitutions[0].soldeApres===10);
 check('Aperçu sans suppression ni modification de stock',untouched===fingerprint());
 check('Motif obligatoire',(await call(pre+'/recette/apply','POST',{ticket:preview.ticket,confirmation:preview.confirmation,motif:''})).status===400);
 check('Confirmation incorrecte refusée',(await call(pre+'/recette/apply','POST',{ticket:preview.ticket,confirmation:'oui',motif:'Test'})).status===400&&untouched===fingerprint());
 check('CSRF nettoyage requis',(await call(pre+'/recette/apply','POST',{ticket:preview.ticket,confirmation:preview.confirmation,motif:'Test'},admin,false)).status===403);
 await ok(pre+'/products','POST',{id:p.id,reference:'RECETTE-A',nom:'Produit recette renommé',unite:'L',actif:true});
 check('Aperçu périmé après modification refusé',(await call(pre+'/recette/apply','POST',{ticket:preview.ticket,confirmation:preview.confirmation,motif:'Test'})).status===409);
 preview=await ok(pre+'/recette/preview','POST',{operation:'Cycle',cycleId:cycle.id});await ok(pre+'/recette/apply','POST',{ticket:preview.ticket,confirmation:preview.confirmation,motif:'Suppression cycle validé de TEST'});
 check('Cycle validé de recette supprimé et stock entièrement restitué',balance()==='10.000000'&&(await call(pre+'/cycles/'+cycle.id)).status===404);
 check('Palettes libérées et autre brouillon conservé',sql(`SELECT COUNT(*) FROM ${db}.vit_dr_palette_validee WHERE numpal=1`)==='0'&&(await call(pre+'/cycles/'+draft.id)).status===200);
 check('Consommations du cycle supprimées, entrée magasin conservée',sql(`SELECT COUNT(*) FROM ${db}.vit_dr_mouvement WHERE cycle_id=${cycle.id}`)==='0'&&sql(`SELECT COUNT(*) FROM ${db}.vit_dr_mouvement WHERE nature='Entree'`)==='1');
 check('Double nettoyage même ticket refusé',(await call(pre+'/recette/apply','POST',{ticket:preview.ticket,confirmation:preview.confirmation,motif:'Rejouer'})).status===409);
 preview=await ok(pre+'/recette/preview','POST',{operation:'Cycle',cycleId:draft.id});await ok(pre+'/recette/apply','POST',{ticket:preview.ticket,confirmation:preview.confirmation,motif:'Supprimer brouillon de test'});
 check('Suppression brouillon sans restitution fictive',balance()==='10.000000');
 const next=await ok(pre+'/cycles','POST',{...rq,palettes:[3]});check('Identifiants non réattribués après nettoyage',next.id>draft.id);
 preview=await ok(pre+'/recette/preview','POST',{operation:'CyclesStock'});await ok(pre+'/recette/apply','POST',{ticket:preview.ticket,confirmation:preview.confirmation,motif:'Réinitialiser cycles et stock de test'});
 let cat=await ok(pre+'/catalog');check('Remise zéro cycles/stock garde produits et programmes',cat.lots.length===0&&cat.produits.length===1&&cat.programmes.length===1&&(await ok(pre+'/cycles')).total===0);
 const adminHistoryCount=sql(`SELECT COUNT(*) FROM ${db}.vit_dr_admin_historique`);
 preview=await ok(pre+'/recette/preview','POST',{operation:'Tout'});await ok(pre+'/recette/apply','POST',{ticket:preview.ticket,confirmation:preview.confirmation,motif:'Fin de recette : nettoyer tous les essais'});
 cat=await ok(pre+'/catalog');check('Nettoyage programmes et produits avec intégrité',cat.lots.length===0&&cat.produits.length===0&&cat.programmes.length===0&&sql(`SELECT COUNT(*) FROM ${db}.vit_dr_programme_revision`)==='0');
 check('Historiques administratifs survivent au reset',sql(`SELECT COUNT(*) FROM ${db}.vit_dr_admin_historique`)===adminHistoryCount&&(await ok(pre+'/recette/history')).filter(h=>h.etat==='Applique').length===4);
 check('Identité Recette conservée après reset',(await ok(pre+'/mode')).registered===true);
 const concurrentPreview=await ok(pre+'/recette/preview','POST',{operation:'Tout'});
 const parallel=await Promise.all([call(pre+'/recette/apply','POST',{ticket:concurrentPreview.ticket,confirmation:concurrentPreview.confirmation,motif:'Test concurrence'}),call(pre+'/recette/apply','POST',{ticket:concurrentPreview.ticket,confirmation:concurrentPreview.confirmation,motif:'Test concurrence'})]);
 check('Deux confirmations simultanées : un seul nettoyage appliqué',parallel.map(r=>r.status).sort().join(',')==='200,409');
 const expired=await ok(pre+'/recette/preview','POST',{operation:'Tout'});sql(`UPDATE referentiels_admin.app_drencher_nettoyage SET date_creation=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 11 MINUTE) WHERE id='${expired.ticket}';`);
 check('Aperçu expiré refusé',(await call(pre+'/recette/apply','POST',{ticket:expired.ticket,confirmation:expired.confirmation,motif:'Expire'})).status===409);
 check('Tables historiques de Logista identiques avant/après',before===historical());
 // Panne de finalisation du journal : le reçu métier permet une réconciliation sans rejouer DELETE.
 sql(`UPDATE referentiels_admin.app_drencher_nettoyage SET etat='Prepare' WHERE id='${preview.ticket}';`);
 check('Journal préparé réconcilié par reçu sans répéter nettoyage',(await ok(pre+'/recette/history')).find(h=>h.id===preview.ticket).etat==='Applique');
 sql(`USE ${db};CREATE TABLE dependance_exterieure(id INT PRIMARY KEY,cycle_id INT,FOREIGN KEY(cycle_id) REFERENCES vit_dr_cycle(id) ON DELETE CASCADE) ENGINE=InnoDB;`);
 try{check('Dépendance inconnue ou cascade bloque tout nettoyage',(await call(pre+'/recette/preview','POST',{operation:'Tout'})).status===409);}finally{sql(`DROP TABLE ${db}.dependance_exterieure;`);}
 const originalFk=sql(`SELECT CONSTRAINT_NAME FROM information_schema.REFERENTIAL_CONSTRAINTS WHERE CONSTRAINT_SCHEMA='${db}' AND TABLE_NAME='vit_dr_revision' LIMIT 1;`);assert.match(originalFk,/^[A-Za-z0-9_]+$/);
 sql(`ALTER TABLE ${db}.vit_dr_revision DROP FOREIGN KEY ${originalFk}, ADD CONSTRAINT recette_test_cascade FOREIGN KEY(cycle_id) REFERENCES vit_dr_cycle(id) ON DELETE CASCADE;`);
 try{check('Cascade ajoutée sur une table Drencher connue également bloquée',(await call(pre+'/recette/preview','POST',{operation:'Tout'})).status===409);}finally{sql(`ALTER TABLE ${db}.vit_dr_revision DROP FOREIGN KEY recette_test_cascade, ADD CONSTRAINT ${originalFk} FOREIGN KEY(cycle_id) REFERENCES vit_dr_cycle(id);`);}
 const external='vitasouss_test_fk_externe_'+nonce;sql(`CREATE DATABASE ${external};CREATE TABLE ${external}.dependance(id INT PRIMARY KEY,cycle_id INT,FOREIGN KEY(cycle_id) REFERENCES ${db}.vit_dr_cycle(id) ON DELETE CASCADE) ENGINE=InnoDB;`);
 try{check('FK dans une autre base, même sans SELECT dessus, bloque nettoyage',(await call(pre+'/recette/preview','POST',{operation:'Tout'})).status===409);}finally{sql(`DROP TABLE ${external}.dependance;`);}
 sql("REVOKE PROCESS ON *.* FROM 'vitasouss_test'@'127.0.0.1';");
 try{check('Sans inspection globale des FK aucune suppression possible',(await call(pre+'/recette/preview','POST',{operation:'Tout'})).status===409);}finally{sql("GRANT PROCESS ON *.* TO 'vitasouss_test'@'127.0.0.1';");}
 sql(`UPDATE ${db}.vit_dr_recette_identite SET identite='${'0'.repeat(32)}' WHERE id=1;`);
 try{check('Marqueur altéré bloque le mode et toute suppression',(await call(pre+'/recette/preview','POST',{operation:'Tout'})).status===409);}finally{sql(`UPDATE ${db}.vit_dr_recette_identite SET identite='${nonce}' WHERE id=1;`);}
 const invalid=randomUUID().replaceAll('-',''),existingDb='vitasouss_recette_drencher_'+invalid;
 sql(`CREATE DATABASE ${existingDb};USE ${existingDb};`+readFileSync('sql/004_drencher_business.sql','utf8')+readFileSync('sql/007_drencher_recette_identite.sql','utf8')+`INSERT INTO vit_dr_recette_identite VALUES(1,'${invalid}','${existingDb}',NULL,UTC_TIMESTAMP());INSERT INTO vit_traitement_produit(reference,nom,unite,actif) VALUES('EXISTANT','Ne pas requalifier','L',1);GRANT SELECT,INSERT,UPDATE,DELETE,TRIGGER ON ${existingDb}.* TO 'vitasouss_test'@'127.0.0.1';`);
 await ok('/admin/contexts','POST',{stationId:station.id,databaseName:existingDb,label:'TEST EXISTANT NON CLASSIFIE',readOnly:false,localRefsta:7816});const ex=(await ok('/admin/configuration')).contexts.find(c=>c.database_name===existingDb);contexts.push(ex.id);
 check('Données existantes jamais automatiquement requalifiées',(await call(`/contexts/${ex.id}/drencher/recette/activate`,'POST',{confirmation:'ACTIVER RECETTE'})).status===409&&sql(`SELECT COUNT(*) FROM ${existingDb}.vit_traitement_produit`)==='1');
 check('Production n’a aucune inscription Recette',sql(`SELECT COUNT(*) FROM referentiels_admin.app_drencher_recette WHERE database_name='logista'`)==='0');
 success=true;
}finally{
 for(const id of contexts)sql(`UPDATE referentiels_admin.app_contexts SET enabled=0 WHERE id=${id};`);for(const id of users)sql(`UPDATE referentiels_admin.app_users SET enabled=0,auth_version=auth_version+1 WHERE id=${id};`);
 writeFileSync('docs/tests-drencher-v11-api.json',JSON.stringify({date:new Date().toISOString(),db,contextId:context.id,host:'127.0.0.1',port:33307,productionAccess:false,passed:results.length,failed:success?0:1,results},null,2));
}
