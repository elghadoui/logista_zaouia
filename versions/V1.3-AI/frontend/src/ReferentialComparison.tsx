import {
  Alert,
  Checkbox,
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useState } from 'react';
import type { Context, Entity, Row } from './api';
import { display, titles, useApi } from './api';
import { DiffTable, PageHeading, State, Status } from './components';
import { ComparisonApply } from './ComparisonApply';
interface Compared {
  status: string;
  key: Row;
  source: Row | null;
  target: Row | null;
  sourceCount: number;
  targetCount: number;
  differences: { field: string; before: unknown; after: unknown }[];
}
interface Report {
  rows: Compared[];
  total: number;
  summary: Record<string, number>;
  warnings: string[];
  comparedAt: string;
  sourceLabel: string;
  targetLabel: string;
}
interface Query {
  name: string;
  targetId: number;
  search: string;
  status: string;
  page: number;
}
const statuses = [
  { value: 'All', label: 'Toutes les différences' },
  { value: 'Different', label: 'Valeurs différentes' },
  { value: 'SourceOnly', label: 'Absentes de DIAF' },
  { value: 'TargetOnly', label: 'Absentes de ZAOUIA' },
  { value: 'Ambiguous', label: 'Identifiants ambigus' },
];
const counts = [
  ['Equal', 'Identiques'],
  ['Different', 'Différentes'],
  ['SourceOnly', 'Absentes DIAF'],
  ['TargetOnly', 'Absentes ZAOUIA'],
  ['Ambiguous', 'Ambiguës'],
];
export function ReferentialComparison({
  context,
  catalog,
  onOpen,
  canWrite,
}: {
  context: Context;
  catalog: Entity[];
  canWrite: boolean;
  onOpen: (name: string, row: Row) => void;
}) {
  const targets = useApi<{ id: number; label: string; station: string }[]>(
    context.isMaster && context.station === 'ZAOUIA'
      ? `/contexts/${context.id}/comparison-targets`
      : null,
  );
  const [name, setName] = useState('verger'),
    [target, setTarget] = useState<string | null>(null),
    [search, setSearch] = useState('');
  const [run, setRun] = useState<Query | null>(null),
    [detail, setDetail] = useState<Compared | null>(null),
    [exporting, setExporting] = useState(false),
    [error, setError] = useState('');
  const targetId = target ? Number(target) : targets.data?.[0]?.id;
  const params = run
    ? new URLSearchParams({
        name: run.name,
        targetId: String(run.targetId),
        search: run.search,
        status: run.status,
        page: String(run.page),
        pageSize: '25',
      })
    : null;
  const result = useApi<Report>(params ? `/contexts/${context.id}/comparison?${params}` : null);
  const [selection, setSelection] = useState<{ scope: string; keys: string[] }>({
    scope: '',
    keys: [],
  });
  const [applying, setApplying] = useState<Compared[] | null>(null);
  const scope = `${context.id}/${params}`;
  const eligible = (row: Compared) =>
    ['Different', 'SourceOnly'].includes(row.status) &&
    row.sourceCount === 1 &&
    row.targetCount <= 1;
  const visible = result.loading ? [] : (result.data?.rows ?? []).filter(eligible);
  const picked = selection.scope === scope ? selection.keys : [];
  const selectedRows = visible.filter((r) => picked.includes(JSON.stringify(r.key)));
  const canApply = canWrite && !context.readOnly;
  function toggle(row: Compared, checked: boolean) {
    const key = JSON.stringify(row.key);
    setSelection({
      scope,
      keys: checked ? [...new Set([...picked, key])] : picked.filter((k) => k !== key),
    });
  }
  const entity = catalog.find((e) => e.name === (run?.name ?? name))!;
  async function exportCsv() {
    if (!params || !run) return;
    setExporting(true);
    setError('');
    try {
      const csvParams = new URLSearchParams(params);
      csvParams.delete('page');
      csvParams.delete('pageSize');
      const response = await fetch(`/api/contexts/${context.id}/comparison/export?${csvParams}`, {
        credentials: 'same-origin',
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { title?: string };
        throw new Error(body.title ?? 'Export indisponible');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `comparaison-${run.name}-ZAOUIA-DIAF.csv`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export indisponible');
    } finally {
      setExporting(false);
    }
  }
  function references(row: Compared) {
    return entity.keys.map((k) => display(row.key[k])).join(' · ');
  }
  function stationName(row: Compared, side: 'source' | 'target') {
    return row.status === 'Ambiguous'
      ? `${side === 'source' ? row.sourceCount : row.targetCount} fiche(s)`
      : display(row[side]?.[entity.label]);
  }
  return (
    <>
      <PageHeading
        eyebrow="CONTINUITÉ DES RÉFÉRENTIELS"
        title="Comparer ZAOUIA / DIAF"
        subtitle="Comparer puis confirmer les écarts ZAOUIA vers DIAF."
      />
      {!context.isMaster || context.station !== 'ZAOUIA' ? (
        <Alert color="orange">
          Sélectionnez ZAOUIA dans le header pour comparer avec un exercice DIAF configuré.
        </Alert>
      ) : (
        <State loading={targets.loading} error={targets.error} retry={targets.refresh}>
          <Paper withBorder p="lg" mb="lg">
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              <Select
                label="Référentiel"
                data={catalog.map((e) => ({ value: e.name, label: titles[e.name] }))}
                value={name}
                onChange={(v) => {
                  setName(v ?? 'verger');
                  setRun(null);
                }}
              />
              <Select
                label="Exercice DIAF"
                data={(targets.data ?? []).map((t) => ({ value: String(t.id), label: t.label }))}
                value={targetId ? String(targetId) : null}
                onChange={(v) => {
                  setTarget(v);
                  setRun(null);
                }}
                placeholder="Route DIAF autorisée"
              />
              <TextInput
                label="Nom ou référence"
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  setRun(null);
                }}
                placeholder="Recherche dans les deux stations"
              />
            </SimpleGrid>
            <Group mt="md" justify="space-between">
              <Text size="sm" c="dimmed">
                ZAOUIA · {context.label}
              </Text>
              <Button
                loading={result.loading}
                disabled={!targetId}
                onClick={() => {
                  setError('');
                  setRun({ name, targetId: targetId!, search, status: 'All', page: 1 });
                  result.refresh();
                }}
              >
                Comparer les données
              </Button>
            </Group>
          </Paper>
          {!targets.data?.length ? (
            <Alert color="orange">
              Aucune destination DIAF autorisée pour cet exercice. Vérifiez la route et les droits
              des deux contextes avec l’administrateur.
            </Alert>
          ) : null}
          {run ? (
            <State loading={result.loading} error={result.error} retry={result.refresh}>
              {result.data ? (
                <>
                  <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} mb="lg">
                    {counts.map(([key, label]) => (
                      <Paper withBorder p="md" key={key}>
                        <Text size="xs" c="dimmed">
                          {label}
                        </Text>
                        <Text
                          fw={750}
                          size="xl"
                          c={key === 'Different' ? 'orange' : 'forest'}
                          mt={6}
                        >
                          {result.data!.summary[key].toLocaleString('fr-MA')}
                        </Text>
                      </Paper>
                    ))}
                  </SimpleGrid>
                  <Group mb="sm">
                    <Badge color="forest" variant="light">
                      ZAOUIA · {result.data.summary.SourceRows} fiches
                    </Badge>
                    <Badge color="forest" variant="light">
                      DIAF · {result.data.summary.TargetRows} fiches
                    </Badge>
                    <Text c="dimmed" size="xs">
                      Lecture : {new Date(result.data.comparedAt).toLocaleString('fr-MA')}
                    </Text>
                  </Group>
                  <Alert color="forest" mb="lg">
                    Les identifiants historiques complets servent au rapprochement. La référence
                    locale de station et les dates techniques générées sont exclues des différences.
                    Les mises à jour exigent une sélection et une confirmation. Aucune suppression
                    DIAF.
                  </Alert>
                  {result.data.warnings.map((w) => (
                    <Alert color="orange" mb="sm" key={w}>
                      {w}
                    </Alert>
                  ))}
                  <Paper withBorder>
                    {canApply ? (
                      <Group p="md">
                        <Checkbox
                          label="Sélectionner les différences applicables de cette page"
                          checked={visible.length > 0 && selectedRows.length === visible.length}
                          indeterminate={
                            selectedRows.length > 0 && selectedRows.length < visible.length
                          }
                          disabled={!visible.length}
                          onChange={(e) =>
                            setSelection({
                              scope,
                              keys: e.currentTarget.checked
                                ? visible.map((r) => JSON.stringify(r.key))
                                : [],
                            })
                          }
                        />
                        <Text size="sm">{selectedRows.length} sélectionné(s)</Text>
                        <Button
                          disabled={!selectedRows.length}
                          onClick={() => setApplying(selectedRows)}
                        >
                          Appliquer la sélection vers DIAF
                        </Button>
                      </Group>
                    ) : null}
                    <Group p="lg" justify="space-between">
                      <Select
                        aria-label="Filtrer les différences"
                        data={statuses}
                        value={run.status}
                        onChange={(v) => setRun({ ...run, status: v ?? 'All', page: 1 })}
                      />
                      <Button variant="light" loading={exporting} onClick={() => void exportCsv()}>
                        Exporter CSV · tous les résultats filtrés
                      </Button>
                    </Group>
                    {!result.data.total ? (
                      <Alert color="forest" m="lg">
                        Aucune différence métier pour les critères choisis et les colonnes
                        disponibles.
                      </Alert>
                    ) : (
                      <>
                        <Box visibleFrom="sm">
                          <Table.ScrollContainer minWidth={760}>
                            <Table horizontalSpacing="lg" verticalSpacing="md">
                              <Table.Thead>
                                <Table.Tr>
                                  {canApply ? <Table.Th>Sélection</Table.Th> : null}
                                  <Table.Th>Référence</Table.Th>
                                  <Table.Th>ZAOUIA</Table.Th>
                                  <Table.Th>DIAF</Table.Th>
                                  <Table.Th>État</Table.Th>
                                  <Table.Th>Écarts</Table.Th>
                                  <Table.Th />
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {result.data.rows.map((row, i) => (
                                  <Table.Tr key={JSON.stringify(row.key) + i}>
                                    {canApply ? (
                                      <Table.Td>
                                        <Checkbox
                                          aria-label={`Sélectionner ${references(row)}`}
                                          checked={picked.includes(JSON.stringify(row.key))}
                                          disabled={!eligible(row)}
                                          onChange={(e) => toggle(row, e.currentTarget.checked)}
                                        />
                                      </Table.Td>
                                    ) : null}
                                    <Table.Td>
                                      <Text size="xs" c="dimmed">
                                        {references(row)}
                                      </Text>
                                    </Table.Td>
                                    <Table.Td>{stationName(row, 'source')}</Table.Td>
                                    <Table.Td>{stationName(row, 'target')}</Table.Td>
                                    <Table.Td>
                                      <Status status={row.status} />
                                    </Table.Td>
                                    <Table.Td>
                                      {row.status === 'Ambiguous'
                                        ? `${row.sourceCount} / ${row.targetCount} fiches`
                                        : row.differences.length}
                                    </Table.Td>
                                    <Table.Td>
                                      <Button
                                        size="compact-sm"
                                        variant="subtle"
                                        onClick={() => setDetail(row)}
                                      >
                                        Voir les différences
                                      </Button>
                                    </Table.Td>
                                  </Table.Tr>
                                ))}
                              </Table.Tbody>
                            </Table>
                          </Table.ScrollContainer>
                        </Box>
                        <Stack hiddenFrom="sm" p="md">
                          {result.data.rows.map((row, i) => (
                            <Paper withBorder p="md" key={JSON.stringify(row.key) + i}>
                              {canApply ? (
                                <Checkbox
                                  mb="sm"
                                  aria-label={`Sélectionner ${references(row)}`}
                                  checked={picked.includes(JSON.stringify(row.key))}
                                  disabled={!eligible(row)}
                                  onChange={(e) => toggle(row, e.currentTarget.checked)}
                                />
                              ) : null}
                              <Group justify="space-between">
                                <Text fw={650}>
                                  {display(
                                    row.source?.[entity.label] ?? row.target?.[entity.label],
                                  )}
                                </Text>
                                <Status status={row.status} />
                              </Group>
                              <Text size="xs" c="dimmed" mt="xs">
                                {references(row)}
                              </Text>
                              <Button
                                size="xs"
                                variant="light"
                                mt="md"
                                onClick={() => setDetail(row)}
                              >
                                Voir les différences
                              </Button>
                            </Paper>
                          ))}
                        </Stack>
                      </>
                    )}
                    <Group p="lg" justify="space-between">
                      <Text size="sm" c="dimmed">
                        {result.data.total} résultat(s) · {titles[run.name]}
                      </Text>
                      <Pagination
                        size="sm"
                        total={Math.max(1, Math.ceil(result.data.total / 25))}
                        value={run.page}
                        onChange={(page) => setRun({ ...run, page })}
                      />
                    </Group>
                  </Paper>
                </>
              ) : null}
            </State>
          ) : null}
          {error ? (
            <Alert color="red" mt="md">
              {error}
            </Alert>
          ) : null}
        </State>
      )}
      <Modal
        opened={detail !== null}
        onClose={() => setDetail(null)}
        title="Différences ZAOUIA / DIAF"
        size="lg"
      >
        {detail ? (
          <Stack>
            <Group>
              <Text fw={700}>
                {display(detail.source?.[entity.label] ?? detail.target?.[entity.label])}
              </Text>
              <Status status={detail.status} />
            </Group>
            <Text size="xs" c="dimmed">
              Référence : {references(detail)}
            </Text>
            {detail.status === 'Ambiguous' ? (
              <Alert color="orange">
                Même identifiant pour {detail.sourceCount} fiche(s) ZAOUIA et {detail.targetCount}{' '}
                fiche(s) DIAF. Les valeurs ne sont pas rapprochées arbitrairement.
              </Alert>
            ) : (
              <DiffTable differences={detail.differences} beforeLabel="DIAF" afterLabel="ZAOUIA" />
            )}
            {entity.name === 'verger' ? (
              <Text size="sm" c="dimmed">
                Référence locale station : ZAOUIA {display(detail.source?.refsta)} · DIAF{' '}
                {display(detail.target?.refsta)}. Ces valeurs restent propres à chaque station.
              </Text>
            ) : null}
            {detail.source && detail.status !== 'Ambiguous' ? (
              <Button
                variant="light"
                onClick={() => {
                  setDetail(null);
                  onOpen(entity.name, detail.source!);
                }}
              >
                Ouvrir la fiche ZAOUIA
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Modal>
      {applying && run ? (
        <ComparisonApply
          context={context}
          name={run.name}
          targetId={run.targetId}
          rows={applying}
          onClose={() => {
            setApplying(null);
            setSelection({ scope: '', keys: [] });
          }}
          onCompleted={() => {
            result.refresh();
            setSelection({ scope: '', keys: [] });
          }}
        />
      ) : null}
    </>
  );
}
