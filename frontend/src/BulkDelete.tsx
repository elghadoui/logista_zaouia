import { Alert, Button, Group, Modal, Paper, Stack, Text, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import type { Context, Entity, Row } from './api';
import { api, display, keyOf } from './api';
interface Preview {
  key: Row;
  before: Row | null;
  inspection: {
    canDelete: boolean;
    reason: string;
    dependencies: { table: string; count: number }[];
    restrictions: string[];
  } | null;
  error: string | null;
}
interface Outcome {
  key: Row;
  status: string;
  message: string;
}
interface Result {
  deleted: number;
  refused: number;
  unconfirmed: number;
  items: Outcome[];
}
export function BulkDelete({
  context,
  entity,
  rows,
  onClose,
  onCompleted,
}: {
  context: Context;
  entity: Entity;
  rows: Row[];
  onClose: () => void;
  onCompleted: () => void;
}) {
  const [preview, setPreview] = useState<Preview[] | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const prefix = `/contexts/${context.id}/entities/${entity.name}`;
  const keys = JSON.stringify(rows.map((row) => keyOf(entity, row)));
  useEffect(() => {
    const abort = new AbortController();
    void api<Preview[]>(
      prefix + '/delete-batch-preview',
      'POST',
      { keys: JSON.parse(keys) },
      abort.signal,
    )
      .then(setPreview)
      .catch((e) => {
        if (!abort.signal.aborted) setError(e instanceof Error ? e.message : 'Contrôle impossible');
      });
    return () => abort.abort();
  }, [prefix, keys]);
  const identity = (key: Row) => entity.keys.map((k) => `${k} : ${display(key[k])}`).join(' · ');
  async function remove() {
    setBusy(true);
    setError('');
    try {
      const value = await api<Result>(prefix + '/delete-batch', 'POST', {
        confirmation,
        items: preview!
          .filter((p) => p.before)
          .map((p) => ({ key: p.key, before: p.before, confirmation })),
      });
      const omitted = preview!
        .filter((p) => !p.before)
        .map((p) => ({ key: p.key, status: 'Refused', message: p.error ?? 'Contrôle impossible' }));
      setResult({
        ...value,
        refused: value.refused + omitted.length,
        items: [...value.items, ...omitted],
      });
      onCompleted();
    } catch (e) {
      const message =
        'Résultat du lot indisponible. Certaines suppressions peuvent avoir été effectuées. Rechargez les fiches et consultez le journal avant toute nouvelle tentative.';
      setError(e instanceof Error ? e.message : message);
      setResult({
        deleted: 0,
        refused: 0,
        unconfirmed: rows.length,
        items: rows.map((row) => ({ key: keyOf(entity, row), status: 'Unconfirmed', message })),
      });
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
      title="Supprimer la sélection"
      size="lg"
      closeOnClickOutside={!busy}
      closeOnEscape={!busy}
      withCloseButton={!busy}
    >
      <Stack>
        <Text>
          {rows.length} sélectionné(s) sur cette page · {context.station} · {context.label}
        </Text>
        {error ? <Alert color="red">{error}</Alert> : null}
        {result ? (
          <>
            <Alert color={result.refused || result.unconfirmed ? 'orange' : 'forest'}>
              {result.deleted} supprimé(s) · {result.refused} non supprimé(s) · {result.unconfirmed}{' '}
              résultat(s) à vérifier.
            </Alert>
            {result.items.map((item, i) => (
              <Paper withBorder p="sm" key={i}>
                <Text fw={600}>{identity(item.key)}</Text>
                <Text size="sm">
                  {item.status === 'Deleted'
                    ? 'Supprimé'
                    : item.status === 'Unconfirmed'
                      ? 'À vérifier'
                      : 'Non supprimé'}{' '}
                  : {item.message}
                </Text>
              </Paper>
            ))}
            <Button onClick={onClose}>Terminer</Button>
          </>
        ) : (
          <>
            {!preview && !error ? <Text>Contrôle de chaque fiche…</Text> : null}
            {preview ? (
              <>
                <Alert color="orange">
                  {preview.filter((p) => p.inspection?.canDelete).length} fiche(s) actuellement
                  supprimable(s). Les dépendances seront revérifiées au moment de chaque
                  suppression. Les autres fiches seront conservées. Aucune cascade ni suppression
                  DIAF.
                </Alert>
                {preview.map((item, i) => (
                  <Paper withBorder p="sm" key={i}>
                    <Text fw={600}>{identity(item.key)}</Text>
                    <Text size="sm">{item.error ?? item.inspection?.reason}</Text>
                    {item.inspection?.dependencies.map((d) => (
                      <Text size="sm" key={d.table}>
                        {d.table} : {d.count} référence(s)
                      </Text>
                    ))}
                    {item.inspection?.restrictions.map((r) => (
                      <Text size="sm" key={r}>
                        {r}
                      </Text>
                    ))}
                  </Paper>
                ))}
                <TextInput
                  label="Confirmation finale"
                  description="Saisissez SUPPRIMER"
                  value={confirmation}
                  disabled={busy}
                  onChange={(e) => setConfirmation(e.currentTarget.value)}
                />
              </>
            ) : null}
            <Group justify="flex-end">
              <Button variant="default" disabled={busy} onClick={onClose}>
                Annuler
              </Button>
              <Button
                color="red"
                loading={busy}
                disabled={
                  confirmation !== 'SUPPRIMER' || !preview?.some((p) => p.inspection?.canDelete)
                }
                onClick={() => void remove()}
              >
                Confirmer la suppression autorisée
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
