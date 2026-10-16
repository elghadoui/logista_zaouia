import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const base='http://127.0.0.1:5080/api',password=process.env.VITASOUSS_TEST_PASSWORD;
assert.ok(password,'Mot de passe de test local requis');
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
const sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--batch','--skip-column-names'],{input:"SET SESSION sql_mode='';\n"+q,encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
const results=[];const check=(name,ok)=>{assert.ok(ok,name);results.push({name,passed:true});console.log('PASS '+name);};
async function login(username='admin'){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});assert.equal(r.status,200,await r.clone().text());const d=await r.json();return{cookie:r.headers.get('set-cookie').split(';')[0],csrf:d.csrf};}
const admin=await login();
async function call(uri,method='GET',body,actor=admin,csrf=true){const r=await fetch(base+uri,{method,headers:{Cookie:actor.cookie,'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':actor.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,data:await r.json().catch(()=>null)}}
async function ok(...args){const r=await call(...args);assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
const cfg=await ok('/admin/configuration'),station=cfg.stations.find(s=>s.code==='ZAOUIA'),diaf=cfg.stations.find(s=>s.code==='DIAF');
for(const st of [station,diaf]){const server=cfg.servers.find(s=>s.id===st.server_id);assert.equal(server.host,'127.0.0.1');assert.equal(server.port,33307);}
const stamp=Date.now(),db='vitasouss_test_drencher_'+stamp;assert.match(db,/^vitasouss_test_drencher_\d+$/);assert.equal(sql(`SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${db}'`),'0');
const dump=readFileSync('F:/diafbacukup/logista_zaouia_051026.sql','utf8');
const ddl=[...dump.matchAll(/CREATE TABLE IF NOT EXISTS `([^`]+)` \(([\s\S]*?)\) ENGINE=[^;]+;/g)].filter(m=>['palbrut','reception','variete','verger','adherent'].includes(m[1])).map(m=>m[0]);
const migration=readFileSync('sql/004_drencher_business.sql','utf8')+readFileSync('sql/010_drencher_reservations.sql','utf8');
sql(`CREATE DATABASE ${db} CHARACTER SET latin1;USE ${db};`+ddl.join('\n')+migration+`GRANT SELECT ON ${db}.* TO 'vitasouss_test'@'127.0.0.1';`+
 ['vit_traitement_produit','vit_dr_programme','vit_dr_mutex','vit_dr_stock_lot','vit_dr_cycle','vit_dr_palette_reservee','vit_dr_reservation_etat'].map(t=>`GRANT INSERT,UPDATE,TRIGGER ON ${db}.${t} TO 'vitasouss_test'@'127.0.0.1';`).join('\n')+
 ['vit_dr_programme_revision','vit_dr_revision','vit_dr_palette_validee','vit_dr_mouvement','vit_dr_admin_historique','vit_dr_palette_reservee'].map(t=>`GRANT INSERT,TRIGGER ON ${db}.${t} TO 'vitasouss_test'@'127.0.0.1';`).join('\n'));
sql('USE referentiels_admin;'+readFileSync('sql/005_drencher_permissions.sql','utf8'));
sql(`USE ${db};`+migration);check('Migration métier idempotente, 12 tables InnoDB',sql(`SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='${db}' AND TABLE_NAME LIKE 'vit_%' AND ENGINE='InnoDB'`)==='12');
sql(`USE ${db};INSERT INTO adherent(refadh,nomadh) VALUES(1,'ADHERENT DEMO');INSERT INTO verger(refver,nomver,refadh) VALUES(101,'VERGER DEMO',1);INSERT INTO variete(codvar,nomvar) VALUES(104,'VARIETE DEMO');INSERT INTO reception(numrec,refsta,codvar,refver,dterec) VALUES(1,7816,104,101,'2026-10-08'),(2,7816,104,101,'2026-10-08'),(3,7702,104,101,'2026-10-08');INSERT INTO palbrut(numpal,numrec,codvar,refver,refadh,pdsfru) VALUES `+Array.from({length:165},(_,i)=>`(${i+1},${i<160?1:2},104,101,1,500)`).join(',')+",(999,3,104,101,1,500),(998,2,NULL,NULL,NULL,NULL);");
const fingerprint=()=>sql(`USE ${db};CHECKSUM TABLE palbrut,reception,variete,verger,adherent;`),before=fingerprint();
const ids=[];const users=[];let source,archive,other;
for(const [stationId,readonly,label]of[[station.id,false,'DEMO DRENCHER'],[station.id,true,'ARCHIVE TEST DRENCHER'],[diaf.id,false,'DIAF TEST DRENCHER']]){await ok('/admin/contexts','POST',{stationId,databaseName:readonly?db+'_archive':db,label,readOnly:readonly,localRefsta:stationId===station.id?7816:7702});const config=await ok('/admin/configuration');const c=config.contexts.find(c=>c.database_name===(readonly?db+'_archive':db)&&c.label===label);ids.push(c.id);if(label==='DEMO DRENCHER')source=c;else if(readonly)archive=c;else other=c;}
sql(`GRANT DELETE ON ${db}.vit_dr_palette_reservee TO 'vitasouss_test'@'127.0.0.1';`);const pre=`/contexts/${source.id}/drencher`;await ok(pre+'/reservations/initialize','POST',{confirmation:'INITIALISER RESERVATIONS'});
async function makeUser(role,label,contextIds,flags){const username='dr_'+label+'_'+stamp;await ok('/admin/users','POST',{username,displayName:'TEST DRENCHER '+label,password,role,contextIds});const c=await ok('/admin/configuration'),u=c.users.find(u=>u.username===username);users.push(u);const permissions=await ok('/admin/users/'+u.id+'/permissions');await ok('/admin/users/'+u.id+'/permissions','PUT',{permissions:permissions.map(p=>({...p,view:!!flags[p.module]?.view,add:!!flags[p.module]?.add,modify:!!flags[p.module]?.modify,delete:false}))});return{...u,actor:await login(username)};}
const views=Object.fromEntries(['drencher','receptions','variete','verger','adherent'].map(m=>[m,{view:true}]));
try {
 const op=await makeUser('Gestionnaire','operateur',[source.id,archive.id],{...views,drencher:{view:true,add:true,modify:true}});
 const quality=await makeUser('Gestionnaire','qualite',[source.id],{...views,drencher_quality:{view:true,modify:true},drencher_manage:{view:true,add:true,modify:true}});
 const consult=await makeUser('Consultation','consultation',[source.id],views);
 check('Droits opérateur : qualité/gestion refusées', (await call(pre+'/products','POST',{id:0,reference:'X',nom:'X',unite:'L',actif:true},op.actor)).status===403);
 check('Exercice non attribué refusé',(await call(`/contexts/${other.id}/drencher/catalog`,'GET',undefined,op.actor)).status===403);
 check('DIAF refusé même à Admin',(await call(`/contexts/${other.id}/drencher/catalog`)).status===403);
 const product=await ok(pre+'/products','POST',{id:0,reference:'DEMO-A',nom:'PRODUIT DEMO A',unite:'L',actif:true},quality.actor);
 const extra=await ok(pre+'/products','POST',{id:0,reference:'DEMO-B',nom:'PRODUIT DEMO B',unite:'kg',actif:true},quality.actor);
 check('Produits communs créés via API',product.id>0&&extra.id>product.id);
 check('Référence produit en double refusée',(await call(pre+'/products','POST',{id:0,reference:'DEMO-A',nom:'Autre',unite:'L',actif:true})).status===409);
 check('Unité immuable',(await call(pre+'/products','POST',{id:product.id,reference:'DEMO-A',nom:'DEMO',unite:'kg',actif:true})).status===409);
 const program=await ok(pre+'/programs','POST',{id:0,version:0,nom:'PROGRAMME DEMO',actif:true,produits:[{produitId:product.id,dose:2.5}]},quality.actor);
 const receipt={produitId:product.id,lot:'FAB-A-1',peremption:'2027-10-08',quantite:10,bon:'BON-DEMO-1',date:'2026-10-08'};
 await ok(pre+'/stock','POST',receipt,quality.actor);await ok(pre+'/stock','POST',{...receipt,lot:'FAB-A-2',bon:'BON-DEMO-2'},quality.actor);await ok(pre+'/stock','POST',{...receipt,produitId:extra.id,lot:'FAB-B',bon:'BON-DEMO-3'},quality.actor);
 check('Bon magasin doublon refusé',(await call(pre+'/stock','POST',receipt)).status===409);
 check('Péremption incohérente refusée',(await call(pre+'/stock','POST',{...receipt,bon:'BON-DEMO-4',peremption:'2028-01-01'})).status===409);
 let catalog=await ok(pre+'/catalog'),lot1=catalog.lots.find(l=>l.lot==='FAB-A-1').id,lot2=catalog.lots.find(l=>l.lot==='FAB-A-2').id,lotB=catalog.lots.find(l=>l.lot==='FAB-B').id;
 const stock=()=>sql(`SELECT GROUP_CONCAT(CONCAT(id,':',solde) ORDER BY id) FROM ${db}.vit_dr_stock_lot`);const stockBefore=stock();
 const p1=await ok(pre+'/palettes?reception=1&page=1','GET',undefined,op.actor),p4=await ok(pre+'/palettes?reception=1&page=4','GET',undefined,op.actor);
 check('Pagination d’un lot de 160 palettes',p1.total===160&&p1.rows.length===50&&p4.rows.length===10);
 check('Relations labels réception/variété/verger/adhérent',p1.rows[0].numrec===1&&p1.rows[0].variete==='VARIETE DEMO'&&p1.rows[0].verger==='VERGER DEMO'&&p1.rows[0].adherent==='ADHERENT DEMO');
 check('Valeurs relationnelles nulles affichables',(await ok(pre+'/palettes?search=998')).rows.find(p=>p.numpal===998).poids===null);
 check('Palettes autre station exclues',(await ok(pre+'/palettes?reception=3')).total===0);
 const request={version:0,date:'2026-10-08',debut:'08:00',fin:'09:00',programmeId:program.id,programmeVersion:1,eauInitiale:1200,eauConsommee:1000,palettes:[1,161],produits:[{produitId:product.id,dose:2.5,machine:2.6,reel:2.7,lots:[{lotId:lot1,quantite:2},{lotId:lot2,quantite:0.7}]}],observations:'DEMONSTRATION : valeurs numériques sans prescription.',motif:''};
 check('Archive non modifiable',(await call(`/contexts/${archive.id}/drencher/cycles`,'POST',request,op.actor)).status===403);
 check('Consultation non modifiable',(await call(pre+'/cycles','POST',request,consult.actor)).status===403);
 check('CSRF obligatoire',(await call(pre+'/cycles','POST',request,op.actor,false)).status===403);
 check('Palettes dupliquées refusées',(await call(pre+'/cycles','POST',{...request,palettes:[1,1]})).status===400);
 check('Palette station étrangère refusée',(await call(pre+'/cycles','POST',{...request,palettes:[999]})).status===409);
 check('Répartition fabricant incohérente refusée',(await call(pre+'/cycles','POST',{...request,produits:[{...request.produits[0],reel:3}]})).status===400);
 const cycle=await ok(pre+'/cycles','POST',request,op.actor);check('Brouillon sans sortie de stock',cycle.statut==='Brouillon'&&stock()===stockBefore);
 let detail=await ok(pre+'/cycles/'+cycle.id);let s=detail.revisions[0].snapshot,p=s.produits[0];
 check('Quatre valeurs distinctes et calcul exact',p.initial===3&&p.final===2.5&&p.machine===2.6&&p.reel===2.7);
 check('Écarts et deux lots fabricants conservés',p.ecartTheorique===0.2&&p.ecartMachine===0.1&&p.lots.length===2);
 check('Sélection multi-lots conservée',s.palettes.length===2&&s.palettes.map(p=>p.numrec).join(',')==='1,2');
 await ok(pre+'/programs','POST',{id:program.id,version:1,nom:'PROGRAMME DEMO',actif:true,produits:[{produitId:product.id,dose:3}]},quality.actor);
 check('Dosage ancien cycle non rétroactif',(await ok(pre+'/cycles/'+cycle.id)).revisions[0].snapshot.produits[0].dose===2.5);
 check('Nouveau cycle version périmée refusée',(await call(pre+'/cycles','POST',{...request,palettes:[2]})).status===409);
 let submitted=await ok(pre+`/cycles/${cycle.id}/submit`,'POST',{version:1,motif:''},op.actor);
 check('Soumission sans sortie de stock',submitted.statut==='En attente de validation'&&stock()===stockBefore);
 check('Opérateur ne valide pas',(await call(pre+`/cycles/${cycle.id}/validate`,'POST',{version:2,motif:''},op.actor)).status===403);
 const validated=await ok(pre+`/cycles/${cycle.id}/validate`,'POST',{version:2,motif:'Écarts contrôlés'},quality.actor);
 check('Validation déduit uniquement le réel par lot',validated.version===3&&sql(`SELECT solde FROM ${db}.vit_dr_stock_lot WHERE id=${lot1}`)==='8.000000'&&sql(`SELECT solde FROM ${db}.vit_dr_stock_lot WHERE id=${lot2}`)==='9.300000');
 const afterValidation=stock();check('Double validation refusée sans nouveau déstockage',(await call(pre+`/cycles/${cycle.id}/validate`,'POST',{version:3,motif:''},quality.actor)).status===409&&stock()===afterValidation);
 check('Palette signalée déjà traitée',(await ok(pre+'/palettes?search=1')).rows.find(p=>p.numpal===1).cycleTraite===cycle.id);
 const rq={...request,programmeVersion:2,palettes:[1],produits:[{...request.produits[0],dose:3}]};
 check('Palette validée dans un autre cycle bloque dès le brouillon',(await call(pre+'/cycles','POST',rq)).status===409&&stock()===afterValidation);
 const insufficient=await ok(pre+'/cycles','POST',{...rq,palettes:[2],produits:[{...rq.produits[0],reel:100,lots:[{lotId:lot1,quantite:100}]}]});await ok(pre+`/cycles/${insufficient.id}/submit`,'POST',{version:1,motif:''});
 check('Stock insuffisant annule toute la transaction',(await call(pre+`/cycles/${insufficient.id}/validate`,'POST',{version:2,motif:''})).status===409&&stock()===afterValidation&&sql(`SELECT COUNT(*) FROM ${db}.vit_dr_palette_validee WHERE numpal=2`)==='0');
 const correction={...request,version:3,motif:'Correction physique : consommation 2,8 L',produits:[{...request.produits[0],reel:2.8,lots:[{lotId:lot1,quantite:2.1},{lotId:lot2,quantite:0.7}]}]};
 check('Correction motif obligatoire',(await call(pre+`/cycles/${cycle.id}/correct`,'POST',{...correction,motif:''},quality.actor)).status===400);
 check('Correction sans droit qualité refusée',(await call(pre+`/cycles/${cycle.id}/correct`,'POST',correction,op.actor)).status===403);
 check('Correction palettes validées inchangées',(await call(pre+`/cycles/${cycle.id}/correct`,'POST',{...correction,palettes:[2]},quality.actor)).status===409);
 await ok(pre+`/cycles/${cycle.id}/correct`,'POST',correction,quality.actor);
 check('Correction restitue puis consomme avec bilan cohérent',sql(`SELECT solde FROM ${db}.vit_dr_stock_lot WHERE id=${lot1}`)==='7.900000'&&sql(`SELECT COUNT(*) FROM ${db}.vit_dr_mouvement WHERE cycle_id=${cycle.id} AND revision=4`)==='4');
 detail=await ok(pre+'/cycles/'+cycle.id);check('Historique immutable et ancienne consommation visible',detail.revisions.length===4&&detail.revisions[3].snapshot.produits[0].reel===2.7&&detail.revisions[0].snapshot.produits[0].reel===2.8);
 check('Correction concurrente périmée refusée',(await call(pre+`/cycles/${cycle.id}/correct`,'POST',correction,quality.actor)).status===409);
 const extraRq={...rq,palettes:[3],produits:[...rq.produits,{produitId:extra.id,dose:0,machine:0.4,reel:0.5,lots:[{lotId:lotB,quantite:0.5}]}]};
 const ec=await ok(pre+'/cycles','POST',extraRq);const es=(await ok(pre+'/cycles/'+ec.id)).revisions[0].snapshot;
 check('Produit hors programme visible et tracé',es.produits[1].horsProgramme&&es.produits[1].reel===0.5&&es.produits[1].nom==='PRODUIT DEMO B');
 const concurrent=await ok(pre+'/cycles','POST',{...rq,palettes:[4]});await ok(pre+`/cycles/${concurrent.id}/submit`,'POST',{version:1,motif:''});
 const races=await Promise.all([call(pre+`/cycles/${concurrent.id}/validate`,'POST',{version:2,motif:''}),call(pre+`/cycles/${concurrent.id}/validate`,'POST',{version:2,motif:''})]);
 check('Deux validations simultanées : une seule appliquée',races.map(r=>r.status).sort().join(',')==='200,409'&&sql(`SELECT COUNT(*) FROM ${db}.vit_dr_mouvement WHERE cycle_id=${concurrent.id} AND nature='Consommation'`)==='2');
 const nc=await ok(pre+'/cycles','POST',{...rq,palettes:[5],produits:[{...rq.produits[0],machine:null,reel:null,lots:[]}]});
 check('Soumission incomplète refusée',(await call(pre+`/cycles/${nc.id}/submit`,'POST',{version:1,motif:''})).status===400);
 check('Historique filtre statut/palette/date', (await ok(pre+'/cycles?status=Valid%C3%A9&search=161&from=2026-10-08&to=2026-10-08')).rows.some(c=>c.id===cycle.id));
 check('Tableau de bord et mouvements accessibles',(await ok(pre+'/cycles')).summary.palettes===3&&(await ok(pre+'/stock')).total>=9);
 check('Tables historiques strictement inchangées',before===fingerprint());
 check('Aucune route suppression/synchronisation Drencher',(await call(pre+'/cycles/'+cycle.id,'DELETE')).status===404&&(await call(pre+'/sync','POST',{})).status===404);
 check('Assistant toujours disponible indépendamment', (await call('/assistant')).status===200);
 check('Lecture Consultation conservée',(await call(pre+'/cycles','GET',undefined,consult.actor)).status===200);
 check('Quantité négative refusée',(await call(pre+'/cycles','POST',{...rq,palettes:[6],eauInitiale:-1})).status===400);
 check('Précision supérieure à six décimales refusée',(await call(pre+'/cycles','POST',{...rq,palettes:[6],eauInitiale:1.1234567})).status===400);
 check('Lot fabricant appartenant à un autre produit refusé',(await call(pre+'/cycles','POST',{...rq,palettes:[6],produits:[{...rq.produits[0],lots:[{lotId:lotB,quantite:2.7}]}]})).status===400);
 const preserve=await ok(pre+'/cycles','POST',{...extraRq,palettes:[6]});
 check('Utilisation réelle conservée même en brouillon',(await call(pre+'/cycles/'+preserve.id,'PUT',{...rq,version:1,palettes:[6]})).status===409);
 const pending=await ok(pre+'/cycles','POST',{...rq,palettes:[7]});await ok(pre+`/cycles/${pending.id}/submit`,'POST',{version:1,motif:''});
 check('Modifier un cycle en attente le remet en brouillon',(await ok(pre+'/cycles/'+pending.id,'PUT',{...rq,version:2,palettes:[7]})).statut==='Brouillon');
 const unchanged=stock();
 check('Correction insuffisante intégralement annulée',(await call(pre+`/cycles/${cycle.id}/correct`,'POST',{...correction,version:4,produits:[{...correction.produits[0],reel:100,lots:[{lotId:lot1,quantite:100}]}]},quality.actor)).status===409&&stock()===unchanged&&(await ok(pre+'/cycles/'+cycle.id)).version===4);
 sql(`USE ${db};CREATE TRIGGER dr_test_trigger BEFORE UPDATE ON vit_dr_stock_lot FOR EACH ROW SET NEW.solde=NEW.solde;`);
 try {check('Déclencheur inattendu bloque le module',(await call(pre+'/catalog')).status===409);} finally {sql(`USE ${db};DROP TRIGGER dr_test_trigger;`);}
 sql(`ALTER TABLE ${db}.vit_dr_stock_lot MODIFY solde DECIMAL(18,2) NOT NULL DEFAULT 0;`);
 try {check('Type SQL incompatible bloque le module',(await call(pre+'/catalog')).status===409);} finally {sql(`ALTER TABLE ${db}.vit_dr_stock_lot MODIFY solde DECIMAL(18,6) NOT NULL DEFAULT 0;`);}
 check('Schéma restauré et tables historiques inchangées',(await call(pre+'/catalog')).status===200&&before===fingerprint());
} finally {
 for(const u of users)sql(`UPDATE referentiels_admin.app_users SET enabled=0,auth_version=auth_version+1 WHERE id=${u.id};`);
 for(const id of ids)sql(`UPDATE referentiels_admin.app_contexts SET enabled=0 WHERE id=${id};`);
 writeFileSync('docs/tests-drencher-v12-legacy.json',JSON.stringify({date:new Date().toISOString(),db,contextId:source.id,host:'127.0.0.1',port:33307,data:'DDL fourni et données synthétiques exclusivement',passed:results.length,failed:results.length<56?1:0,results},null,2));
}
