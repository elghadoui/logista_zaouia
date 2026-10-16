import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
const base='http://127.0.0.1:5080/api', password=process.env.VITASOUSS_TEST_PASSWORD; assert.ok(password);
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
const sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--batch','--raw','--skip-column-names'],{input:"SET SESSION sql_mode='';\n"+q,encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
const results=[];function check(name,yes){assert.ok(yes,name);results.push({name,passed:true});console.log('PASS '+name);}
async function login(username='admin'){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});assert.equal(r.status,200,await r.clone().text());const d=await r.json();return {cookie:r.headers.get('set-cookie').split(';')[0],csrf:d.csrf};}
const admin=await login();
async function raw(uri,actor=admin,method='GET',body){return fetch(base+uri,{method,headers:{Cookie:actor.cookie,'Content-Type':'application/json','X-CSRF-Token':actor.csrf},body:body===undefined?undefined:JSON.stringify(body)});}
async function ok(uri,method='GET',body,actor=admin){const response=await raw(uri,actor,method,body),data=await response.json();assert.equal(response.status,200,JSON.stringify(data));return data;}
const cfg=await ok('/admin/configuration'),station=cfg.stations.find(s=>s.code==='ZAOUIA'),server=cfg.servers.find(s=>s.id===station.server_id);assert.equal(server.host,'127.0.0.1');assert.equal(server.port,33307);
const nonce=randomUUID().replaceAll('-',''),db='vitasouss_recette_drencher_'+nonce;assert.match(db,/^vitasouss_recette_drencher_[a-f0-9]{32}$/);
assert.equal(sql(`SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${db}'`),'0');
sql(`CREATE DATABASE ${db} CHARACTER SET latin1;USE ${db};`+['008_drencher_recette_structure.sql','004_drencher_business.sql','007_drencher_recette_identite.sql','010_drencher_reservations.sql'].map(f=>readFileSync('sql/'+f,'utf8')).join('\n')+`INSERT INTO vit_dr_recette_identite VALUES(1,'${nonce}','${db}',NULL,UTC_TIMESTAMP());GRANT SELECT ON ${db}.* TO 'vitasouss_test'@'127.0.0.1';`+['vit_traitement_produit','vit_dr_programme','vit_dr_programme_revision','vit_dr_mutex','vit_dr_stock_lot','vit_dr_cycle','vit_dr_revision','vit_dr_palette_validee','vit_dr_mouvement','vit_dr_admin_historique','vit_dr_recette_identite','vit_dr_recette_operation','vit_dr_palette_reservee','vit_dr_reservation_etat'].map(t=>`GRANT INSERT,UPDATE,DELETE,TRIGGER ON ${db}.${t} TO 'vitasouss_test'@'127.0.0.1';`).join('\n'));
const contexts=[],users=[];let success=false;
async function context(label,name=db){await ok('/admin/contexts','POST',{stationId:station.id,databaseName:name,label,readOnly:false,localRefsta:7816});const c=(await ok('/admin/configuration')).contexts.find(c=>c.database_name===name&&c.label===label);contexts.push(c.id);return c.id;}
const cid=await context('RECETTE V1.3 RAPPORTS '+nonce),pre=`/contexts/${cid}/drencher`;
function checksum(){return sql('USE '+db+';CHECKSUM TABLE '+['vit_traitement_produit','vit_dr_programme','vit_dr_programme_revision','vit_dr_stock_lot','vit_dr_cycle','vit_dr_revision','vit_dr_mouvement','vit_dr_admin_historique','vit_dr_palette_validee','vit_dr_palette_reservee','vit_dr_reservation_etat','palbrut','reception','adherent','verger','variete'].join(',')+';');}
function rows(report,title){return report.tables.find(t=>t.title.includes(title)).rows;}
async function report(query,actor=admin){return ok(pre+'/reports/stock?format=json&'+query,'GET',undefined,actor);}
async function pdf(uri,name){const response=await raw(pre+uri);assert.equal(response.status,200,await response.clone().text().then(x=>x.slice(0,300)));check('PDF authentifié '+name,response.headers.get('content-type')==='application/pdf'&&response.headers.get('cache-control').includes('no-store'));const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.subarray(0,5).toString(),'%PDF-');writeFileSync('output/pdf/drencher-v13-'+name+'.pdf',bytes);}
try {
 await ok(pre+'/recette/activate','POST',{confirmation:'ACTIVER RECETTE'});await ok(pre+'/reservations/initialize','POST',{confirmation:'INITIALISER RESERVATIONS'});
 const products=[];
 for(const [ref,unit] of [['A','L'],['B','mL'],['C','kg'],['D','g']])products.push(await ok(pre+'/products','POST',{id:0,reference:ref,nom:'PRODUIT FICTIF '+ref,unite:unit,actif:true}));
 const zero=await ok(pre+'/products','POST',{id:0,reference:'ZERO',nom:'SANS MOUVEMENT',unite:'L',actif:false});
 const prog=await ok(pre+'/programs','POST',{id:0,version:0,nom:'PROGRAMME HISTORIQUE',actif:true,produits:products.slice(0,3).map(p=>({produitId:p.id,dose:2.5}))});
 for(const p of products)await ok(pre+'/stock','POST',{produitId:p.id,lot:'FAB-'+p.id,peremption:p===products[0]?'2025-01-01':null,quantite:50,bon:'BON-'+p.id,date:'2026-10-01'});
 const cat=await ok(pre+'/catalog'),lotFor=p=>cat.lots.find(l=>l.produitId===p.id).id;
 sql('USE '+db+";INSERT INTO adherent(refadh,nomadh) VALUES(1,'PRODUCTEUR FICTIF A'),(2,'PRODUCTEUR FICTIF B');INSERT INTO verger(refver,nomver,refadh) VALUES(101,'VERGER FICTIF A',1),(102,'VERGER FICTIF B',2);INSERT INTO variete(codvar,nomvar) VALUES(104,'CLEMENTINE FICTIVE'),(105,'ORANGE FICTIVE');INSERT INTO reception(numrec,refsta,codvar,refver) VALUES(1,7816,104,101),(2,7816,105,102);INSERT INTO palbrut(numpal,numrec,codvar,refver,refadh,pdsfru) VALUES "+Array.from({length:165},(_,i)=>`(${i+1},${i<160?1:2},${i<160?104:105},${i<160?101:102},${i<160?1:2},${i<160?500:750})`).join(',')+';');
 const rq={version:0,date:'2026-10-09',debut:'08:00',fin:'09:00',programmeId:prog.id,programmeVersion:1,eauInitiale:1200,eauConsommee:1000,palettes:[1],produits:products.map((p,i)=>({produitId:p.id,dose:i===3?1:2.5,machine:2.6,reel:2.7,lots:[{lotId:lotFor(p),quantite:2.7}]})),observations:'Essai FICTIF — écarts réellement déclarés. Aucune conformité automatique.',motif:''};
 const cycle=await ok(pre+'/cycles','POST',rq);let f04=await ok(pre+`/reports/f04/${cycle.id}?format=json`);
 check('F04 mono réception en Recette non validé',f04.mode==='Recette'&&f04.warning==='NON VALIDÉE — DOCUMENT DE TRAVAIL'&&rows(f04,'détail des palettes').length===1);
 check('Quatre quantités et écarts déclarés',rows(f04,'quatre quantités')[0].slice(3).join('|')==='3|2,5|2,6|2,7|0,2|0,1');
 check('Matières actives jamais importées du modèle',rows(f04,'Lots fabricants').every(row=>row[4]==='Non renseignée / non vérifiée'));
 check('Lot périmé et produit supplémentaire visibles',JSON.stringify(f04).includes('Lot périmé')&&JSON.stringify(f04).includes('hors programme'));
 const big=await ok(pre+'/cycles','POST',{...rq,palettes:Array.from({length:164},(_,i)=>i+2)});await pdf(`/reports/f04/${big.id}`,'f04');
 const multi=await ok(pre+`/reports/f04/${big.id}?format=json`);
 check('F04 multi réception, variétés, produits et palettes',rows(multi,'détail des palettes').length===164&&rows(multi,'regroupement').length===2&&rows(multi,'quatre quantités').length===4&&JSON.stringify(multi).includes('ORANGE FICTIVE'));
 check('Conversion exacte poids kg et tonnage',rows(multi,'Totaux du cycle').some(row=>row[1]==='83250 kg / 83,25 t'));
 const detail=await ok(pre+`/cycles/${big.id}`),original=JSON.stringify(detail.revisions[0].snapshot),partial=structuredClone(detail.revisions[0].snapshot);partial.palettes[0].poids=null;partial.palettes[0].variete=null;partial.palettes[0].adherent=null;
 sql(`UPDATE ${db}.vit_dr_revision SET contenu='${JSON.stringify(partial).replaceAll("'","''")}' WHERE cycle_id=${big.id} AND version=1;`);
 const missing=await ok(pre+`/reports/f04/${big.id}?format=json`);check('Poids et libellés absents historiques sans valeurs inventées',JSON.stringify(missing).includes('TOTAL PARTIEL')&&rows(missing,'détail des palettes')[0][5]==='Non renseigné');
 sql(`UPDATE ${db}.vit_dr_revision SET contenu='${original.replaceAll("'","''")}' WHERE cycle_id=${big.id} AND version=1;`);
 await ok(pre+`/cycles/${cycle.id}/submit`,'POST',{version:1,motif:''});await ok(pre+`/cycles/${cycle.id}/validate`,'POST',{version:2,motif:'Validation des données fictives'});
 await ok(pre+'/programs','POST',{id:prog.id,version:1,nom:'PROGRAMME ACTUEL',actif:true,produits:products.slice(0,3).map(p=>({produitId:p.id,dose:9}))});
 f04=await ok(pre+`/reports/f04/${cycle.id}?format=json`);check('Cycle validé historique indépendant du programme actuel',f04.warning===''&&JSON.stringify(f04).includes('PROGRAMME HISTORIQUE')&&!JSON.stringify(f04).includes('PROGRAMME ACTUEL')&&rows(f04,'quatre quantités')[0][2]==='2,5');
 sql(`UPDATE ${db}.vit_dr_mouvement SET date_creation='2026-10-01 08:00:00' WHERE nature='Entree';UPDATE ${db}.vit_dr_mouvement SET date_creation='2026-10-08 08:00:00' WHERE nature='Consommation';`);
 const correction={...rq,version:3,motif:'Correction qualité FICTIVE : réel 3 L',produits:rq.produits.map(p=>({...p,reel:3,lots:[{lotId:p.lots[0].lotId,quantite:3}]}))};
 await ok(pre+`/cycles/${cycle.id}/correct`,'POST',correction);
 sql(`UPDATE ${db}.vit_dr_mouvement SET date_creation='2026-10-09 10:00:00' WHERE nature LIKE 'Correction%';`);
 const fingerprint=checksum();
 const card=await report(`type=fiche&produitId=${products[0].id}&from=2026-10-09&to=2026-10-09`);
 check('Ouverture reconstruite depuis mouvements antérieurs',rows(card,'Soldes')[0][2]==='47,3');
 check('Correction restitution puis remplacement dans journal brut',rows(card,'Journal brut').length===2&&rows(card,'Journal brut')[0][7]==='50'&&rows(card,'Journal brut')[1][7]==='47');
 check('Solde final imprimé égale MySQL',rows(card,'Soldes')[0][3]==='47'&&sql(`SELECT solde FROM ${db}.vit_dr_stock_lot WHERE id=${lotFor(products[0])}`)==='47.000000');
 const net=await report('type=consommations&from=2026-10-09&to=2026-10-09');
 check('Consommations nettes sans double compte des anciennes versions',rows(net,'nettes par cycle').length===4&&rows(net,'nettes par cycle').every(row=>row[4]==='3'));
 check('Les quatre unités restent distinctes',rows(net,'Consommations nettes par unité').length===4&&rows(net,'Consommations nettes par unité').every(row=>row[1]==='3'));
 const stock=await report('type=stock&detailLots=true');check('Stock nul produit sans mouvement inclus',rows(stock,'Disponibilités').some(row=>row[0]==='ZERO'&&row[4]==='0'));
 sql(`UPDATE ${db}.vit_dr_stock_lot SET solde=48 WHERE id=${lotFor(products[0])}`);const mismatch=await report('type=stock');check('Écart stock journal signalé sans réparation implicite',mismatch.notes.some(n=>n.includes('ÉCART À CONTRÔLER'))&&sql(`SELECT solde FROM ${db}.vit_dr_stock_lot WHERE id=${lotFor(products[0])}`)==='48.000000');sql(`UPDATE ${db}.vit_dr_stock_lot SET solde=47 WHERE id=${lotFor(products[0])}`);
 check('Péremption réelle et unité du lot',JSON.stringify(stock).includes('2025-01-01')&&JSON.stringify(stock).includes('Périmé'));
 const entry=await report('type=entrees&from=2026-10-01&to=2026-10-01');check('Journal entrées date réception, bon, auteur',rows(entry,'Entrées magasin').length===4&&rows(entry,'Entrées magasin')[0][1].startsWith('BON-'));
 const empty=await report(`type=fiche&produitId=${products[0].id}&from=2026-10-10&to=2026-10-10`);check('Période sans mouvements préserve ouverture et clôture',rows(empty,'Journal brut').length===0&&rows(empty,'Soldes')[0].slice(2).join('|')==='47|47');
 const noMove=await report(`type=fiche&produitId=${zero.id}`);check('Fiche produit sans mouvement garde zéro',rows(noMove,'Soldes')[0].slice(2).join('|')==='0|0');
 const filtered=await report(`type=mouvements&produitId=${products[0].id}&from=2026-10-09&to=2026-10-09&nature=Correction%20consommation`);check('Filtre nature ne fausse pas le solde',rows(filtered,'Journal brut').length===1&&rows(filtered,'Journal brut')[0][7]==='47');
 const onlyLot=await report(`type=stock&lotId=${lotFor(products[1])}&detailLots=true`);check('Filtre lot limité au bon produit',rows(onlyLot,'Disponibilités').length===1&&rows(onlyLot,'Disponibilités')[0][0]==='B');
 check('Produit obligatoire pour fiche',(await raw(pre+'/reports/stock?type=fiche')).status===400);
 check('Période inversée refusée',(await raw(pre+'/reports/stock?type=mouvements&from=2026-10-10&to=2026-10-09')).status===400);
 check('Injection et type de rapport arbitraire refusés',(await raw(pre+'/reports/stock?type=DROP%20TABLE')).status===400);
 check('Cycle absent refusé',(await raw(pre+'/reports/f04/999999')).status===404);
 check('Historique révision validée remplacée identifié',(await ok(pre+`/reports/f04/${cycle.id}?revision=3&format=json`)).warning.includes('RÉVISION HISTORIQUE'));
 mkdirSync('output/pdf',{recursive:true});
 for(const type of ['stock','fiche','entrees','consommations','mouvements'])await pdf(`/reports/stock?type=${type}&produitId=${products[0].id}&detailLots=true`,type);
 check('Tous les rapports strictement sans mutation',checksum()===fingerprint);
 // Context alias mimics Production behavior on this isolated LOCAL synthetic database only.
 const prodDb='vitasouss_test_dr13_'+nonce;
 sql(`CREATE DATABASE ${prodDb} CHARACTER SET latin1;`+['vit_traitement_produit','vit_dr_programme','vit_dr_programme_revision','vit_dr_mutex','vit_dr_stock_lot','vit_dr_cycle','vit_dr_revision','vit_dr_palette_validee','vit_dr_mouvement','vit_dr_admin_historique'].map(t=>`CREATE TABLE ${prodDb}.${t} LIKE ${db}.${t};INSERT INTO ${prodDb}.${t} SELECT * FROM ${db}.${t};GRANT SELECT,TRIGGER ON ${prodDb}.${t} TO 'vitasouss_test'@'127.0.0.1';`).join('\n'));
 const prod=await context('CONTEXTE SYNTHETIQUE NON INSCRIT '+nonce,prodDb);const prodReport=await ok(`/contexts/${prod}/drencher/reports/stock?type=stock&format=json`);check('Contexte non Recette distingué sans accéder à logista',prodReport.mode==='Production');
 const username='dr13_consult_'+nonce;await ok('/admin/users','POST',{username,displayName:'CONSULTATION TEST V13',password,role:'Consultation',contextIds:[prod]});const user=(await ok('/admin/configuration')).users.find(u=>u.username===username);users.push(user.id);const consult=await login(username);
 const consultationPdf=await raw(`/contexts/${prod}/drencher/reports/stock?type=stock`,consult);check('Lecture Consultation autorisée dans contexte attribué',consultationPdf.status===200);await consultationPdf.arrayBuffer();
 check('Exercice non attribué et Recette réservée Admin',(await raw(pre+'/reports/stock?type=stock',consult)).status===403);
 const perms=await ok('/admin/users/'+user.id+'/permissions');await ok('/admin/users/'+user.id+'/permissions','PUT',{permissions:perms.map(p=>({...p,view:p.module==='drencher'?false:p.view}))});const restricted=await login(username);check('Permission module retirée bloque PDF',(await raw(`/contexts/${prod}/drencher/reports/stock?type=stock`,restricted)).status===403);
 check('PDF anonyme refusé',(await fetch(base+pre+'/reports/f04/'+cycle.id)).status===401);
 check('Aucun POST de génération ou de mutation PDF',[404,405].includes((await raw(pre+'/reports/stock',admin,'POST',{})).status));
 check('Rapports ne modifient ni cycles ni données historiques',checksum()===fingerprint);
 success=true;
} finally {
 for(const id of users)sql('UPDATE referentiels_admin.app_users SET enabled=0,auth_version=auth_version+1 WHERE id='+id);
 for(const id of contexts)sql('UPDATE referentiels_admin.app_contexts SET enabled=0 WHERE id='+id);
 writeFileSync('docs/tests-drencher-v13-api.json',JSON.stringify({date:new Date().toISOString(),host:'127.0.0.1',port:33307,productionAccess:false,db,contextId:cid,passed:results.length,failed:success?0:1,results},null,2));
}
process.exit(0);
