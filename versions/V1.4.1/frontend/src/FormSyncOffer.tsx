import { Alert, Button, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import type { Context, Row } from './api';
import { api, useApi } from './api';
import { SyncReview } from './SyncReview';
import { State } from './components';

/** A separate confirmation after the master save. Never writes DIAF on mount. */
export function FormSyncOffer({
  context,
  name,
  recordKey,
  onClose,
}: {
  context: Context;
  name: string;
  recordKey: Row;
  onClose: () => void;
}) {
  const targets = useApi<{ id: number; label: string }[]>(
    `/contexts/${context.id}/synchronization/targets`,
  );
  const [target, setTarget] = useState<string | null>(null);
  const [job, setJob] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const targetId = target ? Number(target) : targets.data?.[0]?.id;
  async function preview() {
    if (!targetId) return;
    setBusy(true);
    setError('');
    try {
      const result = await api<{ items: { status: string; jobId?: string; message: string }[] }>(
        `/contexts/${context.id}/synchronization/prepare`,
        'POST',
        { name, targetId, key: recordKey },
      );
      const item = result.items[0];
      if (item?.status === 'Prepared' && item.jobId) setJob(item.jobId);
      else
        setError(
          item?.message ?? 'Préparation non confirmée. Consultez la file de synchronisation.',
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'DIAF indisponible.');
    } finally {
      setBusy(false);
    }
  }
  if (job) return <SyncReview jobId={job} onClose={onClose} />;
  return (
    <Modal
      opened
      onClose={() => {
        if (!busy) onClose();
      }}
      size="lg"
      title="Synchroniser également vers DIAF ?"
      closeOnEscape={!busy}
      closeOnClickOutside={!busy}
    >
      <Stack>
        <Alert color="forest">L’enregistrement est terminé dans ZAOUIA.</Alert>
        <Text size="sm">
          Vous pouvez examiner les changements proposés pour DIAF, puis confirmer ou annuler. Les
          identifiants métier restent identiques ; les références locales de station sont
          conservées.
        </Text>
        <State loading={targets.loading} error={targets.error} retry={targets.refresh}>
          {targets.data?.length ? (
            <Select
              label="Exercice DIAF"
              data={targets.data.map((t) => ({ value: String(t.id), label: t.label }))}
              value={targetId ? String(targetId) : null}
              onChange={setTarget}
              disabled={busy}
            />
          ) : (
            <Alert color="orange">
              Aucune route DIAF autorisée. ZAOUIA reste enregistré ; configurez la route pour une
              reprise manuelle.
            </Alert>
          )}
        </State>
        {error ? <Alert color="orange">{error} ZAOUIA reste enregistré.</Alert> : null}
        <Group justify="flex-end">
          <Button variant="default" disabled={busy} onClick={onClose}>
            Annuler la synchronisation
          </Button>
          <Button
            loading={busy}
            disabled={!targetId || !!targets.error}
            onClick={() => void preview()}
          >
            Voir l’aperçu DIAF
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
