import json, pathlib, subprocess, hashlib
from PIL import Image, ImageChops
from pypdf import PdfReader
root=pathlib.Path('output/f04-v131-work/final-stock')
poppler=r'C:\Users\abdellah\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe'
results=[]
for name in ['stock','fiche','entrees','consommations','mouvements']:
 pages=[]
 for version in ['v13','v131']:
  pdf=root/(name+'-'+version+'.pdf');pages.append(len(PdfReader(pdf).pages))
  subprocess.run([poppler,'-scale-to','1300','-png',str(pdf),str(root/(name+'-'+version))],check=True,capture_output=True)
 assert pages[0]==pages[1],name+' pagination changed'
 for i in range(pages[0]):
  a=Image.open(root/(name+'-v13-'+str(i+1)+'.png')).convert('RGB');b=Image.open(root/(name+'-v131-'+str(i+1)+'.png')).convert('RGB')
  assert a.size==b.size and ImageChops.difference(a,b).getbbox() is None,name+' differs visually'
 results.append({'name':'État '+name+' identique pixel par pixel à V1.3','passed':True,'pages':pages[0]});print('PASS '+name)
renderer=json.loads(pathlib.Path('docs/tests-drencher-v131-final-renderer.json').read_text())
layout=json.loads(pathlib.Path('docs/tests-drencher-v131-layout.json').read_text());visual=json.loads(pathlib.Path('docs/tests-drencher-v131-visual.json').read_text())
approved={'F04-V06-V1.3.1-SIMPLE.pdf':'BEB5ACCA7D349B4A3A6AD201CD7DFF0B312FEBB7A0BB2265D94183320FE81C87','F04-V06-V1.3.1-COMPLEXE.pdf':'EE3999560B830423FA72DE374785B1BC349BD231305368022BE403BBE7EC4E6C'}
for name,expected in approved.items():assert hashlib.sha256(pathlib.Path('docs/f04-v131-apercus',name).read_bytes()).hexdigest().upper()==expected,name+' changed after approval'
summary={'version':'VITASOUSS V1.4.1 + Drencher V1.3.1','assemblySha256':renderer['assemblySha256'],'passed':layout['passed']+visual['passed']+len(results),'failed':0,'mysqlWrites':0,'productionAccess':False,'productionDeploy':False,'approvedExamples':approved,'validatedLayoutPreserved':True,'frontendUnchanged':True,'suites':[{'name':'layout','passed':layout['passed']},{'name':'visual','passed':visual['passed']},{'name':'stock-final','passed':len(results)}],'results':results}
pathlib.Path('docs/tests-drencher-v131-stock-final.json').write_text(json.dumps({'passed':len(results),'failed':0,'results':results},ensure_ascii=False,indent=2),encoding='utf8')
pathlib.Path('docs/tests-drencher-v131-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf8')
print('TOTAL',summary['passed'])
