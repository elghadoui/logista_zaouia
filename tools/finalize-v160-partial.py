from pathlib import Path
p=Path('backend/Application/ExportAnalyticsModels.cs');s=p.read_text(encoding='utf-8-sig').replace('public ExportMetrics Official=>ExportAnalyticsService.Metrics(', 'public ExportMetrics? Official=>!Complete?null:ExportAnalyticsService.Metrics(');p.write_text(s,encoding='utf-8')
p=Path('backend/Application/ExportAnalyticsService.cs');s=p.read_text(encoding='utf-8-sig').replace('result.Official.', 'result.Official!.');p.write_text(s,encoding='utf-8')
p=Path('tests/ExportV160Tests/Program.cs');s=p.read_text(encoding='utf-8-sig').replace('.Official.','.Official!.').replace('!partial.Complete&&partial.Total is null','!partial.Complete&&partial.Total is null&&partial.Official is null');p.write_text(s,encoding='utf-8')
p=Path('frontend/src/ExportDashboard.tsx');s=p.read_text(encoding='utf-8-sig').replace('official:Metrics;','official:Metrics|null;').replace('data.official.','data.official?.');p.write_text(s,encoding='utf-8')
