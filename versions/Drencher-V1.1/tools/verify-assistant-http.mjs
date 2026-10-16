import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import path from 'node:path';
const base='http://127.0.0.1:5080/api';
if(!process.env.VITASOUSS_TEST_PASSWORD)throw Error('Mot de passe test local requis');
const mysql=path.resolve('.local-mysql/mysql-5.7.44-winx64/bin/mysql.exe');
const sql=q=>execFileSync(mysql,['--host=127.0.0.1','--port=33307','--user=root','--batch','--skip-column-names','--execute',q],{encoding:'utf8',env:{...process.env,MYSQL_PWD:''}}).trim();
const results=[];
const check=(name,ok)=>{assert.ok(ok,name);results.push({name,passed:true});console.log('PASS '+name)};
async function login(username){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password:process.env.VITASOUSS_TEST_PASSWORD})});assert.equal(r.status,200);const d=await r.json();return{cookie:r.headers.get('set-cookie').split(';')[0],csrf:d.csrf};}
async function call(actor,uri,method='GET',body,csrf=true){const r=await fetch(base+uri,{method,headers:{Cookie:actor.cookie,'Content-Type':'application/json',...(csrf?{'X-CSRF-Token':actor.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,data:await r.json().catch(()=>null)}}
const admin=await login('admin');
const config=(await call(admin,'/admin/configuration')).data;
const source=config.contexts.filter(c=>c.enabled&&c.database_name.startsWith('vitasouss_test_v13_src_')).at(-1);
assert.ok(source);const target=config.contexts.filter(c=>c.enabled&&c.database_name.startsWith('vitasouss_test_v13_dst_')).at(-1);assert.ok(target);
for(const context of [source,target]){const station=config.stations.find(s=>s.id===context.station_id);const server=config.servers.find(s=>s.id===station.server_id);assert.equal(server.host,'127.0.0.1');assert.equal(server.port,33307);}
const uid=Number(sql("SELECT id FROM referentiels_admin.app_users WHERE username='v13_consultation'"));assert.ok(uid);
const before=sql(`SELECT enabled,auth_version FROM referentiels_admin.app_users WHERE id=${uid}`);
const access=sql(`SELECT context_id FROM referentiels_admin.app_user_contexts WHERE user_id=${uid}`).split(/\r?\n/).filter(Boolean).map(Number);
try{
 sql(`UPDATE referentiels_admin.app_users SET enabled=1 WHERE id=${uid}; INSERT IGNORE INTO referentiels_admin.app_user_contexts(user_id,context_id) VALUES(${uid},${source.id})`);
 const reader=await login('v13_consultation');
 const state=await call(reader,'/assistant');check('Assistant non configuré : écran disponible',state.status===200&&!state.data.configured&&state.data.message==='Assistant IA indisponible');
 check('Lecture Consultation autorisée',(await call(reader,`/contexts/${source.id}/assistant/tools/adherent?refadh=76`)).status===200);
 const unavailable=await call(reader,`/contexts/${source.id}/assistant/chat`,'POST',{question:'Test fictif'});
 check('Panne isolée sans diagnostic Consultation',unavailable.status===200&&!unavailable.data.available&&unavailable.data.diagnostic===null);
 const adminState=await call(admin,`/contexts/${source.id}/assistant/chat`,'POST',{question:'Test fictif'});
 check('Diagnostic accessible administrateur',adminState.data.diagnostic==='NOT_CONFIGURED');
 check('Exercice non autorisé',(await call(reader,`/contexts/${target.id}/assistant/chat`,'POST',{question:'Test fictif'})).status===403);
 check('SQL libre refusé',(await call(reader,`/contexts/${source.id}/assistant/tools/execute_sql`)).status===403);
 check('CSRF conversation obligatoire',(await call(reader,`/contexts/${source.id}/assistant/chat`,'POST',{question:'Test'},false)).status===403);
 check('Question trop longue refusée',(await call(admin,`/contexts/${source.id}/assistant/chat`,'POST',{question:'x'.repeat(2001)})).status===400);
 check('Corps volumineux refusé',(await call(admin,`/contexts/${source.id}/assistant/chat`,'POST',{question:'x'.repeat(20000)})).status===413);
 check('Modules référentiels continuent',(await call(reader,`/contexts/${source.id}/entities/verger`)).status===200);
 const health=await fetch(base+'/health');check('Santé VITASOUSS conservée',health.status===200&&(await health.json()).version===(process.env.VITASOUSS_EXPECTED_VERSION??'1.4'));
 const page=await fetch('http://127.0.0.1:5080/');const html=await page.text();const asset=html.match(/src="([^\"]+\.js)"/)[1];check('Nouvelle interface publiée',page.status===200&&/\/assets\/index-[\w-]+\.js$/.test(asset));
 check('Ressource interface accessible',(await fetch('http://127.0.0.1:5080'+asset)).status===200);
 for(let i=0;i<6;i++){const r=await call(reader,`/contexts/${source.id}/assistant/chat`,'POST',{question:'Test'});if(r.status===429){check('Limitation des messages utilisateur',true);break;}if(i===5)throw Error('Limiteur absent');}
}finally{
 const [enabled,version]=before.split(/\s+/).map(Number);sql(`UPDATE referentiels_admin.app_users SET enabled=${enabled},auth_version=${version} WHERE id=${uid}; DELETE FROM referentiels_admin.app_user_contexts WHERE user_id=${uid}`);if(access.length)sql(`INSERT INTO referentiels_admin.app_user_contexts(user_id,context_id) VALUES ${access.map(c=>`(${uid},${c})`).join(',')}`);
}
writeFileSync('docs/assistant-http-verification.json',JSON.stringify({testedAt:new Date().toISOString(),realOpenAiCalls:0,results},null,2));console.log(results.length+' vérifications HTTP réussies');

