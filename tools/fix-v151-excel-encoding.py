exec(open('tools/repair-v151-encoding.py',encoding='utf-8-sig').read().split('paths=')[0])
for name in ['backend/Application/AnalyticsExcel.cs','tools/verify-v151-excel.py']:
 p=Path(name);s=p.read_text(encoding='utf-8');p.write_text(repair(s),encoding='utf-8')
