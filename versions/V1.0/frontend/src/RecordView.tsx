import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconCheck, IconLock, IconPlant2 } from './icons';
import { useDebouncedValue } from '@mantine/hooks';
import { useState } from 'react';
import type { Column, Context, Entity, Page, Row, Value } from './api';
import { api, display, keyOf, keyQuery, labels, titles, useApi } from './api';
import { DiffTable, PageHeading, State, Status } from './components';
import { EntityList } from './EntityList';

const groups: Record<string, { title: string; fields: string[] }[]> = {
  verger: [
    { title: 'Informations générales', fields: ['refver', 'nomver', 'refadh', 'refsta', 'letver'] },
    { title: 'Localisation', fields: ['region', 'locver', 'douar', 'geoloc'] },
    { title: 'Exploitation', fields: ['supver', 'technicien', 'tecver', 'coment', 'libelle'] },
    { title: 'Certification', fields: ['codggn', 'certif'] },
    { title: 'État', fields: ['blocker'] },
  ],
  parcelle: [
    { title: 'Identification', fields: ['idparcelle', 'refpar', 'numcul', 'refver'] },
    { title: 'Culture', fields: ['codvar', 'codsvar', 'codvar2', 'souvar2'] },
    {
      title: 'Plantation',
      fields: ['suppar', 'nbrarb', 'ecarte', 'espace', 'portgref', 'dtepln', 'dtearr'],
    },
    { title: 'Irrigation', fields: ['irriga'] },
    { title: 'Protection', fields: ['traite', 'certif', 'couverture', 'typefilet'] },
    { title: 'Localisation', fields: ['latitude', 'longitude'] },
    { title: 'Estimation', fields: ['estimation'] },
  ],
  adherent: [
    { title: 'Identité', fields: ['refadh', 'nomadh', 'cinadh', 'Type', 'nompro', 'txtref'] },
    { title: 'Coordonnées', fields: ['adradh', 'viladh', 'teladh', 'faxadh'] },
    { title: 'Certification', fields: ['certif'] },
  ],
  variete: [
    {
      title: 'Variété & rattachement',
      fields: ['codvar', 'nomvar', 'codcul', 'codgrv', 'nomimp', 'prixmoy', 'catII'],
    },
  ],
  culture: [{ title: 'Culture', fields: ['codcul', 'nomcul'] }],
  grpvar: [{ title: 'Groupe de variétés', fields: ['codgrv', 'nomgrv'] }],
  souvar: [{ title: 'Sous-variété', fields: ['codsvar', 'nomsvar', 'codvar'] }],
};
const references: Record<string, string> = {
  refadh: 'adherent',
  refver: 'verger',
  codvar: 'variete',
  codvar2: 'variete',
  codcul: 'culture',
  codgrv: 'grpvar',
  codsvar: 'souvar',
  souvar2: 'souvar',
};

function ReferenceInput({
  column,
  context,
  value,
  onChange,
  disabled,
  variety,
}: {
  column: Column;
  context: Context;
  value: Value;
  onChange: (value: Value) => void;
  disabled: boolean;
  variety?: Value;
}) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 250);
  const table = references[column.name];
  const query = new URLSearchParams({ pageSize: '100', search: debounced });
  if (table === 'souvar') {
    query.set('filter', 'codvar');
    query.set('value', String(variety ?? 0));
  }
  const result = useApi<Page>(`/contexts/${context.id}/entities/${table}?${query}`);
  const id =
    table === 'souvar'
      ? 'codsvar'
      : table === 'adherent'
        ? 'refadh'
        : table === 'verger'
          ? 'refver'
          : table === 'culture'
            ? 'codcul'
            : table === 'grpvar'
              ? 'codgrv'
              : 'codvar';
  const name =
    table === 'souvar'
      ? 'nomsvar'
      : table === 'adherent'
        ? 'nomadh'
        : table === 'verger'
          ? 'nomver'
          : table === 'culture'
            ? 'nomcul'
            : table === 'grpvar'
              ? 'nomgrv'
              : 'nomvar';
  const options = [
    ...new Map(
      (result.data?.rows ?? [])
        .filter((r) => r[id] !== null)
        .map((r) => [
          String(r[id]),
          { value: String(r[id]), label: `${display(r[name])} · ${r[id]}` },
        ]),
    ).values(),
  ];
  if (value !== null && !options.some((o) => o.value === String(value)))
    options.unshift({ value: String(value), label: `Référence ${value}` });
  return (
    <Select
      label={labels[column.name]}
      data={options}
      value={value === null ? null : String(value)}
      onChange={(v) => onChange(v === null ? null : Number(v))}
      searchable
      clearable={column.nullable}
      onSearchChange={setSearch}
      searchValue={search}
      disabled={disabled || (table === 'souvar' && !variety)}
      nothingFoundMessage={result.loading ? 'Chargement…' : 'Aucune référence'}
      error={result.error || undefined}
      description={table === 'souvar' ? 'Filtrée sur la variété choisie' : undefined}
    />
  );
}

function Field({
  column,
  context,
  row,
  disabled,
  onChange,
}: {
  column: Column;
  context: Context;
  row: Row;
  disabled: boolean;
  onChange: (field: string, value: Value) => void;
}) {
  const value = row[column.name] ?? null;
  const name = column.name;
  if (references[name] && !disabled)
    return (
      <ReferenceInput
        column={column}
        context={context}
        value={value}
        onChange={(v) => onChange(name, v)}
        disabled={disabled}
        variety={row[name === 'souvar2' ? 'codvar2' : 'codvar']}
      />
    );
  if (column.numeric)
    return (
      <NumberInput
        label={labels[name] ?? name}
        value={value === null ? '' : Number(value)}
        onChange={(v) => onChange(name, v === '' ? null : Number(v))}
        disabled={disabled}
        allowDecimal={
          !column.definition.startsWith('int') && !column.definition.startsWith('smallint')
        }
      />
    );
  if (column.date && !column.generated)
    return (
      <TextInput
        type="date"
        label={labels[name]}
        value={value === null ? '' : String(value).slice(0, 10)}
        onChange={(e) => onChange(name, e.currentTarget.value || null)}
        disabled={disabled}
      />
    );
  if (name === 'blocker')
    return (
      <Select
        label="Blocage du verger"
        data={[
          { value: 'N', label: 'N · Valeur historique N' },
          { value: 'O', label: 'O · Valeur historique O' },
          { value: 'Y', label: 'Y · Valeur historique Y' },
        ]}
        value={value === null ? null : String(value)}
        onChange={(v) => onChange(name, v)}
        disabled={disabled}
        description="Le sens exact des codes de blocage doit être confirmé avec l’exploitation."
      />
    );
  if (name === 'libelle' || name === 'adradh')
    return (
      <Textarea
        label={labels[name]}
        value={value === null ? '' : String(value)}
        onChange={(e) => onChange(name, e.currentTarget.value || null)}
        disabled={disabled}
        maxLength={column.maxLength ?? undefined}
        autosize
        minRows={2}
      />
    );
  return (
    <TextInput
      label={labels[name] ?? name}
      value={value === null ? '' : String(value)}
      onChange={(e) =>
        onChange(
          name,
          e.currentTarget.value === '' && column.nullable ? null : e.currentTarget.value,
        )
      }
      disabled={disabled}
      maxLength={column.maxLength ?? undefined}
      description={
        name === 'refsta' ? 'Propre à la station · conservée lors de la synchronisation' : undefined
      }
    />
  );
}

export function RecordView({
  context,
  entity,
  catalog,
  initial,
  creating,
  canWrite,
  onBack,
  onOpen,
  onCreate,
  onSaved,
}: {
  context: Context;
  entity: Entity;
  catalog: Entity[];
  initial: Row;
  creating: boolean;
  canWrite: boolean;
  onBack: () => void;
  onOpen: (name: string, row: Row) => void;
  onCreate: (name: string, row?: Row) => void;
  onSaved: () => void;
}) {
  const query = creating
    ? null
    : `/contexts/${context.id}/entities/${entity.name}/record?key=${keyQuery(entity, initial)}`;
  const result = useApi<Row>(query);
  return (
    <>
      <Button
        variant="subtle"
        color="gray"
        size="sm"
        leftSection={<IconArrowLeft size={16} />}
        mb="md"
        onClick={onBack}
      >
        Retour à la liste
      </Button>
      <State loading={result.loading} error={result.error} retry={result.refresh}>
        {creating || result.data ? (
          <RecordForm
            key={JSON.stringify(result.data ?? initial)}
            context={context}
            entity={entity}
            catalog={catalog}
            source={result.data ?? initial}
            creating={creating}
            canWrite={canWrite}
            onOpen={onOpen}
            onCreate={onCreate}
            onSaved={() => {
              result.refresh();
              onSaved();
            }}
          />
        ) : null}
      </State>
    </>
  );
}

function RecordForm({
  context,
  entity,
  catalog,
  source,
  creating,
  canWrite,
  onOpen,
  onCreate,
  onSaved,
}: {
  context: Context;
  entity: Entity;
  catalog: Entity[];
  source: Row;
  creating: boolean;
  canWrite: boolean;
  onOpen: (name: string, row: Row) => void;
  onCreate: (name: string, row?: Row) => void;
  onSaved: () => void;
}) {
  const [row, setRow] = useState<Row>({
    ...source,
    ...(creating && entity.name === 'verger' ? { refsta: context.localRefsta } : {}),
  });
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dependencies, setDependencies] = useState<string | null>(null);
  const comparison = useApi<{ status: string }>(
    creating || !context.isMaster
      ? null
      : `/contexts/${context.id}/entities/${entity.name}/comparison?key=${keyQuery(entity, source)}`,
  );
  const changes = Object.entries(row)
    .filter(
      ([field, value]) =>
        !entity.keys.includes(field) &&
        !entity.columns.find((c) => c.name === field)?.generated &&
        value !== source[field],
    )
    .map(([field, value]) => ({ field, before: source[field], after: value }));
  const child =
    entity.name === 'adherent'
      ? { name: 'verger', field: 'refadh' }
      : entity.name === 'verger'
        ? { name: 'parcelle', field: 'refver' }
        : entity.name === 'variete'
          ? { name: 'souvar', field: 'codvar' }
          : entity.name === 'culture'
            ? { name: 'variete', field: 'codcul' }
            : entity.name === 'grpvar'
              ? { name: 'variete', field: 'codgrv' }
              : null;
  function change(field: string, value: Value) {
    setRow((previous) => ({
      ...previous,
      [field]: value,
      ...(field === 'codvar' && entity.name === 'parcelle' ? { codsvar: null } : {}),
      ...(field === 'codvar2' ? { souvar2: 0 } : {}),
    }));
  }
  async function save(synchronize: boolean) {
    setSaving(true);
    setError('');
    try {
      const response = await api<{ message: string }>(
        `/contexts/${context.id}/entities/${entity.name}${creating ? '' : '/record'}`,
        creating ? 'POST' : 'PUT',
        creating
          ? {
              values: Object.fromEntries(
                Object.entries(row).filter(
                  ([field]) => !entity.columns.find((c) => c.name === field)?.generated,
                ),
              ),
            }
          : {
              key: keyOf(entity, source),
              before: source,
              values: Object.fromEntries(changes.map((c) => [c.field, c.after])),
              synchronize,
            },
      );
      notifications.show({
        title: 'Enregistrement terminé',
        message: response.message,
        color: 'forest',
      });
      setConfirm(false);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  }
  async function inspectDependencies() {
    try {
      const d = await api<{ reason: string; dependencies: { table: string; count: number }[] }>(
        `/contexts/${context.id}/entities/${entity.name}/dependencies?key=${keyQuery(entity, source)}`,
      );
      setDependencies(
        `${d.reason}\n\n${d.dependencies.map((x) => `${x.table} : ${x.count}`).join('\n') || 'Aucune correspondance détectée.'}`,
      );
    } catch (e) {
      setDependencies(e instanceof Error ? e.message : 'Erreur');
    }
  }
  const sections = groups[entity.name];
  return (
    <>
      <PageHeading
        eyebrow={`${titles[entity.name].toUpperCase()} / ${creating ? 'NOUVELLE FICHE' : entity.keys.map((k) => display(source[k])).join(' · ')}`}
        title={creating ? `Créer · ${titles[entity.name]}` : display(source[entity.label])}
        subtitle={
          creating
            ? 'Saisissez les identifiants historiques explicitement.'
            : 'Informations du référentiel et relations métier.'
        }
        action={
          <Group>
            {context.isMaster ? (
              <Badge color="forest" variant="light">
                ZAOUIA · Maître
              </Badge>
            ) : null}
            {comparison.data ? <Status status={comparison.data.status} /> : null}
            {!canWrite ? (
              <Badge color="gray" leftSection={<IconLock size={12} />}>
                Lecture seule
              </Badge>
            ) : null}
          </Group>
        }
      />
      <Tabs defaultValue="info">
        <Tabs.List mb="lg">
          <Tabs.Tab value="info" leftSection={<IconPlant2 size={16} />}>
            Informations
          </Tabs.Tab>
          {child && !creating ? <Tabs.Tab value="children">{titles[child.name]}</Tabs.Tab> : null}
          {!creating ? <Tabs.Tab value="history">Dépendances historiques</Tabs.Tab> : null}
        </Tabs.List>
        <Tabs.Panel value="info">
          <Stack gap="lg">
            {sections.map((section) => (
              <Paper key={section.title} withBorder p="xl">
                <Group justify="space-between" mb="lg">
                  <Text fw={700}>{section.title}</Text>
                  <Text size="xs" c="dimmed">
                    {context.station}
                  </Text>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                  {section.fields.map((name) => {
                    const column = entity.columns.find((c) => c.name === name);
                    return column ? (
                      <Field
                        key={name}
                        column={column}
                        context={context}
                        row={row}
                        disabled={
                          !canWrite ||
                          (!creating && (entity.keys.includes(name) || column.generated)) ||
                          (creating && column.generated)
                        }
                        onChange={change}
                      />
                    ) : null;
                  })}
                </SimpleGrid>
              </Paper>
            ))}
            <Group justify="space-between" className="save-bar">
              <Text size="sm" c="dimmed">
                {creating
                  ? 'Création dans la station sélectionnée'
                  : `${changes.length} champ(s) modifié(s)`}
              </Text>
              {canWrite ? (
                <Button
                  leftSection={<IconCheck size={17} />}
                  disabled={!creating && changes.length === 0}
                  onClick={() => setConfirm(true)}
                >
                  Vérifier et enregistrer
                </Button>
              ) : null}
            </Group>
          </Stack>
        </Tabs.Panel>
        {child && !creating ? (
          <Tabs.Panel value="children">
            <EntityList
              context={context}
              entity={catalog.find((e) => e.name === child.name)!}
              canWrite={canWrite}
              onOpen={onOpen}
              onCreate={onCreate}
              filter={{ field: child.field, value: String(source[child.field]) }}
              compact
            />
          </Tabs.Panel>
        ) : null}
        <Tabs.Panel value="history">
          <Paper withBorder p="xl">
            <Text fw={700} mb="sm">
              Utilisation dans les applications historiques
            </Text>
            <Text c="dimmed" size="sm" mb="md">
              Les suppressions physiques sont bloquées. Ce contrôle recherche les dépendances
              visibles dans les tables de cette base.
            </Text>
            <Button variant="light" onClick={() => void inspectDependencies()}>
              Analyser les dépendances
            </Button>
            {dependencies ? (
              <Text mt="lg" size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {dependencies}
              </Text>
            ) : null}
          </Paper>
        </Tabs.Panel>
      </Tabs>
      <Modal
        opened={confirm}
        onClose={() => {
          if (!saving) {
            setConfirm(false);
            setError('');
          }
        }}
        title={
          <Text fw={700}>
            {creating
              ? 'Confirmer la création'
              : `Modification · ${display(source[entity.keys[0]])}`}
          </Text>
        }
        size="lg"
        closeOnClickOutside={!saving}
      >
        {creating ? (
          <Alert color="forest" mb="lg">
            L’enregistrement sera créé dans {context.station}. Les clés saisies resteront protégées.
          </Alert>
        ) : (
          <DiffTable differences={changes} />
        )}
        <Divider my="lg" />
        <Group mb="md">
          <Badge color="forest">{context.station}</Badge>
          <Text size="sm">{creating ? 'Nouvel enregistrement' : 'Sera mis à jour'}</Text>
        </Group>
        {!creating && context.isMaster ? (
          <Alert color="orange" mb="md">
            Appliquer également ces modifications à DIAF ? Son refsta sera conservé. Un second
            aperçu DIAF vous sera présenté dans Synchronisation avant application.
          </Alert>
        ) : null}
        {error ? (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        ) : null}
        <Group justify="flex-end">
          <Button variant="default" disabled={saving} onClick={() => setConfirm(false)}>
            Annuler
          </Button>
          <Button
            variant={context.isMaster && !creating ? 'light' : 'filled'}
            loading={saving}
            onClick={() => void save(false)}
          >
            {creating ? 'Créer' : `${context.station} uniquement`}
          </Button>
          {!creating && context.isMaster ? (
            <Button loading={saving} onClick={() => void save(true)}>
              Enregistrer + DIAF
            </Button>
          ) : null}
        </Group>
      </Modal>
    </>
  );
}
