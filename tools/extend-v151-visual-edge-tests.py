from pathlib import Path
p=Path('tools/verify-v151-ui.mjs');s=p.read_text(encoding='utf-8').replace("{mkdirSync,writeFileSync}","{mkdirSync,writeFileSync,readFileSync}");s=s.replace("'frontend/src/contextChoices.ts']","'frontend/src/contextChoices.ts','frontend/src/AnalyticsVisuals.tsx']")
idx=s.index("writeFileSync('docs/tests-v151-ui.json'")
s=s[:idx]+'''const {VarietyRing}=require(path.join(dir,'AnalyticsVisuals.cjs'));
const negativeRing=renderToStaticMarkup(React.createElement(MantineProvider,null,React.createElement(VarietyRing,{rows:[{station:'ZAOUIA',key:'1',label:'Correction',kg:-10,count:1,quantity:null}],onChoose:()=>{}})));
check('Répartition négative suspendue sans pourcentage trompeur',negativeRing.includes('valeurs négatives')&&!negativeRing.includes('analytics-ring-total'));
const changedSources=['AnalyticsDashboard.tsx','AnalyticsVisuals.tsx','CrateOpenings.tsx','Administration.tsx','App.tsx','Sidebar.tsx','contextChoices.ts','FormSyncOffer.tsx','ReferentialComparison.tsx'];
check('Libellés français conservés sans altération d’encodage',changedSources.every(name=>!/[ÃÂ][\\u0080-\\u024F]|â[€ˆ]/.test(readFileSync('frontend/src/'+name,'utf8'))));
''' +s[idx:];p.write_text(s,encoding='utf-8')
