import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
const baseline='release/VITASOUSS-DRENCHER-V1.3.2-SOURCES';
const allowed=new Set(['backend/Program.cs','backend/Api/AdminEndpoints.cs','backend/Api/DrencherEndpoints.cs','backend/Application/PermissionService.cs','backend/Application/DrencherCycles.cs','backend/Application/DrencherPaletteSelection.cs','frontend/src/Permissions.tsx','frontend/src/Drencher.tsx','frontend/src/DrencherManagement.tsx','frontend/src/drencherTypes.ts']);
function walk(dir,prefix=''){return readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?walk(path.join(dir,f.name),prefix+f.name+'/'):[prefix+f.name]);}
const unchanged=[],results=[];
for(const folder of ['backend','frontend/src'])for(const file of walk(path.join(baseline,folder))){const rel=folder+'/'+file;if(allowed.has(rel))continue;assert.deepEqual(readFileSync(rel),readFileSync(path.join(baseline,rel)),rel);unchanged.push({file:rel,sha256:createHash('sha256').update(readFileSync(rel)).digest('hex')});}
results.push({name:`${unchanged.length} sources conservées à l'identique hors autorisations`,passed:true});
assert.equal(readFileSync('backend/Program.cs','utf8').replace('drencherVersion = "1.3.2.1"','drencherVersion = "1.3.2"'),readFileSync(path.join(baseline,'backend/Program.cs'),'utf8'));results.push({name:'Authentification et initialisation inchangées hors numéro Drencher',passed:true});
for(const file of ['DrencherF04Pdf.cs','DrencherPdf.cs','DrencherReports.cs','DrencherStockPlan.cs','DrencherV132.cs','DrencherRecette.cs','DrencherReservations.cs']){assert.deepEqual(readFileSync('backend/Application/'+file),readFileSync(path.join(baseline,'backend/Application',file)));results.push({name:file+' : source identique à V1.3.2',passed:true});}
for(const file of ['010_drencher_reservations.sql','011_drencher_v132.sql']){assert.deepEqual(readFileSync('sql/'+file),readFileSync(path.join(baseline,'sql',file)));results.push({name:file+' : migration métier inchangée',passed:true});}
const permissions=JSON.parse(readFileSync('docs/tests-drencher-v1321-permissions.json','utf8'));
const actual=createHash('sha256').update(readFileSync('publish-v1321-ready/Vitasouss.Api.dll')).digest('hex').toUpperCase();assert.equal(actual,permissions.assemblySha256);results.push({name:'DLL de politique testée identique à la publication finale',passed:true});
writeFileSync('docs/tests-drencher-v1321-conservation.json',JSON.stringify({date:new Date().toISOString(),passed:results.length,failed:0,productionAccess:false,assemblySha256:actual,results,unchanged},null,2));console.log(results.length+' conservation checks passed; '+unchanged.length+' identical files.');

