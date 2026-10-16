from pathlib import Path
p=Path('tools/verify-v151-ui.mjs');s=p.read_text().replace('.test-v150','.test-v151').replace('tests-v150-ui.json','tests-v151-ui.json');p.write_text(s,encoding='utf-8')
