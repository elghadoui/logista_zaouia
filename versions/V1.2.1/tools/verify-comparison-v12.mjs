import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
const base=process.env.VITASOUSS_TEST_URL??'http://127.0.0.1:5080/api';
assert.match(base,/^http:\/\/(127\.0\.0\.1|localhost):\d+\/api$/);
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
function sql(query){return execFileSync(mysql,['--host=127.0.0.1','--port=33307',`--user=${process.env.VITASOUSS_TEST_SETUP_USER??'vitasouss_test'}`,'--batch','--skip-column-names','--execute',query],{encoding:'utf8',env:{...process.env,MYSQL_PWD:process.env.VITASOUSS_TEST_SETUP_PASSWORD??''}}).trim();}
async function session(username){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:process.env.VITASOUSS_TEST_PASSWORD})});assert.equal(r.status,200);return r.headers.get('set-cookie').split(';')[0];}
let cookie=await session('admin');
const auth=await fetch(base+'/auth/me',{headers:{Cookie:cookie}});const csrf=(await auth.json()).csrf;
async function call(uri,method='GET',body,as=cookie){const r=await fetch(base+uri,{method,headers:{Cookie:as,'Content-Type':'application/json','X-CSRF-Token':csrf},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,data:await r.json()};}
async function ok(uri,method='GET',body,as=cookie){const r=await call(uri,method,body,as);assert.equal(r.status,200,uri+': '+JSON.stringify(r.data));return r.data;}
const contexts=await ok('/contexts'),source=contexts.find(c=>c.databaseName==='vitasouss_test_zaouia_v1'),target=contexts.find(c=>c.databaseName==='vitasouss_test_diaf_v1');assert.ok(source&&target);
const pre=`/contexts/${source.id}`,dst=`/contexts/${target.id}`;
const report=(extra='')=>ok(`${pre}/comparison?name=verger&targetId=${target.id}&search=COMPARAISON%20V12${extra}`);
const results=[];function check(name,passed){assert.ok(passed,name);results.push({name,passed:true});console.log('PASS '+name);}
check('Destination DIAF : route autorisée', (await ok(pre+'/comparison-targets')).some(t=>t.id===target.id));
const baseline=sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.verger; SELECT COUNT(*) FROM vitasouss_test_diaf_v1.verger;');
assert.equal(Number(sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.verger WHERE refver IN(32011,32012,32013)')),0);
assert.equal(Number(sql('SELECT COUNT(*) FROM vitasouss_test_diaf_v1.verger WHERE refver IN(32011,32012,32013)')),0);
assert.equal(Number(sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.souvar WHERE codsvar=32000 AND codvar=104')),0);
assert.equal(Number(sql('SELECT COUNT(*) FROM vitasouss_test_diaf_v1.souvar WHERE codsvar=32000 AND codvar=104')),0);
const users=[];
try{
 for(const [prefix,refver,nomver] of [[pre,32011,'=COMPARAISON V12 A'],[dst,32011,'COMPARAISON V12 B'],[pre,32012,'COMPARAISON V12 source seule'],[dst,32013,'COMPARAISON V12 cible seule']])await ok(prefix+'/entities/verger','POST',{values:{refver,nomver,refadh:1,refsta:prefix===pre?7816:1234}});
 const all=await report();
 check('Différence de valeur identifiée',all.rows.some(r=>r.key.refver===32011&&r.status==='Different'&&r.differences.some(d=>d.field==='nomver'&&d.after==='=COMPARAISON V12 A'&&d.before==='COMPARAISON V12 B')));
 check('Fiche absente de DIAF identifiée',all.rows.some(r=>r.key.refver===32012&&r.status==='SourceOnly'));
 check('Fiche absente de ZAOUIA identifiée',all.rows.some(r=>r.key.refver===32013&&r.status==='TargetOnly'));
 check('refsta et dates générées exclus des écarts',all.rows.every(r=>r.differences.every(d=>!['refsta','UpdatedAt'].includes(d.field))));
 check('Compteurs de comparaison cohérents',all.total===3&&all.summary.Different===1&&all.summary.SourceOnly===1&&all.summary.TargetOnly===1);
 const p1=await report('&pageSize=1&page=1'),p2=await report('&pageSize=1&page=2');
 check('Pagination des différences sans changer les totaux',p1.total===3&&p2.total===3&&p1.rows.length===1&&p2.rows.length===1&&p1.rows[0].key.refver!==p2.rows[0].key.refver);
 const different=await report('&status=Different');check('Filtre de statut',different.total===1&&different.rows.every(r=>r.status==='Different'));
 const single=await ok(`${pre}/comparison?name=verger&targetId=${target.id}&search=V12%20A`);
 check('Recherche dans une station ne crée pas de faux absent',single.total===1&&single.rows[0].status==='Different');
 const csvResponse=await fetch(base+`${pre}/comparison/export?name=verger&targetId=${target.id}&search=COMPARAISON%20V12`,{headers:{Cookie:cookie}});const csv=await csvResponse.text();
 check('Export CSV : toutes les différences filtrées',csvResponse.status===200&&csvResponse.headers.get('content-type').includes('text/csv')&&csv.includes('32011')&&csv.includes('32012')&&csv.includes('32013'));
 check('Export CSV : formules neutralisées',csv.includes(`"'=COMPARAISON V12 A"`));
 for(const name of ['adherent','parcelle','culture','grpvar','variete','souvar']){const r=await ok(`${pre}/comparison?name=${name}&targetId=${target.id}&pageSize=1`);check(`Comparaison ${name} : volume SQL réel`,r.summary.SourceRows===Number(sql(`SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.${name}`))&&r.summary.TargetRows===Number(sql(`SELECT COUNT(*) FROM vitasouss_test_diaf_v1.${name}`)));}
 sql("INSERT INTO vitasouss_test_zaouia_v1.souvar(codsvar,codvar,nomsvar) VALUES(32000,104,'V12CMP'); INSERT INTO vitasouss_test_diaf_v1.souvar(codsvar,codvar,nomsvar) VALUES(32000,104,'V12CMP'),(32000,104,'V12CMP')");
 const ambiguous=await ok(`${pre}/comparison?name=souvar&targetId=${target.id}&search=32000`);
 check('Doublon historique : identité ambiguë signalée',ambiguous.total===1&&ambiguous.rows[0].status==='Ambiguous'&&ambiguous.rows[0].sourceCount===1&&ambiguous.rows[0].targetCount===2&&ambiguous.rows[0].differences.length===0);
 for(const [username,contextIds] of [['v12_compare_read',[source.id,target.id]],['v12_compare_source',[source.id]]]){
  let existing=(await ok('/admin/configuration')).users.find(u=>u.username===username);
  if(!existing){await ok('/admin/users','POST',{username,displayName:'Test comparaison V12',role:'Consultation',password:process.env.VITASOUSS_TEST_PASSWORD,contextIds});existing=(await ok('/admin/configuration')).users.find(u=>u.username===username);}else await ok(`/admin/users/${existing.id}/access`,'PUT',{role:'Consultation',enabled:true,contextIds});
  users.push(existing.id);const actor=await session(username);
  if(contextIds.length===2)check('Consultation : comparaison autorisée en lecture',(await call(`${pre}/comparison?name=verger&targetId=${target.id}&search=COMPARAISON%20V12`,'GET',undefined,actor)).status===200);
  else check('Destination non attribuée : comparaison refusée',(await call(`${pre}/comparison?name=verger&targetId=${target.id}`,'GET',undefined,actor)).status===403);
 }
 check('Route non DIAF refusée',(await call(`${pre}/comparison?name=verger&targetId=${source.id}`)).status===403);
 check('Référentiel SQL non autorisé refusé',(await call(`${pre}/comparison?name=verger%3BDROP&targetId=${target.id}`)).status===404);
 check('État non autorisé refusé',(await call(`${pre}/comparison?name=verger&targetId=${target.id}&status=bad`)).status===400);
 check('Comparaison n’écrit aucune donnée',sql("SELECT nomver,refsta FROM vitasouss_test_zaouia_v1.verger WHERE refver=32011")==='=COMPARAISON V12 A\t7816'&&sql("SELECT nomver,refsta FROM vitasouss_test_diaf_v1.verger WHERE refver=32011")==='COMPARAISON V12 B\t1234');
}finally{
 sql("DELETE FROM vitasouss_test_zaouia_v1.verger WHERE refver IN(32011,32012,32013) AND nomver LIKE '%COMPARAISON V12%'; DELETE FROM vitasouss_test_diaf_v1.verger WHERE refver IN(32011,32012,32013) AND nomver LIKE '%COMPARAISON V12%'; DELETE FROM vitasouss_test_zaouia_v1.souvar WHERE codsvar=32000 AND codvar=104 AND nomsvar='V12CMP'; DELETE FROM vitasouss_test_diaf_v1.souvar WHERE codsvar=32000 AND codvar=104 AND nomsvar='V12CMP';");
 for(const id of users)await ok(`/admin/users/${id}/access`,'PUT',{role:'Consultation',enabled:false,contextIds:[]});
}
check('Volumes restaurés après fixtures de comparaison',sql('SELECT COUNT(*) FROM vitasouss_test_zaouia_v1.verger; SELECT COUNT(*) FROM vitasouss_test_diaf_v1.verger;')===baseline);
writeFileSync('docs/comparison-verification-v12.json',JSON.stringify({testedAt:new Date().toISOString(),results},null,2));console.log(`${results.length} vérifications de comparaison réussies.`);
