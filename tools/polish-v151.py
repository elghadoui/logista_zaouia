from pathlib import Path
p=Path('frontend/src/AnalyticsDashboard.tsx');s=p.read_text().replace("currentAvailable.flatMap((s) => s.daily).sort((a,b) => a.key.localeCompare(b.key)).map((r) => i === 5 ? r.count : (r.kg ?? 0) / 1000)","dailyTrend(i === 5)")
s=s.replace('              <Pagination\n', '''              {result.data.rows.length > 5 ? <Button variant="subtle" size="xs" mt="sm" onClick={() => setFullDetails((v) => !v)}>{fullDetails ? 'Réduire à 5 lignes' : `Voir les ${result.data.rows.length} lignes de cette page`}</Button> : null}
              <Pagination
''',1)
s=s.replace('Le tableau par\n                type conserve', 'Le tableau par\n                type conserve')
p.write_text(s,encoding='utf-8')
p=Path('frontend/src/App.tsx');s=p.read_text().replace('header={{ height: 82 }}','header={{ height: 68 }}').replace('className="header-title"','className="header-title" visibleFrom="sm"');p.write_text(s,encoding='utf-8')
p=Path('frontend/src/Sidebar.tsx');p.write_text(p.read_text().replace('V1.4.1\n','V1.5.1\n'),encoding='utf-8')
p=Path('frontend/src/AnalyticsDashboard.css');s=p.read_text().replace('.analytics-source-status :global(.mantine-Alert-title)', '.analytics-source-status .mantine-Alert-title');p.write_text(s,encoding='utf-8')
