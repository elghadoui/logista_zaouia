// Démonstration locale uniquement : aucun paramètre d'hôte distant, aucun accès production.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
const base='http://127.0.0.1:5080/api';assert.ok(process.env.VITASOUSS_TEST_PASSWORD);
const login=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:process.env.VITASOUSS_TEST_PASSWORD})});assert.equal(login.status,200);const actor=await login.json(),cookie=login.headers.get('set-cookie').split(';')[0];
async function api(url,method='GET',body){const r=await fetch(base+url,{method,headers:{Cookie:cookie,'Content-Type':'application/json','X-CSRF-Token':actor.csrf},body:body===undefined?undefined:JSON.stringify(body)});assert.equal(r.status,200,await r.clone().text());return r.json();}
const config=await api('/admin/configuration'),station=config.stations.find(s=>s.code==='ZAOUIA'),server=config.servers.find(s=>s.id===station.server_id);assert.equal(server.host,'127.0.0.1');assert.equal(server.port,33307);
const nonce=randomUUID().replaceAll('-',''),db='vitasouss_recette_drencher_'+nonce;assert.match(db,/^vitasouss_recette_drencher_[a-f0-9]{32}$/);
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe'),sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--batch','--skip-column-names'],{input:"SET SESSION sql_mode='';\n"+q,encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
const definitions=[...JSON.parse(readFileSync('backend/schema.json','utf8').replace(/^\uFEFF/,'')),...JSON.parse(readFileSync('backend/pilot-schema.json','utf8').replace(/^\uFEFF/,''))];
const names=new Set([...definitions.map(d=>d.name),'palbrut','station','reception']);
const dump=readFileSync('F:/diafbacukup/logista_zaouia_051026.sql','utf8');const ddl=[...dump.matchAll(/CREATE TABLE IF NOT EXISTS `([^`]+)` \(([\s\S]*?)\) ENGINE=[^;]+;/g)].filter(m=>names.has(m[1])).map(m=>m[0]);
assert.equal(sql(`SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='${db}'`),'0');
sql(`CREATE DATABASE ${db} CHARACTER SET latin1;USE ${db};`+ddl.join('\n')+readFileSync('sql/004_drencher_business.sql','utf8')+readFileSync('sql/007_drencher_recette_identite.sql','utf8')+`INSERT INTO vit_dr_recette_identite VALUES(1,'${nonce}','${db}',NULL,UTC_TIMESTAMP());GRANT SELECT,UPDATE,TRIGGER ON ${db}.vit_dr_recette_identite TO 'vitasouss_test'@'127.0.0.1';GRANT SELECT,INSERT,TRIGGER ON ${db}.vit_dr_recette_operation TO 'vitasouss_test'@'127.0.0.1';GRANT PROCESS ON *.* TO 'vitasouss_test'@'127.0.0.1';`+`GRANT SELECT ON ${db}.* TO 'vitasouss_test'@'127.0.0.1';`+
 ['vit_traitement_produit','vit_dr_programme','vit_dr_mutex','vit_dr_stock_lot','vit_dr_cycle'].map(t=>`GRANT INSERT,UPDATE,TRIGGER ON ${db}.${t} TO 'vitasouss_test'@'127.0.0.1';`).join('\n')+
 ['vit_dr_programme_revision','vit_dr_revision','vit_dr_palette_validee','vit_dr_mouvement','vit_dr_admin_historique'].map(t=>`GRANT INSERT,TRIGGER ON ${db}.${t} TO 'vitasouss_test'@'127.0.0.1';`).join('\n')+
 `INSERT INTO adherent(refadh,nomadh) VALUES(1,'ADHERENT DEMONSTRATION');INSERT INTO verger(refver,nomver,refadh,refsta) VALUES(101,'VERGER DEMONSTRATION',1,7816);INSERT INTO culture(codcul,nomcul) VALUES(100,'CULTURE DEMO');INSERT INTO grpvar(codgrv,nomgrv) VALUES(1,'GROUPE DEMO');INSERT INTO variete(codvar,nomvar,codcul,codgrv) VALUES(104,'VARIETE DEMONSTRATION',100,1);INSERT INTO station(refsta,nomsta) VALUES(7816,'ZAOUIA DEMO');INSERT INTO reception(numrec,refsta,codvar,refver,dterec) VALUES(1,7816,104,101,'2026-10-08'),(2,7816,104,101,'2026-10-08');INSERT INTO palbrut(numpal,numrec,codvar,refver,refadh,pdsfru) VALUES `+Array.from({length:164},(_,i)=>`(${i+1},${i<160?1:2},104,101,1,500)`).join(',')+';');
const label='RECETTE DRENCHER V1.1 - donnees synthetiques';await api('/admin/contexts','POST',{stationId:station.id,databaseName:db,label,readOnly:false,localRefsta:7816});const c=(await api('/admin/configuration')).contexts.find(c=>c.database_name===db),pre=`/contexts/${c.id}/drencher`;
try {
 sql(['vit_traitement_produit','vit_dr_programme','vit_dr_programme_revision','vit_dr_stock_lot','vit_dr_cycle','vit_dr_revision','vit_dr_palette_validee','vit_dr_mouvement'].map(t=>`GRANT DELETE ON ${db}.${t} TO 'vitasouss_test'@'127.0.0.1';`).join('\n'));
 await api(pre+'/recette/activate','POST',{confirmation:'ACTIVER RECETTE'});
 const product=await api(pre+'/products','POST',{id:0,reference:'DEMO-A',nom:'PRODUIT DEMO A',unite:'L',actif:true});
 const extra=await api(pre+'/products','POST',{id:0,reference:'DEMO-B',nom:'PRODUIT DEMO B',unite:'kg',actif:true});
 await api(pre+'/programs','POST',{id:0,version:0,nom:'PROGRAMME DEMO - sans prescription',actif:true,produits:[{produitId:product.id,dose:2.5}]});
 for(const [pid,lot,bon]of[[product.id,'FAB-DEMO-A1','BON-DEMO-A1'],[product.id,'FAB-DEMO-A2','BON-DEMO-A2'],[extra.id,'FAB-DEMO-B','BON-DEMO-B']])await api(pre+'/stock','POST',{produitId:pid,lot,bon,peremption:'2027-10-08',date:'2026-10-08',quantite:50});
 const info={date:new Date().toISOString(),database:db,contextId:c.id,label,host:'127.0.0.1',port:33307,palettes:164,lot1:160,lot2:4,cycles:0,production:false};writeFileSync('docs/drencher-v11-demo-local.json',JSON.stringify(info,null,2));console.log(JSON.stringify(info));
}catch(e){sql(`UPDATE referentiels_admin.app_contexts SET enabled=0 WHERE id=${c.id}`);throw e;}
