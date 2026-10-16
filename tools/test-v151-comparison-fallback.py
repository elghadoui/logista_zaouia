from pathlib import Path
p=Path('tools/verify-v151-ui.mjs');s=p.read_text(encoding='utf-8').replace('{visibleTargets,selectedVisibleTarget}', '{visibleTargets,selectedVisibleTarget,coherentContextFilters}')
idx=s.index("writeFileSync('docs/tests-v151-ui.json'")
s=s[:idx]+'''check('Masquage autre station retire aussi son archive comparative',coherentContextFilters({otherContext:'',previousContext:'3',previousOtherContext:'4'}).previousOtherContext==='');
check('Retrait archive principale retire l’archive associée',coherentContextFilters({otherContext:'2',previousContext:'',previousOtherContext:'4'}).previousOtherContext==='');
check('Comparaison complète conserve ses quatre contextes',coherentContextFilters({otherContext:'2',previousContext:'3',previousOtherContext:'4'}).previousOtherContext==='4');
''' +s[idx:];p.write_text(s,encoding='utf-8')
