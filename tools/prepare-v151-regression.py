from pathlib import Path
p=Path('tools/verify-v151-excel.py');s=Path('tools/verify-v150-excel.py').read_text(encoding='utf-8').replace('output/audit-v150','output/audit-v151').replace("['receptions-export-test.xlsx','receptions-export-http.xlsx']","['receptions-export-test.xlsx']").replace('Service et HTTP :','Service V1.5.1 :').replace('tests-v150-excel.json','tests-v151-excel.json');p.write_text(s,encoding='utf-8')
# Keep baseline test suites and reports untouched; a dedicated regression runner reports V1.5.1.
p=Path('tests/DrencherV151Regression');p.mkdir(exist_ok=True)
(p/'DrencherV151Regression.csproj').write_text(Path('tests/DrencherPermissionTests/DrencherPermissionTests.csproj').read_text(encoding='utf-8'),encoding='utf-8')
(p/'Program.cs').write_text(Path('tests/DrencherPermissionTests/Program.cs').read_text(encoding='utf-8').replace('docs/tests-drencher-v1321-permissions.json','docs/tests-v151-drencher-permissions.json'),encoding='utf-8')
