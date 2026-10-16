import { Alert, Button, Group, Modal, Paper, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import type { Context, Row } from './api';
import { api, display } from './api';
import { DiffTable } from './components';
interface Selected {
  key: Row;
  source: Row | null;
  target: Row | null;
  differences: { field: string; before: unknown; after: unknown }[];
}
interface Prepared {
  key: Row;
  status: string;
  jobId?: string;
  before?: Row;
  message: string;
}
export function ComparisonApply({
  context,
  name,
  targetId,
  rows,
  onClose,
  onCompleted,
}: {
  context: Context;
  name: string;
  targetId: number;
  rows: Selected[];
  onClose: () => void;
  onCompleted: () => void;
}) {
  const [items, setItems] = useState<Prepared[] | null>(null),
    [finished, setFinished] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const identity = (key: Row) => Object.values(key).map(display).join(' / ');
  const statusLabel: Record<string, string> = {
    Prepared: 'Prête à confirmer',
    Applied: 'Appliquée',
    Refused: 'Refusée',
    Unconfirmed: 'À vérifier',
    Applying: 'Journal à réconcilier',
  };
  async function prepare() {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ items: Prepared[] }>(
        `/contexts/${context.id}/comparison/prepare`,
        'POST',
        {
          targetId,
          name,
          items: rows.map((r) => ({ key: r.key, source: r.source, target: r.target })),
        },
      );
      setItems(result.items);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Préparation non confirmée : consultez la file avant de recommencer.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function apply() {
    setBusy(true);
    setError('');
    const outcomes: Prepared[] = [];
    try {
      for (const item of items ?? []) {
        if (!item.jobId || item.status !== 'Prepared') {
          outcomes.push(item);
          continue;
        }
        try {
          const result = await api<{ message: string; status: string }>(
            `/sync/${item.jobId}/apply`,
            'POST',
            item.before ?? {},
          );
          outcomes.push({ ...item, status: result.status, message: result.message });
        } catch (e) {
          outcomes.push({
            ...item,
            status: 'À vérifier / en attente',
            message:
              e instanceof Error ? e.message : 'Résultat non confirmé : consulter le journal.',
          });
        }
      }
      setItems(outcomes);
      setFinished(true);
      onCompleted();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      opened
      onClose={() => {
        if (!busy) onClose();
      }}
      closeOnClickOutside={!busy}
      closeOnEscape={!busy}
      withCloseButton={!busy}
      size="lg"
      title="Appliquer la sélection vers DIAF"
    >
      <Stack>
        <Alert color="orange">
          ZAOUIA → DIAF · {rows.length} fiche(s) de la page visible. La source reste inchangée ;
          refsta et champs générés exclus. Aucune suppression DIAF. Chaque demande est contrôlée et
          journalisée individuellement.
        </Alert>
        {!items
          ? rows.map((row, i) => (
              <Paper withBorder p="sm" key={i}>
                <Text fw={600}>Référence {identity(row.key)}</Text>
                {row.target ? (
                  <DiffTable differences={row.differences} />
                ) : (
                  <Text size="sm">
                    Création DIAF demandée. Les dépendances et le schéma seront contrôlés ; les
                    référentiels non validés restent protégés.
                  </Text>
                )}
              </Paper>
            ))
          : items.map((item, i) => (
              <Paper withBorder p="sm" key={i}>
                <Text fw={600}>
                  Référence {identity(item.key)} · {statusLabel[item.status] ?? item.status}
                </Text>
                <Text size="sm">{item.message}</Text>
              </Paper>
            ))}
        {error ? <Alert color="red">{error}</Alert> : null}
        <Group justify="flex-end">
          <Button variant="default" disabled={busy} onClick={onClose}>
            {finished ? 'Terminer' : 'Fermer'}
          </Button>
          {!items ? (
            <Button loading={busy} onClick={() => void prepare()}>
              Préparer et contrôler
            </Button>
          ) : !finished ? (
            <Button
              loading={busy}
              disabled={!items.some((i) => i.status === 'Prepared')}
              onClick={() => void apply()}
            >
              Confirmer l’application vers DIAF
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Modal>
  );
}
