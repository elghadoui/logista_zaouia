exec(open('tools/repair-v151-encoding.py',encoding='utf-8-sig').read().split('paths=')[0])
p=Path('frontend/src/CrateOpenings.tsx');p.write_text(repair(p.read_text(encoding='utf-8')),encoding='utf-8')
p=Path('frontend/src/App.tsx');s=p.read_text(encoding='utf-8').replace("VITASOUSS · V1.4.1{' '}","VITASOUSS · V1.5.1{' '}");p.write_text(s,encoding='utf-8')
