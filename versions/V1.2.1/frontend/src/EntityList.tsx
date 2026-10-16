import {
  Badge,
  Checkbox,
  Box,
  Stack,
  SimpleGrid,
  Button,
  Group,
  Pagination,
  Paper,
  Select,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconChevronRight, IconPlus, IconSearch } from './icons';
import { useDebouncedValue } from '@mantine/hooks';
import { useState } from 'react';
import type { Context, Entity, Page, Row } from './api';
import { area, display, keyOf, labels, titles, useApi } from './api';
import { PageHeading, State } from './components';
import { ListKpis } from './ListKpis';
import { BulkDelete } from './BulkDelete';
const columns: Record<string, string[]> = {
  adherent: ['refadh', 'nomadh', 'viladh', 'teladh', 'certif'],
  verger: ['refver', 'nomver', 'refadh', 'region', 'supver', 'parcellesCount', 'certif', 'blocker'],
  parcelle: ['refpar', 'refver', 'cultureName', 'codvar', 'codsvar', 'suppar', 'nbrarb'],
  culture: ['codcul', 'nomcul'],
  grpvar: ['codgrv', 'nomgrv'],
  variete: ['codvar', 'nomvar', 'codcul', 'codgrv'],
  souvar: ['codsvar', 'nomsvar', 'codvar'],
};
export function EntityList({
  context,
  entity,
  canWrite,
  onOpen,
  onCreate,
  filter,
  compact = false,
}: {
  context: Context;
  entity: Entity;
  canWrite: boolean;
  onOpen: (entity: string, row: Row) => void;
  onCreate: (entity: string, initial?: Row) => void;
  filter?: { field: string; value: string };
  compact?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 250);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(entity.label);
  const [descending, setDescending] = useState(false);
  const [certified, setCertified] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ scope: string; keys: string[] }>({
    scope: '',
    keys: [],
  });
  const [deletion, setDeletion] = useState<Row[] | null>(null);
  const [revision, setRevision] = useState(0);
  const query = new URLSearchParams({
    presentation: 'true',
    search: debounced,
    page: String(page),
    pageSize: '25',
    sort,
    descending: String(descending),
  });
  if (filter) {
    query.set('filter', filter.field);
    query.set('value', filter.value);
  } else if (certified && entity.name === 'verger') {
    query.set('filter', 'certif');
    query.set('value', certified);
  }
  const result = useApi<Page>(`/contexts/${context.id}/entities/${entity.name}?${query}`);
  const scope = `${context.id}/${entity.name}/${query}/${search}/${revision}`;
  const identity = (row: Row) => JSON.stringify(keyOf(entity, row));
  const visible = result.loading || result.error ? [] : (result.data?.rows ?? []);
  const selectedKeys = selected.scope === scope ? selected.keys : [];
  const selectedRows = visible.filter((row) => selectedKeys.includes(identity(row)));
  const canSelect = canWrite && !context.readOnly && ['verger', 'parcelle'].includes(entity.name);
  const allSelected = visible.length > 0 && selectedRows.length === visible.length;
  function toggle(row: Row, checked: boolean) {
    const key = identity(row);
    setSelected({
      scope,
      keys: checked ? [...new Set([...selectedKeys, key])] : selectedKeys.filter((k) => k !== key),
    });
  }
  const selectPage = (
    <Checkbox
      aria-label="Sélectionner les lignes visibles de cette page"
      checked={allSelected}
      indeterminate={selectedRows.length > 0 && !allSelected}
      disabled={!visible.length}
      onChange={(e) =>
        setSelected({ scope, keys: e.currentTarget.checked ? visible.map(identity) : [] })
      }
    />
  );
  const fields = columns[entity.name].filter(
    (f) => !(f === 'refver' && filter?.field === 'refver'),
  );
  const names: Record<string, string> = {
    refadh: 'adherentName',
    refver: 'vergerName',
    codvar: 'varietyName',
    codsvar: 'subvarietyName',
    codcul: 'cultureName',
    codgrv: 'groupName',
  };
  function cell(row: Row, field: string) {
    if (['suppar', 'supver'].includes(field))
      return (
        <Text size="sm" ta="right">
          {area(row[field])}
        </Text>
      );
    if (field === 'parcellesCount' || field === 'nbrarb')
      return (
        <Text size="sm" ta="right">
          {display(row[field] ?? (field === 'parcellesCount' ? 0 : null))}
        </Text>
      );
    const name = names[field];
    if (name && row[name])
      return (
        <div>
          <Text size="sm" fw={500}>
            {display(row[name])}
          </Text>
          <Text size="xs" c="dimmed">
            Réf. {display(row[field])}
          </Text>
        </div>
      );
    if (field === 'cultureName')
      return (
        <div>
          <Text size="sm">{display(row[field])}</Text>
          <Text size="xs" c="dimmed">
            Code {display(row.cultureCode)} · N° {display(row.numcul)}
          </Text>
        </div>
      );
    return <Text size="sm">{display(row[field])}</Text>;
  }
  function order(field: string) {
    setDescending(sort === field ? !descending : false);
    setSort(field);
    setPage(1);
  }
  return (
    <>
      {!compact ? (
        <PageHeading
          eyebrow={
            ['adherent', 'verger', 'parcelle'].includes(entity.name)
              ? 'AGRICULTEURS'
              : 'PATRIMOINE VARIÉTAL'
          }
          title={titles[entity.name]}
          subtitle="Un référentiel partagé, des identifiants historiques préservés."
        />
      ) : null}
      {['adherent', 'verger', 'parcelle'].includes(entity.name) ? (
        <ListKpis key={revision} context={context} name={entity.name} query={query} />
      ) : null}
      <Paper withBorder className="list-panel">
        {canSelect ? (
          <Group p="md">
            <Box hiddenFrom="sm">{selectPage}</Box>
            <Text size="sm">{selectedRows.length} sélectionné(s) sur cette page</Text>
            {selectedRows.length > 0 ? (
              <Button color="red" variant="light" onClick={() => setDeletion(selectedRows)}>
                Supprimer la sélection
              </Button>
            ) : null}
          </Group>
        ) : null}
        <Group justify="space-between" p="lg">
          <Group>
            <TextInput
              aria-label="Rechercher"
              placeholder={`Rechercher ${titles[entity.name].toLowerCase()}…`}
              leftSection={<IconSearch size={18} />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
              w={{ base: '100%', sm: 300 }}
            />
            {entity.name === 'verger' && !filter ? (
              <Select
                aria-label="Certification"
                placeholder="Certification"
                clearable
                data={['OUI', 'NON']}
                value={certified}
                onChange={(v) => {
                  setCertified(v);
                  setPage(1);
                }}
                w={155}
              />
            ) : null}
          </Group>
          <Group>
            <Badge color="gray" variant="light">
              {result.data?.total ?? '…'} références
            </Badge>
            {result.data?.summary ? (
              <Text size="sm" fw={600}>
                {area(result.data.summary.surface)} au total
              </Text>
            ) : null}
            {canWrite ? (
              <Button
                size="sm"
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  onCreate(
                    entity.name,
                    filter
                      ? {
                          [filter.field]: Number.isNaN(Number(filter.value))
                            ? filter.value
                            : Number(filter.value),
                        }
                      : undefined,
                  )
                }
              >
                Ajouter
              </Button>
            ) : null}
          </Group>
        </Group>
        <State
          loading={result.loading}
          error={result.error}
          empty={result.data?.total === 0}
          retry={result.refresh}
        >
          <Box hiddenFrom="sm">
            <Stack gap="sm" p="md">
              {result.data?.rows.map((row, i) => (
                <Paper withBorder p="md" key={entity.keys.map((k) => row[k]).join('|') + i}>
                  {canSelect ? (
                    <Checkbox
                      mb="sm"
                      aria-label={`Sélectionner ${display(row[entity.label])}`}
                      checked={selectedKeys.includes(identity(row))}
                      onChange={(e) => toggle(row, e.currentTarget.checked)}
                    />
                  ) : null}
                  <Button variant="subtle" px={0} mb="sm" onClick={() => onOpen(entity.name, row)}>
                    {display(row[entity.label])} · Réf. {display(row[entity.keys[0]])}
                  </Button>
                  <SimpleGrid cols={2}>
                    {fields
                      .filter((f) => f !== entity.label && f !== entity.keys[0])
                      .map((f) => (
                        <div key={f}>
                          <Text size="xs" c="dimmed">
                            {labels[f] ??
                              { cultureName: 'Culture', parcellesCount: 'Parcelles' }[f] ??
                              f}
                          </Text>
                          {cell(row, f)}
                        </div>
                      ))}
                  </SimpleGrid>
                  <Button
                    variant="light"
                    size="xs"
                    mt="md"
                    onClick={() => onOpen(entity.name, row)}
                  >
                    Ouvrir la fiche
                  </Button>
                </Paper>
              ))}
            </Stack>
          </Box>
          <Box visibleFrom="sm">
            <Table.ScrollContainer minWidth={compact ? 620 : 760}>
              <Table highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
                <Table.Thead>
                  <Table.Tr>
                    {canSelect ? <Table.Th>{selectPage}</Table.Th> : null}
                    {fields.map((field) => (
                      <Table.Th
                        key={field}
                        style={{
                          textAlign: ['supver', 'suppar', 'nbrarb', 'parcellesCount'].includes(
                            field,
                          )
                            ? 'right'
                            : 'left',
                        }}
                      >
                        <UnstyledButton
                          disabled={!entity.columns.some((c) => c.name === field)}
                          onClick={() => order(field)}
                        >
                          <Group
                            gap={5}
                            justify={
                              ['supver', 'suppar', 'nbrarb', 'parcellesCount'].includes(field)
                                ? 'flex-end'
                                : 'flex-start'
                            }
                          >
                            <Text size="xs" fw={700}>
                              {labels[field] ??
                                { cultureName: 'Culture', parcellesCount: 'Parcelles' }[field]}
                            </Text>
                            {sort === field ? (
                              descending ? (
                                <IconArrowDown size={12} />
                              ) : (
                                <IconArrowUp size={12} />
                              )
                            ) : null}
                          </Group>
                        </UnstyledButton>
                      </Table.Th>
                    ))}
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {result.data?.rows.map((row, i) => (
                    <Table.Tr key={entity.keys.map((k) => row[k]).join('|') + i}>
                      {canSelect ? (
                        <Table.Td>
                          <Checkbox
                            aria-label={`Sélectionner ${display(row[entity.label])}`}
                            checked={selectedKeys.includes(identity(row))}
                            onChange={(e) => toggle(row, e.currentTarget.checked)}
                          />
                        </Table.Td>
                      ) : null}
                      {fields.map((field) => (
                        <Table.Td key={field}>
                          {field === entity.label ? (
                            <UnstyledButton
                              className="record-name"
                              onClick={() => onOpen(entity.name, row)}
                            >
                              {display(row[field])}
                            </UnstyledButton>
                          ) : field === 'blocker' ? (
                            <Badge color={row[field] === 'O' ? 'red' : 'gray'} variant="light">
                              {display(row[field])}
                            </Badge>
                          ) : (
                            cell(row, field)
                          )}
                        </Table.Td>
                      ))}
                      <Table.Td>
                        <Button
                          variant="subtle"
                          size="compact-sm"
                          rightSection={<IconChevronRight size={15} />}
                          onClick={() => onOpen(entity.name, row)}
                        >
                          Fiche
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Box>
        </State>
        <Group justify="space-between" p="lg" className="table-footer">
          <Text size="xs" c="dimmed">
            {result.data?.total ?? 0} résultats · 25 par page
          </Text>
          <Pagination
            size="sm"
            value={page}
            onChange={setPage}
            total={Math.max(1, Math.ceil((result.data?.total ?? 0) / 25))}
          />
        </Group>
      </Paper>
      {deletion ? (
        <BulkDelete
          context={context}
          entity={entity}
          rows={deletion}
          onClose={() => {
            setDeletion(null);
            setSelected({ scope: '', keys: [] });
          }}
          onCompleted={() => {
            setSelected({ scope: '', keys: [] });
            setRevision((v) => v + 1);
            result.refresh();
          }}
        />
      ) : null}
    </>
  );
}
