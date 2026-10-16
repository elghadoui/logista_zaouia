from pathlib import Path
p=Path('frontend/src/AnalyticsVisuals.tsx');s=p.read_text();s=s.replace("<title>{r.label} · {station} : {n == null ? 'Indisponible' : number(n)} {crates ? 'unités' : 't'} · {r.count} {crates ? 'mouvements' : 'lots'}</title>","<title>{`${r.label} · ${station} : ${n == null ? 'Indisponible' : number(n)} ${crates ? 'unités' : 't'} · ${r.count} ${crates ? 'mouvements' : 'lots'}`}</title>");s=s.replace('<title>{s.label} : {number(part)} %</title>', '<title>{`${s.label} : ${number(part)} %`}</title>');p.write_text(s,encoding='utf-8')
p=Path('tools/verify-v151-ui.mjs');s=p.read_text();needle="writeFileSync('docs/tests-v151-ui.json'";idx=s.index(needle);s=s[:idx]+'''globalThis.__analytics={...globalThis.__analytics,complete:true,totalKg:1000};
html=render('receptions');
check('Filtres repliés par défaut et commande accessible',html.includes('aria-expanded="false"')&&html.includes('aria-controls="analytics-filters"'));
check('V1.5.1 affichée, graphiques SVG réels, aucun NaN',html.includes('VITASOUSS 1.5.1')&&html.includes('analytics-column')&&!html.includes('NaN'));
globalThis.__analytics.sources[0].crateFlows=[{scope:'type',crateType:1,crate:'CAISSE TEST',entries:100,exits:130,physicalVariation:-30,invalid:0,incoherent:0}];
html=render('caisserie');check('Variation E−S par type et absence de dette inventée',html.includes('CAISSE TEST')&&html.includes('-30')&&html.includes('Non déterminable'));
globalThis.__analytics.sources[0].crateFlows[0].physicalVariation=null;html=render('caisserie');check('Variation invalide indiquée indisponible',html.includes('Indisponible')&&!html.includes('NaN'));
''' +s[idx:];p.write_text(s,encoding='utf-8')
