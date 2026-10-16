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

let success=false;
try{
 await ok(pre+'/recette/activate','POST',{confirmation:'ACTIVER RECETTE'});
 const product=await ok(pre+'/products','POST',{id:0,reference:'A',nom:'PRODUIT A',unite:'L',actif:true});
 const program=await ok(pre+'/programs','POST',{id:0,version:0,nom:'PROGRAMME',actif:true,produits:[{produitId:product.id,dose:2.5}]});
 await ok(pre+'/stock','POST',{produitId:product.id,lot:'EXP',peremption:'2027-10-08',quantite:20,bon:'BON-1',date:'2026-10-09'});
 await ok(pre+'/stock','POST',{produitId:product.id,lot:'SANS',peremption:null,quantite:20,bon:'BON-2',date:'2026-10-09'});
 let cat=await ok(pre+'/catalog');let lot=cat.lots.find(l=>l.lot==='EXP').id;
 check('Cause MySqlDateTime corrigée : péremption chaîne ISO',cat.lots.find(l=>l.id===lot).peremption==='2027-10-08');
 check('Péremption absente conservée null',cat.lots.find(l=>l.lot==='SANS').peremption===null);
 const m=await ok(pre+'/stock');check('Dates mouvements normalisées après réception et rechargement',m.rows.every(r=>r.dateReception==='2026-10-09'&&typeof r.dateCreation==='string'));
 sql('USE '+db+";INSERT INTO adherent(refadh,nomadh) VALUES(1,'ADHERENT A'),(2,'ADHERENT B');INSERT INTO verger(refver,nomver,refadh) VALUES(101,'VERGER A',1),(102,'VERGER B',2);INSERT INTO variete(codvar,nomvar) VALUES(104,'VARIETE A'),(105,'VARIETE B');INSERT INTO reception(numrec,refsta,codvar,refver) VALUES(1,7816,104,101),(2,7816,105,102);INSERT INTO palbrut(numpal,numrec,codvar,refver,refadh,pdsfru) VALUES "+Array.from({length:164},(_,i)=>'('+(i+1)+','+(i<160?1:2)+','+(i<160?104:105)+','+(i<160?101:102)+','+(i<160?1:2)+','+(i<160?500:750)+')').join(',')+';');
 const historical=()=>sql('USE '+db+';CHECKSUM TABLE palbrut,reception,variete,verger,adherent;'),before=historical();
 const rq={version:0,date:'2026-10-09',debut:'08:00',fin:'09:00',programmeId:program.id,programmeVersion:1,eauInitiale:1200,eauConsommee:1000,palettes:[10,11,12],produits:[{produitId:product.id,dose:2.5,machine:2.6,reel:2.7,lots:[{lotId:lot,quantite:2.7}]}],observations:'TEST',motif:''};
 check('Écriture refusée avant migration',(await call(pre+'/cycles','POST',rq)).status===409);
 const palettes=[10,11,12].map(n=>({numpal:n,numrec:1,codvar:104,variete:'VARIETE A',refver:101,verger:'VERGER A',refadh:1,adherent:'ADHERENT A',poids:500,cycleTraite:null}));
 const snapshot={date:rq.date,debut:rq.debut,fin:rq.fin,programmeId:program.id,programmeVersion:1,programmeNom:'PROGRAMME',eauInitiale:1200,eauConsommee:1000,unitePoids:'kg',palettes,produits:[{produitId:product.id,reference:'A',nom:'PRODUIT A',unite:'L',dose:2.5,doseProgramme:2.5,initial:3,final:2.5,machine:2.6,reel:2.7,ecartTheorique:0.2,ecartMachine:0.1,horsProgramme:false,doseModifiee:false,lots:[{lotId:lot,lot:'EXP',peremption:'2027-10-08',quantite:2.7}]}],observations:'TEST'};
 const literal=JSON.stringify(snapshot).replaceAll("'","''");
 for(const [id,state]of [[1,'Brouillon'],[2,'En attente de validation']])sql('USE '+db+";INSERT INTO vit_dr_cycle(id,statut,version,date_traitement,debut,fin,auteur_id,auteur,date_creation) VALUES("+id+",'"+state+"',1,'2026-10-09','08:00','09:00',1,'DEMO',UTC_TIMESTAMP());INSERT INTO vit_dr_revision(cycle_id,version,contenu,action,motif,auteur,date_creation) VALUES("+id+",1,'"+literal+"','Legacy','','DEMO',UTC_TIMESTAMP());");
 const diag=await ok(pre+'/reservations/diagnostic');check('Diagnostic avant SQL révèle les doublons 10 11 12',!diag.installed&&diag.conflicts.length===3);
 sql('USE '+db+';'+readFileSync('sql/010_drencher_reservations.sql','utf8')+"GRANT SELECT,INSERT,UPDATE,DELETE,TRIGGER ON "+db+".vit_dr_palette_reservee TO 'vitasouss_test'@'127.0.0.1';GRANT SELECT,INSERT,UPDATE,TRIGGER ON "+db+".vit_dr_reservation_etat TO 'vitasouss_test'@'127.0.0.1';");
 check('Initialisation en conflit refusée sans modifier les cycles',(await call(pre+'/reservations/initialize','POST',{confirmation:'INITIALISER RESERVATIONS'})).status===409&&sql('SELECT SUM(version) FROM '+db+'.vit_dr_cycle')==='2');
 check('Arbitrage sans confirmation refusé',(await call(pre+'/reservations/arbitrate','POST',{cycleId:2,version:1,retirer:[10,11,12],confirmation:'oui',motif:'Test'})).status===400);
 await ok(pre+'/reservations/arbitrate','POST',{cycleId:2,version:1,retirer:[10,11,12],confirmation:'ARBITRER CYCLE 2',motif:'Administrateur conserve le cycle correspondant au traitement réel'});
 check('Arbitrage garde anciennes versions et consommations',(await ok(pre+'/cycles/2')).revisions.length===2&&(await ok(pre+'/cycles/2')).revisions[0].snapshot.produits[0].reel===2.7);
 await ok(pre+'/reservations/initialize','POST',{confirmation:'INITIALISER RESERVATIONS'});
 check('Migration remplit seulement le registre de réservation',sql('SELECT COUNT(*) FROM '+db+'.vit_dr_palette_reservee')==='3'&&(await ok(pre+'/reservations/status')).ready);
 const list=await ok(pre+'/palettes/choices?reception=1&pageSize=25&page=7');check('Pagination serveur 160 palettes en pages de 25',list.total===160&&list.rows.length===10);
 const reserved=(await ok(pre+'/palettes/choices?numpal=12')).rows[0];check('Brouillon indisponible avec cycle et état',reserved.cycleAffecte===1&&reserved.etatCycle==='Brouillon');
 check('Deuxième brouillon mêmes palettes refusé',(await call(pre+'/cycles','POST',rq)).status===409);
 check('Message de conflit humain contient palette cycle et état',(await call(pre+'/cycles','POST',rq)).data.title.includes('palette 10')&&(await call(pre+'/cycles','POST',rq)).data.title.includes('Brouillon'));
 const own=await ok(pre+'/palettes/selection','POST',{cycleId:1,ids:[10,11,12]});check('Palettes du cycle courant restent sélectionnables',own.count===3);
 const global=await ok(pre+'/palettes/selection','POST',{ids:[],ajouterLot:1});check('Sélection globale côté API au-delà des pages visibles',global.count===157&&global.skipped===3&&global.poids===78500&&!('rows'in global));
 const multi=await ok(pre+'/palettes/selection','POST',{ids:[161],ajouterLot:1});check('Sélection multi-réceptions et résumé compact regroupé',multi.count===158&&multi.receptions===2&&multi.groups.length===2);
 check('Filtres variété adhérent verger réels',(await ok(pre+'/palettes/choices?codvar=105&refadh=2&refver=102')).total===4);
 check('Sélection réservée pour un autre cycle refusée',(await call(pre+'/palettes/selection','POST',{ids:[12]})).status===409);
 const updated=await ok(pre+'/cycles/1','PUT',{...rq,version:1,palettes:[10,11]});check('Retrait de palette du brouillon libère la réservation',(await ok(pre+'/palettes/choices?numpal=12')).rows[0].cycleAffecte===null);
 await ok(pre+'/cycles/1/submit','POST',{version:updated.version,motif:''});check('Palette dans cycle soumis indisponible',(await ok(pre+'/palettes/choices?numpal=10')).rows[0].etatCycle==='En attente de validation');
 await ok(pre+'/cycles/1/validate','POST',{version:3,motif:'Contrôle recette'});
 check('Palette validée indisponible',(await ok(pre+'/palettes/choices?numpal=10')).rows[0].etatCycle==='Validé');
 check('Déstockage du réel seul, sans changer les calculs',String((await ok(pre+'/catalog')).lots.find(l=>l.id===lot).solde)==='17.3');
 const values=(await ok(pre+'/cycles/1')).revisions[0].snapshot.produits[0];check('Les quatre quantités conservées',values.initial===3&&values.final===2.5&&values.machine===2.6&&values.reel===2.7);
 check('Mouvements après validation lisibles et normalisés',(await ok(pre+'/stock')).rows.some(r=>r.nature==='Consommation'&&r.quantite===-2.7&&typeof r.dateCreation==='string'));
 const username='v12_racer_'+nonce;await ok('/admin/users','POST',{username,displayName:'SECOND ADMIN TEST V12',password,role:'Admin',contextIds:[context.id]});const secondUser=(await ok('/admin/configuration')).users.find(u=>u.username===username);users.push(secondUser.id);const secondActor=await login(username);
 const racing=await Promise.all([call(pre+'/cycles','POST',{...rq,palettes:[14]}),call(pre+'/cycles','POST',{...rq,palettes:[14]},secondActor)]);check('Deux utilisateurs concurrents : une réservation unique',racing.map(r=>r.status).sort().join(',')==='200,409');
 const cyc=racing.find(r=>r.status===200).data;
 check('Modification brouillon vers palette validée refusée',(await call(pre+'/cycles/'+cyc.id,'PUT',{...rq,version:1,palettes:[10]})).status===409);
 const preview=await ok(pre+'/recette/preview','POST',{operation:'Cycle',cycleId:1});await ok(pre+'/recette/apply','POST',{ticket:preview.ticket,confirmation:preview.confirmation,motif:'Nettoyage de test avec réservation V1.2'});
 check('Suppression Recette restitue le stock et libère palettes',(await ok(pre+'/catalog')).lots.find(l=>l.id===lot).solde===20&&(await ok(pre+'/palettes/choices?numpal=10')).rows[0].cycleAffecte===null);
 const d=await ok(pre+'/recette/preview','POST',{operation:'Cycle',cycleId:cyc.id});await ok(pre+'/recette/apply','POST',{ticket:d.ticket,confirmation:d.confirmation,motif:'Suppression brouillon'});check('Suppression brouillon libère aussi la réservation',(await ok(pre+'/palettes/choices?numpal=14')).rows[0].cycleAffecte===null);
 const reset=await ok(pre+'/recette/preview','POST',{operation:'Tout'});await ok(pre+'/recette/apply','POST',{ticket:reset.ticket,confirmation:reset.confirmation,motif:'Fin de tests'});check('Reset complet conserve état migration et vide réservations',sql('SELECT COUNT(*) FROM '+db+'.vit_dr_palette_reservee')==='0'&&(await ok(pre+'/reservations/status')).ready);
 check('Historique et cinq tables historiques préservés',before===historical()&&(await ok(pre+'/recette/history')).some(r=>r.etat==='Applique'));
 success=true;
}finally{for(const id of users)sql('UPDATE referentiels_admin.app_users SET enabled=0,auth_version=auth_version+1 WHERE id='+id);for(const id of contexts)sql('UPDATE referentiels_admin.app_contexts SET enabled=0 WHERE id='+id);writeFileSync('docs/tests-drencher-v13-reservations.json',JSON.stringify({date:new Date().toISOString(),db,contextId:context.id,host:'127.0.0.1',port:33307,productionAccess:false,passed:results.length,failed:success?0:1,results},null,2));}
