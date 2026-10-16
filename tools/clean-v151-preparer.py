from pathlib import Path
p=Path('tools/prepare-v151-anomalies.py');s=p.read_text(encoding='utf-8');s=s[:s.index("p=root/'tests/AnalyticsV151Tests/Program.cs'")];p.write_text(s,encoding='utf-8')
