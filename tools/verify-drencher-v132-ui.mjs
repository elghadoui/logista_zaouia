import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
const require=createRequire(path.resolve('frontend/package.json')),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{MantineProvider}=require('@mantine/core'),{build}=require('esbuild');
const dir=path.resolve('frontend/.test-v132-ui');mkdirSync(dir,{recursive:true});writeFileSync(path.join(dir,'package.json'),'{"type":"commonjs"}');
await build({entryPoints:['frontend/src/DrencherProducts.tsx','frontend/src/DrencherPrograms.tsx','frontend/src/DrencherEditor.tsx','frontend/src/DrencherCycleAdmin.tsx'],bundle:true,platform:'node',format:'cjs',outdir:dir,external:['react','react-dom','@mantine/core','@mantine/hooks','@mantine/notifications']});
const {DrencherProducts}=require(path.join(dir,'DrencherProducts.js')),{DrencherPrograms}=require(path.join(dir,'DrencherPrograms.js')),{DrencherEditor}=require(path.join(dir,'DrencherEditor.js')),{DrencherCycleAdmin}=require(path.join(dir,'DrencherCycleAdmin.js'));
const render=(component,props)=>renderToStaticMarkup(React.createElement(MantineProvider,null,React.createElement(component,props))),results=[];
function check(name,yes){assert.ok(yes,name);results.push({name,passed:true});console.log('PASS '+name);}
const catalog={produits:[{id:1,reference:'A',nom:'VISIBLE',unite:'L',actif:true,matiereActive:'MATIERE FICTIVE',afficherF04:true},{id:2,reference:'B',nom:'MASQUE',unite:'kg',actif:true,afficherF04:false}],programmes:[{id:1,version:2,nom:'ACTIF FICTIF',actif:true,produits:[{produitId:1,dose:2.5}]},{id:2,version:3,nom:'INACTIF FICTIF',actif:false,produits:[{produitId:1,dose:2.5}]}],lots:[],unitePoids:'kg'},props={path:'/contexts/123/drencher',catalog,canAdd:true,canModify:true,refresh:()=>{}};
let html=render(DrencherProducts,props);check('Table produits : MA et visibilité lisibles',html.includes('MATIERE FICTIVE')&&html.includes('Matière active')&&html.includes('Affiché')&&html.includes('Masqué'));check('Produit MA absent sans invention',html.includes('Non renseignée'));
html=render(DrencherPrograms,props);check('Actions directes Activer et Désactiver',html.includes('>Activer<')&&html.includes('>Désactiver<'));check('Versions antérieures restent consultables',html.includes('Consulter les versions')&&html.includes('v3'));
html=render(DrencherCycleAdmin,{path:props.path,cycle:{id:1,version:2,statut:'En attente de validation'}});check('Action administrative de suppression disponible',html.includes('Supprimer le cycle'));
html=render(DrencherCycleAdmin,{path:props.path,cycle:{id:1,version:2,statut:'En attente de validation'},readOnly:true});check('Action administrative désactivée archive',html.includes('disabled=""'));
const snapshot=JSON.parse(readFileSync('tests/DrencherV132Tests/fixtures/cycle-synthetique.json','utf8').replace(/^\uFEFF/,''));
const initial={id:1,version:2,statut:'En attente de validation',auteur:'FICTIF',dateCreation:'2026-10-14',dateValidation:null,validateur:null,revisions:[{version:2,action:'Soumission',motif:'',auteur:'FICTIF',dateCreation:'2026-10-14',snapshot}]};
html=render(DrencherEditor,{path:props.path,catalog,initial,onCancel:()=>{},onSaved:()=>{}});check('Éditeur soumis utilise correction qualité, pas brouillon',html.includes('Enregistrer la correction')&&!html.includes('Enregistrer le brouillon'));
writeFileSync('docs/tests-drencher-v132-ui.json',JSON.stringify({date:new Date().toISOString(),passed:results.length,failed:0,scope:'Rendu réel React/Mantine en SSR ; pas d’interaction DOM ni navigateur.',results},null,2));
