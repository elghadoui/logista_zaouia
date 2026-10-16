import { Alert, Button, Group, Modal, Paper, Stack, Table, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { Context, Row } from './api';
import { api, dateDisplay, display, titles, useApi } from './api';
import { DiffTable, PageHeading, State, Status } from './components';
interface Job {
  id: string;
  entity: string;
  record_key: string;
  target_label: string;
  status: string;
  attempts: number;
  error: string | null;
  created_at: string;
  source_status: string;
}
interface Preview {
  id: string;
  entity: string;
  target: string;
  before: Row;
  differences: { field: string; before: unknown; after: unknown }[];
}
export function Synchronization({
  context,
  canWrite,
  admin,
}: {
  context: Context;
  canWrite: boolean;
  admin: boolean;
}) {
  const jobs = useApi<Job[]>(`/contexts/${context.id}/sync`);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function inspect(id: string) {
    setBusy(true);
    setError('');
    try {
      setPreview(await api<Preview>(`/sync/${id}/preview`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setBusy(false);
      jobs.refresh();
    }
  }
  async function apply() {
    if (!preview) return;
    setBusy(true);
    try {
      const response = await api<{ message: string }>(
        `/sync/${preview.id}/apply`,
        'POST',
        preview.before,
      );
      notifications.show({ title: 'Synchronisation', message: response.message, color: 'forest' });
      setPreview(null);
      jobs.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }
  async function reconcile(id: string) {
    setBusy(true);
    setError('');
    try {
      const r = await api<{ message: string }>(`/admin/sync/${id}/reconcile`, 'POST');
      notifications.show({ message: r.message, color: 'forest' });
      jobs.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="CONTINUITÉ DES RÉFÉRENTIELS"
        title="Synchronisation ZAOUIA → DIAF"
        subtitle="Chaque application vers DIAF exige votre confirmation après comparaison des valeurs."
      />
      <Alert color="forest" mb="lg">
        Le refsta de DIAF est conservé. Un identifiant absent ou ambigu bloque la synchronisation et
        doit être vérifié.
      </Alert>
      {error ? (
        <Alert color="orange" mb="lg">
          {error}
        </Alert>
      ) : null}
      <State
        loading={jobs.loading}
        error={jobs.error}
        empty={jobs.data?.length === 0}
        retry={jobs.refresh}
      >
        <Paper withBorder>
          <Table.ScrollContainer minWidth={750}>
            <Table horizontalSpacing="lg" verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Référence</Table.Th>
                  <Table.Th>Exercice DIAF</Table.Th>
                  <Table.Th>État</Table.Th>
                  <Table.Th>Tentatives</Table.Th>
                  <Table.Th>Dernier résultat</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {jobs.data?.map((job) => (
                  <Table.Tr key={job.id}>
                    <Table.Td>
                      <Text fw={600} size="sm">
                        {titles[job.entity]}
                      </Text>
                      <Text c="dimmed" size="xs">
                        {Object.values(JSON.parse(job.record_key) as Record<string, unknown>).join(
                          ' · ',
                        )}
                      </Text>
                    </Table.Td>
                    <Table.Td>{job.target_label}</Table.Td>
                    <Table.Td>
                      <Status status={job.status} />
                    </Table.Td>
                    <Table.Td>{job.attempts}</Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {job.error ?? '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {canWrite && job.status !== 'Applied' ? (
                        <Button
                          variant="light"
                          size="xs"
                          loading={busy}
                          disabled={job.source_status !== 'Applied' || job.status === 'Applying'}
                          onClick={() => void inspect(job.id)}
                        >
                          Comparer / reprendre
                        </Button>
                      ) : null}
                      {admin && job.status === 'Applying' ? (
                        <Button
                          variant="light"
                          size="xs"
                          loading={busy}
                          onClick={() => void reconcile(job.id)}
                        >
                          Vérifier le résultat DIAF
                        </Button>
                      ) : null}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      </State>
      <Modal
        opened={preview !== null}
        onClose={() => {
          if (!busy) setPreview(null);
        }}
        title="Confirmer les différences DIAF"
        size="lg"
      >
        <Stack>
          <Text size="sm">Exercice : {preview?.target}</Text>
          {preview ? (
            <DiffTable
              differences={preview.differences}
              beforeLabel="DIAF actuellement"
              afterLabel="ZAOUIA à appliquer"
            />
          ) : null}
          <Alert color="forest">
            Le refsta DIAF reste inchangé. Si DIAF évolue entre l’aperçu et la confirmation,
            l’application sera refusée.
          </Alert>
          {error ? <Alert color="red">{error}</Alert> : null}
          <Group justify="flex-end">
            <Button variant="default" disabled={busy} onClick={() => setPreview(null)}>
              Annuler
            </Button>
            <Button loading={busy} onClick={() => void apply()}>
              Appliquer à DIAF
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
interface Change {
  id: string;
  entity: string;
  record_key: string;
  operation: string;
  status: string;
  userName: string;
  created_at: string;
  before_json: string | null;
  after_json: string;
  patch_json: string;
  sync_requested: boolean;
  error: string | null;
}
export function Journal({ context, admin }: { context: Context; admin: boolean }) {
  const result = useApi<Change[]>(`/contexts/${context.id}/journal`);
  const [detail, setDetail] = useState<Change | null>(null);
  const [error, setError] = useState('');
  async function reconcile(id: string) {
    try {
      const r = await api<{ message: string }>(`/admin/changes/${id}/reconcile`, 'POST');
      notifications.show({ message: r.message, color: 'forest' });
      result.refresh();
      setDetail(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="TRAÇABILITÉ"
        title="Journal des modifications"
        subtitle="Les 200 dernières opérations de l’application sur cet exercice, avec leurs valeurs avant et après."
      />
      <State
        loading={result.loading}
        error={result.error}
        empty={result.data?.length === 0}
        retry={result.refresh}
      >
        <Paper withBorder>
          <Table.ScrollContainer minWidth={700}>
            <Table horizontalSpacing="lg" verticalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Référence</Table.Th>
                  <Table.Th>Utilisateur</Table.Th>
                  <Table.Th>Opération</Table.Th>
                  <Table.Th>État</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {result.data?.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td>{dateDisplay(r.created_at)}</Table.Td>
                    <Table.Td>
                      {titles[r.entity]} ·{' '}
                      {Object.values(JSON.parse(r.record_key) as Row)
                        .map(display)
                        .join(' / ')}
                    </Table.Td>
                    <Table.Td>{r.userName}</Table.Td>
                    <Table.Td>
                      {(
                        {
                          Create: 'Création',
                          Transfer: 'Transfert',
                          CompareUpdate: 'Comparaison vers DIAF',
                          CompareCreate: 'Création DIAF contrôlée',
                          Delete: 'Suppression',
                          Update: 'Modification',
                        } as Record<string, string>
                      )[r.operation] ?? r.operation}
                    </Table.Td>
                    <Table.Td>
                      <Status status={r.status} />
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => {
                          setError('');
                          setDetail(r);
                        }}
                      >
                        Détails
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      </State>
      <Modal
        opened={detail !== null}
        onClose={() => setDetail(null)}
        title="Détail de l’opération"
        size="lg"
      >
        {detail ? (
          <Stack>
            <Group>
              <Text fw={600}>{detail.userName}</Text>
              <Status status={detail.status} />
            </Group>
            <Text size="sm">
              {context.station} · {context.label} · {dateDisplay(detail.created_at)}
            </Text>
            {detail.operation === 'Delete' ? (
              <Alert color={detail.status === 'Applied' ? 'forest' : 'orange'}>
                {detail.status === 'Applied'
                  ? 'La fiche a été supprimée dans cet exercice.'
                  : detail.status === 'Blocked'
                    ? 'La tentative a été bloquée ; la fiche est conservée.'
                    : 'Résultat de suppression à vérifier dans le journal.'}
              </Alert>
            ) : null}
            <DiffTable
              differences={Object.entries(
                JSON.parse(
                  detail.operation === 'Delete' ? (detail.before_json ?? '{}') : detail.patch_json,
                ) as Row,
              ).map(([field, after]) => ({
                field,
                after:
                  detail.operation === 'Delete'
                    ? detail.status === 'Applied'
                      ? null
                      : after
                    : after,
                before: detail.before_json ? (JSON.parse(detail.before_json) as Row)[field] : null,
              }))}
            />
            <Text size="sm">
              Synchronisation demandée : {detail.sync_requested ? 'Oui' : 'Non'}
            </Text>
            {detail.error ? <Alert color="orange">{detail.error}</Alert> : null}
            {error ? <Alert color="red">{error}</Alert> : null}
            {admin && !['Applied', 'Blocked'].includes(detail.status) ? (
              <Button variant="light" onClick={() => void reconcile(detail.id)}>
                Vérifier le résultat dans la base et réconcilier
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </Modal>
    </>
  );
}
