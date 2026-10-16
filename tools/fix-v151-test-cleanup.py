from pathlib import Path
for name in ['tools/verify-drencher-v151-api.mjs','tools/verify-drencher-v151-guard.mjs']:
 p=Path(name);s=p.read_text(encoding='utf-8')
 marker="assert.ok(password,'Mot de passe de test local requis via variable environnement');"
 s=s.replace(marker,marker+"\nconst localAdmin=JSON.parse(readFileSync('backend/appsettings.Local.json','utf8').replace(/^\\uFEFF/,'' )).Admin;assert.equal(localAdmin.Host,'127.0.0.1');assert.equal(localAdmin.Port,33307);assert.match(localAdmin.Database,/^[a-zA-Z0-9_]+$/);")
 s=s.replace(" for(const u of users)await call('/admin/users/'+u.id,'PUT',{displayName:u.display_name,role:u.role,active:false});\n for(const id of contexts)await call('/admin/contexts/'+id+'/disable','POST');", " if(users.length)sql(`USE ${localAdmin.Database};UPDATE app_users SET enabled=0,auth_version=auth_version+1 WHERE enabled=1 AND id IN (${users.map(u=>Number(u.id)).join(',')}) AND LEFT(username,7)='dr1321_' AND RIGHT(username,32)='${nonce}';`);\n if(contexts.length)sql(`USE ${localAdmin.Database};UPDATE app_contexts SET enabled=0 WHERE id IN (${contexts.map(Number).join(',')}) AND database_name IN ('${db}','${db}_archive');`);")
 p.write_text(s,encoding='utf-8')
