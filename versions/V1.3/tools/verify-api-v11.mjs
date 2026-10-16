import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const base=process.env.VITASOUSS_TEST_URL ?? 'http://127.0.0.1:5080/api';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+\/api$/.test(base))throw new Error('Tests réservés à une copie locale.');
const login=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:process.env.VITASOUSS_TEST_PASSWORD})});
assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
const results=[];
async function get(path){const r=await fetch(base+path,{headers:{Cookie:cookie}});assert.equal(r.status,200,path);return r.json();}
function check(name,condition){assert.ok(condition,name);results.push({name,passed:true});console.log('PASS '+name);}
const contexts=await get('/contexts');const source=contexts.find(c=>c.databaseName==='vitasouss_test_zaouia_v1');assert.ok(source);const prefix=`/contexts/${source.id}`;
async function all(name){const first=await get(`${prefix}/entities/${name}?pageSize=100`);const rows=[...first.rows];for(let p=2;p<=Math.ceil(first.total/100);p++)rows.push(...(await get(`${prefix}/entities/${name}?pageSize=100&page=${p}`)).rows);return rows;}
const adherents=await all('adherent'),vergers=await all('verger'),parcelles=await all('parcelle'),varietes=await all('variete'),cultures=await all('culture'),souvars=await all('souvar');
const catalog=await get('/catalog');
const key=(name,r)=>encodeURIComponent(JSON.stringify(Object.fromEntries(catalog.find(e=>e.name===name).keys.map(k=>[k,r[k]]))));
for(const name of ['adherent','verger','parcelle','culture','grpvar','variete','souvar']){
 const raw=await get(`${prefix}/entities/${name}?pageSize=10`);const enriched=await get(`${prefix}/entities/${name}?pageSize=10&presentation=true`);
 check(`Liste ${name} : pagination et cardinalité conservées`,raw.total===enriched.total&&raw.rows.length===enriched.rows.length);
}
const v=vergers.find(r=>r.refver===7602) ?? vergers[0];const owner=adherents.find(a=>a.refadh===v.refadh);assert.ok(owner);
const vp=await get(`${prefix}/entities/verger/presentation?key=${key('verger',v)}`);const children=parcelles.filter(p=>p.refver===v.refver);
check('Synthèse verger : propriétaire réel',vp.relations.adherent.nomadh===owner.nomadh);
check('Synthèse verger : total parcelles réel',vp.metrics.parcelles===children.length);
check('Synthèse verger : superficie réelle',Math.abs(Number(vp.metrics.surface)-children.reduce((n,p)=>n+Number(p.suppar??0),0))<0.00001);
check('Fiche brute conservée pour contrôle optimiste',Object.keys(vp.record).length===catalog.find(e=>e.name==='verger').columns.length&&!('adherentName' in vp.record));
const ap=await get(`${prefix}/entities/adherent/presentation?key=${key('adherent',owner)}`);const owned=vergers.filter(r=>r.refadh===owner.refadh);const ownedIds=new Set(owned.map(r=>r.refver));const ownedParcels=parcelles.filter(p=>ownedIds.has(p.refver));
check('Synthèse adhérent : vergers et parcelles réels',ap.metrics.vergers===owned.length&&ap.metrics.parcelles===ownedParcels.length);
check('Synthèse adhérent : superficie réelle',Math.abs(Number(ap.metrics.surface)-ownedParcels.reduce((n,p)=>n+Number(p.suppar??0),0))<0.00001);
const list=await get(`${prefix}/entities/parcelle?presentation=true&filter=refver&value=${v.refver}&pageSize=2`);
check('Résumé calculé sur toutes les parcelles, hors pagination',list.rows.length===Math.min(2,children.length)&&list.summary.count===children.length&&Math.abs(Number(list.summary.surface)-Number(vp.metrics.surface))<0.00001);
for(const p of list.rows){const variety=varietes.find(x=>x.codvar===p.codvar);const culture=cultures.find(x=>x.codcul===variety?.codcul);const matches=souvars.filter(x=>x.codsvar===p.codsvar&&x.codvar===p.codvar);
 check(`Libellés parcelle ${p.refpar} : relations réelles`,p.varietyName===(variety?.nomvar??null)&&p.cultureName===(culture?.nomcul??null)&&p.subvarietyName===(matches.length===1?matches[0].nomsvar:null));
 const pp=await get(`${prefix}/entities/parcelle/presentation?key=${key('parcelle',p)}`);check(`Navigation parcelle ${p.refpar} : verger et adhérent`,pp.relations.parent.refver===v.refver&&pp.relations.parent.refadh===owner.refadh);
}
const last=adherents.toSorted((a,b)=>String(a.nomadh).localeCompare(String(b.nomadh))).at(-1);
const selected=await get(`${prefix}/lookups/adherent?selected=${last.refadh}&search=aucune-correspondance-xyz`);
check('Sélecteur : nom sélectionné résolu hors première page',selected.length<=40&&selected.some(r=>r.refadh===last.refadh&&r.nomadh===last.nomadh));
for(const variety of [104,105]){const options=await get(`${prefix}/lookups/souvar?variety=${variety}`);check(`Cascade sous-variétés ${variety}`,options.length<=40&&options.every(o=>souvars.some(s=>s.codsvar===o.codsvar&&s.nomsvar===o.nomsvar&&s.codvar===variety)));}
check('Sous-variétés : pas de liste globale sans variété',(await get(`${prefix}/lookups/souvar`)).length===0);
const invalid=await fetch(base+`${prefix}/lookups/adherent;DROP`,{headers:{Cookie:cookie}});check('Sélecteur : catalogue SQL strict',invalid.status===404);
const archive=contexts.find(c=>c.readOnly&&c.station==='ZAOUIA');const archived=await get(`/contexts/${archive.id}/entities/verger/presentation?key=${key('verger',v)}`);check('Lecture des synthèses en archive',archived.record.refver===v.refver);
writeFileSync('docs/api-verification-v11.json',JSON.stringify({testedAt:new Date().toISOString(),base,results},null,2));
console.log(`${results.length} vérifications V1.1 réussies.`);
