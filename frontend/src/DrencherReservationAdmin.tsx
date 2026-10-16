import { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { api, useApi } from './api';
interface Conflict {
  numpal: number;
  cycles: { cycleId: number; version: number; statut: string }[];
}
export function DrencherReservationAdmin({
  path,
  onUpdated,
}: {
  path: string;
  onUpdated?: () => void;
}) {
  const diag = useApi<{
    installed: boolean;
    conflicts: Conflict[];
    cycles: number;
    palettes: number;
    message: string;
  }>(path + '/reservations/diagnostic');
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [initialize, setInitialize] = useState(false),
    [cycle, setCycle] = useState<string | null>(null),
    [remove, setRemove] = useState<string[]>([]),
    [phrase, setPhrase] = useState(''),
    [motif, setMotif] = useState('');
  const owners = Array.from(
    new Map(
      (diag.data?.conflicts ?? []).flatMap((p) => p.cycles).map((c) => [c.cycleId, c]),
    ).values(),
  );
  const current = owners.find((c) => String(c.cycleId) === cycle);
  async function act() {
    setBusy(true);
    setError('');
    try {
      await api(
        path + `/reservations/${initialize ? 'initialize' : 'arbitrate'}`,
        'POST',
        initialize
          ? { confirmation: phrase }
          : {
              cycleId: current?.cycleId,
              version: current?.version,
              retirer: remove.map(Number),
              confirmation: phrase,
              motif,
            },
      );
      setInitialize(false);
      setCycle(null);
      setPhrase('');
      setRemove([]);
      setMotif('');
      diag.refresh();
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack>
      <Title order={4}>Diagnostic et migration des réservations V1.2</Title>
      <Alert>
        Aucun cycle n'est modifié automatiquement. Diagnostic avant le SQL 010, arbitrage explicite
        des doublons, puis initialisation du nouveau registre. Les cycles validés ne sont jamais
        arbitrés ici.
      </Alert>
      {diag.error || error ? <Alert color="red">{diag.error || error}</Alert> : null}
      <Group>
        <Button variant="light" onClick={diag.refresh}>
          Actualiser le diagnostic
        </Button>
        <Button
          disabled={!diag.data?.installed || !!diag.data?.conflicts.length || busy}
          onClick={() => {
            setInitialize(true);
            setPhrase('');
          }}
        >
          Initialiser les réservations
        </Button>
      </Group>
      <Text>{diag.data?.message}</Text>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Palette en conflit</Table.Th>
            <Table.Th>Cycles et états</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {diag.data?.conflicts.map((p) => (
            <Table.Tr key={p.numpal}>
              <Table.Td>{p.numpal}</Table.Td>
              <Table.Td>
                {p.cycles.map((c) => `#${c.cycleId} (${c.statut}, v${c.version})`).join(' · ')}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {owners.some((c) => c.statut !== 'Validé') ? (
        <Select
          label="Cycle non validé à arbitrer"
          value={cycle}
          data={owners
            .filter((c) => c.statut !== 'Validé')
            .map((c) => ({ value: String(c.cycleId), label: `Cycle #${c.cycleId} · ${c.statut}` }))}
          onChange={(v) => {
            setCycle(v);
            setPhrase('');
            setRemove([]);
            setMotif('');
          }}
        />
      ) : null}
      <Modal
        opened={initialize || cycle !== null}
        onClose={() => {
          if (!busy) {
            setInitialize(false);
            setCycle(null);
          }
        }}
        title={initialize ? 'Confirmer l’initialisation' : 'Arbitrage explicite d’un cycle'}
      >
        <Stack>
          {error ? <Alert color="red">{error}</Alert> : null}
          {initialize ? (
            <Text>
              Seul le registre de réservation est rempli. Les instantanés existants ne sont pas
              réécrits.
            </Text>
          ) : (
            <>
              <Alert color="orange">
                Choisir le cycle qui correspond au traitement réel. Les palettes retirées et les
                anciennes valeurs restent visibles dans l'historique. Si aucune palette ne reste,
                compléter ce brouillon avant soumission.
              </Alert>
              <MultiSelect
                label="Palettes en conflit à retirer de ce cycle"
                value={remove}
                onChange={setRemove}
                data={(diag.data?.conflicts ?? [])
                  .filter((p) => p.cycles.some((c) => String(c.cycleId) === cycle))
                  .map((p) => ({ value: String(p.numpal), label: `Palette ${p.numpal}` }))}
              />
              <Textarea
                label="Motif obligatoire de l'arbitrage"
                value={motif}
                onChange={(e) => setMotif(e.currentTarget.value)}
              />
            </>
          )}
          <TextInput
            label={`Saisir ${initialize ? 'INITIALISER RESERVATIONS' : 'ARBITRER CYCLE ' + cycle}`}
            value={phrase}
            onChange={(e) => setPhrase(e.currentTarget.value)}
          />
          <Button
            loading={busy}
            disabled={
              phrase !== (initialize ? 'INITIALISER RESERVATIONS' : 'ARBITRER CYCLE ' + cycle) ||
              (!initialize && (!remove.length || !motif.trim()))
            }
            onClick={() => void act()}
          >
            Confirmer
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
