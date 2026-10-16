import { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  Pagination,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { api, useApi } from './api';
import { State } from './components';
import type { Detail } from './drencherTypes';
import { DrencherPrint } from './DrencherPrint';
import { DrencherF04Actions } from './DrencherDocuments';
type Deleted = {
  id: number;
  version: number;
  date_suppression: string;
  administrateur: string;
  motif: string;
};
export function DrencherCycleAdmin({
  path,
  cycle,
  onUpdated,
  readOnly = false,
}: {
  path: string;
  cycle?: Pick<Detail, 'id' | 'version' | 'statut'>;
  onUpdated?: () => void;
  readOnly?: boolean;
}) {
  const [opened, setOpened] = useState(false),
    [phrase, setPhrase] = useState(''),
    [motif, setMotif] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState<number | null>(null);
  const history = useApi<{ total: number; rows: Deleted[] }>(
    cycle ? null : `${path}/cycles/deleted?page=${page}`,
  );
  const detail = useApi<Detail>(selected ? `${path}/cycles/${selected}` : null);
  async function remove() {
    if (!cycle) return;
    setBusy(true);
    setError('');
    try {
      await api(`${path}/cycles/${cycle.id}/delete`, 'POST', {
        version: cycle.version,
        confirmation: phrase,
        motif,
      });
      setOpened(false);
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible.');
    } finally {
      setBusy(false);
    }
  }
  if (!cycle)
    return (
      <Stack>
        <Title order={4}>Historique des cycles supprimés</Title>
        <Text>
          Les instantanés et les mouvements sont conservés. Consultation administrative uniquement.
        </Text>
        <State loading={history.loading} error={history.error} retry={history.refresh}>
          <Table.ScrollContainer minWidth={650}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  {['Cycle', 'Date UTC', 'Administrateur', 'Motif', ''].map((x) => (
                    <Table.Th key={x}>{x}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {history.data?.rows.map((r) => (
                  <Table.Tr key={r.id}>
                    <Table.Td>
                      #{r.id} · v{r.version}
                    </Table.Td>
                    <Table.Td>{r.date_suppression}</Table.Td>
                    <Table.Td>{r.administrateur}</Table.Td>
                    <Table.Td>{r.motif}</Table.Td>
                    <Table.Td>
                      <Button variant="subtle" onClick={() => setSelected(r.id)}>
                        Consulter
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </State>
        <Pagination
          total={Math.max(1, Math.ceil((history.data?.total ?? 0) / 25))}
          value={page}
          onChange={setPage}
        />
        <Modal
          opened={selected !== null}
          onClose={() => setSelected(null)}
          title="Archive administrative · cycle supprimé"
          size="95%"
        >
          <State loading={detail.loading} error={detail.error} retry={detail.refresh}>
            {detail.data ? (
              <Stack>
                <Alert color="red">SUPPRIMÉ · document d’archive uniquement</Alert>
                <DrencherF04Actions
                  path={path}
                  cycleId={detail.data.id}
                  revision={detail.data.version}
                />
                <DrencherPrint detail={detail.data} />
              </Stack>
            ) : null}
          </State>
        </Modal>
      </Stack>
    );
  return (
    <>
      <Button
        color="red"
        variant="light"
        disabled={readOnly || cycle.statut === 'Supprimé'}
        onClick={() => {
          setPhrase('');
          setMotif('');
          setError('');
          setOpened(true);
        }}
      >
        Supprimer le cycle · admin
      </Button>
      <Modal
        opened={opened}
        onClose={() => {
          if (!busy) setOpened(false);
        }}
        title={`Supprimer le cycle #${cycle.id} ?`}
      >
        <Stack>
          <Alert color="orange">
            Suppression logique définitive pour les opérations : les quantités réellement
            comptabilisées seront restituées et les palettes libérées. L’historique sera conservé.
          </Alert>
          {error ? <Alert color="red">{error}</Alert> : null}
          <Textarea
            label="Motif obligatoire"
            maxLength={1000}
            value={motif}
            disabled={busy}
            onChange={(e) => setMotif(e.currentTarget.value)}
          />
          <TextInput
            label={`Recopier : SUPPRIMER CYCLE ${cycle.id}`}
            value={phrase}
            disabled={busy}
            onChange={(e) => setPhrase(e.currentTarget.value)}
          />
          <Group justify="end">
            <Button variant="default" disabled={busy} onClick={() => setOpened(false)}>
              Annuler
            </Button>
            <Button
              color="red"
              loading={busy}
              disabled={readOnly || phrase !== `SUPPRIMER CYCLE ${cycle.id}` || !motif.trim()}
              onClick={() => void remove()}
            >
              Confirmer la suppression
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
