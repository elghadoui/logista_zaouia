import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
const changed=new Set(['backend/Program.cs','backend/Api/DrencherEndpoints.cs','backend/Application/DrencherModels.cs','backend/Application/DrencherService.cs','backend/Application/DrencherCycles.cs','backend/Application/DrencherRecette.cs','backend/Application/DrencherReservations.cs','backend/Application/DrencherReports.cs','backend/Application/DrencherF04Pdf.cs','frontend/src/Drencher.tsx','frontend/src/DrencherDocuments.tsx','frontend/src/DrencherEditor.tsx','frontend/src/DrencherProducts.tsx','frontend/src/DrencherPrograms.tsx','frontend/src/DrencherStock.tsx','frontend/src/drencherTypes.ts']);
const baseline='versions/Drencher-V1.3.1',same=[],results=[];
function walk(root,prefix=''){return readdirSync(root,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(root,f.name),prefix+f.name+'/'):[prefix+f.name]);}
for(const folder of ['backend','frontend/src'])for(const f of walk(path.join(baseline,folder))){const rel=folder+'/'+f;if(changed.has(rel))continue;assert.deepEqual(readFileSync(rel),readFileSync(path.join(baseline,rel)),rel+' changed outside Drencher scope');same.push({file:rel,sha256:createHash('sha256').update(readFileSync(rel)).digest('hex')});}
results.push({name:`${same.length} fichiers hors changement : empreintes identiques à V1.3.1`,passed:true});
const before=readFileSync(path.join(baseline,'backend/Program.cs'),'utf8');assert.equal(readFileSync('backend/Program.cs','utf8').replace('drencherVersion = "1.3.2"','drencherVersion = "1.3.1"'),before);results.push({name:'Initialisation, authentification, sessions et routes hors Drencher inchangées',passed:true});
const originals=[['SIMPLE','beb5acca7d349b4a3a6ad201cd7dff0b312febb7a0bb2265d94183320fe81c87'],['COMPLEXE','ee3999560b830423fa72de374785b1bc349bd231305368022be403bbe7ec4e6c']];
for(const [name,expected] of originals){assert.equal(createHash('sha256').update(readFileSync(`docs/f04-v131-apercus/F04-V06-V1.3.1-${name}.pdf`)).digest('hex'),expected);results.push({name:'PDF validé V1.3.1 '+name+' conservé',passed:true});}
writeFileSync('docs/tests-drencher-v132-sources.json',JSON.stringify({date:new Date().toISOString(),passed:results.length,failed:0,results,unchangedFiles:same},null,2));
console.log(`${same.length} unchanged source files; 4 conservation checks passed.`);
