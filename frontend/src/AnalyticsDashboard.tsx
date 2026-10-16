import {
  Alert,
  Collapse,
  Tooltip,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
  Pagination,
  Progress,
  ScrollArea,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import type { Context } from './api';
import { useApi } from './api';
import { State } from './components';
import './AnalyticsDashboard.css';
import { coherentContextFilters } from './contextChoices';
import { CaisserieFlowChart, Sparkline, TemporalChart, VarietyRing } from './AnalyticsVisuals';
import { IconLeaf, IconUsers, IconTrees, IconHistory, IconSwitchHorizontal, IconLock } from './icons';
import IconFilter from '@tabler/icons-react/dist/esm/icons/IconFilter.mjs';
import IconFileSpreadsheet from '@tabler/icons-react/dist/esm/icons/IconFileSpreadsheet.mjs';
import IconPackage from '@tabler/icons-react/dist/esm/icons/IconPackage.mjs';

interface Bucket {
  station: string;
  key: string;
  label: string;
  kg: number | null;
  count: number;
  quantity: number | null;
  entries?: number | null;
  exits?: number | null;
  entriesPallets?: number | null;
  exitsPallets?: number | null;
  invalidFlowQuantities?: number;
  invalidPalletQuantities?: number;
}
interface Detail {
  contextId: number;
  station: string;
  number: number;
  date: string | null;
  producerId: number | null;
  producer: string;
  orchardId: number | null;
  orchard: string;
  category: string;
  product: string;
  variety: string;
  netKg: number | null;
  quantity: number | null;
  crate: string;
  movement: string | null;
}
interface Source {
  contextId: number;
  station: string;
  available: boolean;
  campaign: { start: string; end: string; label: string } | null;
  period: { from: string; to: string } | null;
  metrics: {
    selectedKg: number | null;
    todayKg: number | null;
    yesterdayKg: number | null;
    sevenKg: number | null;
    monthKg: number | null;
    campaignKg: number | null;
    previousKg: number | null;
    lots: number;
    producers: number;
    varieties: number;
    missingNet: number;
    missingDate: number;
  };
  total: number;
  daily: Bucket[];
  weekly: Bucket[];
  varieties: Bucket[];
  producers: Bucket[];
  movements: Bucket[];
  crateFlows?: { scope: string; producerId: number | null; orchardId: number | null; crateType: number | null; label: string; producerLabel: string; orchardLabel: string; crate: string; entries: number; exits: number; entriesPallets: number; exitsPallets: number; invalid: number; invalidPallets: number; incoherent: number; physicalVariation: number | null; producerMovementBalance: number | null; palletMovementBalance: number | null; producerDebt: number | null }[];
  options: Record<string, { value: number; label: string }[]>;
  warnings: string[];
  estimates: {
    summary: { parcels: number; usable: number; estimatedKg: number | null; ambiguous: number };
    incomplete: {
      idparcelle: number;
      refver: number;
      refpar: string;
      numcul: number;
      orchard: string;
      reason: string;
    }[];
    campaignLinked: boolean;
  } | null;
}
interface ProducerSituationRow { contextId: number; station: string; producerId: number | null; producer: string; crateType: number | null; crate: string; entries: number; exits: number; crateBalance: number | null; entriesPallets: number; exitsPallets: number; palletBalance: number | null; invalid: number; invalidPallets: number; incoherent: number }
interface ProducerSituationTotal extends Omit<ProducerSituationRow, 'producerId'|'producer'> {}
interface ProducerSituationResult { rows: ProducerSituationRow[]; totals: ProducerSituationTotal[]; page: number; pageSize: number; total: number; complete: boolean; warnings: string[] }
interface Result {
  sources: Source[];
  complete: boolean;
  observedKg: number;
  totalKg: number | null;
  evolution: number | null;
  rows: Detail[];
  page: number;
  pageSize: number;
  total: number;
  warnings: string[];
  estimateConsolidationAvailable: boolean;
}
interface Filters {
  period: string;
  from: string;
  to: string;
  category: string;
  product: string;
  variety: string;
  producer: string;
  orchard: string;
  crateType: string;
  movement: string;
  search: string;
  otherContext: string;
  previousContext: string;
  previousOtherContext: string;
}
const defaults: Filters = {
  period: 'campaign',
  from: '',
  to: '',
  category: '',
  product: '',
  variety: '',
  producer: '',
  orchard: '',
  crateType: '',
  movement: '',
  search: '',
  otherContext: '',
  previousContext: '',
  previousOtherContext: '',
};
const storage = (id: number) => `vitasouss.analytics.v150.${id}`; // Preserve the existing shared filter preferences.
function readFilters(id: number): Filters {
  try {
    const v: unknown = JSON.parse(sessionStorage.getItem(storage(id)) ?? 'null');
    if (v && typeof v === 'object')
      return coherentContextFilters({
        ...defaults,
        ...Object.fromEntries(
          Object.entries(v).filter(([k, v]) => k in defaults && typeof v === 'string'),
        ),
      });
  } catch {
    /* Optional preference. */
  }
  return { ...defaults };
}
const format = (n: number | null | undefined, digits = 3) =>
  n == null
    ? 'Indisponible'
    : new Intl.NumberFormat('fr-MA', { maximumFractionDigits: digits }).format(n);
const signed = (n: number) => `${n > 0 ? '+' : ''}${format(n, 1)} %`;
const tonnes = (n: number | null | undefined) =>
  n == null ? 'Indisponible' : `${format(n / 1000)} t`;
function Chart({
  title,
  rows,
  crates = false,
  onChoose,
}: {
  title: string;
  rows: Bucket[];
  crates?: boolean;
  onChoose?: (r: Bucket) => void;
}) {
  const max = Math.max(1, ...rows.map((r) => Math.abs((crates ? r.quantity : r.kg) ?? 0)));
  return (
    <Paper withBorder p="md">
      <Text fw={700} mb="sm">
        {title}
      </Text>
      {rows.length === 0 ? (
        <Text c="dimmed">Aucune donnée sur cette période.</Text>
      ) : (
        <ScrollArea h={Math.min(350, rows.length * 40 + 20)}>
          <div className="analytics-bars" role="group">
            {rows.map((r, i) => (
              <button
                type="button"
                className="analytics-bar"
                key={`${r.station}:${r.key}:${i}`}
                disabled={!onChoose}
                onClick={() => onChoose?.(r)}
                aria-label={`${r.label}, ${r.station}, ${crates ? format(r.quantity, 0) : tonnes(r.kg)}, ${r.count} mouvements ou lots`}
              >
                <span className="analytics-bar-label">
                  {r.label}
                  <small>
                    {r.station} · {r.count} {crates ? 'mvt.' : 'lots'}
                  </small>
                </span>
                <span className="analytics-track">
                  <span
                    className={r.station === 'DIAF' ? 'analytics-fill diaf' : 'analytics-fill'}
                    style={{
                      width: `${Math.max(0.4, (Math.abs((crates ? r.quantity : r.kg) ?? 0) / max) * 100)}%`,
                    }}
                  />
                </span>
                <strong>{crates ? format(r.quantity, 0) : tonnes(r.kg)}</strong>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </Paper>
  );
}
export function AnalyticsDashboard({
  context,
  contexts,
  module,
  onContextChange,
}: {
  context: Context;
  contexts: Context[];
  module: 'receptions' | 'caisserie';
  onContextChange: (id: number) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [fullDetails, setFullDetails] = useState(false);
  const [caisserieUnit, setCaisserieUnit] = useState<'caisses'|'palettes'>('palettes');
  const [producerSearch, setProducerSearch] = useState('');
  const [debouncedProducerSearch] = useDebouncedValue(producerSearch,300);
  const [situationPage, setSituationPage] = useState(1);
  const [situationSort, setSituationSort] = useState('exits');
  const [situationAsc, setSituationAsc] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => readFilters(context.id));
  const [search] = useDebouncedValue(filters.search, 300);
  const [page, setPage] = useState(1),
    [sort, setSort] = useState('date'),
    [asc, setAsc] = useState(false),
    [busy, setBusy] = useState(false),
    [exportError, setExportError] = useState('');
  function update(patch: Partial<Filters>) {
    setFilters((current) => {
      const next = coherentContextFilters({ ...current, ...patch });
      try {
        sessionStorage.setItem(storage(context.id), JSON.stringify(next));
      } catch {
        /* Optional preference. */
      }
      return next;
    });
    setPage(1);
  }
  useEffect(() => {
    const patch: Partial<Filters> = {};
    for (const key of ['otherContext', 'previousContext', 'previousOtherContext'] as const)
      if (filters[key] && !contexts.some((c) => String(c.id) === filters[key])) patch[key] = '';
    if (Object.keys(patch).length) update(patch);
  }, [contexts, filters.otherContext, filters.previousContext, filters.previousOtherContext]);
  const query = new URLSearchParams({
    period: filters.period,
    page: String(page),
    sort,
    asc: String(asc),
  });
  for (const [k, v] of Object.entries({ ...filters, search }))
    if (v && k !== 'period') query.set(k, v);
  const endpoint = `/contexts/${context.id}/analytics/${module}`;
  const result = useApi<Result>(`${endpoint}?${query.toString()}`);
  const situationQuery=new URLSearchParams({period:filters.period,page:String(situationPage),sort:situationSort,asc:String(situationAsc)});
  for(const [k,v] of Object.entries(filters)) if(v&&k!=='period'&&k!=='movement'&&k!=='previousContext'&&k!=='previousOtherContext')situationQuery.set(k,v);
  if(debouncedProducerSearch.trim())situationQuery.set('search',debouncedProducerSearch.trim());else situationQuery.delete('search');
  const situation=useApi<ProducerSituationResult>(module==='caisserie'?`/contexts/${context.id}/analytics/caisserie/producers?${situationQuery.toString()}`:null);
  const drillPending = useRef(false);
  useEffect(() => {
    if (result.data && drillPending.current) {
      document
        .getElementById('analytics-details')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      drillPending.current = false;
    }
  }, [result.data]);
  function detailFocus() {
    drillPending.current = true;
    document
      .getElementById('analytics-details')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const currentCount = filters.otherContext ? 2 : 1;
  const current = result.data?.sources.slice(0, currentCount) ?? [];
  const receipts = module === 'receptions';
  // A movement count can span container types; a crate quantity cannot imply interchangeability.
  function chartSource(source: Source): Source {
    if (receipts || filters.crateType) return source;
    const counts = (rows: Bucket[]) => rows.map((r) => ({ ...r, quantity: r.count }));
    return {
      ...source,
      daily: counts(source.daily),
      weekly: counts(source.weekly),
      varieties: counts(source.varieties),
      producers: counts(source.producers),
    };
  }
  const prior = (result.data?.sources.slice(currentCount) ?? []).map(chartSource);
  const currentAvailable = current.filter((s) => s.available).map(chartSource);
  const partialMetric = (value: number, render: (n: number) => string) =>
    currentAvailable.length === 0
      ? 'Indisponible'
      : `${result.data?.complete ? '' : 'Partiel · '}${render(value)}`;
  function options(key: string) {
    const map = new Map<string, string>();
    for (const s of currentAvailable)
      for (const o of s.options[key] ?? []) map.set(String(o.value), `${o.label} [${o.value}]`);
    return [...map].map(([value, label]) => ({ value, label }));
  }
  const metric = (key: keyof Source['metrics']) =>
    currentAvailable.reduce((n, s) => n + (s.metrics[key] ?? 0), 0);
  function dailyTrend(lots: boolean) {
    const sums = new Map<string, number>();
    for (const source of currentAvailable) for (const row of source.daily) {
      if (!lots && row.kg == null) continue;
      sums.set(row.key, (sums.get(row.key) ?? 0) + (lots ? row.count : row.kg! / 1000));
    }
    return [...sums].sort(([a], [b]) => a.localeCompare(b)).map(([, n]) => n);
  }
  function selectPeriod(from: string, to: string) {
    detailFocus();
    update({ period: 'custom', from: from.slice(0, 10), to: to.slice(0, 10) });
    document
      .getElementById('analytics-details')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function drillDimension(row: Bucket, key: 'producer' | 'variety') {
    const source = current.find((s) => s.station === row.station);
    const next = {
      ...filters,
      [key]: row.key === '?' ? '' : row.key,
      otherContext: '',
      previousContext: '',
      previousOtherContext: '',
    };
    if (source && source.contextId !== context.id) {
      try {
        sessionStorage.setItem(storage(source.contextId), JSON.stringify(next));
      } catch {
        /* Optional preference. */
      }
      onContextChange(source.contextId);
    } else {
      detailFocus();
      update(next);
    }
  }
  function weekPeriod(key: string) {
    const year = Number(key.slice(0, 4)),
      week = Number(key.slice(4));
    const d = new Date(Date.UTC(year, 0, 4));
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) + (week - 1) * 7);
    const end = new Date(d);
    end.setUTCDate(d.getUTCDate() + 6);
    selectPeriod(d.toISOString(), end.toISOString());
  }
  async function download() {
    setBusy(true);
    setExportError('');
    try {
      const response = await fetch(`/api${endpoint}/export?${query.toString()}`, {
        credentials: 'same-origin',
      });
      if (!response.ok) {
        const e = (await response.json()) as { title?: string };
        throw new Error(e.title ?? 'Export indisponible.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VITASOUSS-${module}.xlsx`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Export indisponible.');
    } finally {
      setBusy(false);
    }
  }
  async function downloadSituation() {
    setBusy(true);setExportError('');
    try {
      const response=await fetch(`/api/contexts/${context.id}/analytics/caisserie/producers/export?${situationQuery.toString()}`,{credentials:'same-origin'});
      if(!response.ok){const e=await response.json() as {title?:string};throw new Error(e.title??'Export de situation indisponible.');}
      const url=URL.createObjectURL(await response.blob());const a=document.createElement('a');a.href=url;a.download='VITASOUSS-caisserie-producteurs.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(e){setExportError(e instanceof Error?e.message:'Export indisponible.');}finally{setBusy(false);}
  }
  function flowRows(rows: Bucket[], unit: 'caisses'|'palettes') {
    if(filters.movement)return [];
    return rows.map((r)=>({station:r.station,key:r.key,label:r.label,entries:(unit==='caisses'?r.entries:r.entriesPallets)??null,exits:(unit==='caisses'?r.exits:r.exitsPallets)??null,invalid:(unit==='caisses'?r.invalidFlowQuantities:r.invalidPalletQuantities)??0}));
  }
  const other = contexts.find((c) => String(c.id) === filters.otherContext);
  const ctxOptions = (items: Context[]) =>
    items.map((c) => ({ value: String(c.id), label: `${c.station} · ${c.label}` }));
  return (
    <Stack gap="md" className="analytics-page">
      <Group justify="space-between" className="analytics-heading">
        <div> 
          <Text className="eyebrow">PILOTAGE DES STATIONS · LECTURE SEULE</Text>
          <Title order={1}>
            {receipts ? 'Pilotage des réceptions' : 'Pilotage de la caisserie'}
          </Title>
          <Text c="dimmed">
            {context.station} · {context.label}
            {other ? ` + ${other.station} · ${other.label}` : ''}
          </Text>
        </div>
        <Badge variant="light" color="forest">
          VITASOUSS 1.5.1
        </Badge>
      </Group>
      <Paper withBorder p="md" className="analytics-filter-card">
        <Group justify="space-between" gap="sm">
          <Group gap="xs"><span className="analytics-heading-icon">{receipts ? <IconLeaf size={21}/> : <IconPackage size={21}/>}</span><div><Text fw={700} size="sm">{context.station} · {context.label}{other ? ` + ${other.station}` : ''}</Text><Text size="xs" c="dimmed">{({ today: "Aujourd'hui", yesterday: 'Hier', seven: '7 derniers jours', week: 'Semaine en cours', month: 'Mois en cours', campaign: 'Campagne complète', custom: `${filters.from || '…'} → ${filters.to || '…'}` } as Record<string, string>)[filters.period]}</Text></div></Group>
          <Group gap="xs"><Button size="xs" variant="default" leftSection={<IconFilter size={15}/>} aria-expanded={filtersOpen} aria-controls="analytics-filters" onClick={() => setFiltersOpen((v) => !v)}>Filtres{Object.entries(filters).filter(([k,v]) => k !== 'period' && !!v).length ? ` · ${Object.entries(filters).filter(([k,v]) => k !== 'period' && !!v).length}` : ''}</Button><Button size="xs" variant="subtle" onClick={() => update({ ...defaults })}>Réinitialiser</Button></Group>
        </Group>
        <Group gap="xs" mt="xs" className="analytics-active-filters">{Object.entries(filters).filter(([k,v]) => !!v && !['period', 'from', 'to'].includes(k)).map(([key,v]) => <Badge key={key} variant="light" color="forest">{({ category: 'Culture', product: 'Produit', variety: 'Variété', producer: 'Producteur', orchard: 'Verger', crateType: 'Caisse', movement: 'Mouvement', search: 'Recherche', otherContext: 'Consolidation', previousContext: 'Archive', previousOtherContext: 'Archive associée' } as Record<string,string>)[key]} : {key.endsWith('Context') ? contexts.find((c) => String(c.id) === v)?.label ?? v : ({ category: 'categories', product: 'products', variety: 'varieties', producer: 'producers', orchard: 'orchards', crateType: 'crates' } as Record<string,string>)[key] ? options(({ category: 'categories', product: 'products', variety: 'varieties', producer: 'producers', orchard: 'orchards', crateType: 'crates' } as Record<string,string>)[key]).find((o) => o.value === v)?.label ?? v : v}</Badge>)}</Group>
        <Collapse in={filtersOpen} id="analytics-filters">
        <Stack gap="sm" mt="md">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            <Select
              label="Station / exercice principal"
              searchable
              value={String(context.id)}
              data={ctxOptions(contexts.filter((c) => ['ZAOUIA', 'DIAF'].includes(c.station)))}
              onChange={(v) => {
                if (v) onContextChange(Number(v));
              }}
            />
            <Select
              label="Consolider avec l'autre station"
              placeholder="Une station uniquement"
              clearable
              searchable
              value={filters.otherContext || null}
              data={ctxOptions(
                contexts.filter(
                  (c) => c.station !== context.station && ['ZAOUIA', 'DIAF'].includes(c.station),
                ),
              )}
              onChange={(v) => update({ otherContext: v ?? '', previousOtherContext: '' })}
            />
            <Select
              label="Période"
              value={filters.period}
              data={[
                { value: 'today', label: "Aujourd'hui" },
                { value: 'yesterday', label: 'Hier' },
                { value: 'seven', label: '7 derniers jours' },
                { value: 'week', label: 'Semaine en cours' },
                { value: 'month', label: 'Mois en cours' },
                { value: 'campaign', label: 'Campagne complète' },
                { value: 'custom', label: 'Période personnalisée' },
              ]}
              onChange={(v) => update({ period: v ?? 'campaign' })}
            />
            <TextInput
              label="Recherche des détails"
              placeholder="Producteur, verger, variété, numéro"
              value={filters.search}
              onChange={(e) => update({ search: e.currentTarget.value })}
              maxLength={120}
            />
            {filters.period === 'custom' ? (
              <>
                <TextInput
                  type="date"
                  label="Du"
                  value={filters.from}
                  onChange={(e) => update({ from: e.currentTarget.value })}
                />
                <TextInput
                  type="date"
                  label="Au inclus"
                  value={filters.to}
                  onChange={(e) => update({ to: e.currentTarget.value })}
                />
              </>
            ) : null}
            {(['category', 'product', 'variety', 'producer', 'orchard', 'crateType'] as const).map(
              (key, i) => (
                <Select
                  key={key}
                  label={
                    [
                      'Catégorie · culture',
                      'Produit · groupe de variétés',
                      'Variété',
                      'Producteur / adhérent',
                      'Verger',
                      'Type de caisse',
                    ][i]
                  }
                  data={options(
                    ['categories', 'products', 'varieties', 'producers', 'orchards', 'crates'][i],
                  )}
                  value={filters[key] || null}
                  clearable
                  searchable
                  onChange={(v) => update({ [key]: v ?? '' })}
                />
              ),
            )}
            {!receipts ? (
              <Select
                label="Mouvement enregistré"
                data={[
                  { value: 'E', label: 'E · entrée station' },
                  { value: 'S', label: 'S · sortie station' },
                ]}
                clearable
                value={filters.movement || null}
                onChange={(v) => update({ movement: v ?? '' })}
              />
            ) : null}
            <Select
              label="Comparer à une archive"
              placeholder="Comparaison non activée"
              clearable
              searchable
              data={ctxOptions(
                contexts.filter(
                  (c) => c.station === context.station && !!c.readOnly && c.id !== context.id,
                ),
              )}
              value={filters.previousContext || null}
              onChange={(v) => update({ previousContext: v ?? '', previousOtherContext: '' })}
            />
            {other && filters.previousContext ? (
              <Select
                label={`Archive ${other.station}`}
                placeholder="Requise pour consolider"
                clearable
                searchable
                data={ctxOptions(
                  contexts.filter((c) => c.station === other.station && !!c.readOnly),
                )}
                value={filters.previousOtherContext || null}
                onChange={(v) => update({ previousOtherContext: v ?? '' })}
              />
            ) : null}
          </SimpleGrid>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Dates en heure du Maroc. Catégorie = culture ; produit = groupe du référentiel. Les
              codes filtrent chaque source, sans rapprochement automatique.
            </Text>
            <Button variant="subtle" onClick={() => update({ ...defaults })}>
              Réinitialiser les filtres
            </Button>
          </Group>
        </Stack>
        </Collapse>
      </Paper>
      <State loading={result.loading} error={result.error} retry={result.refresh}>
        {result.data ? (
          <Stack gap="lg">
            <Alert className="analytics-source-status"
              color={result.data.complete ? 'green' : 'orange'}
              title={
                result.data.complete
                  ? 'Sources chargées'
                  : 'Données incomplètes — aucun total global garanti'
              }
            >
              {current
                .map(
                  (s) =>
                    `${s.station} : ${s.available ? `${s.campaign?.label} · ${s.total} lignes` : 'indisponible'}`,
                )
                .join(' / ')}
            </Alert>
            {receipts ? (
              <div className="analytics-overview">
                <SimpleGrid cols={{ base: 2, sm: 2, xl: 4 }} className="analytics-kpi-grid">
                  <Paper component="button" type="button" withBorder p="md" className="analytics-kpi analytics-kpi-primary" onClick={() => { detailFocus(); update({ period: 'today' }); }} aria-label="Tonnage net aujourd'hui, voir le détail">
                    <Group justify="space-between" wrap="nowrap"><span className="analytics-kpi-icon"><IconLeaf size={18}/></span><span className="analytics-kpi-hint">TONNAGE NET</span></Group>
                    <Text size="xs" c="dimmed" mt="sm">Aujourd’hui</Text>
                    <Text fw={750} size="xl">{partialMetric(metric('todayKg'), (n) => tonnes(n))}</Text>
                    <Sparkline points={dailyTrend(false)} label="Tonnage net quotidien observé"/>
                  </Paper>
                  <Paper component="button" type="button" withBorder p="md" className="analytics-kpi analytics-kpi-primary" onClick={() => { detailFocus(); update({ period: 'campaign' }); }} aria-label="Tonnage net de la campagne ou période, voir le détail">
                    <Group justify="space-between" wrap="nowrap"><span className="analytics-kpi-icon"><IconTrees size={18}/></span><span className="analytics-kpi-hint">CAMPAGNE</span></Group>
                    <Text size="xs" c="dimmed" mt="sm">Tonnage · période sélectionnée</Text>
                    <Text fw={750} size="xl">{tonnes(result.data.totalKg)}</Text>
                    <Sparkline points={dailyTrend(false)} label="Tonnage net observé sur la période"/>
                  </Paper>
                  <Paper component="button" type="button" withBorder p="md" className="analytics-kpi analytics-kpi-primary" onClick={() => { detailFocus(); update({ period: 'campaign' }); }} aria-label="Nombre de lots réceptionnés, voir le détail">
                    <Group justify="space-between" wrap="nowrap"><span className="analytics-kpi-icon"><IconPackage size={18}/></span><span className="analytics-kpi-hint">ACTIVITÉ</span></Group>
                    <Text size="xs" c="dimmed" mt="sm">Lots réceptionnés</Text>
                    <Text fw={750} size="xl">{partialMetric(metric('lots'), (n) => format(n, 0))}</Text>
                    <Sparkline points={dailyTrend(true)} label="Nombre de lots observés par jour"/>
                  </Paper>
                  <Paper component="button" type="button" withBorder p="md" className="analytics-kpi analytics-kpi-primary" onClick={() => { detailFocus(); setFullDetails(true); }} aria-label="Producteurs distincts, voir le détail">
                    <Group justify="space-between" wrap="nowrap"><span className="analytics-kpi-icon"><IconUsers size={18}/></span><span className="analytics-kpi-hint">PRODUCTEURS</span></Group>
                    <Text size="xs" c="dimmed" mt="sm">Producteurs distincts</Text>
                    <Text fw={750} size="xl">{partialMetric(metric('producers'), (n) => format(n, 0))}</Text>
                    <Text className="analytics-kpi-secondary">{currentAvailable.length ? `${format(metric('varieties'), 0)} variétés sur le périmètre` : 'Variétés : indisponible'}</Text>
                  </Paper>
                </SimpleGrid>
                <Paper withBorder className="analytics-metric-ribbon" px="md" py="sm">
                  <div><span>HIER</span><strong>{partialMetric(metric('yesterdayKg'), (n) => tonnes(n))}</strong></div>
                  <div><span>7 DERNIERS JOURS</span><strong>{partialMetric(metric('sevenKg'), (n) => tonnes(n))}</strong></div>
                  <div><span>CE MOIS</span><strong>{partialMetric(metric('monthKg'), (n) => tonnes(n))}</strong></div>
                  <div><span>PÉRIODE PRÉCÉDENTE</span><strong>{metric('previousKg') ? signed(((metric('selectedKg') - metric('previousKg')) / metric('previousKg')) * 100) : 'Non comparable'}</strong></div>
                  <div><span>CAMPAGNE PRÉCÉDENTE</span><strong>{result.data.evolution == null ? 'Non comparable' : signed(result.data.evolution)}</strong></div>
                </Paper>
              </div>
            ) : (
              <div className="analytics-overview">
                {(() => {
                  const flows = current.flatMap((s) => (s.crateFlows ?? []).filter((f) => f.scope === 'type'));
                  const available = current.some((s) => s.available);
                  const anomalous = flows.filter((f) => f.invalid > 0 || f.incoherent > 0).length;
                  const reliable = flows.filter((f) => f.physicalVariation != null).length;
                  const kpis = [
                    { label: 'Types de caisse observés', value: available ? format(flows.length, 0) : 'Indisponible', icon: <IconPackage size={18}/>, hint: 'RÉFÉRENCES DISTINCTES' },
                    { label: 'Variations calculables', value: available ? `${format(reliable, 0)} / ${format(flows.length, 0)}` : 'Indisponible', icon: <IconSwitchHorizontal size={18}/>, hint: 'PAR TYPE UNIQUEMENT' },
                    { label: 'Types à vérifier', value: available ? format(anomalous, 0) : 'Indisponible', icon: <IconHistory size={18}/>, hint: 'ANOMALIES DÉTECTÉES' },
                    { label: 'Stock / dettes certifiés', value: 'Non déterminables', icon: <IconLock size={18}/>, hint: 'OUVERTURES À CONFIRMER' },
                  ];
                  return <SimpleGrid cols={{ base: 2, sm: 2, xl: 4 }} className="analytics-kpi-grid">{kpis.map((kpi) => <Paper key={kpi.label} withBorder p="md" className="analytics-kpi analytics-kpi-primary"><Group justify="space-between" wrap="nowrap"><span className="analytics-kpi-icon">{kpi.icon}</span><span className="analytics-kpi-hint">{kpi.hint}</span></Group><Text size="xs" c="dimmed" mt="sm">{kpi.label}</Text><Text fw={750} size="xl">{kpi.value}</Text><Text className="analytics-kpi-secondary">Les types restent séparés ; aucun stock absolu n’est déduit.</Text></Paper>)}</SimpleGrid>;
                })()}
                <Paper withBorder className="analytics-crate-ledger" p="md">
                  <Group justify="space-between" mb="xs"><div><Text fw={700}>Flux de caisserie par type</Text><Text size="xs" c="dimmed">Lecture par référence · quantités E et S présentées séparément</Text></div><Badge variant="light" color="forest">E − S · période filtrée</Badge></Group>
                  <Table.ScrollContainer minWidth={620}><Table striped highlightOnHover><Table.Thead><Table.Tr><Table.Th>Station</Table.Th><Table.Th>Type de caisse</Table.Th><Table.Th>Entrées E</Table.Th><Table.Th>Sorties S</Table.Th><Table.Th>Variation E − S</Table.Th><Table.Th>Contrôle</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{current.flatMap((s) => (s.crateFlows ?? []).filter((f) => f.scope === 'type').map((f) => <Table.Tr key={`${s.contextId}:${f.crateType}`}><Table.Td>{s.station}</Table.Td><Table.Td>{f.crate} <span className="analytics-code">#{f.crateType ?? '?'}</span></Table.Td><Table.Td>{format(f.entries,0)}</Table.Td><Table.Td>{format(f.exits,0)}</Table.Td><Table.Td><Text fw={700} c={f.physicalVariation == null ? 'dimmed' : f.physicalVariation < 0 ? 'orange' : 'forest'}>{f.physicalVariation == null ? 'À vérifier' : `${f.physicalVariation > 0 ? '+' : ''}${format(f.physicalVariation,0)}`}</Text></Table.Td><Table.Td>{f.invalid || f.incoherent ? <Badge color="orange" variant="light">Anomalie</Badge> : <Badge color="gray" variant="light">Flux constaté</Badge>}</Table.Td></Table.Tr>))}</Table.Tbody></Table></Table.ScrollContainer>{current.every((s) => !(s.crateFlows ?? []).some((f) => f.scope === 'type')) ? <div className="analytics-empty-compact"><span className="analytics-empty-mark"><IconPackage size={22}/></span><div><Text fw={600}>Aucun flux de caisse sur ce périmètre</Text><Text size="xs" c="dimmed">Les soldes de propriété ne sont pas déduits des mouvements disponibles.</Text></div></div> : null}
                </Paper>
              </div>
            )}
            {exportError ? <Alert color="red">{exportError}</Alert> : null}
            {!receipts && !filters.crateType ? (
              <Alert color="blue">
                Les quantités de caisses exigent un type sélectionné. Le graphique Palettes utilise
                les quantités enregistrées séparément ; les classements non typés restent des nombres de
                mouvements. Aucun type de caisse n'est considéré interchangeable.
              </Alert>
            ) : null}
            <Tabs defaultValue="daily" className="analytics-tabs">
              <Tabs.List>
                <Tabs.Tab value="daily">Quotidien</Tabs.Tab>
                <Tabs.Tab value="weekly">Semaines ISO</Tabs.Tab>
                <Tabs.Tab value="distribution">Répartition</Tabs.Tab>
                <Tabs.Tab value="comparison">Stations & campagnes</Tabs.Tab>
                {receipts ? <Tabs.Tab value="estimates">Estimations indicatives</Tabs.Tab> : null}
              </Tabs.List>
              <Tabs.Panel value="daily" pt="md">
                {!receipts?<Group justify="flex-end" mb="sm"><Select aria-label="Unité du graphique Caisserie" value={caisserieUnit} onChange={(v)=>v&&setCaisserieUnit(v as 'caisses'|'palettes')} data={[{value:'palettes',label:'Palettes'},{value:'caisses',label:'Caisses · sélectionner un type'}]} w={260}/></Group>:null}
                {!receipts?<div className="analytics-daily-grid">
                <CaisserieFlowChart title={`Entrées et sorties par jour · ${caisserieUnit}`} unitLabel={caisserieUnit} unavailableMessage={filters.movement?'Retirez le filtre E/S pour comparer les deux sens.':caisserieUnit==='caisses'&&!filters.crateType?'Sélectionnez un type de caisse pour afficher des quantités comparables.':'Aucune quantité fiable sur cette période'} rows={currentAvailable.flatMap((s)=>flowRows(s.daily,caisserieUnit))} onChoose={(r)=>selectPeriod(r.key,r.key)}/>
                <Chart title="Flux par type de caisse" rows={currentAvailable.flatMap((s)=>s.movements)} crates/>
                </div>:<div className="analytics-daily-grid">
                <TemporalChart
                  title={
                    receipts
                      ? 'Tonnage net par jour · cliquez pour détailler'
                      : filters.crateType
                        ? 'Quantités du type sélectionné par jour · aucun solde'
                        : 'Nombre de mouvements par jour · types non additionnés'
                  }
                  rows={currentAvailable
                    .flatMap((s) => s.daily)
                    .sort((a, b) => a.key.localeCompare(b.key))}
                  crates={!receipts}
                  unitLabel={receipts ? 'tonnes nettes' : filters.crateType ? 'caisses mouvementées' : 'mouvements'}
                  variant="line"
                  onChoose={(r) => selectPeriod(r.key, r.key)}
                />

                <VarietyRing rows={currentAvailable.flatMap((s) => s.varieties)} onChoose={(r) => drillDimension(r, 'variety')}/>
                </div>}
              </Tabs.Panel>
              <Tabs.Panel value="weekly" pt="md">
                <Stack>
                  {!receipts?<Group justify="flex-end"><Select aria-label="Unité du graphique Caisserie" value={caisserieUnit} onChange={(v)=>v&&setCaisserieUnit(v as 'caisses'|'palettes')} data={[{value:'palettes',label:'Palettes'},{value:'caisses',label:'Caisses · sélectionner un type'}]} w={260}/></Group>:null}
                  <Text size="sm" c="dimmed" className="analytics-week-intro">
                    {receipts
                      ? 'Semaine ISO lundi–dimanche. Les colonnes montrent les tonnes nettes et la courbe verte le nombre de lots.'
                    : `Semaine ISO lundi–dimanche. Les colonnes distinguent les entrées et sorties de ${caisserieUnit}; les types de caisse ne sont jamais additionnés.`}
                  </Text>
                  {!receipts?<CaisserieFlowChart title={`Entrées et sorties par semaine ISO · ${caisserieUnit}`} unitLabel={caisserieUnit} unavailableMessage={filters.movement?'Retirez le filtre E/S pour comparer les deux sens.':caisserieUnit==='caisses'&&!filters.crateType?'Sélectionnez un type de caisse pour afficher des quantités comparables.':'Aucune quantité fiable sur cette période'} rows={currentAvailable.flatMap((s)=>flowRows(s.weekly,caisserieUnit))} onChoose={(r)=>weekPeriod(r.key)}/>:<TemporalChart
                    title={receipts ? 'Réceptions par semaine ISO' : 'Mouvements par semaine ISO'}
                    rows={currentAvailable
                      .flatMap((s) => s.weekly)
                      .sort((a, b) => a.key.localeCompare(b.key))}
                    crates={!receipts}
                    unitLabel={receipts ? 'tonnes nettes' : filters.crateType ? 'caisses mouvementées' : 'mouvements'}
                    variant="combo"
                    onChoose={(r) => weekPeriod(r.key)}
                  />}
                  <WeeklyComparison sources={currentAvailable} crates={!receipts} movementOnly={!receipts && !filters.crateType} />
                </Stack>
              </Tabs.Panel>
              <Tabs.Panel value="distribution" pt="md">
                <SimpleGrid cols={{ base: 1, lg: 2 }}>
                  <Chart
                    title="Classement des variétés"
                    rows={currentAvailable
                      .flatMap((s) => s.varieties)
                      .sort((a, b) => (b.kg ?? b.quantity ?? 0) - (a.kg ?? a.quantity ?? 0))}
                    crates={!receipts}
                    onChoose={(r) => drillDimension(r, 'variety')}
                  />
                  <Chart
                    title="Classement des producteurs"
                    rows={currentAvailable
                      .flatMap((s) => s.producers)
                      .sort((a, b) => (b.kg ?? b.quantity ?? 0) - (a.kg ?? a.quantity ?? 0))}
                    crates={!receipts}
                    onChoose={(r) => drillDimension(r, 'producer')}
                  />
                  {!receipts?<ProducerSituationTable data={situation.data} loading={situation.loading} error={situation.error} search={producerSearch} onSearch={(v)=>{setProducerSearch(v);setSituationPage(1);}} sort={situationSort} onSort={(v)=>{setSituationSort(v);setSituationPage(1);}} asc={situationAsc} onDirection={()=>setSituationAsc(v=>!v)} page={situationPage} onPage={setSituationPage} onExport={downloadSituation} busy={busy} exportError={exportError} onOpen={(r)=>{if(r.producerId!=null)drillDimension({station:r.station,key:String(r.producerId),label:r.producer,kg:null,count:0,quantity:null},'producer');}}/>:null}
                  {receipts ? (
                    <Paper withBorder p="md">
                      <Text fw={700}>Part des variétés dans le tonnage observé</Text>
                      {currentAvailable
                        .flatMap((s) => s.varieties)
                        .map((r) => (
                          <Group justify="space-between" key={`${r.station}:${r.key}`}>
                            <Text size="sm">
                              {r.station} · {r.label}
                            </Text>
                            <Text size="sm">
                              {result.data?.observedKg
                                ? format(((r.kg ?? 0) / result.data.observedKg) * 100, 1) + ' %'
                                : 'Non calculable'}
                            </Text>
                          </Group>
                        ))}
                    </Paper>
                  ) : (
                    <Chart
                      title="Types de caisses et mouvements · types non interchangeables"
                      rows={currentAvailable.flatMap((s) => s.movements)}
                      crates
                    />
                  )}
                </SimpleGrid>
              </Tabs.Panel>
              <Tabs.Panel value="comparison" pt="md">
                <Stack>
                  {!receipts ? <Paper withBorder p="md"><Text fw={700}>Producteurs et vergers · flux enregistrés</Text><Text size="xs" c="dimmed" mb="sm">Ces lignes décrivent les mouvements associés au producteur et au verger ; elles ne certifient ni dette ni propriété.</Text><ScrollArea h={300}><Table.ScrollContainer minWidth={700}><Table><Table.Thead><Table.Tr><Table.Th>Station / attribution</Table.Th><Table.Th>Nom</Table.Th><Table.Th>Type</Table.Th><Table.Th>E</Table.Th><Table.Th>S</Table.Th><Table.Th>Contrôle</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{current.flatMap((s) => (s.crateFlows ?? []).filter((f) => f.scope !== 'type').map((f,i) => <Table.Tr key={`${s.contextId}:${f.scope}:${i}`}><Table.Td>{s.station} · {f.scope === 'producer' ? 'Producteur' : 'Verger'}</Table.Td><Table.Td>{f.scope === 'producer' ? f.producerLabel : f.orchardLabel} [{f.scope === 'producer' ? f.producerId : f.orchardId}]</Table.Td><Table.Td>{f.crate}</Table.Td><Table.Td>{format(f.entries,0)}</Table.Td><Table.Td>{format(f.exits,0)}</Table.Td><Table.Td>{f.invalid || f.incoherent ? 'À vérifier' : 'Rattachement cohérent ; nature non certifiée'}</Table.Td></Table.Tr>))}</Table.Tbody></Table></Table.ScrollContainer></ScrollArea></Paper> : null}
                  <SimpleGrid cols={{ base: 1, md: 2 }}>
                    {current.map((s) => (
                      <Paper withBorder p="md" key={s.contextId}>
                        <Text fw={700}>
                          {s.station} · {s.campaign?.label}
                        </Text>
                        <Text size="xl">
                          {s.available
                            ? receipts
                              ? tonnes(s.metrics.selectedKg)
                              : `${format(s.total, 0)} mouvements`
                            : 'Source indisponible'}
                        </Text>
                        {receipts ? (
                          <Text>
                            Contribution :{' '}
                            {result.data?.observedKg
                              ? format(
                                  ((s.metrics.selectedKg ?? 0) / result.data.observedKg) * 100,
                                  1,
                                ) + ' %'
                              : 'Non calculable'}
                          </Text>
                        ) : null}
                      </Paper>
                    ))}
                  </SimpleGrid>
                  {prior.length ? (
                    <>
                      <Paper withBorder p="md" className="analytics-comparison-summary">
                        <Group justify="space-between"><Text fw={700}>Comparaison des campagnes</Text><Tooltip multiline w={300} label="Variation = (tonnage actuel − tonnage précédent) / tonnage précédent × 100. Les dates sont alignées sur le même nombre de jours écoulés depuis le début de chaque campagne. Aucun taux de réalisation prévisionnelle."><Badge variant="light">Méthode de calcul ⓘ</Badge></Tooltip></Group>
                        <SimpleGrid cols={{ base: 1, sm: 2 }} mt="sm">{[...current, ...prior].map((s) => <div key={s.contextId}><Text size="sm" fw={600}>{s.station} · {s.campaign?.label ?? 'Campagne indisponible'}</Text><Text size="xs" c="dimmed">{s.period?.from?.slice(0,10)} → {s.period?.to?.slice(0,10)}</Text><Text fw={750} size="xl">{s.available && s.metrics.missingNet === 0 && s.metrics.missingDate === 0 ? tonnes(s.metrics.selectedKg) : 'Non comparable'}</Text></div>)}</SimpleGrid>
                        <Text mt="xs" fw={700}>Évolution : {result.data.evolution == null ? 'Non comparable' : signed(result.data.evolution)}</Text>
                      </Paper>
                      <Text>
                        Comparaison à durée écoulée équivalente depuis le début de campagne ; borne
                        courante limitée à aujourd'hui. Les séries ci-dessous portent leurs dates
                        réelles et sont alignées par jours écoulés dans le tableau comparatif.
                      </Text>
                      {receipts ? <CampaignComparison current={current} prior={prior} /> : null}
                      {prior.map((s) => (
                        <Stack key={s.contextId}>
                          <Text fw={700}>
                            {s.station} · {s.campaign?.label} ·{' '}
                            {s.available ? 'Archive chargée' : 'Archive indisponible'}
                          </Text>
                          <Chart
                            title="Archive · évolution quotidienne"
                            rows={s.daily}
                            crates={!receipts}
                          />
                          <Chart
                            title="Archive · semaines ISO"
                            rows={s.weekly}
                            crates={!receipts}
                          />
                          <SimpleGrid cols={{ base: 1, md: 2 }}>
                            <Chart
                              title="Archive · variétés"
                              rows={s.varieties}
                              crates={!receipts}
                            />
                            <Chart
                              title="Archive · producteurs"
                              rows={s.producers}
                              crates={!receipts}
                            />
                          </SimpleGrid>
                        </Stack>
                      ))}
                    </>
                  ) : (
                    <Alert color="gray">
                      Sélectionnez une archive réellement configurée pour comparer deux campagnes.
                      Aucune donnée historique n'est générée.
                    </Alert>
                  )}
                </Stack>
              </Tabs.Panel>
              {receipts ? (
                <Tabs.Panel value="estimates" pt="md">
                  <Stack>
                    {!result.data.estimateConsolidationAvailable ? (
                      <Alert color="orange">
                        Pas d'estimation consolidée : l'identité interstation des parcelles n'est
                        pas démontrée. Les valeurs ci-dessous restent séparées par source et ne
                        doivent pas être additionnées.
                      </Alert>
                    ) : null}
                    {currentAvailable.map((s) => (
                      <Estimates key={s.contextId} source={s} />
                    ))}
                    <Alert color="orange">
                      Les estimations ne sont pas rattachées à une campagne par le schéma. Tonnage
                      réel dans la période : {tonnes(result.data.observedKg)}. Aucun écart ni taux
                      de réalisation n'est calculé sur ces périmètres non comparables.
                    </Alert>
                  </Stack>
                </Tabs.Panel>
              ) : null}
            </Tabs>
            <Paper withBorder p="md" id="analytics-details" className="analytics-detail-card">
              <Group justify="space-between" mb="md">
                <div>
                  <Text fw={700}>
                    {receipts ? 'Détail des réceptions' : 'Historique des mouvements'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {format(result.data.total, 0)} lignes · pagination et tri côté serveur
                  </Text>
                </div>
                <Group>
                  <Select
                    aria-label="Trier les détails"
                    value={sort}
                    data={[
                      { value: 'date', label: 'Date' },
                      { value: 'number', label: 'Numéro' },
                      { value: 'producer', label: 'Producteur' },
                      { value: 'variety', label: 'Variété' },
                      receipts
                        ? { value: 'net', label: 'Poids net' }
                        : { value: 'quantity', label: 'Quantité' },
                    ]}
                    onChange={(v) => {
                      setSort(v ?? 'date');
                      setPage(1);
                    }}
                  />
                  <Button
                    variant="light"
                    onClick={() => {
                      setAsc((v) => !v);
                      setPage(1);
                    }}
                  >
                    {asc ? 'Croissant' : 'Décroissant'}
                  </Button>
                  <Button
                    variant="light"
                    loading={busy}
                    disabled={!current.every((s) => s.available)}
                    onClick={() => void download()}
                  >
                    <IconFileSpreadsheet size={16}/> Exporter Excel
                  </Button>
                </Group>
              </Group>
              <Table.ScrollContainer minWidth={1000}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Station / n°</Table.Th>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Producteur</Table.Th>
                      <Table.Th>Verger</Table.Th>
                      <Table.Th>Catégorie / produit</Table.Th>
                      <Table.Th>Variété</Table.Th>
                      {receipts ? (
                        <Table.Th>Poids net</Table.Th>
                      ) : (
                        <>
                          <Table.Th>Type caisse</Table.Th>
                          <Table.Th>Mvt.</Table.Th>
                          <Table.Th>Quantité</Table.Th>
                        </>
                      )}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {(fullDetails ? result.data.rows : result.data.rows.slice(0, 5)).map((r) => (
                      <Table.Tr key={`${r.contextId}:${r.number}`}>
                        <Table.Td>
                          {r.station} · {r.number}
                        </Table.Td>
                        <Table.Td>{r.date ?? 'Date manquante'}</Table.Td>
                        <Table.Td>
                          {r.producer} [{r.producerId ?? '?'}]
                        </Table.Td>
                        <Table.Td>
                          {r.orchard} [{r.orchardId ?? '?'}]
                        </Table.Td>
                        <Table.Td>
                          {r.category}
                          <br />
                          {r.product}
                        </Table.Td>
                        <Table.Td>{r.variety}</Table.Td>
                        {receipts ? (
                          <Table.Td>
                            {tonnes(r.netKg)}
                            <Text size="xs" c="dimmed">
                              {format(r.netKg, 2)} kg
                            </Text>
                          </Table.Td>
                        ) : (
                          <>
                            <Table.Td>{r.crate}</Table.Td>
                            <Table.Td>
                              <Badge variant="light">{r.movement ?? '?'}</Badge>
                            </Table.Td>
                            <Table.Td>{format(r.quantity, 0)}</Table.Td>
                          </>
                        )}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
              {result.data.rows.length === 0 ? (
                <Text c="dimmed" py="md">
                  Aucune ligne sur ce périmètre.
                </Text>
              ) : null}
              {result.data.rows.length > 5 ? <Button variant="subtle" size="xs" mt="sm" onClick={() => setFullDetails((v) => !v)}>{fullDetails ? 'Réduire à 5 lignes' : `Voir les ${result.data.rows.length} lignes de cette page`}</Button> : null}
              <Pagination
                mt="md"
                value={page}
                total={Math.max(1, Math.min(400, Math.ceil(result.data.total / 25)))}
                onChange={setPage}
                aria-label="Pages des détails"
              />
              {result.data.total > 10000 ? (
                <Text size="xs">
                  Affinez la période pour accéder au-delà des 10 000 premières lignes. Export
                  jusqu'à 20 000 lignes.
                </Text>
              ) : null}
            </Paper>
            <details>
              <summary>Sources, calculs et limites des données</summary>
              <Stack gap="xs" mt="sm">
                {[
                  ...new Set([
                    ...result.data.warnings,
                    ...result.data.sources.flatMap((s) => s.warnings),
                  ]),
                ].map((w) => (
                  <Text size="sm" key={w}>
                    {w}
                  </Text>
                ))}
              </Stack>
            </details>
          </Stack>
        ) : null}
      </State>
    </Stack>
  );
}
function WeeklyComparison({ sources, crates, movementOnly = false }: { sources: Source[]; crates: boolean; movementOnly?: boolean }) {
  return (
    <Paper withBorder p="md" className="analytics-week-table-card">
      <Group justify="space-between" mb="xs"><Text fw={700}>Détail par semaine ISO</Text><Text className="analytics-muted-note">Variations calculées uniquement entre semaines consécutives observées.</Text></Group>
      <ScrollArea h={Math.min(300, Math.max(76, sources.reduce((n, s) => n + s.weekly.length, 0) * 36 + 42))}>
        <Table className="analytics-week-table" striped highlightOnHover>
          <Table.Thead><Table.Tr><Table.Th>Station</Table.Th><Table.Th>Semaine ISO</Table.Th><Table.Th ta="right">{movementOnly ? 'Mouvements' : crates ? 'Quantité déplacée' : 'Tonnage net'}</Table.Th>{!movementOnly ? <Table.Th ta="right">{crates ? 'Mouvements' : 'Lots'}</Table.Th> : null}<Table.Th ta="right">Variation</Table.Th></Table.Tr></Table.Thead>
          <Table.Tbody>{sources.flatMap((s) => s.weekly.map((w, i) => {
            const prior = s.weekly[i - 1];
            const adjacent = prior && Math.round((isoMonday(w.key).getTime() - isoMonday(prior.key).getTime()) / 86400000) === 7;
            const before = adjacent ? (crates ? prior.quantity : prior.kg) : null;
            const now = crates ? w.quantity : w.kg;
            const change = before != null && before > 0 && now != null ? signed(((now - before) / before) * 100) : 'Non comparable';
            return <Table.Tr key={`${s.contextId}:${w.key}`}><Table.Td>{s.station}</Table.Td><Table.Td>{w.label}</Table.Td><Table.Td ta="right">{crates ? format(now, 0) : tonnes(now)}</Table.Td>{!movementOnly ? <Table.Td ta="right">{format(w.count, 0)}</Table.Td> : null}<Table.Td ta="right">{change}</Table.Td></Table.Tr>;
          }))}</Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
export function ProducerSituationTable({data,loading,error,search,onSearch,sort,onSort,asc,onDirection,page,onPage,onExport,busy,exportError,onOpen}:{data:ProducerSituationResult|null;loading:boolean;error:string;search:string;onSearch:(v:string)=>void;sort:string;onSort:(v:string)=>void;asc:boolean;onDirection:()=>void;page:number;onPage:(v:number)=>void;onExport:()=>void;busy:boolean;exportError:string;onOpen:(r:ProducerSituationRow)=>void}) {
  return <Paper withBorder p="md" className="analytics-producer-situation">
    <Group justify="space-between" mb="xs"><div><Text fw={700}>Situation de la caisserie par producteur</Text><Text size="sm" c="dimmed">Balance des mouvements par producteur et type · sorties − entrées ; aucune dette ni stock station déduits.</Text></div><Button size="xs" leftSection={<IconFileSpreadsheet size={15}/>} onClick={onExport} loading={busy} disabled={!data?.total}>Exporter Excel</Button></Group>
    {!data?.complete&&data?<Alert color="yellow" mb="sm">Une source est indisponible : les totaux consolidés sont incomplets. {data.warnings.join(' ')}</Alert>:null}
    {error?<Alert color="red" mb="sm">{error}</Alert>:null}{exportError?<Alert color="red" mb="sm">{exportError}</Alert>:null}
    <Group mb="sm" align="end"><TextInput label="Rechercher un producteur" placeholder="Nom ou référence" value={search} onChange={(e)=>onSearch(e.currentTarget.value)}/><Select label="Classement" value={sort} onChange={(v)=>v&&onSort(v)} data={[{value:'exits',label:'Sorties caisses'},{value:'entries',label:'Entrées caisses'},{value:'balance',label:'Solde caisses'},{value:'palletExits',label:'Sorties palettes'},{value:'palletEntries',label:'Entrées palettes'},{value:'palletBalance',label:'Solde palettes'},{value:'producer',label:'Producteur'}]}/><Button variant="default" onClick={onDirection}>{asc?'Croissant':'Décroissant'}</Button></Group>
    <Table.ScrollContainer minWidth={1040}><Table striped highlightOnHover className="analytics-producer-table"><Table.Thead><Table.Tr><Table.Th>Station</Table.Th><Table.Th>Producteur</Table.Th><Table.Th>Type de caisse</Table.Th><Table.Th ta="right">Entrées caisses</Table.Th><Table.Th ta="right">Sorties caisses</Table.Th><Table.Th ta="right">Solde caisses</Table.Th><Table.Th ta="right">Entrées palettes</Table.Th><Table.Th ta="right">Sorties palettes</Table.Th><Table.Th ta="right">Solde palettes</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{data?.rows.map((r,i)=><Table.Tr key={`${r.contextId}:${r.producerId}:${r.crateType}:${i}`}><Table.Td>{r.station}</Table.Td><Table.Td><Button variant="subtle" size="compact-sm" onClick={()=>onOpen(r)} disabled={r.producerId==null}>{r.producer} <span className="analytics-code">[{r.producerId??'?' }]</span></Button>{r.invalid||r.invalidPallets||r.incoherent?<Badge ml="xs" color="orange" variant="light">À vérifier</Badge>:null}</Table.Td><Table.Td>{r.crate} <span className="analytics-code">#{r.crateType??'?'}</span></Table.Td><Table.Td ta="right">{r.invalid? 'À vérifier':format(r.entries,0)}</Table.Td><Table.Td ta="right">{r.invalid? 'À vérifier':format(r.exits,0)}</Table.Td><Table.Td ta="right" c={r.crateBalance==null?'dimmed':r.crateBalance<0?'orange':'forest'}><strong>{r.crateBalance==null?'À vérifier':format(r.crateBalance,0)}</strong></Table.Td><Table.Td ta="right">{r.invalidPallets?'À vérifier':format(r.entriesPallets,0)}</Table.Td><Table.Td ta="right">{r.invalidPallets?'À vérifier':format(r.exitsPallets,0)}</Table.Td><Table.Td ta="right" c={r.palletBalance==null?'dimmed':r.palletBalance<0?'orange':'forest'}><strong>{r.palletBalance==null?'À vérifier':format(r.palletBalance,0)}</strong></Table.Td></Table.Tr>)}</Table.Tbody></Table></Table.ScrollContainer>
    {loading?<Text size="sm" c="dimmed" mt="sm">Chargement des situations…</Text>:data?.total===0?<Text size="sm" c="dimmed" mt="sm">Aucun mouvement attribué à un producteur sur ce périmètre.</Text>:null}
    {(data?.totals?.length??0)>0?<Table.ScrollContainer minWidth={1040}><Table className="analytics-situation-totals"><Table.Tbody>{data!.totals.map(t=><Table.Tr key={`${t.contextId}:${t.crateType}`}><Table.Td>{t.station}</Table.Td><Table.Td><strong>TOTAL · {t.crate} #{t.crateType??'?'}</strong></Table.Td><Table.Td/><Table.Td ta="right">{t.invalid?'À vérifier':format(t.entries,0)}</Table.Td><Table.Td ta="right">{t.invalid?'À vérifier':format(t.exits,0)}</Table.Td><Table.Td ta="right"><strong>{t.crateBalance==null?'À vérifier':format(t.crateBalance,0)}</strong></Table.Td><Table.Td ta="right">{t.invalidPallets?'À vérifier':format(t.entriesPallets,0)}</Table.Td><Table.Td ta="right">{t.invalidPallets?'À vérifier':format(t.exitsPallets,0)}</Table.Td><Table.Td ta="right"><strong>{t.palletBalance==null?'À vérifier':format(t.palletBalance,0)}</strong></Table.Td></Table.Tr>)}</Table.Tbody></Table></Table.ScrollContainer>:null}
    {data&&data.total>data.pageSize?<Pagination mt="sm" value={page} onChange={onPage} total={Math.ceil(data.total/data.pageSize)}/>:null}
  </Paper>;
}
function isoMonday(key: string) {
  const d = new Date(Date.UTC(Number(key.slice(0, 4)), 0, 4));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) + (Number(key.slice(4)) - 1) * 7);
  return d;
}
function CampaignComparison({ current, prior }: { current: Source[]; prior: Source[] }) {
  return (
    <Paper withBorder p="md">
      <Text fw={700}>Alignement depuis le début de campagne</Text>
      <Table.ScrollContainer minWidth={600}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Station</Table.Th>
              <Table.Th>Jour campagne</Table.Th>
              <Table.Th>Actuel</Table.Th>
              <Table.Th>Archive</Table.Th>
              <Table.Th>Actuel t</Table.Th>
              <Table.Th>Archive t</Table.Th>
              <Table.Th>Cumul actuel t</Table.Th>
              <Table.Th>Cumul archive t</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {current.flatMap((s, i) => {
              const p = prior[i];
              if (!s.campaign || !p?.campaign || !p.available) return [];
              const start = Date.parse(s.campaign.start),
                oldStart = Date.parse(p.campaign.start);
              const mapped = new Map(
                p.daily.map((d) => [Math.round((Date.parse(d.key) - oldStart) / 86400000), d]),
              );
              let cumul = 0,
                oldCumul = 0;
              const daily = new Map(
                s.daily.map((d) => [Math.round((Date.parse(d.key) - start) / 86400000), d]),
              );
              const days = [...new Set([...daily.keys(), ...mapped.keys()])].sort((a, b) => a - b);
              return days.map((day) => {
                const d = daily.get(day),
                  v = mapped.get(day);
                cumul += d?.kg ?? 0;
                oldCumul += v?.kg ?? 0;
                return (
                  <Table.Tr key={`${s.contextId}:${day}`}>
                    <Table.Td>{s.station}</Table.Td>
                    <Table.Td>J{day + 1}</Table.Td>
                    <Table.Td>{d?.key ?? '—'}</Table.Td>
                    <Table.Td>{v?.key ?? '—'}</Table.Td>
                    <Table.Td>{tonnes(d?.kg ?? 0)}</Table.Td>
                    <Table.Td>{tonnes(v?.kg ?? 0)}</Table.Td>
                    <Table.Td>{tonnes(cumul)}</Table.Td>
                    <Table.Td>{tonnes(oldCumul)}</Table.Td>
                  </Table.Tr>
                );
              });
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}
function Estimates({ source }: { source: Source }) {
  const e = source.estimates;
  if (!e)
    return <Alert color="gray">{source.station} : estimation non disponible dans ce schéma.</Alert>;
  const coverage = e.summary.parcels ? (e.summary.usable / e.summary.parcels) * 100 : 0;
  return (
    <Paper withBorder p="md">
      <Text fw={700}>{source.station} · référentiel de parcelles</Text>
      <SimpleGrid cols={{ base: 2, md: 4 }} mt="md">
        <div>
          <Text size="xs">Estimation partielle exploitable</Text>
          <Text fw={700}>{tonnes(e.summary.estimatedKg)}</Text>
        </div>
        <div>
          <Text size="xs">Parcelles renseignées et non ambiguës</Text>
          <Text fw={700}>
            {e.summary.usable} / {e.summary.parcels}
          </Text>
        </div>
        <div>
          <Text size="xs">Incomplètes ou ambiguës</Text>
          <Text fw={700}>{e.summary.parcels - e.summary.usable}</Text>
        </div>
        <div>
          <Text size="xs">Couverture indicative</Text>
          <Text fw={700}>{format(coverage, 1)} %</Text>
          <Progress value={coverage} aria-label="Couverture des estimations" />
        </div>
      </SimpleGrid>
      <Text size="xs" c="dimmed" mt="md">
        Périmètre du référentiel : filtres produit, variété, producteur et verger uniquement. Dates,
        type de caisse et mouvement ne décrivent pas une parcelle. Aucun rattachement campagne
        prouvé.
      </Text>
      <details>
        <summary>Parcelles à compléter · 100 premières lignes</summary>
        <Table.ScrollContainer minWidth={600}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Identité métier</Table.Th>
                <Table.Th>Verger</Table.Th>
                <Table.Th>À vérifier</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {e.incomplete.map((p, i) => (
                <Table.Tr key={`${p.idparcelle}:${i}`}>
                  <Table.Td>
                    {p.refver} / {p.refpar} / {p.numcul}
                  </Table.Td>
                  <Table.Td>{p.orchard}</Table.Td>
                  <Table.Td>{p.reason}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </details>
    </Paper>
  );
}
