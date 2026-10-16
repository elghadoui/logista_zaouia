import {
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  Pagination,
  Paper,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useRef, useState } from 'react';
import type { Column, Context, Row } from './api';
import { api, area, display, labels, useApi } from './api';
import { useDebouncedValue } from '@mantine/hooks';
import { PageHeading, State } from './components';
import { ListControls, useColumns } from './ListControls';
import type { FilterItem } from './ListControls';
const names: Record<string, string> = {
  declaration_verger: 'Origines / déclarations de verger',
  partenaire: 'Partenaires',
  destination: 'Destinations',
  pays: 'Pays',
  grpemb: 'Groupes emballages',
  groupart: 'Groupes articles',
  defaut: 'Défauts',
  typeecart: 'Types d’écart',
  receptions: 'Réceptions',
  caisserie: 'Caisserie',
  versements: 'Versements',
  export: 'Export',
  ecarts: 'Écarts',
};
interface PilotResult {
  available: boolean;
  reason: string;
  columns: Column[];
  keys: string[];
  editable: string[];
  rows: Row[];
  total: number | null;
  canWrite: boolean;
  evolution: { day: string; count: number }[];
  missingColumns?: string[];
  quantities?: string;
  periodAvailable?: boolean;
}
export function PilotTable({
  context,
  module,
  board,
  canWrite,
}: {
  context: Context;
  module: string;
  board: boolean;
  canWrite: boolean;
}) {
  const [search, setSearch] = useState(''),
    [page, setPage] = useState(1),
    [filters, setFilters] = useState<FilterItem[]>([]),
    [from, setFrom] = useState(''),
    [to, setTo] = useState('');
  const [selected, setSelected] = useState<Row | null>(null),
    [creating, setCreating] = useState(false),
    [values, setValues] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const detail = useRef<HTMLDivElement>(null);
  const [debouncedSearch] = useDebouncedValue(search, 250);
  const [debouncedFilters] = useDebouncedValue(filters, 250);
  const query = new URLSearchParams({ search: debouncedSearch, page: String(page) });
  const active = Object.fromEntries(
    debouncedFilters.filter((f) => f.value !== '').map((f) => [f.field, f.value]),
  );
  if (Object.keys(active).length) query.set('filters', JSON.stringify(active));
  if (board) {
    if (from) query.set('from', from);
    if (to) query.set('to', to);
  }
  const result = useApi<PilotResult>(
    `/contexts/${context.id}/${board ? 'boards' : 'pilot'}/${module}?${query}`,
  );
  const options = (result.data?.columns ?? []).map((c) => ({
    value: c.name,
    label: labels[c.name] ?? c.name,
  }));
  const preferences = useColumns(
    'pilot.' + module,
    options,
    options.slice(0, 6).map((c) => c.value),
  );
  function open(row: Row | null) {
    setSelected(row);
    setCreating(row === null);
    setValues({});
    setError('');
  }
  async function save() {
    setBusy(true);
    setError('');
    try {
      await api(`/contexts/${context.id}/pilot/${module}`, creating ? 'POST' : 'PUT', {
        key: Object.fromEntries((result.data?.keys ?? []).map((k) => [k, selected?.[k]])),
        before: selected ?? {},
        values,
      });
      setSelected(null);
      setCreating(false);
      result.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Écriture non confirmée');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow={board ? 'TABLEAUX DE BORD · PILOTE' : 'RÉFÉRENTIELS COMPLÉMENTAIRES'}
        title={names[module] ?? module}
        subtitle={`${context.station} · ${context.label}`}
      />
      <Paper withBorder p="lg" mb="lg">
        <Group>
          <TextInput
            aria-label="Rechercher"
            placeholder="Nom ou référence…"
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
          />
          <ListControls
            columns={options}
            visible={preferences.visible}
            onColumns={preferences.change}
            filterFields={options}
            filters={filters}
            onFilters={(v) => {
              setFilters(v);
              setPage(1);
            }}
          />
          {board ? (
            <>
              <TextInput
                type="date"
                label="Du"
                value={from}
                onChange={(e) => {
                  setFrom(e.currentTarget.value);
                  setPage(1);
                }}
              />
              <TextInput
                type="date"
                label="Au"
                value={to}
                onChange={(e) => {
                  setTo(e.currentTarget.value);
                  setPage(1);
                }}
              />
            </>
          ) : null}
          {!board && canWrite && result.data?.canWrite ? (
            <Button onClick={() => open(null)}>Ajouter</Button>
          ) : null}
        </Group>
      </Paper>
      <State loading={result.loading} error={result.error} retry={result.refresh}>
        {result.data ? (
          <>
            <Alert color={result.data.available ? 'forest' : 'orange'} mb="lg">
              {result.data.reason}
              {result.data.missingColumns?.length
                ? ` Colonnes absentes : ${result.data.missingColumns.join(', ')}.`
                : ''}
            </Alert>
            {board && result.data.available ? (
              <>
                <Paper withBorder p="lg" mb="lg">
                  <Button
                    variant="subtle"
                    onClick={() => detail.current?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Stack gap={3}>
                      <Text size="sm">
                        Lignes de la table principale · tous les résultats filtrés
                      </Text>
                      <Text size="xl" fw={750}>
                        {result.data.total?.toLocaleString('fr-MA')}
                      </Text>
                      <Text size="xs">Voir le détail correspondant</Text>
                    </Stack>
                  </Button>
                  <Text size="xs" c="dimmed">
                    {result.data.quantities}
                  </Text>
                </Paper>
                {result.data.evolution.length ? (
                  <Paper withBorder p="lg" mb="lg">
                    <Text fw={650} mb="md">
                      Évolution journalière · 60 dernières dates disponibles
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                      {result.data.evolution.map((day) => (
                        <Button
                          key={day.day}
                          variant="subtle"
                          h="auto"
                          py="xs"
                          onClick={() => {
                            setFrom(day.day.slice(0, 10));
                            setTo(day.day.slice(0, 10));
                            setPage(1);
                            detail.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          <Stack w="100%" gap={3}>
                            <Text size="sm">
                              {day.day.slice(0, 10)} · {day.count} ligne(s)
                            </Text>
                            <Progress
                              value={
                                (100 * day.count) /
                                Math.max(...result.data!.evolution.map((d) => d.count))
                              }
                            />
                          </Stack>
                        </Button>
                      ))}
                    </SimpleGrid>
                  </Paper>
                ) : (
                  <Text c="dimmed" mb="md">
                    Évolution non disponible : aucune date exploitable dans les résultats.
                  </Text>
                )}
              </>
            ) : null}
            {result.data.available ? (
              <Paper withBorder ref={detail}>
                <Group p="md">
                  <Badge>{result.data.total ?? '—'} résultats</Badge>
                  <Text size="xs" c="dimmed">
                    25 par page · clic sur une fiche pour le détail
                  </Text>
                </Group>
                <Table.ScrollContainer minWidth={650}>
                  <Table highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        {preferences.visible.map((f) => (
                          <Table.Th key={f}>{labels[f] ?? f}</Table.Th>
                        ))}
                        <Table.Th />
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {result.data.rows.map((row, i) => (
                        <Table.Tr key={i}>
                          {preferences.visible.map((f) => (
                            <Table.Td key={f}>{display(row[f])}</Table.Td>
                          ))}
                          <Table.Td>
                            <Button size="compact-sm" variant="subtle" onClick={() => open(row)}>
                              Fiche
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
                <Pagination
                  p="md"
                  value={page}
                  onChange={setPage}
                  total={Math.max(1, Math.ceil((result.data.total ?? 0) / 25))}
                />
              </Paper>
            ) : null}
          </>
        ) : null}
      </State>
      <Modal
        opened={selected !== null || creating}
        onClose={() => {
          if (!busy) {
            setSelected(null);
            setCreating(false);
          }
        }}
        size="lg"
        title={creating ? 'Nouvelle fiche' : names[module]}
        closeOnEscape={!busy}
        closeOnClickOutside={!busy}
      >
        <Stack>
          <Alert color="orange">
            {result.data?.reason} Les identifiants existants restent immuables. Suppression
            désactivée dans ce pilote.
          </Alert>
          {result.data?.columns.map((c) => {
            const editable =
              !board &&
              canWrite &&
              result.data!.canWrite &&
              (result.data!.editable.includes(c.name) ||
                (creating && result.data!.keys.includes(c.name)));
            return (
              <TextInput
                key={c.name}
                label={labels[c.name] ?? c.name}
                value={values[c.name] ?? (creating ? '' : String(selected?.[c.name] ?? ''))}
                readOnly={!editable}
                disabled={busy}
                description={!editable ? 'Lecture seule' : undefined}
                onChange={(e) => setValues((v) => ({ ...v, [c.name]: e.currentTarget.value }))}
              />
            );
          })}
          {error ? <Alert color="red">{error}</Alert> : null}
          {!board && canWrite && result.data?.canWrite ? (
            <Button
              loading={busy}
              disabled={!Object.keys(values).length}
              onClick={() => void save()}
            >
              Confirmer l’enregistrement local
            </Button>
          ) : null}
        </Stack>
      </Modal>
    </>
  );
}
export function DrencherPanel() {
  return (
    <>
      <PageHeading
        eyebrow="QUALITÉ"
        title="Drencher"
        subtitle="Intégration progressive au portail VITASOUSS"
      />
      <Alert color="orange">
        Projet Drencher source requis pour intégration complète. Aucun projet Drencher identifiable
        n’a été trouvé dans les emplacements inspectés. Les traitements, consommations et
        formulaires F04 restent protégés.
      </Alert>
    </>
  );
}
export function AssistantPanel({ context }: { context: Context }) {
  const status = useApi<{ configured: boolean; message: string; tools: string[] }>('/assistant');
  const [tool, setTool] = useState('adherent'),
    [refadh, setRefadh] = useState(''),
    [run, setRun] = useState<string | null>(null);
  const result = useApi<{
    record?: Row;
    metrics?: { vergers: number; parcelles: number; surface: number | null };
    total?: number | null;
    rows?: Row[];
    available?: boolean;
    reason?: string;
  }>(run);
  return (
    <>
      <PageHeading
        eyebrow="ASSISTANCE EN LECTURE SEULE"
        title="Assistant IA"
        subtitle={`${context.station} · ${context.label}`}
      />
      <State loading={status.loading} error={status.error} retry={status.refresh}>
        <Alert color="orange" mb="lg">
          {status.data?.message}. Les consultations ci-dessous restent disponibles. L’assistant ne
          peut modifier aucune donnée.
        </Alert>
        <Paper withBorder p="lg">
          <Stack>
            <Textarea
              label="Question"
              placeholder="Combien de vergers possède cet adhérent ?"
              disabled={!status.data?.configured}
            />
            <Text size="sm">Lecture contrôlée disponible dès maintenant :</Text>
            <Group>
              <Select
                label="Outil métier"
                data={(status.data?.tools ?? []).map((value) => ({
                  value,
                  label:
                    (
                      {
                        adherent: 'Synthèse adhérent',
                        'parcelles-adherent': 'Parcelles d’un adhérent',
                        receptions: 'Réceptions',
                        versements: 'Versements',
                        ecarts: 'Écarts',
                      } as Record<string, string>
                    )[value] ?? value,
                }))}
                value={tool}
                onChange={(v) => {
                  setTool(v ?? 'adherent');
                  setRun(null);
                }}
              />
              {tool.includes('adherent') ? (
                <TextInput
                  label="Référence adhérent"
                  value={refadh}
                  onChange={(e) => setRefadh(e.currentTarget.value)}
                />
              ) : null}
              <Button
                disabled={tool.includes('adherent') && !/^-?\d+$/.test(refadh)}
                onClick={() => {
                  setRun(
                    `/contexts/${context.id}/assistant/tools/${tool}${tool.includes('adherent') ? '?refadh=' + encodeURIComponent(refadh) : ''}`,
                  );
                  result.refresh();
                }}
              >
                Consulter
              </Button>
            </Group>
          </Stack>
        </Paper>
        <State loading={result.loading} error={result.error} retry={result.refresh}>
          {result.data ? (
            <Paper withBorder p="lg" mt="lg">
              <Stack>
                {result.data.record ? (
                  <Text fw={650}>
                    {display(result.data.record.nomadh)} · Réf. {display(result.data.record.refadh)}
                  </Text>
                ) : null}
                {result.data.metrics ? (
                  <Group>
                    <Text>{result.data.metrics.vergers} verger(s)</Text>
                    <Text>{result.data.metrics.parcelles} parcelle(s)</Text>
                    <Text>{area(result.data.metrics.surface)}</Text>
                  </Group>
                ) : null}
                {result.data.total !== undefined ? (
                  <Text>
                    {result.data.total === null
                      ? 'Non disponible dans cet exercice'
                      : `${result.data.total} ligne(s) au total · premières 25 fiches ci-dessous`}
                  </Text>
                ) : null}
                {result.data.reason ? (
                  <Text size="sm" c="dimmed">
                    {result.data.reason}
                  </Text>
                ) : null}
                {result.data.rows?.length ? (
                  <Table.ScrollContainer minWidth={650}>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          {Object.keys(result.data.rows[0])
                            .slice(0, 6)
                            .map((field) => (
                              <Table.Th key={field}>{labels[field] ?? field}</Table.Th>
                            ))}
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {result.data.rows.map((row, i) => (
                          <Table.Tr key={i}>
                            {Object.keys(result.data!.rows![0])
                              .slice(0, 6)
                              .map((field) => (
                                <Table.Td key={field}>{display(row[field])}</Table.Td>
                              ))}
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                ) : null}
              </Stack>
            </Paper>
          ) : null}
        </State>
      </State>
    </>
  );
}
