from pathlib import Path
p=Path('frontend/src/AnalyticsDashboard.tsx')
s=p.read_text(encoding='utf-8')
s=s.replace('  Alert,','  Alert,\n  Collapse,\n  Tooltip,')
s=s.replace("import './AnalyticsDashboard.css';", "import './AnalyticsDashboard.css';\nimport { Sparkline, TemporalChart, VarietyRing } from './AnalyticsVisuals';\nimport { IconLeaf, IconUsers, IconTrees, IconDashboard, IconHistory, IconSearch, IconSwitchHorizontal, IconArrowUpRight } from './icons';\nimport IconFilter from '@tabler/icons-react/dist/esm/icons/IconFilter.mjs';\nimport IconFileSpreadsheet from '@tabler/icons-react/dist/esm/icons/IconFileSpreadsheet.mjs';\nimport IconPackage from '@tabler/icons-react/dist/esm/icons/IconPackage.mjs';")
s=s.replace("const tonnes =", "const signed = (n: number) => `${n > 0 ? '+' : ''}${format(n, 1)} %`;\nconst tonnes =")
s=s.replace("  const [filters, setFilters]", "  const [filtersOpen, setFiltersOpen] = useState(false);\n  const [filters, setFilters]")
s=s.replace("const storage = (id: number) => `vitasouss.analytics.v150.${id}`;", "const storage = (id: number) => `vitasouss.analytics.v150.${id}`; // Preserve the existing shared filter preferences.")
# Remove any comparison source hidden since it was last chosen. Visibility changes never alter backend authorization.
s=s.replace("  const query = new URLSearchParams({", "  useEffect(() => {\n    const patch: Partial<Filters> = {};\n    for (const key of ['otherContext', 'previousContext', 'previousOtherContext'] as const)\n      if (filters[key] && !contexts.some((c) => String(c.id) === filters[key])) patch[key] = '';\n    if (Object.keys(patch).length) update(patch);\n  }, [contexts, filters.otherContext, filters.previousContext, filters.previousOtherContext]);\n  const query = new URLSearchParams({")
s=s.replace('    <Stack gap="lg" className="analytics-page">','    <Stack gap="md" className="analytics-page">')
s=s.replace('<Group justify="space-between">\n        <div>', '<Group justify="space-between" className="analytics-heading">\n        <div> ',1)
s=s.replace('TABLEAUX DE BORD · LECTURE SEULE','PILOTAGE DES STATIONS · LECTURE SEULE')
s=s.replace('VITASOUSS 1.5.0','VITASOUSS 1.5.1')
s=s.replace('      <Paper withBorder p="md">\n        <Stack gap="sm">', '''      <Paper withBorder p="md" className="analytics-filter-card">
        <Group justify="space-between" gap="sm">
          <Group gap="xs"><span className="analytics-heading-icon">{receipts ? <IconLeaf size={21}/> : <IconPackage size={21}/>}</span><div><Text fw={700} size="sm">{context.station} · {context.label}{other ? ` + ${other.station}` : ''}</Text><Text size="xs" c="dimmed">{({ today: "Aujourd'hui", yesterday: 'Hier', seven: '7 derniers jours', week: 'Semaine en cours', month: 'Mois en cours', campaign: 'Campagne complète', custom: `${filters.from || '…'} → ${filters.to || '…'}` } as Record<string, string>)[filters.period]}</Text></div></Group>
          <Group gap="xs"><Button size="xs" variant="default" leftSection={<IconFilter size={15}/>} aria-expanded={filtersOpen} aria-controls="analytics-filters" onClick={() => setFiltersOpen((v) => !v)}>Filtres{Object.entries(filters).filter(([k,v]) => k !== 'period' && !!v).length ? ` · ${Object.entries(filters).filter(([k,v]) => k !== 'period' && !!v).length}` : ''}</Button><Button size="xs" variant="subtle" onClick={() => update({ ...defaults })}>Réinitialiser</Button></Group>
        </Group>
        <Group gap="xs" mt="xs" className="analytics-active-filters">{Object.entries(filters).filter(([k,v]) => !!v && !['period', 'from', 'to'].includes(k)).map(([key,v]) => <Badge key={key} variant="light" color="forest">{({ category: 'Culture', product: 'Produit', variety: 'Variété', producer: 'Producteur', orchard: 'Verger', crateType: 'Caisse', movement: 'Mouvement', search: 'Recherche', otherContext: 'Consolidation', previousContext: 'Archive', previousOtherContext: 'Archive associée' } as Record<string,string>)[key]} : {key.endsWith('Context') ? contexts.find((c) => String(c.id) === v)?.label ?? v : ({ category: 'categories', product: 'products', variety: 'varieties', producer: 'producers', orchard: 'orchards', crateType: 'crates' } as Record<string,string>)[key] ? options(({ category: 'categories', product: 'products', variety: 'varieties', producer: 'producers', orchard: 'orchards', crateType: 'crates' } as Record<string,string>)[key]).find((o) => o.value === v)?.label ?? v : v}</Badge>)}</Group>
        <Collapse in={filtersOpen} id="analytics-filters">
        <Stack gap="sm" mt="md">''',1)
s=s.replace('        </Stack>\n      </Paper>\n      <State', '        </Stack>\n        </Collapse>\n      </Paper>\n      <State',1)
s=s.replace("E · lié aux réceptions", "E · entrée station").replace("S · convention sortie", "S · sortie station")
s=s.replace("`${format(((metric('selectedKg') - metric('previousKg')) / metric('previousKg')) * 100, 1)} %`", "signed(((metric('selectedKg') - metric('previousKg')) / metric('previousKg')) * 100)")
s=s.replace("`${format(result.data.evolution, 1)} %`", "signed(result.data.evolution)")
s=s.replace('                    <Text size="xs" c="dimmed">\n                      {title}', '''                    <Group justify="space-between" gap="xs"><span className="analytics-kpi-icon">{(() => { const Icon = [IconLeaf, IconHistory, IconDashboard, IconHistory, IconTrees, IconPackage, IconUsers, IconLeaf, IconSwitchHorizontal, IconArrowUpRight][i]; return <Icon size={18}/>; })()}</span><span className="analytics-kpi-hint">{i < 5 ? 'TONNES NETTES' : i < 8 ? 'PÉRIMÈTRE FILTRÉ' : 'COMPARAISON'}</span></Group>
                    <Text size="xs" c="dimmed" mt="sm">
                      {title}''')
s=s.replace('                    <Text size="xs" c="dimmed">\n                      Voir le détail · filtres appliqués\n                    </Text>', '''                    {i < 6 ? <Sparkline points={currentAvailable.flatMap((s) => s.daily).sort((a,b) => a.key.localeCompare(b.key)).map((r) => i === 5 ? r.count : (r.kg ?? 0) / 1000)} label={i === 5 ? 'Lots quotidiens observés sur la période' : 'Tonnage quotidien observé sur la période'}/> : <Text size="xs" c="dimmed" mt="sm">Voir le détail <IconArrowUpRight size={12}/></Text>}''')
# temporal chart only in the daily and weekly blocks (retain dimension ranking bars)
a=s.index('              <Tabs.Panel value="daily"');b=s.index('              <Tabs.Panel value="distribution"',a)
s=s[:a]+s[a:b].replace('<Chart','<TemporalChart')+s[b:]
# Daily modern row with actual variety donut / movement ranking.
a=s.index('              <Tabs.Panel value="daily"');b=s.index('              </Tabs.Panel>',a)
block=s[a:b]
block=block.replace('                <TemporalChart', '                <div className="analytics-daily-grid">\n                <TemporalChart',1)
block+='\n                {receipts ? <VarietyRing rows={currentAvailable.flatMap((s) => s.varieties)} onChoose={(r) => drillDimension(r, \'variety\')}/> : <Chart title="Flux par type de caisse" rows={currentAvailable.flatMap((s) => s.movements)} crates/>}\n                </div>\n'
s=s[:a]+block+s[b:]
s=s.replace('<Tabs defaultValue="daily">','<Tabs defaultValue="daily" className="analytics-tabs">')
s=s.replace('                    Exporter Excel','                    <IconFileSpreadsheet size={16}/> Exporter Excel')
s=s.replace('            <Paper withBorder p="md" id="analytics-details">','            <Paper withBorder p="md" id="analytics-details" className="analytics-detail-card">')
s=s.replace('            <Alert\n              color={result.data.complete', '            <Alert className="analytics-source-status"\n              color={result.data.complete')
# campaign comparison explicit current/prior dates and net tonnes next to existing math
needle='                  {prior.length ? (\n                    <>'
s=s.replace(needle, '''                  {prior.length ? (
                    <>
                      <Paper withBorder p="md" className="analytics-comparison-summary">
                        <Group justify="space-between"><Text fw={700}>Comparaison des campagnes</Text><Tooltip multiline w={300} label="Variation = (tonnage actuel − tonnage précédent) / tonnage précédent × 100. Les dates sont alignées sur le même nombre de jours écoulés depuis le début de chaque campagne. Aucun taux de réalisation prévisionnelle."><Badge variant="light">Méthode de calcul ⓘ</Badge></Tooltip></Group>
                        <SimpleGrid cols={{ base: 1, sm: 2 }} mt="sm">{[...current, ...prior].map((s) => <div key={s.contextId}><Text size="sm" fw={600}>{s.station} · {s.campaign?.label ?? 'Campagne indisponible'}</Text><Text size="xs" c="dimmed">{s.period?.from?.slice(0,10)} → {s.period?.to?.slice(0,10)}</Text><Text fw={750} size="xl">{s.available && s.metrics.missingNet === 0 && s.metrics.missingDate === 0 ? tonnes(s.metrics.selectedKg) : 'Non comparable'}</Text></div>)}</SimpleGrid>
                        <Text mt="xs" fw={700}>Évolution : {result.data.evolution == null ? 'Non comparable' : signed(result.data.evolution)}</Text>
                      </Paper>''')
p.write_text(s,encoding='utf-8')
# dark sidebar scope; portal popovers intentionally separately styled
p=Path('frontend/src/Sidebar.module.css');s=p.read_text(encoding='utf-8')
s=s.replace('light-dark(#ffffff, #19271f)','#123e2c').replace('light-dark(#233c34, #e3eee8)','#f0f5ec').replace('light-dark(#233c34, #d6e6dc)','#d9e9da').replace('light-dark(#e5f2e9, #29483a)','#355d43').replace('light-dark(#174c3c, #b3dbc1)','#f5ffe9').replace('light-dark(#dbe7df, #3d5146)','#42644e').replace('light-dark(#e1e9e4, #30443a)','#345640').replace('light-dark(#73867d, #a0b4aa)','#adbfac')
s+='''\n.root :global(.mantine-NavLink-root) { color: #dcead9; }\n.root :global(.mantine-NavLink-root):hover { background: #295239; color: white; }\n.root :global(.mantine-ActionIcon-root) { color: #d5e8cd; }\n.root :global(.mantine-Text-root)[data-variant] { color: #b5c9b0; }\n.root :global(.mantine-Text-root) { --mantine-color-dimmed: #b5c9b0; }\n.popover .item { color: light-dark(#233c34, #d6e6dc); }\n.popover .item[data-active] { background: light-dark(#e5f2e9, #29483a); color: light-dark(#174c3c, #b3dbc1); }\n'''
p.write_text(s,encoding='utf-8')
