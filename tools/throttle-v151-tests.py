from pathlib import Path
for name in ['tools/verify-drencher-v151-api.mjs','tools/verify-drencher-v151-guard.mjs']:
 p=Path(name);s=p.read_text(encoding='utf-8')
 s=s.replace("async function login(username='admin'){const r=await fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});assert.equal", "async function login(username='admin'){const request=()=>fetch(base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});let r=await request();if(r.status===429){console.log('Limite de connexion respectée : attente de la fenêtre suivante.');await new Promise(resolve=>setTimeout(resolve,60000));r=await request();}assert.equal")
 p.write_text(s,encoding='utf-8')
