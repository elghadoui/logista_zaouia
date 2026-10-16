import { usePermissions } from './Permissions';
import {
  Alert,
  Button,
  Checkbox,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { Context, Entity, Presentation, Row, Value } from './api';
import { api, area, display, keyOf, keyQuery, useApi } from './api';
import { ReferenceInput } from './ReferenceInput';
import { State } from './components';
import { SyncReview } from './SyncReview';
interface Inspection {
  canDelete: boolean;
  reason: string;
  dependencies: { table: string; count: number; fields: string[] }[];
  restrictions: string[];
}

export function RecordActions({
  context,
  entity,
  presentation,
  onSaved,
  onDeleted,
  disabled,
}: {
  context: Context;
  entity: Entity;
  presentation: Presentation;
  onSaved: () => void;
  onDeleted: () => void;
  disabled: boolean;
}) {
  const source = presentation.record;
  const rights = usePermissions(entity.name);
  const [mode, setMode] = useState<'transfer' | 'delete' | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [owner, setOwner] = useState<Value>(null),
    [sync, setSync] = useState(false),
    [confirmation, setConfirmation] = useState('');
  const [job, setJob] = useState<string | null>(null),
    [pending, setPending] = useState('');
  const inspection = useApi<Inspection>(
    mode === 'delete'
      ? `/contexts/${context.id}/entities/${entity.name}/delete-preview?key=${keyQuery(entity, source)}`
      : null,
  );
  const selected = useApi<Row[]>(
    mode === 'transfer' && owner !== null
      ? `/contexts/${context.id}/lookups/adherent?selected=${owner}`
      : null,
  );
  const comparison = useApi<{ status: string }>(
    mode === 'transfer' && context.isMaster
      ? `/contexts/${context.id}/entities/verger/comparison?key=${keyQuery(entity, source)}`
      : null,
  );
  const selectedOwner = selected.data?.find((r) => r.refadh === owner);
  function open(next: 'transfer' | 'delete') {
    setError('');
    setConfirmation('');
    setOwner(null);
    setSync(false);
    setMode(next);
  }
  async function transfer() {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ id: string; message: string; synchronization: string }>(
        `/contexts/${context.id}/vergers/transfer`,
        'POST',
        { key: keyOf(entity, source), before: source, newAdherent: owner, synchronize: sync },
      );
      notifications.show({ message: result.message, color: 'forest' });
      setMode(null);
      if (result.synchronization === 'Pending') {
        try {
          const jobs = await api<{ id: string; change_id: string }[]>(
            `/contexts/${context.id}/sync`,
          );
          const next = jobs.find((j) => j.change_id === result.id);
          if (next) setJob(next.id);
          else setPending('Transfert enregistré. Reprenez la demande DIAF dans Synchronisation.');
        } catch {
          setPending('Transfert enregistré. La demande DIAF reste dans la file pour reprise.');
        }
      } else if (result.synchronization === 'Reconciliation') setPending(result.message);
      else onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transfert impossible');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ message: string }>(
        `/contexts/${context.id}/entities/${entity.name}/delete`,
        'POST',
        { key: keyOf(entity, source), before: source, confirmation },
      );
      notifications.show({ message: result.message, color: 'forest' });
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible');
      inspection.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Group mb="lg">
        {entity.name === 'verger' && rights.modify ? (
          <Button variant="light" disabled={disabled} onClick={() => open('transfer')}>
            Transférer vers un autre adhérent
          </Button>
        ) : null}
        {rights.delete ? (
          <Button color="red" variant="outline" disabled={disabled} onClick={() => open('delete')}>
            {entity.name === 'verger'
              ? 'Supprimer le verger'
              : entity.name === 'adherent'
                ? 'Supprimer le producteur'
                : 'Supprimer la parcelle'}
          </Button>
        ) : null}
      </Group>
      {disabled ? (
        <Text size="xs" c="dimmed" mb="md">
          Enregistrez vos modifications avant un transfert ou une suppression.
        </Text>
      ) : null}
      <Modal
        opened={mode !== null}
        onClose={() => {
          if (!busy) setMode(null);
        }}
        size="lg"
        title={mode === 'transfer' ? 'Transférer le verger' : 'Suppression contrôlée'}
        closeOnClickOutside={!busy}
      >
        <Stack>
          <Paper withBorder p="md">
            <Text fw={700}>{display(source[entity.label])}</Text>
            <Text size="sm" c="dimmed">
              {entity.keys.map((k) => `${k} : ${display(source[k])}`).join(' · ')}
            </Text>
            <Text size="sm">
              {context.station} · {context.label}
            </Text>
            {entity.name === 'parcelle' ? (
              <Text size="sm">
                {area(source.suppar)} · Verger {source.refver}
              </Text>
            ) : null}
          </Paper>
          {mode === 'transfer' ? (
            <>
              <Text size="sm">
                Adhérent actuel :{' '}
                <strong>{display(presentation.relations.adherent?.nomadh)}</strong> · Réf.{' '}
                {display(source.refadh)}
              </Text>
              <ReferenceInput
                table="adherent"
                column={entity.columns.find((c) => c.name === 'refadh')!}
                context={context}
                value={owner}
                onChange={setOwner}
                disabled={busy}
              />
              <Alert color="forest">
                {display(presentation.relations.adherent?.nomadh)} →{' '}
                {display(selectedOwner?.nomadh)}
                <br />
                Le verger {source.refver}, ses parcelles et ses données seront conservés. Seul son
                adhérent change.
              </Alert>
              {context.isMaster ? (
                <Checkbox
                  label="Préparer également la synchronisation DIAF"
                  checked={sync}
                  onChange={(e) => setSync(e.currentTarget.checked)}
                  disabled={busy || comparison.data?.status === 'NotConfigured'}
                />
              ) : null}
              <Text size="xs" c="dimmed">
                DIAF exige une comparaison et une confirmation supplémentaires. Sa référence station
                reste inchangée.
              </Text>
            </>
          ) : (
            <State loading={inspection.loading} error={inspection.error} retry={inspection.refresh}>
              {inspection.data ? (
                <>
                  <Alert color={inspection.data.canDelete ? 'orange' : 'red'}>
                    {inspection.data.reason}
                  </Alert>
                  {inspection.data.dependencies.map((d, i) => (
                    <Text size="sm" key={d.table + i}>
                      <strong>{d.table}</strong> : {d.count} correspondance(s) ·{' '}
                      {d.fields.join(', ')}
                    </Text>
                  ))}
                  {inspection.data.restrictions.map((r) => (
                    <Text size="sm" key={r}>
                      {r}
                    </Text>
                  ))}
                  {!inspection.data.canDelete && entity.name === 'verger' ? (
                    <Text size="sm">
                      Le verger reste conservé. Le champ de blocage est disponible dans « État » ;
                      ses codes historiques doivent être interprétés selon vos règles métier.
                    </Text>
                  ) : null}
                  {inspection.data.canDelete ? (
                    <>
                      <Text size="sm">
                        Suppression définitive de cette fiche dans cet exercice, sans cascade et
                        sans suppression DIAF. Le serveur revérifiera les dépendances.
                      </Text>
                      <TextInput
                        label="Confirmation finale"
                        description="Saisissez SUPPRIMER"
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.currentTarget.value)}
                        disabled={busy}
                      />
                    </>
                  ) : null}
                </>
              ) : null}
            </State>
          )}
          {error ? <Alert color="red">{error}</Alert> : null}
          <Group justify="flex-end">
            <Button variant="default" disabled={busy} onClick={() => setMode(null)}>
              Annuler
            </Button>
            {mode === 'transfer' ? (
              <Button
                loading={busy}
                disabled={owner === null || owner === source.refadh || !selectedOwner}
                onClick={() => void transfer()}
              >
                {sync ? 'Confirmer le transfert + DIAF' : 'Confirmer le transfert'}
              </Button>
            ) : inspection.data?.canDelete ? (
              <Button
                color="red"
                loading={busy}
                disabled={confirmation !== 'SUPPRIMER'}
                onClick={() => void remove()}
              >
                Confirmer la suppression
              </Button>
            ) : null}
          </Group>
        </Stack>
      </Modal>
      {job ? (
        <SyncReview
          jobId={job}
          onClose={() => {
            setJob(null);
            onSaved();
          }}
        />
      ) : null}
      <Modal opened={!!pending} onClose={onSaved} title="Transfert enregistré">
        <Alert color="orange">{pending}</Alert>
        <Button mt="md" onClick={onSaved}>
          Terminer
        </Button>
      </Modal>
    </>
  );
}
