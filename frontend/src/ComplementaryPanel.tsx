import {
  Alert,
  Autocomplete,
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useState } from 'react';
import type { Column, Context, Row } from './api';
import { api, display, useApi } from './api';
import { PageHeading, State } from './components';
import { FormSyncOffer } from './FormSyncOffer';
import { usePermissions } from './Permissions';
const names: Record<string, string> = {
  partenaire: 'Partenaires',
  destination: 'Destinations',
  pays: 'Pays',
  marche: 'Marchés',
  grpemb: 'Groupes emballages',
  groupart: 'Groupes articles',
  defaut: 'Défauts',
  typeecart: 'Types d’écart',
  declaration_verger: 'Origines / Déclarations',
};
const fields: Record<string, string> = {
  refver_reel: 'Verger réel',
  refver_nreel: 'Déclaré sous',
  codvar: 'Variété',
  refstat: 'Station',
  codgre: 'Groupe emballage',
  codpay: 'Pays',
  codmar: 'Marché',
  nommar: 'Marché',
  gest: 'Gestion (SU / NS)',
  famdef: 'Famille du défaut',
  culture: 'Culture',
  adresse: 'Adresse',
  adresse2: 'Adresse complémentaire',
  rue: 'Rue',
  ville: 'Ville',
  cp: 'Code postal',
  tel: 'Téléphone',
  fax: 'Fax',
  rep: 'Code externe',
  coment: 'Commentaire',
  pays: 'Pays (texte historique)',
  type: 'Référence article',
  nom: 'Nom',
  vildes: 'Destination',
  nompay: 'Pays',
  abrpay: 'Abréviation',
  nomgre: 'Groupe emballage',
  intdef: 'Défaut',
  destype: 'Type d’écart',
  articlesCount: 'Articles liés',
};
const visibleFields: Record<string, string[]> = {
  partenaire: [
    'nom',
    'type',
    'codpay',
    'ville',
    'pays',
    'rue',
    'adresse',
    'cp',
    'tel',
    'fax',
    'rep',
    'coment',
  ],
  destination: ['vildes', 'codpay', 'adresse', 'adresse2', 'nomFact'],
  pays: ['nompay', 'abrpay', 'codmar'],
  marche: ['nommar', 'gest'],
  grpemb: ['nomgre'],
  groupart: ['type', 'codgre'],
  defaut: ['intdef', 'famdef', 'culture'],
  typeecart: ['destype'],
  declaration_verger: ['refver_reel', 'refver_nreel', 'codvar', 'refstat'],
};
interface Result {
  available: boolean;
  columns: Column[];
  keys: string[];
  label: string;
  rows: Row[];
  displayRows?: Row[];
  total: number | null;
  reason: string;
  canWrite: boolean;
  editable: string[];
}
export function ComplementaryPanel({
  context,
  module,
  canWrite,
}: {
  context: Context;
  module: string;
  canWrite: boolean;
}) {
  const rights = usePermissions(module);
  const syncRights = usePermissions('sync');
  const [search, setSearch] = useState(''),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState<Row | null>(null),
    [creating, setCreating] = useState(false),
    [values, setValues] = useState<Record<string, string | null>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [confirmDelete, setConfirmDelete] = useState(false);
  const [syncKey, setSyncKey] = useState<Row | null>(null);
  const [notice, setNotice] = useState('');
  const result = useApi<Result>(
    `/contexts/${context.id}/pilot/${module}?${new URLSearchParams({ search, page: String(page) })}`,
  );
  const options = useApi<Record<string, { value: string; label: string }[]>>(
    `/contexts/${context.id}/pilot/${module}/options`,
  );
  const articles = useApi<Row[]>(
    module === 'grpemb' && selected
      ? `/contexts/${context.id}/pilot/grpemb/articles?codgre=${selected.codgre}`
      : null,
  );
  const protection = useApi<{
    editable: string[];
    deleteAllowed: boolean;
    reason: string;
    usages: { table: string; field: string; count: number; confirmed: boolean }[];
  }>(
    selected && result.data?.keys
      ? `/contexts/${context.id}/pilot/${module}/protection?key=${encodeURIComponent(JSON.stringify(Object.fromEntries(result.data.keys.map((k) => [k, selected[k]]))))}`
      : null,
  );
  const columns = (result.data?.columns ?? []).filter(
    (c) => !result.data?.keys.includes(c.name) && visibleFields[module]?.includes(c.name),
  );
  function open(row: Row | null) {
    setSelected(row);
    setCreating(!row);
    setValues(
      row
        ? {}
        : module === 'marche'
          ? { gest: 'NS' }
          : module === 'partenaire'
            ? { type: 'EXPORTATEUR' }
            : {},
    );
    setError('');
    setConfirmDelete(false);
  }
  async function save(remove = false) {
    setBusy(true);
    setError('');
    try {
      const saved = await api<{ status: string; key?: Row; message: string }>(
        `/contexts/${context.id}/pilot/${module}${remove ? '/delete' : ''}`,
        remove || creating ? 'POST' : 'PUT',
        {
          key: Object.fromEntries((result.data?.keys ?? []).map((k) => [k, selected?.[k]])),
          before: selected ?? {},
          values: remove ? {} : values,
        },
      );
      setSelected(null);
      setCreating(false);
      result.refresh();
      options.refresh();
      setNotice(saved.message);
      if (
        !remove &&
        saved.status === 'Applied' &&
        saved.key &&
        syncRights.modify &&
        context.isMaster &&
        module !== 'declaration_verger'
      )
        setSyncKey(saved.key);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement non confirmé');
    } finally {
      setBusy(false);
    }
  }
  const writable = canWrite && !!result.data?.canWrite;
  return (
    <>
      <PageHeading
        eyebrow="RÉFÉRENTIELS"
        title={names[module]}
        subtitle={`${context.station} · ${context.label}`}
      />
      <Paper withBorder p="md">
        <Group justify="space-between">
          <TextInput
            aria-label="Rechercher"
            placeholder="Rechercher un libellé…"
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
          />
          {writable && rights.add ? <Button onClick={() => open(null)}>Ajouter</Button> : null}
        </Group>
      </Paper>
      {notice ? <Alert mt="md">{notice}</Alert> : null}
      <State loading={result.loading} error={result.error} retry={result.refresh}>
        {result.data ? (
          <Stack mt="md">
            <Alert>{result.data.reason}</Alert>
            <Paper withBorder>
              <Badge m="md">{result.data.total ?? '—'} références</Badge>
              <Table.ScrollContainer minWidth={600}>
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Référence</Table.Th>
                      {columns.map((c) => (
                        <Table.Th key={c.name}>
                          {module === 'partenaire' && c.name === 'type'
                            ? 'Type de partenaire'
                            : (fields[c.name] ?? c.name)}
                        </Table.Th>
                      ))}
                      {module === 'grpemb' ? <Table.Th>Articles liés</Table.Th> : null}
                      <Table.Th />
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {result.data.rows.map((row, i) => (
                      <Table.Tr key={i}>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {result.data?.keys.map((k) => display(row[k])).join(' · ')}
                          </Text>
                        </Table.Td>
                        {columns.map((c) => (
                          <Table.Td key={c.name}>
                            {display(result.data?.displayRows?.[i]?.[c.name] ?? row[c.name])}
                          </Table.Td>
                        ))}
                        {module === 'grpemb' ? (
                          <Table.Td>
                            {display(result.data?.displayRows?.[i]?.articlesCount)}
                          </Table.Td>
                        ) : null}
                        <Table.Td>
                          <Button variant="subtle" size="compact-sm" onClick={() => open(row)}>
                            Fiche
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
              <Pagination
                m="md"
                value={page}
                onChange={setPage}
                total={Math.max(1, Math.ceil((result.data.total ?? 0) / 25))}
              />
            </Paper>
          </Stack>
        ) : null}
      </State>
      <Modal
        opened={creating || !!selected}
        onClose={() => {
          if (!busy) {
            setSelected(null);
            setCreating(false);
          }
        }}
        title={creating ? 'Créer · ' + names[module] : names[module]}
        size="lg"
        closeOnEscape={!busy}
        closeOnClickOutside={!busy}
      >
        <Stack>
          <Alert>{result.data?.reason}</Alert>
          {selected ? (
            <State loading={protection.loading} error={protection.error} retry={protection.refresh}>
              {protection.data ? (
                <Alert color={protection.data.editable.length ? 'forest' : 'orange'}>
                  {protection.data.reason}
                  {protection.data.usages.map((u) => (
                    <Text size="xs" key={u.table + u.field}>
                      {u.count} utilisation(s) · {u.table}.{u.field}
                      {u.confirmed ? '' : ' — porteur de code à valider'}
                    </Text>
                  ))}
                </Alert>
              ) : null}
            </State>
          ) : null}
          {(result.data?.keys ?? []).map((k) => {
            const column = result.data?.columns.find((c) => c.name === k);
            return (
              <TextInput
                key={k}
                label={`Référence historique (${k})`}
                description={
                  creating
                    ? 'Facultative : attribuée par ZAOUIA si laissée vide.'
                    : 'Identifiant non modifiable.'
                }
                value={values[k] ?? String(selected?.[k] ?? '')}
                readOnly={!creating || !!column?.generated}
                disabled={busy}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setValues((old) => {
                    const next = { ...old };
                    if (value) next[k] = value;
                    else delete next[k];
                    return next;
                  });
                }}
              />
            );
          })}
          {columns.map((c) => {
            const relation =
              options.data?.[c.name] ??
              ([
                'codgre',
                'codpay',
                'codmar',
                'culture',
                'refver_reel',
                'refver_nreel',
                'codvar',
                'refstat',
              ].includes(c.name)
                ? []
                : undefined);
            const editable =
              writable &&
              (creating
                ? rights.add && (result.data?.editable.includes(c.name) || !!relation)
                : rights.modify && !!protection.data?.editable.includes(c.name));
            const value = Object.prototype.hasOwnProperty.call(values, c.name)
              ? (values[c.name] ?? '')
              : String(selected?.[c.name] ?? '');
            if (c.name === 'famdef' || (module === 'marche' && c.name === 'gest'))
              return (
                <Autocomplete
                  key={c.name}
                  label={fields[c.name]}
                  value={value}
                  disabled={!editable || busy}
                  description={
                    c.name === 'gest'
                      ? 'SU : subventionné · NS : non subventionné · autre code de 2 caractères maximum'
                      : 'Familles existantes ou nouvelle famille'
                  }
                  maxLength={c.maxLength ?? undefined}
                  data={
                    c.name === 'gest'
                      ? ['SU', 'NS', ...(!['SU', 'NS', ''].includes(value) ? [value] : [])]
                      : (options.data?.famdef ?? []).map((v) => v.value)
                  }
                  onChange={(v) => setValues((old) => ({ ...old, [c.name]: v }))}
                />
              );
            if (module === 'partenaire' && c.name === 'type')
              return (
                <Select
                  key={c.name}
                  label="Type de partenaire"
                  searchable
                  data={[
                    ...new Set([
                      'EXPORTATEUR',
                      'T.ETRANGER',
                      'T.MAROC',
                      'TRANSITAIRE',
                      ...(value ? [value] : []),
                    ]),
                  ]}
                  value={value || null}
                  disabled={!editable || busy}
                  onChange={(v) => setValues((old) => ({ ...old, type: v }))}
                />
              );
            if (relation)
              return (
                <Select
                  key={c.name}
                  label={fields[c.name] ?? c.name}
                  searchable
                  limit={50}
                  data={relation}
                  value={value || null}
                  disabled={!editable || busy}
                  clearable={c.nullable}
                  onChange={(v) => setValues((old) => ({ ...old, [c.name]: v }))}
                  error={options.error}
                />
              );
            if (creating && !editable) return null;
            return (
              <TextInput
                key={c.name}
                label={fields[c.name] ?? c.name}
                value={value}
                maxLength={c.maxLength ?? undefined}
                readOnly={!editable}
                disabled={busy}
                onChange={(e) => {
                  const next = e.currentTarget.value;
                  setValues((old) => ({ ...old, [c.name]: next }));
                }}
              />
            );
          })}
          {module === 'grpemb' && selected ? (
            <Paper withBorder p="md">
              <Text fw={700}>Articles liés</Text>
              {articles.error ? (
                <Alert color="orange">{articles.error}</Alert>
              ) : articles.data?.length ? (
                articles.data.map((a, i) => <Text key={i}>{display(a.type)}</Text>)
              ) : (
                <Text c="dimmed">Aucun article disponible dans cette liste.</Text>
              )}
            </Paper>
          ) : null}
          {error ? <Alert color="red">{error}</Alert> : null}
          <Group justify="flex-end">
            {writable &&
            (creating ? rights.add : rights.modify && !!protection.data?.editable.length) ? (
              <Button
                loading={busy}
                disabled={!Object.keys(values).length}
                onClick={() => void save()}
              >
                Enregistrer
              </Button>
            ) : null}
            {!creating && rights.delete ? (
              <Button
                color="red"
                variant="light"
                disabled={!writable || !protection.data?.deleteAllowed || busy}
                onClick={() => setConfirmDelete(true)}
              >
                Supprimer
              </Button>
            ) : null}
          </Group>
          {confirmDelete ? (
            <Alert color="red">
              <Stack>
                <Checkbox
                  label="Je confirme la suppression de cette référence, si aucune dépendance ne la protège."
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.currentTarget.checked)}
                />
                <Button color="red" loading={busy} onClick={() => void save(true)}>
                  Vérifier les dépendances et supprimer
                </Button>
              </Stack>
            </Alert>
          ) : null}
        </Stack>
      </Modal>
      {syncKey ? (
        <FormSyncOffer
          context={context}
          name={module}
          recordKey={syncKey}
          onClose={() => setSyncKey(null)}
        />
      ) : null}
    </>
  );
}
