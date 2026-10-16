import { RecordSummary } from './RecordSummary';
import { SyncReview } from './SyncReview';
import type { Presentation } from './api';
import {
  Alert,
  Checkbox,
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
import type { Column, Context, Entity, Row, Value } from './api';
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
    { title: 'Identification', fields: ['refpar', 'refver', 'numcul'] },
    { title: 'Culture', fields: ['codvar', 'codsvar', 'codvar2', 'souvar2'] },
    {
      title: 'Plantation',
      fields: ['suppar', 'nbrarb', 'ecarte', 'espace', 'portgref', 'dtepln', 'dtearr'],
    },
    {
      title: 'Irrigation / protection',
      fields: ['irriga', 'traite', 'certif', 'couverture', 'typefilet'],
    },
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
  error,
}: {
  column: Column;
  context: Context;
  value: Value;
  onChange: (value: Value) => void;
  disabled: boolean;
  variety?: Value;
  error?: string;
}) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 250);
  const table = references[column.name];
  const query = new URLSearchParams({
    search: debounced,
    ...(value === null ? {} : { selected: String(value) }),
  });
  if (table === 'souvar') {
    query.set('variety', String(variety ?? 0));
  }
  const result = useApi<Row[]>(`/contexts/${context.id}/lookups/${table}?${query}`);
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
      (result.data ?? [])
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
      withAsterisk={!column.nullable && !column.generated}
      error={error || result.error || undefined}
      description={table === 'souvar' ? 'Filtrée sur la variété choisie' : undefined}
    />
  );
}

function Field({
  entityName,
  column,
  context,
  row,
  disabled,
  error,
  onChange,
}: {
  entityName: string;
  column: Column;
  context: Context;
  row: Row;
  disabled: boolean;
  error?: string;
  onChange: (field: string, value: Value) => void;
}) {
  const value = row[column.name] ?? null;
  const name = column.name;
  if (name === 'refsta')
    return (
      <div>
        <Text size="sm" fw={500}>
          Station locale
        </Text>
        <Text fw={650} mt={6}>
          {context.station}
        </Text>
        <Text c="dimmed" size="xs">
          Référence station {display(value)} · lecture seule
        </Text>
      </div>
    );
  if (references[name] && references[name] !== entityName)
    return (
      <ReferenceInput
        column={column}
        error={error}
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
        withAsterisk={!column.nullable && !column.generated}
        error={error}
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
        withAsterisk={!column.nullable && !column.generated}
        error={error}
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
        withAsterisk={!column.nullable && !column.generated}
        error={error}
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
      withAsterisk={!column.nullable && !column.generated}
      error={error}
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
    : `/contexts/${context.id}/entities/${entity.name}/presentation?key=${keyQuery(entity, initial)}`;
  const result = useApi<Presentation>(query);
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
        Retour
      </Button>
      <State loading={result.loading} error={result.error} retry={result.refresh}>
        {creating || result.data ? (
          <RecordForm
            key={JSON.stringify(result.data ?? initial)}
            context={context}
            entity={entity}
            catalog={catalog}
            source={result.data?.record ?? initial}
            presentation={result.data}
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
  presentation,
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
  presentation: Presentation | null;
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
  const [syncChecked, setSyncChecked] = useState(false);
  const [syncJob, setSyncJob] = useState<string | null>(null);
  const [savedPending, setSavedPending] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
        field !== 'refsta' &&
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
    setFieldErrors((previous) => ({ ...previous, [field]: '' }));
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
      const response = await api<{ id: string; message: string; synchronization?: string }>(
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
      if (synchronize && response.synchronization === 'Pending') {
        try {
          const jobs = await api<{ id: string; change_id: string }[]>(
            `/contexts/${context.id}/sync`,
          );
          const job = jobs.find((j) => j.change_id === response.id);
          if (job) setSyncJob(job.id);
          else
            setSavedPending(
              'ZAOUIA enregistré. La demande DIAF reste en attente dans Synchronisation.',
            );
        } catch {
          setSavedPending(
            'ZAOUIA enregistré. La file DIAF est momentanément indisponible ; reprenez depuis Synchronisation.',
          );
        }
      } else if (response.synchronization === 'Reconciliation') setSavedPending(response.message);
      else onSaved();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Enregistrement impossible';
      setError(message);
      const match = message.match(/^(\w+)(?:\s*:|\s+est obligatoire|\s+obligatoire)/);
      if (match) setFieldErrors({ [match[1]]: message });
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
            {context.readOnly ? (
              <Badge color="gray">Archive · Lecture seule</Badge>
            ) : context.isMaster ? (
              <Badge color="forest" variant="light">
                ZAOUIA · Maître
              </Badge>
            ) : (
              <Badge color="forest" variant="light">
                DIAF · Destination
              </Badge>
            )}
            {comparison.data ? (
              <Group gap={5}>
                <Text size="xs" c="dimmed">
                  DIAF
                </Text>
                <Status status={comparison.data.status} />
              </Group>
            ) : null}
            {!canWrite ? (
              <Badge color="gray" leftSection={<IconLock size={12} />}>
                Lecture seule
              </Badge>
            ) : null}
          </Group>
        }
      />
      {!creating && presentation && ['adherent', 'verger', 'parcelle'].includes(entity.name) ? (
        <RecordSummary entity={entity} data={presentation} onOpen={onOpen} />
      ) : null}
      <Tabs defaultValue="info">
        <Tabs.List mb="lg">
          <Tabs.Tab value="info" leftSection={<IconPlant2 size={16} />}>
            Vue générale
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
                    return column && !(creating && column.generated) ? (
                      <Field
                        entityName={entity.name}
                        key={name}
                        column={column}
                        context={context}
                        row={row}
                        disabled={
                          name === 'refsta' ||
                          !canWrite ||
                          (!creating && (entity.keys.includes(name) || column.generated)) ||
                          (creating && column.generated)
                        }
                        error={fieldErrors[name]}
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
                  onClick={() => {
                    const errors: Record<string, string> = {};
                    for (const c of entity.columns)
                      if (
                        !c.generated &&
                        !c.nullable &&
                        (!c.definition.includes('DEFAULT') || entity.keys.includes(c.name)) &&
                        (row[c.name] === null || row[c.name] === undefined)
                      )
                        errors[c.name] = 'Ce champ est obligatoire.';
                    setFieldErrors(errors);
                    if (!Object.keys(errors).length) setConfirm(true);
                  }}
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
          <Stack mb="md">
            <Checkbox
              label="Synchroniser également avec DIAF"
              checked={syncChecked}
              onChange={(e) => setSyncChecked(e.currentTarget.checked)}
              disabled={comparison.data?.status === 'NotConfigured'}
            />
            <Text size="xs" c="dimmed">
              La référence station est locale : la valeur DIAF sera conservée. Une comparaison DIAF
              précède son application.
            </Text>
          </Stack>
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
            loading={saving}
            onClick={() => void save(!creating && !!context.isMaster && syncChecked)}
          >
            {creating
              ? 'Créer'
              : syncChecked
                ? 'Enregistrer + synchroniser DIAF'
                : `Enregistrer ${context.station}`}
          </Button>
        </Group>
      </Modal>
      {syncJob ? (
        <SyncReview
          jobId={syncJob}
          onClose={() => {
            setSyncJob(null);
            onSaved();
          }}
        />
      ) : null}
      <Modal opened={!!savedPending} onClose={onSaved} title="Enregistrement ZAOUIA">
        <Alert color="orange">{savedPending}</Alert>
        <Button mt="md" onClick={onSaved}>
          Reprendre plus tard
        </Button>
      </Modal>
    </>
  );
}
