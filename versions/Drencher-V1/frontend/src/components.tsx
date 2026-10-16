import {
  Alert,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconArrowUpRight, IconDatabaseOff } from './icons';
import type { ReactNode } from 'react';
import { area, display, labels } from './api';
export function State({
  loading,
  error,
  empty,
  retry,
  children,
}: {
  loading?: boolean;
  error?: string;
  empty?: boolean;
  retry?: () => void;
  children: ReactNode;
}) {
  if (loading)
    return (
      <Center py={70}>
        <Stack align="center">
          <Loader color="forest" />
          <Text c="dimmed">Chargement de vos données…</Text>
        </Stack>
      </Center>
    );
  if (error)
    return (
      <Alert color="red" title="Impossible de charger les données" icon={<IconAlertCircle />}>
        {error}
        {retry ? (
          <Button mt="md" variant="light" color="red" onClick={retry}>
            Réessayer
          </Button>
        ) : null}
      </Alert>
    );
  if (empty)
    return (
      <Paper withBorder p={50}>
        <Stack align="center">
          <IconDatabaseOff size={36} color="#83968d" />
          <Text fw={600}>Aucun enregistrement</Text>
          <Text c="dimmed" size="sm">
            Adaptez votre recherche ou ajoutez un référentiel si vos droits le permettent.
          </Text>
        </Stack>
      </Paper>
    );
  return children;
}
export function Status({ status }: { status: string }) {
  const text: Record<string, string> = {
    Applied: 'Enregistré',
    Prepared: 'À réconcilier',
    Rejected: 'Refusé / à vérifier',
    Blocked: 'Suppression bloquée',
    Pending: 'En attente',
    Applying: 'À vérifier',
    AwaitingSource: 'Source à vérifier',
    Error: 'Erreur',
    Synchronized: 'Synchronisé',
    Different: 'Différent',
    Equal: 'Identique',
    SourceOnly: 'Absente DIAF',
    TargetOnly: 'Absente ZAOUIA',
    Ambiguous: 'Identité ambiguë',
    Conflict: 'Même libellé / autre code',
    NotConfigured: 'DIAF non configuré',
    Unavailable: 'Indisponible',
  };
  return (
    <Badge
      variant="light"
      color={
        ['Applied', 'Synchronized', 'Equal'].includes(status)
          ? 'forest'
          : ['Error', 'Unavailable', 'Rejected', 'Ambiguous', 'Conflict'].includes(status)
            ? 'red'
            : 'orange'
      }
    >
      {text[status] ?? status}
    </Badge>
  );
}
export function DiffTable({
  differences,
  beforeLabel = 'Avant',
  afterLabel = 'Après',
}: {
  differences: { field: string; before: unknown; after: unknown }[];
  beforeLabel?: string;
  afterLabel?: string;
}) {
  return (
    <Table verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Champ</Table.Th>
          <Table.Th>{beforeLabel}</Table.Th>
          <Table.Th>{afterLabel}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {differences.map((d) => (
          <Table.Tr key={d.field}>
            <Table.Td fw={600}>{labels[d.field] ?? d.field}</Table.Td>
            <Table.Td c="dimmed">
              {['suppar', 'supver'].includes(d.field) ? area(d.before) : display(d.before)}
            </Table.Td>
            <Table.Td>
              <Text fw={600} c="forest">
                {['suppar', 'supver'].includes(d.field) ? area(d.after) : display(d.after)}
              </Text>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
export function PageHeading({
  title,
  eyebrow,
  subtitle,
  action,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <Group justify="space-between" align="end" mb={26}>
      <div>
        {eyebrow ? (
          <Text className="eyebrow" mb={7}>
            {eyebrow}
          </Text>
        ) : null}
        <Text component="h1" className="page-title">
          {title}
        </Text>
        {subtitle ? (
          <Text c="dimmed" mt={6} size="sm">
            {subtitle}
          </Text>
        ) : null}
      </div>
      {action}
    </Group>
  );
}
export function QuickLink({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Paper component="button" className="quick-link" withBorder onClick={onClick}>
      <Group justify="space-between">
        <div>
          <Text fw={650}>{title}</Text>
          <Text c="dimmed" size="sm" mt={4}>
            {description}
          </Text>
        </div>
        <IconArrowUpRight size={22} />
      </Group>
    </Paper>
  );
}
