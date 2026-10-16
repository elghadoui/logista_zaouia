import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import type { Row } from './api';
import { api, useApi } from './api';
import { DiffTable, State } from './components';
interface Preview {
  id: string;
  target: string;
  before: Row;
  differences: { field: string; before: unknown; after: unknown }[];
}
export function SyncReview({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const preview = useApi<Preview>(`/sync/${jobId}/preview`);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [done, setDone] = useState(false);
  const [outcome, setOutcome] = useState('');
  async function apply() {
    if (!preview.data) return;
    setBusy(true);
    setError('');
    try {
      const result = await api<{ status: string; message: string }>(
        `/sync/${jobId}/apply`,
        'POST',
        preview.data.before,
      );
      if (result.status === 'Applied') {
        setOutcome(result.message);
        setDone(true);
      } else
        setError(
          result.message || 'Résultat non confirmé : consultez le journal avant une reprise.',
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Synchronisation impossible');
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
      title="ZAOUIA enregistré · Synchronisation DIAF"
      size="lg"
      closeOnClickOutside={!busy}
    >
      <Stack>
        <Alert color="forest">La modification est enregistrée dans ZAOUIA.</Alert>
        {done ? (
          <Alert color="forest">
            {outcome || 'DIAF est synchronisé. Sa référence station a été conservée.'}
          </Alert>
        ) : (
          <>
            <State loading={preview.loading} error={preview.error} retry={preview.refresh}>
              {preview.data ? (
                <>
                  <Text size="sm">DIAF · {preview.data.target}</Text>
                  <DiffTable
                    differences={preview.data.differences}
                    beforeLabel="DIAF actuellement"
                    afterLabel="ZAOUIA à appliquer"
                  />
                </>
              ) : null}
            </State>
            <Text c="dimmed" size="sm">
              La référence station de DIAF reste inchangée. Seules les différences présentées seront
              appliquées après confirmation.
            </Text>
            {error || preview.error ? (
              <Alert color="orange">
                Synchronisation DIAF impossible. ZAOUIA reste enregistré et la demande reste dans la
                file pour reprise. {error}
              </Alert>
            ) : null}
          </>
        )}
        <Group justify="flex-end">
          <Button variant="default" disabled={busy} onClick={onClose}>
            {done ? 'Terminer' : 'Annuler'}
          </Button>
          {error ? (
            <Button
              variant="light"
              disabled={busy}
              onClick={() => {
                setError('');
                preview.refresh();
              }}
            >
              Comparer à nouveau
            </Button>
          ) : null}
          {!done && preview.data && !preview.error ? (
            <Button loading={busy} onClick={() => void apply()}>
              Confirmer la synchronisation DIAF
            </Button>
          ) : null}
        </Group>
      </Stack>
    </Modal>
  );
}
