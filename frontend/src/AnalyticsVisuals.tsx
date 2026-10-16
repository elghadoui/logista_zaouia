import { useEffect, useId, useRef, useState } from 'react';
import { Group, Paper, Text } from '@mantine/core';
import { IconDatabaseOff } from './icons';

export interface VisualPoint { station: string; key: string; label: string; kg: number | null; quantity: number | null; count: number }
export interface VisualFlowPoint { station: string; key: string; label: string; entries: number | null; exits: number | null; invalid: number }
const number = (n: number) => new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 3 }).format(n);
const value = (r: VisualPoint, crates: boolean) => (crates ? r.quantity : r.kg == null ? null : r.kg / 1000);
const color = (station: string) => station === 'DIAF' ? '#dc8b42' : '#43875b';

/** Actual observations only: no synthetic trend, interpolation of missing dates or forecast. */
export function Sparkline({ points, label }: { points: number[]; label: string }) {
  const id = useId().replace(/:/g, '');
  if (points.length < 2) return <span className="analytics-spark-empty">Courbe indisponible</span>;
  const min = Math.min(0, ...points), span = Math.max(1, Math.max(...points) - min);
  const path = points.map((n, i) => `${i * 156 / (points.length - 1)},${34 - (n - min) / span * 30}`).join(' ');
  return <svg className="analytics-spark" viewBox="0 0 156 40" role="img" aria-label={label}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#68a76c" stopOpacity=".22"/><stop offset="1" stopColor="#68a76c" stopOpacity="0"/></linearGradient></defs>
    <polygon points={`0,40 ${path} 156,40`} fill={`url(#${id})`}/><polyline points={path} fill="none" stroke="#43875b" strokeWidth="1.8"/>
  </svg>;
}

export function TemporalChart({ title, rows, crates = false, onChoose, variant = 'line', unitLabel, countLabel }: { title: string; rows: VisualPoint[]; crates?: boolean; onChoose?: (r: VisualPoint) => void; variant?: 'line' | 'bars' | 'combo'; unitLabel?: string; countLabel?: string }) {
  const [selected, setSelected] = useState<VisualPoint | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const plotRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = plotRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const keys = [...new Set(rows.map((r) => r.key))].sort();
  const stations = [...new Set(rows.map((r) => r.station))];
  const values = rows.flatMap((r) => { const n = value(r, crates); return n == null ? [] : [n]; });
  const min = Math.min(0, ...values), max = Math.max(0, ...values), span = Math.max(1, max - min);
  const counts = rows.map((r) => r.count);
  const countMax = Math.max(1, ...counts);
  const unit = unitLabel ?? (crates ? 'caisses mouvementées' : 't');
  const countUnit = countLabel ?? (crates ? 'mouvements' : 'lots');
  const byIdentity = new Map(rows.map((r) => [`${r.station}:${r.key}`, r]));
  // The plot fills the panel; long series scroll rather than aggregating or truncating real observations.
  const height = variant === 'combo' ? 330 : 290;
  const plotTop = variant === 'combo' ? 38 : 18, plotBottom = height - 48;
  const plotHeight = plotBottom - plotTop;
  const side = variant === 'combo' ? 78 : 68;
  const width = Math.max(520, containerWidth, keys.length * Math.max(22, stations.length * 12) + side * 2 + 20);
  const plotWidth = width - side * 2;
  const cell = plotWidth / Math.max(1, keys.length), bar = Math.min(34, cell / Math.max(1, stations.length) - 5);
  const y = (n: number) => plotBottom - (n - min) / span * plotHeight;
  const yCount = (n: number) => plotBottom - n / countMax * plotHeight;
  const pointX = (index: number) => side + index * cell + cell / 2;
  const displayedKey = (key: string) => rows.find((r) => r.key === key)?.label ?? key;
  const adjacent = (before: string, after: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(before) && /^\d{4}-\d{2}-\d{2}$/.test(after))
      return Date.parse(`${after}T00:00:00Z`) - Date.parse(`${before}T00:00:00Z`) === 86400000;
    if (/^\d{6}$/.test(before) && /^\d{6}$/.test(after)) {
      const monday = (key: string) => {
        const date = new Date(Date.UTC(Number(key.slice(0, 4)), 0, 4));
        date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7) + (Number(key.slice(4)) - 1) * 7);
        return date.getTime();
      };
      return monday(after) - monday(before) === 7 * 86400000;
    }
    return false;
  };
  function seriesSegments(station: string, countSeries = false) {
    const points = keys.flatMap((key, i) => {
      const row = byIdentity.get(`${station}:${key}`), n = row ? (countSeries ? row.count : value(row, crates)) : null;
      return row && n != null ? [{ row, index: i, n }] : [];
    });
    const segments: typeof points[] = [];
    for (const point of points) {
      const prior = segments[segments.length - 1]?.at(-1);
      const consecutive = prior && point.index === prior.index + 1 && adjacent(prior.row.key, point.row.key);
      if (!consecutive || !prior) segments.push([point]);
      else segments[segments.length - 1].push(point);
    }
    return segments;
  }
  const barColor = (station: string) => station === 'DIAF' ? '#9b7ab5' : '#76549b';
  const lineColor = (station: string) => station === 'DIAF' ? '#83a94c' : '#2e7d4b';
  return <Paper withBorder p="md" className={`analytics-chart-card ${variant === 'combo' ? 'analytics-chart-combo' : ''}`}>
    <Group justify="space-between" mb="xs"><Text fw={700}>{title}</Text><Group gap="md" className="analytics-chart-legend">
      {stations.map((s) => <span className="analytics-legend" key={`${s}:bar`}><i className={variant === 'combo' ? 'analytics-legend-column' : ''} style={{ background: variant === 'combo' ? barColor(s) : color(s) }}/>{s}{variant === 'combo' ? ` · ${unit}` : ''}</span>)}
      {variant === 'combo' && stations.map((s) => <span className="analytics-legend" key={`${s}:line`}><i className="analytics-legend-line" style={{ background: lineColor(s) }}/>{s} · {countUnit}</span>)}
    </Group></Group>
    {rows.length === 0 ? <div className="analytics-chart-empty"><span className="analytics-empty-mark"><IconDatabaseOff size={22}/></span><div><Text fw={600}>Aucune donnée sur cette période</Text><Text size="xs" c="dimmed">Le graphique apparaîtra dès qu’une observation sera disponible pour ces filtres.</Text></div></div> : <>
      <div ref={plotRef} className="analytics-plot-scroll" tabIndex={0} aria-label="Graphique défilant ; chaque observation est accessible au clavier">
        <svg viewBox={`0 0 ${width} ${height + 38}`} style={{ width, minWidth: '100%' }} role="group" aria-label={title}>
          {[0, 1, 2, 3, 4].map((i) => {
            const yy = plotBottom - plotHeight * i / 4;
            return <g key={i}><line x1={side} x2={width - side} y1={yy} y2={yy} className="analytics-gridline"/><text x={side - 10} y={yy + 4} textAnchor="end" className="analytics-axis">{number(min + span * i / 4)}</text>{variant === 'combo' ? <text x={width - side + 10} y={yy + 4} textAnchor="start" className="analytics-axis">{new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(countMax * i / 4)}</text> : null}</g>;
          })}
          {variant === 'combo' ? <><text x={side} y="17" className="analytics-axis analytics-axis-title">{unit}</text><text x={width - side} y="17" textAnchor="end" className="analytics-axis analytics-axis-title">{countLabel ?? (crates ? 'Mouvements' : 'Lots')}</text></> : null}
          {variant === 'bars' ? keys.map((key, i) => <g key={key}>
            {stations.map((station, j) => {
              const r = byIdentity.get(`${station}:${key}`); if (!r || value(r, crates) == null) return null;
              const n = value(r, crates), h = Math.abs(y(n ?? 0) - y(0));
              const fill = color(station);
              return <g key={station} role={onChoose ? 'button' : 'img'} tabIndex={0} className="analytics-column" aria-label={`${r.label} · ${station} · ${n == null ? 'indisponible' : number(n)} ${unit}`} onMouseEnter={() => setSelected(r)} onFocus={() => setSelected(r)} onClick={() => onChoose?.(r)} onKeyDown={(e) => { if (onChoose && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onChoose(r); } }}>
                <title>{`${r.label} · ${station} : ${n == null ? 'Indisponible' : number(n)} ${unit} · ${r.count} ${countUnit}`}</title>
                <rect x={side + i * cell + j * (bar + 4)} y={Math.min(y(0), y(n ?? 0)) - (h === 0 ? 1 : 0)} width={Math.max(3, bar)} height={Math.max(2, h)} rx="4" fill={fill} opacity={n == null ? .3 : .9}/>
              </g>;
            })}
            {(i % Math.max(1, Math.ceil(keys.length / 12)) === 0 || i === keys.length - 1) && <text x={pointX(i)} y={height + 19} textAnchor="middle" className="analytics-axis">{displayedKey(key)}</text>}
          </g>) : variant === 'combo' ? <>
            {keys.map((key, i) => <g key={key}>
              {stations.map((station, j) => {
                const r = byIdentity.get(`${station}:${key}`); if (!r || value(r, crates) == null) return null;
                const n = value(r, crates), h = Math.abs(y(n ?? 0) - y(0));
                return <g key={station} role={onChoose ? 'button' : 'img'} tabIndex={0} className="analytics-column" aria-label={`${r.label} · ${station} · ${n == null ? 'indisponible' : number(n)} ${unit} · ${r.count} ${countUnit}`} onMouseEnter={() => setSelected(r)} onFocus={() => setSelected(r)} onClick={() => onChoose?.(r)} onKeyDown={(e) => { if (onChoose && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onChoose(r); } }}>
                  <title>{`${r.label} · ${station} : ${n == null ? 'Indisponible' : number(n)} ${unit} · ${r.count} ${countUnit}`}</title>
                  <rect x={side + i * cell + j * (bar + 4)} y={Math.min(y(0), y(n ?? 0))} width={Math.max(3, bar)} height={Math.max(2, h)} rx="4" fill={barColor(station)} opacity={n == null ? .35 : .88}/>
                </g>;
              })}
              {(i % Math.max(1, Math.ceil(keys.length / 16)) === 0 || i === keys.length - 1) && <text x={pointX(i)} y={height + 19} textAnchor="middle" className="analytics-axis">{displayedKey(key)}</text>}
            </g>)}
            {stations.map((station) => seriesSegments(station, true).map((segment, j) => {
              const d = segment.map((p, i) => `${i ? 'L' : 'M'} ${pointX(p.index)} ${yCount(p.row.count)}`).join(' ');
              return <g key={`count:${station}:${j}`} className="analytics-combo-line">
                {segment.length > 1 ? <path d={d} fill="none" stroke={lineColor(station)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/> : null}
                {segment.map((p) => <g key={`${p.row.key}:${station}`} role={onChoose ? 'button' : 'img'} tabIndex={0} className="analytics-line-point" aria-label={`${p.row.label} · ${station} · ${p.row.count} ${countUnit}`} onMouseEnter={() => setSelected(p.row)} onFocus={() => setSelected(p.row)} onClick={() => onChoose?.(p.row)} onKeyDown={(e) => { if (onChoose && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onChoose(p.row); } }}>
                  <title>{`${p.row.label} · ${station} : ${p.row.count} ${countUnit}`}</title><circle cx={pointX(p.index)} cy={yCount(p.row.count)} r="5" fill={lineColor(station)} stroke="white" strokeWidth="2"/>
                </g>)}
              </g>;
            }))}
          </> : <>
            {stations.map((station) => seriesSegments(station).map((segment, j) => {
              const d = segment.map((p, i) => `${i ? 'L' : 'M'} ${pointX(p.index)} ${y(p.n)}`).join(' ');
              const fill = `${d} L ${pointX(segment[segment.length - 1].index)} ${y(0)} L ${pointX(segment[0].index)} ${y(0)} Z`;
              return <g key={`${station}:${j}`}>
                {segment.length > 1 ? <><path d={fill} fill={color(station)} opacity=".08"/><path d={d} fill="none" stroke={color(station)} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></> : null}
                {segment.map((p) => <g key={`${p.row.key}:${station}`} role={onChoose ? 'button' : 'img'} tabIndex={0} className="analytics-line-point" aria-label={`${p.row.label} · ${station} · ${number(p.n)} ${crates ? 'unités' : 'tonnes'}`} onMouseEnter={() => setSelected(p.row)} onFocus={() => setSelected(p.row)} onClick={() => onChoose?.(p.row)} onKeyDown={(e) => { if (onChoose && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onChoose(p.row); } }}>
                  <title>{`${p.row.label} · ${station} : ${number(p.n)} ${crates ? 'unités' : 't'} · ${p.row.count} ${countUnit}`}</title>
                  <circle cx={pointX(p.index)} cy={y(p.n)} r="4" fill={color(station)} stroke="white" strokeWidth="2"/>
                </g>)}
              </g>;
            }))}
            {keys.map((key, i) => (i % Math.max(1, Math.ceil(keys.length / 12)) === 0 || i === keys.length - 1) && <text key={key} x={pointX(i)} y={height + 19} textAnchor="middle" className="analytics-axis">{displayedKey(key)}</text>)}
          </>}
        </svg>
      </div>
      <Text size="xs" c="dimmed" className="analytics-chart-caption">{selected ? `${selected.station} · ${selected.label} : ${value(selected, crates) == null ? 'Indisponible' : number(value(selected, crates)!)} ${unit}${variant === 'combo' ? ` · ${selected.count} ${countUnit}` : ''}` : `Observations réelles${variant !== 'bars' ? ' · segments interrompus aux semaines ou dates absentes' : ''}${onChoose ? ' · Entrée ouvre le détail' : ''}.`}</Text>
    </>}
  </Paper>;
}

/** Paired E/S quantities; unknown crate types are never combined into a crate total. */
export function CaisserieFlowChart({ title, rows, unitLabel, unavailableMessage, onChoose }: { title: string; rows: VisualFlowPoint[]; unitLabel: string; unavailableMessage?: string; onChoose?: (row: VisualFlowPoint) => void }) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const element = plotRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => setContainerWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const usable = rows.filter((r) => r.invalid === 0 && r.entries != null && r.exits != null);
  const keys = [...new Set(usable.map((r) => r.key))].sort();
  const stations = [...new Set(usable.map((r) => r.station))];
  const byIdentity = new Map(usable.map((r) => [`${r.station}:${r.key}`, r]));
  const maximum = Math.max(0, ...usable.flatMap((r) => [r.entries ?? 0, r.exits ?? 0]));
  const tickMax = Math.max(1, Math.ceil(maximum / 5));
  const height = 320, side = 78, top = 30, bottom = 258, plotHeight = bottom - top;
  const width = Math.max(520, containerWidth, keys.length * Math.max(40, stations.length * 30) + side * 2 + 20);
  const plotWidth = width - 2 * side, cell = plotWidth / Math.max(1, keys.length);
  const groupWidth = Math.min(cell * .76, 70), stationWidth = groupWidth / Math.max(1, stations.length), barWidth = Math.max(4, stationWidth * .36);
  const pointX = (i: number) => side + i * cell + cell / 2;
  const y = (n: number) => bottom - n / (tickMax * 5) * plotHeight;
  const colorFor = (station: string, movement: 'entry' | 'exit') => movement === 'entry' ? (station === 'DIAF' ? '#72a95c' : '#2f8054') : (station === 'DIAF' ? '#e5a251' : '#8b67ad');
  return <Paper withBorder p="md" className="analytics-chart-card analytics-flow-chart">
    <Group justify="space-between" mb="xs"><Text fw={700}>{title}</Text><Group gap="md" className="analytics-chart-legend"><span className="analytics-legend"><i style={{ background: '#2f8054' }}/>Entrées · {unitLabel}</span><span className="analytics-legend"><i style={{ background: '#8b67ad' }}/>Sorties · {unitLabel}</span></Group></Group>
    {keys.length === 0 ? <div className="analytics-chart-empty"><span className="analytics-empty-mark"><IconDatabaseOff size={22}/></span><div><Text fw={600}>{unavailableMessage ?? 'Aucune quantité fiable sur cette période'}</Text><Text size="xs" c="dimmed">Les valeurs absentes ou invalides restent indisponibles. Aucun mouvement n’est remplacé par un compte de lignes.</Text></div></div> : <>
      <div ref={plotRef} className="analytics-plot-scroll" tabIndex={0} aria-label="Graphique des entrées et sorties par période">
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width, minWidth: '100%' }} role="group" aria-label={title}>
          {[0,1,2,3,4,5].map((i) => { const v = tickMax * i, yy = y(v); return <g key={i}><line x1={side} x2={width-side} y1={yy} y2={yy} className="analytics-gridline"/><text x={side-10} y={yy+4} textAnchor="end" className="analytics-axis">{formatAxis(v)}</text></g>; })}
          {keys.map((key,i) => <g key={key}>{stations.map((station,j) => {
            const row = byIdentity.get(`${station}:${key}`); if (!row) return null;
            const base = pointX(i) - groupWidth/2 + j*stationWidth;
            const values = [{name:'Entrées',value:row.entries!,x:base+stationWidth*.12,color:colorFor(station,'entry')},{name:'Sorties',value:row.exits!,x:base+stationWidth*.53,color:colorFor(station,'exit')}];
            return <g key={station}>{values.map((item,k) => <g key={k} role={onChoose?'button':'img'} tabIndex={0} className="analytics-column" aria-label={`${row.label} · ${station} · ${item.name} ${formatAxis(item.value)} ${unitLabel}`} onClick={() => onChoose?.(row)} onKeyDown={(e) => { if(onChoose&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onChoose(row);} }}><title>{`${row.label} · ${station} · ${item.name} ${formatAxis(item.value)} ${unitLabel} · variation sorties − entrées : ${formatAxis((row.exits??0)-(row.entries??0))} ${unitLabel}`}</title><rect x={item.x} y={y(item.value)} width={barWidth} height={Math.max(1,bottom-y(item.value))} rx="3" fill={item.color}/></g>)}</g>;
          })}{(i % Math.max(1, Math.ceil(keys.length/14))===0 || i===keys.length-1) && <text x={pointX(i)} y={height-20} textAnchor="middle" className="analytics-axis">{rows.find(r=>r.key===key)?.label??key}</text>}</g>)}
        </svg>
      </div>
      <Text size="xs" c="dimmed" className="analytics-chart-caption">Infobulle : entrées, sorties et variation (sorties − entrées). Les types de caisse restent séparés.</Text>
    </>}
  </Paper>;
}
function formatAxis(n: number) { return new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(n); }

export function VarietyRing({ rows, onChoose }: { rows: VisualPoint[]; onChoose: (row: VisualPoint) => void }) {
  if (rows.some((r) => r.kg != null && r.kg < 0)) return <Paper withBorder p="md"><Text fw={700}>Répartition du tonnage observé</Text><Text size="sm" c="dimmed" mt="md">Répartition indisponible : des valeurs négatives nécessitent une vérification. Consultez les classements et les détails.</Text></Paper>;
  const sorted = rows.filter((r) => (r.kg ?? 0) > 0).sort((a, b) => b.kg! - a.kg!);
  const total = sorted.reduce((s, r) => s + r.kg!, 0);
  const palette = ['#286044', '#559256', '#93b76c', '#d9bb68', '#cf8c4b'];
  let offset = 0;
  const segments = sorted.slice(0, 4).map((r, i) => ({ row: r, label: r.label, kg: r.kg!, color: palette[i] }));
  if (sorted.length > 4) segments.push({ row: sorted[4], label: 'Autres variétés', kg: sorted.slice(4).reduce((s, r) => s + r.kg!, 0), color: palette[4] });
  return <Paper withBorder p="md" className="analytics-ring-card"><Text fw={700}>Répartition du tonnage observé</Text>
    {total <= 0 ? <Text c="dimmed" py="xl">Aucune répartition positive disponible.</Text> : <div className="analytics-ring-layout">
      <svg viewBox="0 0 160 160" role="img" aria-label={`Répartition des variétés, ${number(total / 1000)} tonnes observées`}>
        <circle cx="80" cy="80" r="58" fill="none" stroke="var(--mantine-color-default-hover)" strokeWidth="20"/>
        {segments.map((s, i) => { const part = s.kg / total * 100, start = offset; offset += part; return <circle key={i} cx="80" cy="80" r="58" pathLength="100" fill="none" stroke={s.color} strokeWidth="20" strokeDasharray={`${part} ${100 - part}`} strokeDashoffset={-start} transform="rotate(-90 80 80)"><title>{`${s.label} : ${number(part)} %`}</title></circle>; })}
        <text x="80" y="78" textAnchor="middle" className="analytics-ring-total">{number(total / 1000)}</text><text x="80" y="98" textAnchor="middle" className="analytics-axis">tonnes</text>
      </svg>
      <div>{segments.map((s, i) => <button type="button" key={i} className="analytics-ring-label" disabled={s.label === 'Autres variétés'} onClick={() => onChoose(s.row)}><i style={{ background: s.color }}/><span>{s.label}<small>{s.label === 'Autres variétés' ? `${sorted.length - 4} variétés` : s.row.station}</small></span><strong>{number(s.kg / total * 100)} %</strong></button>)}</div>
    </div>}
  </Paper>;
}
