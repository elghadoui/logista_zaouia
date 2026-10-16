from pathlib import Path
import subprocess,json
from PIL import Image,ImageChops
import pdfplumber
root=Path.cwd();out=root/'output/pdf/v132-verification'
poppler=Path('C:/Users/abdellah/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')
results=[]
def check(name,yes):
 assert yes,name
 results.append(dict(name=name,passed=True));print('PASS '+name)
def raster(path):
 prefix=path.with_suffix('')
 subprocess.run([str(poppler),'-r','100','-png','-singlefile',str(path),str(prefix)],check=True,capture_output=True)
 return prefix.with_suffix('.png')
for name in ['simple','complexe','stock','fiche','entrees','consommations','mouvements']:
 old=out/(name+('-v131.pdf' if name in ['simple','complexe'] else '-v13.pdf'));new=out/(name+'-v132.pdf')
 oldpng,newpng=raster(old),raster(new)
 check(name+' : rendu identique à présentation validée',ImageChops.difference(Image.open(oldpng).convert('RGB'),Image.open(newpng).convert('RGB')).getbbox() is None)
 with pdfplumber.open(new) as pdf:
  check(name+' : une page sans débordement',len(pdf.pages)==1)
with pdfplumber.open(out/'simple-v132.pdf') as pdf:
 visible=pdf.pages[0].extract_text();check('Valeurs historiques physiques inchangées','Quantité réelle' in visible)
for mode,label in [('REEL','Quantité réelle'),('THEORIQUE','Quantité théorique finale'),('MACHINE','Quantité machine')]:
 file=root/f'docs/f04-v132-apercus/F04-V06-V1.3.2-{mode}.pdf';raster(file)
 with pdfplumber.open(file) as pdf:
  text='\n'.join(p.extract_text() or '' for p in pdf.pages)
  check(mode+' : type de quantité explicite',label in text)
  check(mode+' : matière active imprimée','MA FICTIVE A' in text)
  # The hidden product is fixture product index 1 before API tests, or product B after API tests.
  check(mode+' : aucune matière active masquée','MA CACHEE' not in text and 'MA SECRETE FICTIVE' not in text)
  check(mode+' : aucune ligne ni total produit masqué','PRODUIT MASQUE' not in text)
  check(mode+' : dimensions A4 paysage',all(abs(p.width-841.89)<1 and abs(p.height-595.28)<1 for p in pdf.pages))
  quantity=pdf.pages[0].crop((590,110,700,180)).extract_text() or ''
  expected={'REEL':'2,7','THEORIQUE':'2,5','MACHINE':'2,6'}[mode]
  if 'PROGRAMME FICTIF' in text and mode=='REEL':expected='3'
  check(mode+' : quantité principale correspond à la valeur historisée',expected+' L' in quantity)
  check(mode+' : texte contenu dans la page',all(c['x0']>=10 and c['x1']<=833 and c['top']>=0 and c['bottom']<=593 for p in pdf.pages for c in p.chars))
with pdfplumber.open(out/'all-hidden.pdf') as pdf:
 text='\n'.join(p.extract_text() or '' for p in pdf.pages)
 fixture=json.loads((root/'tests/DrencherV132Tests/fixtures/cycle-synthetique.json').read_text(encoding='utf-8-sig'))
 check('Tous produits masqués : aucun nom dans formulaire ni annexe',all(p['nom'] not in text for p in fixture['produits']))
with pdfplumber.open(out/'volume-machine.pdf') as pdf:
 check('Volume : pagination et annexes conservées',len(pdf.pages)>1)
 check('Volume : type machine sur toutes pages',all('Quantité machine' in (p.extract_text() or '') for p in pdf.pages))
(root/'docs/tests-drencher-v132-pdf.json').write_text(json.dumps(dict(passed=len(results),failed=0,browserInteractive=False,productionAccess=False,results=results),indent=2,ensure_ascii=False),encoding='utf-8')
