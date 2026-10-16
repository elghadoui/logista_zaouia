from pathlib import Path
p=Path('tools/verify-v151-api.mjs');s=Path('tools/verify-v150-api.mjs').read_text(encoding='utf-8').replace("version==='1.5.0'","version==='1.5.1'").replace('Version HTTP V1.5.0','Version HTTP V1.5.1').replace('output/audit-v150/receptions-export-http.xlsx','output/audit-v151/receptions-export-http.xlsx').replace('docs/tests-v150-api.json','docs/tests-v151-api.json')
s=s.replace('async function user(label,contextIds,modules)',"async function user(label,contextIds,modules,role='Consultation')").replace("role:'Consultation',password",'role,password')
needle=" check('Empreintes métier inchangées"
idx=s.index(needle)
s=s[:idx]+''' const inventoryPath=`/admin/contexts/${z}/crate-openings`;
 check('Inventaires : Consultation refusée en accès direct',(await call(inventoryPath,op)).status===403);
 const manager=await user('inventory_manager',[z],['caisserie'],'Gestionnaire');
 check('Inventaires : Gestionnaire sans Admin refusé',(await call(inventoryPath,manager)).status===403);
 const inventories=await ok(inventoryPath);
 check('Inventaires : migration et types réels exposés à Admin',inventories.installed&&inventories.types.length===2&&Array.isArray(inventories.revisions));
 const type=1,revision=inventories.revisions.find(r=>r.crate_type===type)?.revision??0;
 const opening={crateType:type,openingDate:'2026-09-01',ownedTotal:1000,physicalQuantity:600,dues:[{producerId:1,orchardId:10,quantity:300}],note:'Inventaire HTTP synthétique '+nonce,confirmed:true,expectedRevision:revision};
 check('Inventaire sans confirmation refusé API',(await call(inventoryPath,admin,'POST',{...opening,confirmed:false})).status===400);
 check('Inventaire physique excessif refusé API',(await call(inventoryPath,admin,'POST',{...opening,physicalQuantity:1001})).status===400);
 check('Inventaire création interdite Gestionnaire API',(await call(inventoryPath,manager,'POST',opening)).status===403);
 const saved=await ok(inventoryPath,admin,'POST',opening);
 check('Inventaire enregistré dans administration et historisé',typeof saved.id==='number'&&(await ok(inventoryPath)).rows.some(r=>r.id===saved.id&&r.revision===revision+1));
 check('Révision périmée refusée API',(await call(inventoryPath,admin,'POST',opening)).status===409);
 check('Aucune suppression d’inventaire fournie',[404,405].includes((await call(inventoryPath+'/'+saved.id,admin,'DELETE')).status));
 const fixture=configuration.contexts.find(c=>c.id===z);
 const contextBody={stationId:fixture.station_id,databaseName:fixture.database_name,label:fixture.label,readOnly:!!fixture.read_only,localRefsta:fixture.local_refsta,showInSelectors:false};
 try {
  await ok(`/admin/contexts/${z}`,admin,'PUT',contextBody);
  check('Masquage API : sélecteurs Admin et Consultation filtrés',!(await ok('/contexts')).some(c=>c.id===z)&&!(await ok('/contexts',op)).some(c=>c.id===z));
  check('Masquage API : droits directs conservés',(await call(endpoint(z),op)).status===200);
  check('Masquage API : configuration administrative conservée',(await ok('/admin/configuration')).contexts.some(c=>c.id===z&&!c.show_in_selectors));
  check('Masquage non attribuable par utilisateur non Admin',(await call(`/admin/contexts/${z}`,op,'PUT',contextBody)).status===403);
 } finally {await ok(`/admin/contexts/${z}`,admin,'PUT',{...contextBody,showInSelectors:true});}
 check('Réaffichage sans réattribution de droits',(await ok('/contexts',op)).some(c=>c.id===z));
 const physical=await ok(endpoint(audit,'caisserie'),both);
 check('HTTP variation physique E−S = −41 010 par type, aucune dette',physical.sources[0].crateFlows.some(f=>f.scope==='type'&&f.crateType===1&&f.physicalVariation===-41010&&f.producerDebt===null));
''' +s[idx:]
p.write_text(s,encoding='utf-8')
