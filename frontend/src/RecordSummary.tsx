import { Button, Group, Paper, SimpleGrid, Text } from '@mantine/core';
import type { Entity, Presentation, Row } from './api';
import { area, display } from './api';

export function RecordSummary({
  entity,
  data,
  onOpen,
}: {
  entity: Entity;
  data: Presentation;
  onOpen: (name: string, row: Row) => void;
}) {
  const r = data.record,
    m = data.metrics,
    parent = data.relations.adherent ?? data.relations.parent;
  return (
    <Paper withBorder p="lg" mb="lg">
      {parent ? (
        <Group gap="xs" mb="md">
          <Text size="sm" c="dimmed">
            Agriculteurs /
          </Text>
          {parent.refadh !== null && parent.refadh !== undefined ? (
            <Button
              variant="subtle"
              size="compact-sm"
              onClick={() => onOpen('adherent', { refadh: parent.refadh })}
            >
              {display(parent.nomadh)} · Réf. {parent.refadh}
            </Button>
          ) : null}
          {entity.name === 'parcelle' ? (
            <>
              <Text c="dimmed">/</Text>
              <Button
                variant="subtle"
                size="compact-sm"
                onClick={() => onOpen('verger', { refver: parent.refver })}
              >
                {display(parent.nomver)} · Verger {parent.refver}
              </Button>
            </>
          ) : null}
          <Text size="sm" c="dimmed">
            / {display(r[entity.label])}
          </Text>
        </Group>
      ) : null}
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }}>
        {(entity.name === 'adherent'
          ? [
              ['Téléphone', display(r.teladh)],
              ['Ville', display(r.viladh)],
              ['Certification', display(r.certif)],
              ['Vergers', display(m?.vergers)],
              ['Parcelles', display(m?.parcelles)],
              ['Surface des parcelles', area(m?.surface)],
            ]
          : entity.name === 'verger'
            ? [
                ['Région', display(r.region)],
                ['Superficie du verger', area(r.supver)],
                ['Parcelles', display(m?.parcelles)],
                ['Surface des parcelles', area(m?.surface)],
                ['Certification', display(r.certif)],
                ['Référence station locale', display(r.refsta)],
              ]
            : [
                ['Parcelle', display(r.refpar)],
                ['Numéro de culture', display(r.numcul)],
                ['Superficie', area(r.suppar)],
                ['Arbres', display(r.nbrarb)],
              ]
        ).map(([label, value]) => (
          <div key={label}>
            <Text size="xs" c="dimmed">
              {label}
            </Text>
            <Text size="sm" fw={650} mt={4}>
              {value}
            </Text>
          </div>
        ))}
      </SimpleGrid>
    </Paper>
  );
}
