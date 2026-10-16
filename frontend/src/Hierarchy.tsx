import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronRight, IconLeaf } from './icons';
import { useState } from 'react';
import type { Context, Page, Row } from './api';
import { display, useApi } from './api';
import { PageHeading, State } from './components';
export function Hierarchy({
  context,
  onOpen,
}: {
  context: Context;
  onOpen: (name: string, row: Row) => void;
}) {
  const [culture, setCulture] = useState<Row | null>(null);
  const [group, setGroup] = useState<Row | null>(null);
  const [variety, setVariety] = useState<Row | null>(null);
  const cultures = useApi<Page>(`/contexts/${context.id}/entities/culture?pageSize=100`);
  const varieties = useApi<Page>(
    culture
      ? `/contexts/${context.id}/entities/variete?pageSize=100&filter=codcul&value=${culture.codcul}`
      : null,
  );
  const groups = useApi<Page>(`/contexts/${context.id}/entities/grpvar?pageSize=100`);
  const subs = useApi<Page>(
    variety
      ? `/contexts/${context.id}/entities/souvar?pageSize=100&filter=codvar&value=${variety.codvar}`
      : null,
  );
  const relevantGroups = (groups.data?.rows ?? []).filter((g) =>
    varieties.data?.rows.some((v) => v.codgrv === g.codgrv),
  );
  function item(row: Row, label: string, id: string, selected: boolean, onClick: () => void) {
    return (
      <UnstyledButton
        key={String(row[id])}
        className={`tree-item ${selected ? 'selected' : ''}`}
        onClick={onClick}
      >
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Text fw={600} size="sm">
              {display(row[label])}
            </Text>
            <Text size="xs" c="dimmed">
              Ouvrir la fiche
            </Text>
          </div>
          <IconChevronRight size={16} />
        </Group>
      </UnstyledButton>
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="PATRIMOINE VARIÉTAL"
        title="Du verger à la variété."
        subtitle="Les groupes d’une culture sont déduits des variétés, conformément à la base historique."
      />
      {[cultures, varieties, groups, subs].some((r) => r.data && r.data.total > 100) ? (
        <Alert color="orange" mb="lg">
          Plus de 100 références : utilisez les listes avec recherche pour consulter l’ensemble des
          données.
        </Alert>
      ) : null}
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="md">
        <Paper withBorder p="lg">
          <Text className="eyebrow" mb="lg">
            01 · CULTURE
          </Text>
          <State loading={cultures.loading} error={cultures.error} retry={cultures.refresh}>
            <Stack gap={5}>
              {cultures.data?.rows.map((r) =>
                item(r, 'nomcul', 'codcul', culture?.codcul === r.codcul, () => {
                  setCulture(r);
                  setGroup(null);
                  setVariety(null);
                }),
              )}
            </Stack>
          </State>
          {culture ? (
            <Button fullWidth variant="subtle" mt="md" onClick={() => onOpen('culture', culture)}>
              Ouvrir la culture
            </Button>
          ) : null}
        </Paper>
        <Paper withBorder p="lg">
          <Text className="eyebrow" mb="lg">
            02 · GROUPE
          </Text>
          <State
            loading={groups.loading || varieties.loading}
            error={groups.error || varieties.error}
            retry={groups.refresh}
          >
            {culture ? (
              <Stack gap={5}>
                {relevantGroups.map((r) =>
                  item(r, 'nomgrv', 'codgrv', group?.codgrv === r.codgrv, () => {
                    setGroup(r);
                    setVariety(null);
                  }),
                )}
                {!relevantGroups.length ? (
                  <Text c="dimmed" size="sm">
                    Aucun groupe associé via les variétés.
                  </Text>
                ) : null}
              </Stack>
            ) : (
              <Text c="dimmed" size="sm">
                Choisissez une culture.
              </Text>
            )}
          </State>
          {group ? (
            <Button fullWidth variant="subtle" mt="md" onClick={() => onOpen('grpvar', group)}>
              Ouvrir le groupe
            </Button>
          ) : null}
        </Paper>
        <Paper withBorder p="lg">
          <Text className="eyebrow" mb="lg">
            03 · VARIÉTÉ
          </Text>
          <Stack gap={5}>
            {culture ? (
              varieties.data?.rows
                .filter((v) => !group || v.codgrv === group.codgrv)
                .map((r) =>
                  item(r, 'nomvar', 'codvar', variety?.codvar === r.codvar, () => setVariety(r)),
                )
            ) : (
              <Text c="dimmed" size="sm">
                Choisissez une culture ou un groupe.
              </Text>
            )}
          </Stack>
          {variety ? (
            <Button fullWidth variant="subtle" mt="md" onClick={() => onOpen('variete', variety)}>
              Ouvrir la variété
            </Button>
          ) : null}
        </Paper>
        <Paper withBorder p="lg">
          <Group mb="lg" justify="space-between">
            <Text className="eyebrow">04 · SOUS-VARIÉTÉ</Text>
            <IconLeaf size={18} color="#367d50" />
          </Group>
          <State loading={subs.loading} error={subs.error} retry={subs.refresh}>
            {variety ? (
              <Stack gap={5}>
                {subs.data?.rows.map((r) =>
                  item(r, 'nomsvar', 'codsvar', false, () => onOpen('souvar', r)),
                )}
                {subs.data?.total === 0 ? (
                  <Text c="dimmed" size="sm">
                    Aucune sous-variété pour cette variété.
                  </Text>
                ) : null}
              </Stack>
            ) : (
              <Text c="dimmed" size="sm">
                Choisissez une variété.
              </Text>
            )}
          </State>
          {variety ? (
            <Badge mt="md" color="forest" variant="light">
              Variété {variety.codvar}
            </Badge>
          ) : null}
        </Paper>
      </SimpleGrid>
    </>
  );
}
