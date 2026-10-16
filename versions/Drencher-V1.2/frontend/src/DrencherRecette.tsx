import { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { api, useApi } from './api';
import { number } from './drencherTypes';
const cleanupLabels: Record<string, string> = {
  vit_dr_cycle: 'Cycles',
  vit_dr_revision: 'Révisions des cycles',
  vit_dr_palette_validee: 'Palettes traitées',
  vit_dr_mouvement: 'Mouvements de stock',
  vit_dr_stock_lot: 'Lots fabricants en stock',
  vit_dr_programme: 'Programmes',
  vit_dr_programme_revision: 'Versions des programmes',
  vit_traitement_produit: 'Produits',
};
export interface DrMode {
  mode: string;
  registered: boolean;
  eligible: boolean;
  installation: boolean;
}
interface Preview {
  ticket: string;
  confirmation: string;
  details: {
    database: string;
    operation: string;
    cycleId: number | null;
    counts: Record<string, number>;
    restitutions: {
      nom: string;
      unite: string;
      lot: string;
      quantiteRestituee: number;
      soldeAvant: number;
      soldeApres: number;
    }[];
    programmesProduitsConserves: boolean;
    historiqueAdministratifConserve: boolean;
  };
  expiresMinutes: number;
}
export function DrencherRecette({
  path,
  mode,
  refresh,
}: {
  path: string;
  mode: DrMode;
  refresh: () => void;
}) {
  const [id, setId] = useState<number | string>(''),
    [activation, setActivation] = useState(''),
    [preview, setPreview] = useState<Preview | null>(null),
    [confirmation, setConfirmation] = useState(''),
    [motif, setMotif] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const history = useApi<
    {
      id: string;
      operation: string;
      cycleId: number | null;
      etat: string;
      motif: string;
      auteur: string;
      dateCreation: string;
      dateExecution: string | null;
    }[]
  >(mode.registered ? path + '/recette/history' : null);
  async function run(operation: string) {
    setBusy(true);
    setError('');
    try {
      const p = await api<Preview>(path + '/recette/preview', 'POST', {
        operation,
        cycleId: operation === 'Cycle' ? Number(id) : null,
      });
      setPreview(p);
      setConfirmation('');
      setMotif('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Aperçu impossible.');
    } finally {
      setBusy(false);
    }
  }
  async function activate() {
    setBusy(true);
    setError('');
    try {
      await api(path + '/recette/activate', 'POST', { confirmation: activation });
      notifications.show({ color: 'green', message: 'Mode Recette inscrit sur la base isolée.' });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Activation impossible.');
    } finally {
      setBusy(false);
    }
  }
  async function apply() {
    if (!preview) return;
    setBusy(true);
    setError('');
    try {
      await api(path + '/recette/apply', 'POST', { ticket: preview.ticket, confirmation, motif });
      setPreview(null);
      notifications.show({
        color: 'green',
        message: 'Nettoyage de recette effectué et journalisé.',
      });
      refresh();
      history.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nettoyage impossible.');
      history.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack>
      <Title order={4}>Mode Recette Drencher · administration</Title>
      <Alert color={mode.registered ? 'orange' : 'blue'}>
        {mode.registered
          ? 'Base de test isolée. Les nettoyages sont réservés aux administrateurs, après aperçu et confirmation.'
          : 'Les suppressions sont désactivées sur ce contexte. Aucune donnée existante n’est automatiquement considérée comme un test.'}
      </Alert>
      {error && !preview ? <Alert color="red">{error}</Alert> : null}
      {!mode.installation ? (
        <Alert color="orange">
          Installer le script 006_drencher_recette_admin.sql dans la base d'administration avant
          activation.
        </Alert>
      ) : null}
      {!mode.registered ? (
        <Paper withBorder p="md">
          <Stack>
            <Title order={5}>Préparer une base isolée neuve</Title>
            <Text>
              Le guide de mise à jour contient le générateur SQL New-DrencherRecette.ps1. Faire
              créer la base neuve par le DBA, puis ajouter son contexte ZAOUIA dans Administration
              et le sélectionner ici. Aucun nettoyage n'est disponible pour logista.
            </Text>
            {mode.eligible && mode.installation ? (
              <>
                <Text size="sm">
                  Activation possible seulement si les tables Drencher sont vides et l'identité de
                  recette est vérifiée.
                </Text>
                <TextInput
                  label="Saisir ACTIVER RECETTE"
                  value={activation}
                  onChange={(e) => setActivation(e.currentTarget.value)}
                />
                <Button
                  loading={busy}
                  disabled={activation !== 'ACTIVER RECETTE'}
                  onClick={() => void activate()}
                >
                  Inscrire ce contexte en Recette
                </Button>
              </>
            ) : null}
          </Stack>
        </Paper>
      ) : (
        <>
          <Paper withBorder p="md">
            <Stack>
              <Title order={5}>Supprimer un cycle de test</Title>
              <Text size="sm">
                Un cycle validé de recette peut être supprimé : son stock est restitué et ses
                palettes libérées. Cette action reste interdite en production.
              </Text>
              <Group align="end">
                <NumberInput label="Numéro du cycle de test" min={1} value={id} onChange={setId} />
                <Button
                  color="red"
                  variant="light"
                  disabled={!id || busy}
                  onClick={() => void run('Cycle')}
                >
                  Voir l'aperçu de suppression
                </Button>
              </Group>
            </Stack>
          </Paper>
          <Paper withBorder p="md">
            <Stack>
              <Title order={5}>Remise à zéro des essais</Title>
              <Text size="sm">
                L'historique administratif et les tables historiques Logista sont conservés. Les
                identifiants ne sont jamais réattribués.
              </Text>
              <Group>
                <Button
                  color="orange"
                  variant="light"
                  disabled={busy}
                  onClick={() => void run('CyclesStock')}
                >
                  Réinitialiser cycles et stock
                </Button>
                <Button
                  color="red"
                  variant="light"
                  disabled={busy}
                  onClick={() => void run('Tout')}
                >
                  Tout réinitialiser, produits et programmes inclus
                </Button>
              </Group>
            </Stack>
          </Paper>
          <Title order={5}>Historique des nettoyages</Title>
          {history.error ? <Alert color="red">{history.error}</Alert> : null}
          <Table.ScrollContainer minWidth={650}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  {['Date', 'Opération / cycle', 'État', 'Motif', 'Administrateur'].map((h) => (
                    <Table.Th key={h}>{h}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {history.data?.map((h) => (
                  <Table.Tr key={h.id}>
                    <Table.Td>{h.dateExecution ?? h.dateCreation}</Table.Td>
                    <Table.Td>
                      {h.operation}
                      {h.cycleId ? ' · #' + h.cycleId : ''}
                    </Table.Td>
                    <Table.Td>{h.etat}</Table.Td>
                    <Table.Td>{h.motif || '—'}</Table.Td>
                    <Table.Td>{h.auteur}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </>
      )}
      <Modal
        opened={preview !== null}
        onClose={() => {
          if (!busy) setPreview(null);
        }}
        title="Confirmer le nettoyage de recette"
        size="lg"
        centered
      >
        <Stack>
          {error ? <Alert color="red">{error}</Alert> : null}
          {preview ? (
            <>
              <Alert color="red">
                Base isolée : {preview.details.database}.{' '}
                {preview.details.cycleId
                  ? 'Cycle de test #' + preview.details.cycleId
                  : 'Toutes les données du périmètre choisi'}
                . Cette suppression est définitive dans la recette.
              </Alert>
              <Text>
                Programmes et produits :{' '}
                {preview.details.programmesProduitsConserves ? 'conservés' : 'supprimés'}.
                Historique administratif conservé. Aperçu valable {preview.expiresMinutes} minutes.
              </Text>
              <Text size="sm" c="dimmed">
                Lignes concernées par le nettoyage. Les autres cycles sont conservés lors d'une
                suppression individuelle.
              </Text>
              <Table>
                <Table.Tbody>
                  {Object.entries(preview.details.counts).map(([name, count]) => (
                    <Table.Tr key={name}>
                      <Table.Td>{cleanupLabels[name] ?? name}</Table.Td>
                      <Table.Td>{count}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              {preview.details.restitutions.length ? (
                <>
                  <Text fw={600}>Stock restitué après suppression du cycle de test</Text>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Produit / lot</Table.Th>
                        <Table.Th>Restitué</Table.Th>
                        <Table.Th>Stock après</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {preview.details.restitutions.map((r, i) => (
                        <Table.Tr key={i}>
                          <Table.Td>
                            {r.nom} · {r.lot}
                          </Table.Td>
                          <Table.Td>
                            {number(r.quantiteRestituee)} {r.unite}
                          </Table.Td>
                          <Table.Td>
                            {number(r.soldeApres)} {r.unite}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </>
              ) : null}
              <TextInput
                label={`Recopier : ${preview.confirmation}`}
                value={confirmation}
                onChange={(e) => setConfirmation(e.currentTarget.value)}
                disabled={busy}
              />
              <Textarea
                label="Motif obligatoire du nettoyage"
                maxLength={1000}
                value={motif}
                onChange={(e) => setMotif(e.currentTarget.value)}
                disabled={busy}
              />
              <Group justify="end">
                <Button variant="default" disabled={busy} onClick={() => setPreview(null)}>
                  Annuler
                </Button>
                <Button
                  color="red"
                  loading={busy}
                  disabled={confirmation !== preview.confirmation || !motif.trim()}
                  onClick={() => void apply()}
                >
                  Confirmer le nettoyage
                </Button>
              </Group>
            </>
          ) : null}
        </Stack>
      </Modal>
    </Stack>
  );
}
