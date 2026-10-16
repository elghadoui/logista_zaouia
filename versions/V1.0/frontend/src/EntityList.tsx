import {
  Badge,
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
import { display, labels, titles, useApi } from './api';
import { PageHeading, State } from './components';
const columns: Record<string, string[]> = {
  adherent: ['refadh', 'nomadh', 'viladh', 'teladh', 'certif'],
  verger: ['refver', 'nomver', 'refadh', 'region', 'supver', 'certif', 'blocker'],
  parcelle: ['refpar', 'numcul', 'refver', 'codvar', 'codsvar', 'suppar', 'nbrarb'],
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
  const query = new URLSearchParams({
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
  const fields = columns[entity.name];
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
      <Paper withBorder className="list-panel">
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
              w={300}
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
          <Table.ScrollContainer minWidth={compact ? 620 : 760}>
            <Table highlightOnHover verticalSpacing="md" horizontalSpacing="lg">
              <Table.Thead>
                <Table.Tr>
                  {fields.map((field) => (
                    <Table.Th key={field}>
                      <UnstyledButton onClick={() => order(field)}>
                        <Group gap={5}>
                          <Text size="xs" fw={700}>
                            {labels[field]}
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
                    {fields.map((field, index) => (
                      <Table.Td key={field}>
                        {index === 1 ? (
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
                          <Text
                            size="sm"
                            c={index === 0 ? 'dimmed' : undefined}
                            ff={index === 0 ? 'monospace' : undefined}
                          >
                            {display(row[field])}
                          </Text>
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
    </>
  );
}
