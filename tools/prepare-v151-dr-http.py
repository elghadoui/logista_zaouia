from pathlib import Path
for old,new in [('tools/verify-drencher-v150-api.mjs','tools/verify-drencher-v151-api.mjs'),('tools/verify-drencher-v150-guard.mjs','tools/verify-drencher-v151-guard.mjs')]:
 s=Path(old).read_text(encoding='utf-8').replace('tests-v150-drencher-api.json','tests-v151-drencher-api.json').replace('tests-v150-drencher-guard.json','tests-v151-drencher-guard.json')
 Path(new).write_text(s,encoding='utf-8')
p=Path('tools/verify-v151-excel.py');s=p.read_text(encoding='utf-8').replace("['receptions-export-test.xlsx']","['receptions-export-test.xlsx','receptions-export-http.xlsx']").replace('Service V1.5.1 :','Service et HTTP V1.5.1 :');p.write_text(s,encoding='utf-8')
