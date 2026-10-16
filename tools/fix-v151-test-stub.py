from pathlib import Path
p=Path('tools/verify-v151-ui.mjs');s=p.read_text(encoding='utf-8').replace('export const labels={};','export const labels={};export const titles={};');p.write_text(s,encoding='utf-8')
