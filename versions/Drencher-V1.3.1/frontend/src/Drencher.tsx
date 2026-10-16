import { DrencherReservationAdmin } from './DrencherReservationAdmin';
import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { api, useApi } from './api';
import type { Context } from './api';
import { usePermissions } from './Permissions';
import { State } from './components';
import { DrencherEditor } from './DrencherEditor';
import { DrencherManagement } from './DrencherManagement';
import { DrencherPrint } from './DrencherPrint';
import { DrencherF04Actions } from './DrencherDocuments';
import { DrencherRecette } from './DrencherRecette';
import type { DrMode } from './DrencherRecette';
import type { Catalog, Cycle, Detail, Snapshot } from './drencherTypes';
import { number } from './drencherTypes';
import './Drencher.css';

export function Drencher({ context, admin = false }: { context: Context; admin?: boolean }) {
  const path = `/contexts/${context.id}/drencher`;
  const rights = usePermissions('drencher'),
    quality = usePermissions('drencher_quality'),
    manage = usePermissions('drencher_manage');
  const [tab, setTab] = useState<string | null>('cycles'),
    [managementTab, setManagementTab] = useState<string | null>('products'),
    [search, setSearch] = useState(''),
    [status, setStatus] = useState<string | null>(null),
    [from, setFrom] = useState(''),
    [to, setTo] = useState(''),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState<number | null>(null),
    [editing, setEditing] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [note, setNote] = useState('');
  const mode = useApi<DrMode>(context.station === 'ZAOUIA' ? path + '/mode' : null);
  const catalog = useApi<Catalog>(context.station === 'ZAOUIA' ? path + '/catalog' : null);
  const reservations = useApi<{ ready: boolean }>(
    context.station === 'ZAOUIA' ? path + '/reservations/status' : null,
  );
  const cycles = useApi<{
    rows: (Cycle & { snapshot: Snapshot })[];
    total: number;
    summary: {
      cycles: number;
      attente: number;
      palettes: number;
      consommations: { nom: string; unite: string; quantite: number }[];
    };
  }>(
    catalog.data
      ? path +
          `/cycles?page=${page}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status ?? '')}&from=${from}&to=${to}`
      : null,
  );
  const detail = useApi<Detail>(selected ? path + '/cycles/' + selected : null);
  const writable = !context.readOnly;
  const s = detail.data?.revisions[0]?.snapshot;
  function refresh() {
    mode.refresh();
    catalog.refresh();
    cycles.refresh();
    detail.refresh();
  }
  async function transition(validate: boolean) {
    if (!detail.data) return;
    setBusy(true);
    setError('');
    try {
      await api(path + `/cycles/${selected}/${validate ? 'validate' : 'submit'}`, 'POST', {
        version: detail.data.version,
        motif: note,
      });
      refresh();
      setNote('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Opération impossible');
    } finally {
      setBusy(false);
    }
  }
  if (context.station !== 'ZAOUIA')
    return <Alert color="orange">Le Drencher V1 est disponible uniquement pour ZAOUIA.</Alert>;
  return (
    <Stack className="drencher-workspace">
      <Group justify="space-between" className="dr-no-print">
        <div>
          <Text size="xs" c="dimmed">
            OPÉRATIONS · ZAOUIA / {context.label}
          </Text>
          <Title order={2}>Drencher</Title>
          <Text c="dimmed">Saisie des traitements, traçabilité et contrôle qualité.</Text>
        </div>
        <Badge color={mode.data?.registered ? 'orange' : 'blue'}>
          {mode.data ? mode.data.mode.toUpperCase() : 'MODE NON VÉRIFIÉ'}
        </Badge>
      </Group>
      {reservations.data && !reservations.data.ready ? (
        <Alert color="orange" className="dr-no-print">
          Réservations V1.2 à initialiser : diagnostic et arbitrage éventuel dans Réservations ·
          admin. La saisie est protégée jusqu'à la migration.
        </Alert>
      ) : null}
      {error ? (
        <Alert color="red" className="dr-no-print" withCloseButton onClose={() => setError('')}>
          {error}
        </Alert>
      ) : null}
      <State loading={catalog.loading} error={catalog.error} retry={catalog.refresh}>
        {catalog.data ? (
          editing ? (
            <DrencherEditor
              key={`${selected ?? 0}:${detail.data?.version ?? 0}`}
              path={path}
              catalog={catalog.data}
              initial={selected ? (detail.data ?? undefined) : undefined}
              onCancel={() => setEditing(false)}
              onSaved={(id) => {
                setSelected(id);
                setEditing(false);
                refresh();
              }}
            />
          ) : (
            <>
              <Tabs value={tab} onChange={setTab} className="dr-no-print">
                <Tabs.List>
                  <Tabs.Tab value="cycles">Cycles & qualité</Tabs.Tab>
                  <Tabs.Tab value="management">Produits, programmes & stock</Tabs.Tab>
                  {admin ? (
                    <>
                      <Tabs.Tab value="recette">Mode Recette · admin</Tabs.Tab>
                      <Tabs.Tab value="reservations">Réservations · admin</Tabs.Tab>
                    </>
                  ) : null}
                </Tabs.List>
              </Tabs>
              {tab === 'reservations' && admin ? (
                <DrencherReservationAdmin path={path} onUpdated={reservations.refresh} />
              ) : tab === 'recette' && admin ? (
                mode.data ? (
                  <DrencherRecette path={path} mode={mode.data} refresh={refresh} />
                ) : (
                  <Alert color="orange">{mode.error || 'Chargement du mode…'}</Alert>
                )
              ) : tab === 'management' ? (
                <DrencherManagement
                  activeTab={managementTab}
                  onTabChange={setManagementTab}
                  path={path}
                  catalog={catalog.data}
                  canAdd={writable && manage.add}
                  canModify={writable && manage.modify}
                  refresh={catalog.refresh}
                />
              ) : (
                <>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} className="dr-no-print">
                    {[
                      ['Cycles enregistrés', cycles.data?.summary.cycles],
                      ['En attente qualité', cycles.data?.summary.attente],
                      ['Palettes validées', cycles.data?.summary.palettes],
                    ].map(([label, value]) => (
                      <Paper withBorder p="md" key={label}>
                        <Text c="dimmed">{label}</Text>
                        <Title order={3}>{value ?? '—'}</Title>
                      </Paper>
                    ))}
                  </SimpleGrid>
                  <Text size="sm" className="dr-no-print">
                    Consommations validées :{' '}
                    {cycles.data?.summary.consommations
                      .map((p) => `${p.nom} : ${number(p.quantite)} ${p.unite}`)
                      .join(' · ') || 'Aucune'}
                  </Text>
                  <Group className="dr-no-print">
                    <TextInput
                      label="Réception, palette, variété ou cycle"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.currentTarget.value);
                        setPage(1);
                      }}
                    />
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
                    <Select
                      label="Statut"
                      clearable
                      data={['Brouillon', 'En attente de validation', 'Validé']}
                      value={status}
                      onChange={(v) => {
                        setStatus(v);
                        setPage(1);
                      }}
                    />
                    <Button
                      mt="lg"
                      disabled={!writable || !rights.add}
                      onClick={() => {
                        setSelected(null);
                        setEditing(true);
                      }}
                    >
                      Nouveau cycle
                    </Button>
                  </Group>
                  <State loading={cycles.loading} error={cycles.error} retry={cycles.refresh}>
                    <Table.ScrollContainer minWidth={650} className="dr-no-print">
                      <Table highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            {[
                              'Cycle / date',
                              'Programme',
                              'Palettes',
                              'Statut',
                              'Opérateur',
                              '',
                            ].map((v) => (
                              <Table.Th key={v}>{v}</Table.Th>
                            ))}
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {cycles.data?.rows.map((c) => (
                            <Table.Tr key={c.id}>
                              <Table.Td>
                                #{c.id} · {c.snapshot.date}
                              </Table.Td>
                              <Table.Td>
                                {c.snapshot.programmeNom} v{c.snapshot.programmeVersion}
                              </Table.Td>
                              <Table.Td>{c.snapshot.palettes.length}</Table.Td>
                              <Table.Td>
                                <Badge
                                  color={
                                    c.statut === 'Validé'
                                      ? 'green'
                                      : c.statut === 'Brouillon'
                                        ? 'gray'
                                        : 'orange'
                                  }
                                >
                                  {c.statut}
                                </Badge>
                              </Table.Td>
                              <Table.Td>{c.auteur}</Table.Td>
                              <Table.Td>
                                <Button
                                  variant="subtle"
                                  onClick={() => {
                                    setSelected(c.id);
                                    setNote('');
                                  }}
                                >
                                  Ouvrir
                                </Button>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Table.ScrollContainer>
                  </State>
                  <Pagination
                    className="dr-no-print"
                    total={Math.max(1, Math.ceil((cycles.data?.total ?? 0) / 25))}
                    value={page}
                    onChange={setPage}
                  />
                  {selected ? (
                    <State loading={detail.loading} error={detail.error} retry={detail.refresh}>
                      {detail.data && s ? (
                        <Paper withBorder p="lg">
                          <Group justify="space-between" className="dr-no-print">
                            <Title order={3}>
                              Cycle #{selected} · {detail.data.statut}
                            </Title>
                            <Group>
                              <DrencherF04Actions
                                path={path}
                                cycleId={selected}
                                revision={detail.data.version}
                              />
                              {writable &&
                              (detail.data.statut === 'Validé' ? quality.modify : rights.modify) ? (
                                <Button onClick={() => setEditing(true)}>
                                  {detail.data.statut === 'Validé'
                                    ? 'Correction qualité'
                                    : 'Modifier'}
                                </Button>
                              ) : null}
                            </Group>
                          </Group>
                          <DrencherPrint detail={detail.data} />
                          <Group className="dr-no-print" mt="md">
                            <Textarea
                              label="Observations du contrôle qualité"
                              value={note}
                              maxLength={1000}
                              onChange={(e) => setNote(e.currentTarget.value)}
                              flex={1}
                            />
                            {writable && detail.data.statut === 'Brouillon' && rights.modify ? (
                              <Button loading={busy} onClick={() => void transition(false)}>
                                Soumettre à la qualité
                              </Button>
                            ) : null}
                            {writable &&
                            detail.data.statut === 'En attente de validation' &&
                            quality.modify ? (
                              <Button loading={busy} onClick={() => void transition(true)}>
                                Valider & déduire le stock
                              </Button>
                            ) : null}
                          </Group>
                        </Paper>
                      ) : null}
                    </State>
                  ) : null}
                </>
              )}
            </>
          )
        ) : null}
      </State>
    </Stack>
  );
}
