from pathlib import Path
for name in ['frontend/src/FormSyncOffer.tsx','frontend/src/ReferentialComparison.tsx']:
 p=Path(name);s=p.read_text(encoding='utf-8');s="import { selectedVisibleTarget, useContextTargets } from './contextChoices';\n"+s
 s=s.replace('  const targets = useApi<','  const routes = useApi<',1)
 idx=s.index('  const [',s.index('  const routes ='))
 s=s[:idx]+'  const targets = useContextTargets(routes);\n'+s[idx:]
 s=s.replace('const targetId = target ? Number(target) : targets.data?.[0]?.id;', 'const targetId = selectedVisibleTarget(targets.data, target);')
 p.write_text(s,encoding='utf-8')
p=Path('tools/verify-v151-ui.mjs');s=p.read_text(encoding='utf-8');s=s.replace("'frontend/src/Sidebar.tsx']", "'frontend/src/Sidebar.tsx','frontend/src/contextChoices.ts']")
idx=s.index("writeFileSync('docs/tests-v151-ui.json'")
s=s[:idx]+'''const {visibleTargets,selectedVisibleTarget}=require(path.join(dir,'contextChoices.cjs'));
const choices=visibleTargets([{id:1,label:'Masqué'},{id:2,label:'Visible'}],[{id:2},{id:3}]);
check('Comparaison et formulaires : cible masquée retirée sans ajout de route',choices.length===1&&choices[0].id===2);
check('Ancienne sélection masquée remplacée par une cible visible seulement',selectedVisibleTarget(choices,'1')===2&&selectedVisibleTarget([],'1')===undefined);
check('Aucune cible si la liste visible est indisponible',visibleTargets([{id:1}],null).length===0);
''' +s[idx:];p.write_text(s,encoding='utf-8')
