import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
const require=createRequire(path.resolve('frontend/package.json'));
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{MantineProvider}=require('@mantine/core'),{build}=require('esbuild');
const dir=path.resolve('frontend/.test-v150');mkdirSync(dir,{recursive:true});
await build({entryPoints:['frontend/src/AnalyticsDashboard.tsx','frontend/src/navigation.ts'],bundle:true,platform:'node',format:'cjs',outdir:dir,outExtension:{'.js':'.cjs'},external:['react','react-dom','@mantine/core','@mantine/hooks'],loader:{'.css':'empty'},plugins:[{name:'fixture',setup(b){b.onLoad({filter:/[\\/]api\.ts$/},()=>({contents:'export const area=x=>String(x);export const display=x=>String(x);export const labels={};export const useApi=()=>({data:globalThis.__analytics,loading:false,error:"",refresh:()=>{}});',loader:'ts'}));}}]});
const {AnalyticsDashboard}=require(path.join(dir,'AnalyticsDashboard.cjs')),{visibleNavigation}=require(path.join(dir,'navigation.cjs'));
const results=[];function check(name,valid){assert.ok(valid,name);results.push({name,passed:true});console.log('PASS '+name);}
const context={id:1,station:'ZAOUIA',label:'2026/2027',readOnly:false};
const source={contextId:1,station:'ZAOUIA',available:true,campaign:{start:'2026-09-01',end:'2027-08-31',label:'26-27'},period:{from:'2026-09-01',to:'2027-08-31'},metrics:{selectedKg:1000,todayKg:1000,yesterdayKg:0,sevenKg:1000,monthKg:1000,campaignKg:1000,previousKg:0,lots:1,producers:1,varieties:1,missingNet:0,missingDate:0},total:1,daily:[{station:'ZAOUIA',key:'2026-10-15',label:'2026-10-15',kg:1000,count:1}],weekly:[],varieties:[],producers:[],movements:[],warnings:['Limite métier vérifiable'],options:{},estimates:null};
globalThis.__analytics={sources:[source],complete:true,observedKg:1000,totalKg:1000,evolution:null,rows:[{station:'ZAOUIA',contextId:1,number:1,date:'2026-10-15',producer:'TEST',producerId:1,orchard:'VERGER TEST',orchardId:1,category:'CAT TEST',product:'PRODUIT TEST',variety:'VARIETE TEST',netKg:1000,quantity:100,crate:'CAISSE'}],total:1,warnings:[],estimateConsolidationAvailable:true};
function render(module){return renderToStaticMarkup(React.createElement(MantineProvider,null,React.createElement(AnalyticsDashboard,{context,contexts:[context],module,onContextChange:()=>{}})));}
let html=render('receptions');
check('Réceptions : vrai composant Mantine, indicateurs et recherche',html.includes('Pilotage des réceptions')&&html.includes('Recherche des détails')&&html.includes('Poids net'));
check('Choix des contextes et consolidation visibles',html.includes('Station / exercice principal')&&html.includes('Consolider avec'));
check('Archive autorisée sélectionnable et aucune archive inventée',html.includes('Comparer à une archive')&&!html.includes('2025/2026'));
check('Graphique accessible, détail et export Excel présents',html.includes('Tonnage net par jour')&&html.includes('aria-label')&&html.includes('Exporter Excel'));
check('Filtres catégories et groupes produits présents',html.includes('Catégorie · culture')&&html.includes('Produit · groupe'));
html=render('caisserie');check('Trois besoins caisserie distincts et limites explicites',html.includes('Dette des producteurs')&&html.includes('Stock physique station')&&html.includes('Caisses personnelles')&&html.includes('Non déterminable'));
check('Historique par type et quantités sans faux solde',html.includes('Historique des mouvements')&&html.includes('Type caisse')&&!html.includes('Solde calculé'));
globalThis.__analytics={...globalThis.__analytics,complete:false,totalKg:null};html=render('receptions');check('Total incomplet visible sans écran blanc',html.includes('Données incomplètes')&&html.includes('Indisponible'));
const nav=visibleNavigation('Consultation',key=>key.split(':').pop()==='receptions');check('Sidebar respecte permission Réceptions sans Caisserie',nav.some(g=>g.id==='analytics'&&g.items.length===1&&g.items[0].key==='analytics:receptions'));
check('Navigation Drencher historique conservée',visibleNavigation('Admin',()=>true).some(g=>g.id==='drencher'&&g.items[0].key==='drencher'));
writeFileSync('docs/tests-v150-ui.json',JSON.stringify({date:new Date().toISOString(),passed:results.length,failed:0,scope:'Composants réels en SSR ; aucune interaction navigateur revendiquée.',results},null,2));

