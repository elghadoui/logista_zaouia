import pathlib, json, hashlib, subprocess
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw

root=pathlib.Path('output/pdf'); target=root/'review-final';target.mkdir(exist_ok=True)
poppler=pathlib.Path(r'C:\Users\abdellah\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe')
results=[];files=[]
def check(name,condition):
 assert condition,name
 results.append({'name':name,'passed':True});print('PASS '+name)
for source in sorted(root.glob('drencher-v13-*.pdf')):
 reader=PdfReader(source); texts=[p.extract_text() for p in reader.pages]
 check(source.stem+' A4 paysage',all(abs(float(p.mediabox.width)-841.89)<1 and abs(float(p.mediabox.height)-595.276)<1 for p in reader.pages))
 check(source.stem+' en-têtes et Recette sur toutes les pages',all('ZAOUIA / VITASOUSS' in t and 'RECETTE' in t and 'DONNÉES DE TEST' in t for t in texts))
 check(source.stem+' pagination et identité répétées',all('Page '+str(i+1)+' / '+str(len(texts)) in t and 'Document ' in t and 'UTC' in t for i,t in enumerate(texts)))
 check(source.stem+' sans code actif PDF',all('/JavaScript' not in str(p) for p in reader.pages) and '/OpenAction' not in reader.trailer['/Root'])
 if source.stem.endswith('f04'):
  check('F04 multi-pages, cycle et V06 répétés',len(texts)>1 and all('F04 MPS-01 V06' in t and 'Cycle n° 2 / révision 1' in t for t in texts))
  check('F04 produits, écarts, totaux et visas présents',all(s in '\n'.join(texts) for s in ['83,25','83250','Théorique initiale','Théorique finale','Machine','Réelle','Visas','hors programme']))
  check('F04 tableaux de palettes avec en-têtes répétés',all('Réception' in t and 'Palette' in t for t in texts if '500' in t and 'VERGER FICTIF' in t and 'Programme' not in t))
 subprocess.run([str(poppler),'-scale-to','1200','-png',str(source),str(target/source.stem)],check=True,capture_output=True)
 images=sorted(target.glob(source.stem+'-*.png'),key=lambda p:int(p.stem.split('-')[-1]));thumbs=[]
 for i,img in enumerate(images):
  with Image.open(img) as original:
   thumb=ImageOps.pad(original.convert('RGB'),(420,320),color='white');ImageDraw.Draw(thumb).text((8,305),source.stem+' p.'+str(i+1),fill='black');thumbs.append(thumb)
 contact=Image.new('RGB',(420*3,320*((len(thumbs)+2)//3)),'#dde5e0')
 for i,img in enumerate(thumbs):contact.paste(img,((i%3)*420,(i//3)*320))
 contact.save(target/(source.stem+'-contact.png'))
 files.append({'file':str(source),'pages':len(texts),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
check('Six documents PDF générés',len(files)==6)
analysis=json.loads(pathlib.Path('docs/drencher-v13-excel-analysis.json').read_text(encoding='utf8'))
for source in analysis:check('Original Excel préservé '+pathlib.Path(source['path']).name,hashlib.sha256(pathlib.Path(source['path']).read_bytes()).hexdigest()==source['sha256'])
pathlib.Path('docs/tests-drencher-v13-pdf.json').write_text(json.dumps({'passed':len(results),'failed':0,'browserInteractive':False,'physicalPrint':False,'method':'Poppler PNG + pypdf structure/text; visual review of contact sheets separately','files':files,'results':results},ensure_ascii=False,indent=2),encoding='utf8')
