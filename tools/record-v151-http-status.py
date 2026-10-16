from pathlib import Path
p=Path('tools/pack-v151.py');s=p.read_text(encoding='utf-8');s=s.replace("if final:names+=['api','visual','drencher-api','drencher-guard']", "for name in ['api','drencher-api','drencher-guard','visual']:\n if final or (root/f'docs/tests-v151-{name}.json').exists():names.append(name)")
s=s.replace("httpValidated=final,visualValidated=final", "httpValidated='api' in names,visualValidated='visual' in names,drencherHttpValidated=all(n in names for n in ['drencher-api','drencher-guard'])")
s=s.replace("'CANDIDAT COMPILÉ ; VALIDATIONS HTTP ET VISUELLES EN ATTENTE'", "'CANDIDAT COMPILÉ ; REVUE VISUELLE EN ATTENTE' if 'api' in names else 'CANDIDAT COMPILÉ ; VALIDATIONS HTTP ET VISUELLES EN ATTENTE'")
s=s.replace("if not final:report+='''- API", "if not final and 'api' not in names:report+='''- API")
s=s.replace("report+='''Les VM et IIS", "if not final and 'api' in names:report+='''- Tests HTTP V1.5.1 réussis ; revue visuelle et captures toujours bloquées par la préférence navigateur enregistrée sur 127.0.0.1:5080. Aucun contournement ni capture fabriquée.\\n\\n'''\nreport+='''Les VM et IIS")
s=s.replace("'verify-drencher-v150-api.mjs','verify-drencher-v150-guard.mjs'", "'verify-drencher-v151-api.mjs','verify-drencher-v151-guard.mjs'")
p.write_text(s,encoding='utf-8')
p=Path('tools/verify-v151-package.py');s=p.read_text(encoding='utf-8').replace("import json,hashlib,re","import json,hashlib,re,sys");s=s.replace("stage=root/'release/VITASOUSS-V1.5.1-CANDIDAT'", "stage=root/('release/VITASOUSS-V1.5.1' if '--final' in sys.argv else 'release/VITASOUSS-V1.5.1-CANDIDAT')");s=s.replace("summary['httpValidated']==(not summary['candidate'])", "(summary['candidate'] or summary['httpValidated'] and summary['visualValidated'])");p.write_text(s,encoding='utf-8')
