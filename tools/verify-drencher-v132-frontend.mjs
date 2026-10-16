import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const require=createRequire(path.resolve('frontend/package.json')),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{MantineProvider}=require('@mantine/core'),{build}=require('esbuild');
const dir=path.resolve('frontend/.test-v132');mkdirSync(dir,{recursive:true});writeFileSync(path.join(dir,'package.json'),'{"type":"commonjs"}');
await build({entryPoints:['frontend/src/DrencherDocuments.tsx','frontend/src/drencherDocumentClient.ts'],bundle:true,platform:'node',format:'cjs',outdir:dir,external:['react','react-dom','@mantine/core','@mantine/hooks','@mantine/notifications']});
const {DrencherF04Actions,DrencherStockDocuments}=require(path.join(dir,'DrencherDocuments.js')),{fetchDrencherPdf}=require(path.join(dir,'drencherDocumentClient.js'));
const results=[];function check(name,yes){assert.ok(yes,name);results.push({name,passed:true});console.log('PASS '+name);}
const render=(component,props)=>renderToStaticMarkup(React.createElement(MantineProvider,null,React.createElement(component,props)));
let html=render(DrencherF04Actions,{path:'/contexts/123/drencher',cycleId:12,revision:4});check('Trois actions F04 réelles Mantine',html.includes('Aperçu F04')&&html.includes('Imprimer F04')&&html.includes('Exporter PDF'));
html=render(DrencherStockDocuments,{path:'/contexts/123/drencher',catalog:{produits:[],lots:[],programmes:[],unitePoids:'kg'}});check('Bouton stock Impressions et états intégré',html.includes('Impressions et états'));
const originalFetch=global.fetch;
try {
 let request;
 global.fetch=async (url,options)=>{request={url,options};return new Response('%PDF-1.7\nFICTIF',{status:200,headers:{'Content-Type':'application/pdf','X-Document-Id':'document-test'}});};
 const controller=new AbortController(),file=await fetchDrencherPdf('/contexts/123/drencher/reports/f04/12',controller.signal);
 check('URL API avec contexte et session correcte',request.url==='/api/contexts/123/drencher/reports/f04/12'&&request.options.credentials==='same-origin'&&request.options.cache==='no-store'&&request.options.signal===controller.signal);
 check('Identité PDF et contenu reçus sans transformation',file.name==='Drencher-document-test.pdf'&&(await file.blob.text()).startsWith('%PDF-1.7'));
 global.fetch=async()=>new Response(JSON.stringify({title:'Accès refusé : permission du module insuffisante.'}),{status:403,headers:{'Content-Type':'application/json'}});
 await assert.rejects(fetchDrencherPdf('/test',controller.signal),/Accès refusé/);check('Erreur permission lisible',true);
 global.fetch=async()=>new Response('HTML connexion',{status:200,headers:{'Content-Type':'text/html'}});
 await assert.rejects(fetchDrencherPdf('/test',controller.signal),/Rechargez votre session/);check('Connexion HTML jamais présentée comme PDF',true);
 global.fetch=async()=>new Response('Erreur proxy',{status:502});
 await assert.rejects(fetchDrencherPdf('/test',controller.signal),/Document indisponible/);check('Panne propre sans exception technique',true);
 global.fetch=async()=>{throw new DOMException('Aborted','AbortError');};await assert.rejects(fetchDrencherPdf('/test',controller.signal),{name:'AbortError'});check('Annulation du téléchargement conservée',true);
}finally{global.fetch=originalFetch;}
const src=readFileSync('frontend/src/DrencherDocuments.tsx','utf8');
check('Même PDF temporaire pour aperçu export et impression',src.includes('src={file.url}')&&src.includes('a.href = file.url')&&src.includes('contentWindow?.print()'));
check('Révocation Blob et annulation au démontage',src.includes('URL.revokeObjectURL')&&src.includes('request.current?.abort()'));
check('Cinq documents et filtres adaptés', ['stock','fiche','entrees','consommations','mouvements'].every(k=>src.includes(`'${k}'`))&&src.includes("active && type === 'stock'"));
writeFileSync('docs/tests-drencher-v132-frontend.json',JSON.stringify({date:new Date().toISOString(),browserInteractive:false,passed:results.length,failed:0,results},null,2));
