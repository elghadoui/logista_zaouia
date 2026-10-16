import pathlib, json, subprocess, hashlib
from pypdf import PdfReader
from PIL import Image, ImageDraw, ImageFont, ImageChops

root=pathlib.Path('docs/f04-v131-apercus')
poppler=r'C:\Users\abdellah\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe'
results=[]
def check(name,ok):
 assert ok,name
 results.append({'name':name,'passed':True});print('PASS '+name)
texts={};counts={}
for name in ['F04-V06-V1.3.1-SIMPLE','F04-V06-V1.3.1-COMPLEXE','F04-V06-V1.3.1-VOLUME-TEST','stock-renderer-v131-test','stock-renderer-v13-baseline']:
 pdf=root/(name+'.pdf');reader=PdfReader(pdf);texts[name]=[p.extract_text() for p in reader.pages];counts[name]=len(reader.pages)
 for old_image in root.glob(name+'-*.png'):
  if old_image.parent.resolve()!=root.resolve():raise RuntimeError('Image hors du dossier de contrôle')
  if old_image.stem.split('-')[-1].isdigit():old_image.unlink()
 subprocess.run([poppler,'-scale-to','1700','-png',str(pdf),str(root/name)],check=True,capture_output=True)
 check(name+' : format A4 paysage',all(abs(float(p.mediabox.width)-841.89)<1 and abs(float(p.mediabox.height)-595.28)<1 for p in reader.pages))
 if name.startswith('F04'):
  check(name+' : référence et pagination sur toutes les pages',all('F04 MPS-01 V06' in text and f'Page {i+1} sur {len(reader.pages)}' in text for i,text in enumerate(texts[name])))
  check(name+' : données d’essai clairement identifiées',all('RECETTE' in text for text in texts[name] if 'Nom commercial' in text))
check('Cycle simple cinq palettes / un produit = une page',counts['F04-V06-V1.3.1-SIMPLE']==1 and '5 sur cette page' in texts['F04-V06-V1.3.1-SIMPLE'][0])
check('Cycle complexe 164 palettes / quatre produits = une page',counts['F04-V06-V1.3.1-COMPLEXE']==1 and '164 sur cette page' in texts['F04-V06-V1.3.1-COMPLEXE'][0])
for name in ['F04-V06-V1.3.1-SIMPLE','F04-V06-V1.3.1-COMPLEXE']:
 t='\n'.join(texts[name])
 check(name+' : quatre quantités et deux visas sur la fiche',all(word in t for word in ['Quantité calculée initiale','Quantité calculée finale','Consommation machine','Quantité produit consommée','Visa opérateur','Visa Responsable qualité']))
 check(name+' : palette exacte, pas d’annexe forcée','Annexe de traçabilité' not in t)
complex_text=' '.join(texts['F04-V06-V1.3.1-COMPLEXE'][0].split())
check('Totaux kg / tonnes, quatre unités, écarts et lot périmé',all(w in complex_text for w in ['83250','83,25','mL','kg','g','Hors programme','LOT PÉRIMÉ']))
check('Pas de conformité automatique et ingrédients absents explicités','C / NC : non renseignée' in complex_text and 'non vérifiée' in complex_text)
volume=' '.join('\n'.join(texts['F04-V06-V1.3.1-VOLUME-TEST']).split())
check('Volume : plusieurs formulaires et annexe uniquement pour les débordements',counts['F04-V06-V1.3.1-VOLUME-TEST']>1 and 'Annexe de traçabilité' in volume and 'quantités produits pour le cycle complet' in volume)
check('Volume : aucun dernier groupe ni produit omis','Réception 129' in volume and 'EXTRA-3' in volume)
check('Volume : observation longue conservée sans troncature',volume.count('Observation longue synthétique conservée intégralement.')>=30)
a=Image.open(root/'stock-renderer-v131-test-1.png').convert('RGB');b=Image.open(root/'stock-renderer-v13-baseline-1.png').convert('RGB')
check('Rendu état de stock V1.3 identique pixel par pixel',a.size==b.size and ImageChops.difference(a,b).getbbox() is None)
prior=json.loads(pathlib.Path('docs/tests-drencher-v13-summary.json').read_text(encoding='utf8'))
for row in prior['unchanged']:check('Source métier préservée : '+row['file'],hashlib.sha256(pathlib.Path(row['file']).read_bytes()).hexdigest().upper()==row['sha256'])
check('JavaScript livré V1.3 inchangé',hashlib.sha256(pathlib.Path('frontend/dist'+prior['frontend']['asset']).read_bytes()).hexdigest().upper()==prior['frontend']['assetSha256'])
check('Page HTML livrée V1.3 inchangée',hashlib.sha256(pathlib.Path('frontend/dist/index.html').read_bytes()).hexdigest().upper()==prior['frontendIndexSha256'])
old=pathlib.Path('versions/Drencher-V1.3/backend/Application/DrencherReports.cs').read_text(encoding='utf8')
new=pathlib.Path('backend/Application/DrencherReports.cs').read_text(encoding='utf8')
check('Lecture et calcul des cinq états de stock strictement inchangés',old[old.index(' public async Task<DrReport> StockReport'):]==new[new.index(' public async Task<DrReport> StockReport'):])
originals=json.loads(pathlib.Path('docs/drencher-v13-excel-analysis.json').read_text(encoding='utf8'))
for item in originals:check('Classeur original intact : '+pathlib.Path(item['path']).name,hashlib.sha256(pathlib.Path(item['path']).read_bytes()).hexdigest()==item['sha256'])

# Actual Excel export and actual new PDF export, scaled to the same A4 page for comparison.
canvas=Image.new('RGB',(3400,1250),'#eeeeee');draw=ImageDraw.Draw(canvas)
font=ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf',28)
for index,(file,title) in enumerate([('excel-nadorcotte-v06.png','Modèle Excel original — NADORCOTTE / V06'),('F04-V06-V1.3.1-SIMPLE-1.png','VITASOUSS V1.3.1 — 5 palettes / 1 produit / 1 page')]):
 im=Image.open(root/file).convert('RGB');im.thumbnail((1680,1190));canvas.paste(im,(index*1700+10,55));draw.text((index*1700+20,12),title,font=font,fill='#111111')
canvas.save(root/'COMPARATIF-EXCEL-F04-V131.png')
volume_files=sorted(root.glob('F04-V06-V1.3.1-VOLUME-TEST-*.png'),key=lambda p:int(p.stem.split('-')[-1]))
contact=Image.new('RGB',(1500,380*((len(volume_files)+2)//3)),'#dddddd')
for i,p in enumerate(volume_files):
 im=Image.open(p).convert('RGB');im.thumbnail((490,350));contact.paste(im,((i%3)*500,(i//3)*380+20));ImageDraw.Draw(contact).text(((i%3)*500+8,(i//3)*380+2),'Page '+str(i+1),fill='black')
contact.save(root/'VOLUME-CONTROLE.png')
net=json.loads(pathlib.Path('docs/tests-drencher-v131-layout.json').read_text())
pathlib.Path('docs/tests-drencher-v131-visual.json').write_text(json.dumps({'passed':len(results),'failed':0,'counts':counts,'excelExport':'Microsoft Excel COM; original opened ReadOnly and closed without save','pixelStockComparison':True,'mysqlWrites':0,'browserInteractive':False,'physicalPrint':False,'results':results},ensure_ascii=False,indent=2),encoding='utf8')
print('TOTAL',len(results)+net['passed'])
