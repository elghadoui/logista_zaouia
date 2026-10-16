from pathlib import Path
# Repair only byte sequences that prove UTF-8 was previously decoded as Windows-1252.
# Always read/write explicitly as UTF-8 after this repair.
def repair(s):
 for attempt in range(4):
  out=[];i=0;changed=False
  while i<len(s):
   try:b=s[i].encode('cp1252')[0]
   except UnicodeEncodeError:b=0
   size=2 if 0xc2<=b<=0xdf else 3 if 0xe0<=b<=0xef else 4 if 0xf0<=b<=0xf4 else 0
   if size and i+size<=len(s):
    try:
     chunk=s[i:i+size].encode('cp1252'); decoded=chunk.decode('utf-8')
     if len(decoded)==1:
      out.append(decoded);i+=size;changed=True;continue
    except (UnicodeEncodeError,UnicodeDecodeError):pass
   out.append(s[i]);i+=1
  s=''.join(out)
  if not changed:break
 return s
paths=[*Path('frontend/src').glob('Analytics*'),Path('frontend/src/Sidebar.tsx'),Path('frontend/src/App.tsx'),Path('backend/Application/CrateOpeningService.cs'),Path('tools/verify-v151-ui.mjs'),Path('tests/AnalyticsV151Tests/Program.cs')]
for p in paths:
 if p.is_file():
  old=p.read_text(encoding='utf-8');new=repair(old)
  if old!=new:p.write_text(new,encoding='utf-8');print('Encodage corrigé :',p)
p=Path('frontend/src/AnalyticsVisuals.tsx');s=p.read_text(encoding='utf-8');s=s.replace("<title>{r.label} · {station} : {n == null ? 'Indisponible' : number(n)} {crates ? 'unités' : 't'} · {r.count} {crates ? 'mouvements' : 'lots'}</title>","<title>{`${r.label} · ${station} : ${n == null ? 'Indisponible' : number(n)} ${crates ? 'unités' : 't'} · ${r.count} ${crates ? 'mouvements' : 'lots'}`}</title>");s=s.replace('<title>{s.label} : {number(part)} %</title>', '<title>{`${s.label} : ${number(part)} %`}</title>');p.write_text(s,encoding='utf-8')
