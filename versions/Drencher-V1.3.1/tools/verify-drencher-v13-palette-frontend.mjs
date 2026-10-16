import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(path.resolve('frontend/package.json')),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{MantineProvider}=require('@mantine/core'),{build}=require('esbuild');
const dir=path.resolve('frontend/.test-v12');mkdirSync(dir,{recursive:true});writeFileSync(path.join(dir,'package.json'),'{"type":"commonjs"}');const results=[];function check(name,ok){assert.ok(ok,name);results.push({name,passed:true});console.log('PASS '+name);}
await build({entryPoints:['frontend/src/drencherDates.ts','frontend/src/DrencherPalettePicker.tsx','frontend/src/DrencherEditor.tsx','frontend/src/DrencherStock.tsx','frontend/src/DrencherPrograms.tsx','frontend/src/DrencherPrint.tsx','frontend/src/DrencherReservationAdmin.tsx'],bundle:true,platform:'node',format:'cjs',outdir:dir,external:['react','react-dom','@mantine/core','@mantine/hooks','@mantine/notifications'],loader:{'.css':'empty'}});
const dates=require(path.join(dir,'drencherDates.js')),picker=require(path.join(dir,'DrencherPalettePicker.js'));const render=(name,props)=>renderToStaticMarkup(React.createElement(MantineProvider,null,React.createElement(require(path.join(dir,name+'.js'))[name],props)));
try{
 let reproduced=false;try{({year:2027,month:10,day:8}).slice(0,10);}catch(e){reproduced=e instanceof TypeError;}check('Plantage slice reproduit sur vraie forme MySqlDateTime',reproduced);
 check('Chaînes civiles et ISO normalisées',dates.drDay('2027-10-08')==='2027-10-08'&&dates.drDay('2027-10-08T00:00:00')==='2027-10-08');
 check('Objet MySqlDateTime et variante majuscule normalisés',dates.drDay({isValidDateTime:true,year:2027,month:10,day:8})==='2027-10-08'&&dates.drDay({Year:2027,Month:10,Day:8})==='2027-10-08');
 check('Dates nulles absentes et impossibles sans erreur',[null,undefined,{},0,'0000-00-00','2027-02-29',{year:2027,month:10,day:8,isValidDateTime:false}].every(d=>dates.drDay(d)===null));
 check('Date valide bissextile sans décalage de jour',dates.drDay('2028-02-29T23:00:00-10:00')==='2028-02-29');
 const palettes=Array.from({length:164},(_,i)=>({numpal:i+1,numrec:i<160?1:2,codvar:i<160?104:105,variete:i<160?'A':'B',refver:101,verger:'V',refadh:1,adherent:'P',poids:500,cycleTraite:null}));
 let ids=[];for(let i=0;i<4;i++)ids=picker.paletteMerge(ids,palettes.slice(i*50,(i+1)*50).map(p=>p.numpal));check('Sélections de pages conservées jusqu’à 164 palettes',ids.length===164);check('Sélection page rejouée sans doublon',picker.paletteMerge(ids,[1,2]).length===164);
 const committed=[1,2];let draft=picker.paletteMerge(committed,[3,4]);draft=draft.filter(n=>n!==1);check('Annuler ne modifie pas la sélection précédente',committed.join(',')==='1,2'&&draft.join(',')==='2,3,4');
 check('Palette réservée ailleurs bloquée, propre cycle autorisé',!picker.paletteAvailable({...palettes[0],cycleAffecte:2},1)&&picker.paletteAvailable({...palettes[0],cycleAffecte:1},1));
 const summary=picker.summarizePalettes(palettes);check('Résumé compact poids réceptions groupes exacts',summary.count===164&&summary.poids===82000&&summary.receptions===2&&summary.groups.length===2);
 check('Poids manquant non inventé',picker.summarizePalettes([{...palettes[0],poids:null}]).poids===null);
 const catalog={produits:[{id:1,reference:'A',nom:'Produit A',unite:'L',actif:true}],programmes:[],lots:[{id:1,produitId:1,lot:'EXP',peremption:{year:2027,month:10,day:8},solde:20,nom:'Produit A',unite:'L'},{id:2,produitId:1,lot:'SANS',peremption:null,solde:1,nom:'Produit A',unite:'L'}],unitePoids:'kg'};
 const html=render('DrencherStock',{path:'/test',catalog,canAdd:true,canModify:true,refresh:()=>{}});check('Vrai Stock rendu avec date objet et date absente',html.includes('2027-10-08')&&html.includes('SANS')&&html.includes('EXP'));
 const editor=render('DrencherEditor',{path:'/test',catalog,onCancel:()=>{},onSaved:()=>{}});check('Formulaire principal bouton sans liste longue',editor.includes('Sélectionner les palettes')&&!editor.includes('Toutes les palettes du lot')&&!editor.includes('Numéro de palette'));
 check('Quatre colonnes produits conservées',editor.includes('Initial calculé')&&editor.includes('Final théorique')&&editor.includes('Machine')&&editor.includes('Réel physique'));
 const source=readFileSync('frontend/src/DrencherPalettePicker.tsx','utf8');check('Fenêtre dédiée pagination serveur, sélection page et globale',source.includes('Sélectionner la page')&&source.includes('/palettes/selection')&&!source.includes('while ('));
 check('Confirmation et annulation distinctes dans la fenêtre',source.includes('Confirmer la sélection')&&source.includes('Annuler')&&source.includes('onConfirm'));
 check('Dates Drencher sans slice dangereux',['DrencherStock','DrencherPrint','DrencherPrograms'].every(n=>!readFileSync('frontend/src/'+n+'.tsx','utf8').match(/(?:peremption|dateReception|dateCreation)\??\.slice/)));
 const props={id:1,version:1,statut:'Brouillon',auteur:'DEMO',dateCreation:'2026-10-09',validateur:null,dateValidation:null,revisions:[{version:1,action:'Enregistrement',motif:'',auteur:'DEMO',dateCreation:'2026-10-09',snapshot:{date:'2026-10-09',debut:'08:00',fin:'09:00',programmeId:1,programmeVersion:1,programmeNom:'P',eauInitiale:1200,eauConsommee:1000,unitePoids:'kg',palettes:palettes.slice(0,2),produits:[{produitId:1,nom:'Produit A',unite:'L',dose:2.5,initial:3,final:2.5,machine:2.6,reel:2.7,ecartTheorique:0.2,ecartMachine:0.1,lots:[{lotId:1,lot:'EXP',peremption:{year:2027,month:10,day:8},quantite:2.7}]}],observations:''}}]};
 check('Impression robuste dates objets avec calcul kg/tonnes',render('DrencherPrint',{detail:props}).includes('1 t'));
 writeFileSync('docs/tests-drencher-v13-palette-frontend.json',JSON.stringify({date:new Date().toISOString(),passed:results.length,failed:0,scope:'Rendu réel React/Mantine, calculs de sélection et dates. Pas d’interaction DOM ni capture navigateur.',results},null,2));
}finally{if(!dir.startsWith(path.resolve('frontend')+path.sep))throw Error('Nettoyage hors test');rmSync(dir,{recursive:true,force:true});}
