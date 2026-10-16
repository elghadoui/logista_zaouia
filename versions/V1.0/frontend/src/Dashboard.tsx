import { Badge, Button, Group, Paper, SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { IconArrowUpRight, IconLeaf, IconMap2, IconTrees, IconUsers } from './icons';
import type { Context } from './api';
import { dateDisplay, titles, useApi } from './api';
import { PageHeading, QuickLink, State, Status } from './components';
interface DashboardData {
  counts: Record<string, number>;
  recent: {
    id: string;
    entity: string;
    record_key: string;
    operation: string;
    status: string;
    createdAt: string;
    userName: string;
  }[];
  sync: { status: string; count: number }[];
  diafConfigured: boolean;
}
const cards = [
  { name: 'adherent', icon: IconUsers, description: 'Producteurs & partenaires' },
  { name: 'verger', icon: IconTrees, description: 'Patrimoine agricole' },
  { name: 'parcelle', icon: IconMap2, description: 'Unités de production' },
  { name: 'variete', icon: IconLeaf, description: 'Références variétales' },
];
export function Dashboard({
  context,
  navigate,
}: {
  context: Context;
  navigate: (name: string) => void;
}) {
  const result = useApi<DashboardData>(`/contexts/${context.id}/dashboard`);
  const pending =
    result.data?.sync.filter((s) => s.status !== 'Applied').reduce((sum, s) => sum + s.count, 0) ??
    0;
  return (
    <>
      <PageHeading
        eyebrow="VUE D’ENSEMBLE"
        title="Votre patrimoine, une référence commune."
        subtitle={`${context.station} · Exercice ${context.label} · Données de la base sélectionnée`}
        action={
          <Badge variant="light" size="lg" color={context.readOnly ? 'gray' : 'forest'}>
            {context.readOnly ? 'Archive · lecture seule' : 'Exercice actif'}
          </Badge>
        }
      />
      <State loading={result.loading} error={result.error} retry={result.refresh}>
        <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="lg" mb="xl">
          {cards.map(({ name, icon: Icon, description }) => (
            <Paper withBorder p="xl" key={name} className="metric">
              <Group justify="space-between">
                <div className="metric-icon">
                  <Icon size={22} />
                </div>
                <Button
                  variant="subtle"
                  size="compact-xs"
                  aria-label={`Ouvrir ${titles[name]}`}
                  onClick={() => navigate(name)}
                >
                  <IconArrowUpRight size={18} />
                </Button>
              </Group>
              <Text className="metric-number" mt="lg">
                {result.data?.counts[name]?.toLocaleString('fr-MA') ?? '—'}
              </Text>
              <Text fw={650}>{titles[name]}</Text>
              <Text c="dimmed" size="xs" mt={4}>
                {description}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <Paper withBorder p="xl">
            <Group justify="space-between" mb="lg">
              <Text fw={700}>Continuité entre les stations</Text>
              <Badge variant="dot" color={pending ? 'orange' : 'forest'}>
                {result.data?.diafConfigured
                  ? pending
                    ? 'Action requise'
                    : 'Aucune attente'
                  : 'À configurer'}
              </Badge>
            </Group>
            <div className="station-flow">
              <div>
                <img src="/logos/zaouia.png" alt="ZAOUIA" />
                <Text size="xs" c="dimmed">
                  Base maître
                </Text>
              </div>
              <span className="flow-line">→</span>
              <div>
                <img src="/logos/diaf.png" alt="DIAF" />
                <Text size="xs" c="dimmed">
                  Station destinataire
                </Text>
              </div>
            </div>
            <Text size="sm" mt="lg" c="dimmed">
              {result.data?.diafConfigured
                ? `${pending} demande(s) en attente de confirmation ou de reprise. Les modifications de refsta restent locales.`
                : 'DIAF n’est pas encore configuré. Vous pouvez travailler normalement dans ZAOUIA.'}
            </Text>
            <Button variant="light" mt="lg" onClick={() => navigate('sync')}>
              Voir les synchronisations
            </Button>
          </Paper>
          <Paper withBorder p="xl">
            <Text fw={700} mb="lg">
              Accès rapides
            </Text>
            <Stack gap="sm">
              <QuickLink
                title="Explorer les agriculteurs"
                description="Adhérent → vergers → parcelles"
                onClick={() => navigate('adherent')}
              />
              <QuickLink
                title="Parcourir les variétés"
                description="Culture → groupes → variétés → sous-variétés"
                onClick={() => navigate('hierarchy')}
              />
            </Stack>
          </Paper>
        </SimpleGrid>
        <Paper withBorder mt="xl">
          <Group p="xl" justify="space-between">
            <Text fw={700}>Dernières modifications</Text>
            <Button variant="subtle" size="sm" onClick={() => navigate('journal')}>
              Tout le journal
            </Button>
          </Group>
          {result.data?.recent.length ? (
            <Table.ScrollContainer minWidth={600}>
              <Table horizontalSpacing="xl" verticalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Référentiel</Table.Th>
                    <Table.Th>Opération</Table.Th>
                    <Table.Th>Utilisateur</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>État</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {result.data.recent.map((r) => (
                    <Table.Tr key={r.id}>
                      <Table.Td>
                        <Text size="sm" fw={600}>
                          {titles[r.entity]}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {Object.values(JSON.parse(r.record_key) as Record<string, unknown>).join(
                            ' · ',
                          )}
                        </Text>
                      </Table.Td>
                      <Table.Td>{r.operation === 'Create' ? 'Création' : 'Modification'}</Table.Td>
                      <Table.Td>{r.userName}</Table.Td>
                      <Table.Td>{dateDisplay(r.createdAt)}</Table.Td>
                      <Table.Td>
                        <Status status={r.status} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <Text p="xl" pt={0} c="dimmed" size="sm">
              Les modifications enregistrées par cette application apparaîtront ici.
            </Text>
          )}
        </Paper>
      </State>
    </>
  );
}
