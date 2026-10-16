import { drDateText, drExpired } from './drencherDates';
import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { api, useApi } from './api';
import type { ManagementProps } from './DrencherManagement';
import { number, today } from './drencherTypes';
import { DrencherStockDocuments } from './DrencherDocuments';
const empty = () => ({
  produitId: 0,
  lot: '',
  peremption: '',
  quantite: 0,
  bon: '',
  date: today(),
});
interface Movement {
  id: number;
  cycleId: number | null;
  nature: string;
  quantite: number;
  bon: string;
  dateReception: string | null;
  dateCreation: string;
  auteur: string;
  lot: string;
  nom: string;
  unite: string;
}
export function DrencherStock({ path, catalog, canAdd, refresh }: ManagementProps) {
  const [search, setSearch] = useState(''),
    [filter, setFilter] = useState<string | null>(null),
    [available, setAvailable] = useState<string | null>(null),
    [nature, setNature] = useState<string | null>(null),
    [page, setPage] = useState(1),
    [opened, setOpened] = useState(false),
    [entry, setEntry] = useState(empty),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [lotPage, setLotPage] = useState(1);
  const [query] = useDebouncedValue(search, 200);
  const movements = useApi<{ total: number; rows: Movement[] }>(
    path +
      `/stock?page=${page}&search=${encodeURIComponent(query)}${filter ? `&produitId=${filter}` : ''}${nature ? `&nature=${encodeURIComponent(nature)}` : ''}`,
  );
  const q = search.trim().toLocaleLowerCase('fr');
  const lots = catalog.lots.filter(
    (l) =>
      (!filter || l.produitId === Number(filter)) &&
      (!available || (available === 'positif' ? l.solde > 0 : l.solde === 0)) &&
      (
        l.nom +
        ' ' +
        l.lot +
        ' ' +
        (catalog.produits.find((p) => p.id === l.produitId)?.reference ?? '')
      )
        .toLocaleLowerCase('fr')
        .includes(q),
  );
  const products = catalog.produits
    .map((p) => ({ ...p, lots: catalog.lots.filter((l) => l.produitId === p.id) }))
    .filter(
      (p) =>
        (!filter || p.id === Number(filter)) &&
        (p.nom + ' ' + p.reference + ' ' + p.lots.map((l) => l.lot).join(' '))
          .toLocaleLowerCase('fr')
          .includes(q),
    )
    .filter(
      (p) =>
        p.lots.length &&
        (!available ||
          (available === 'positif'
            ? p.lots.some((l) => l.solde > 0)
            : p.lots.every((l) => l.solde === 0))),
    );
  async function receive() {
    setBusy(true);
    setError('');
    try {
      await api(path + '/stock', 'POST', entry);
      setOpened(false);
      setEntry(empty());
      notifications.show({
        color: 'green',
        title: 'Stock Drencher',
        message: 'Réception enregistrée avec son bon magasin.',
      });
      refresh();
      movements.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Réception impossible.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack>
      <Group justify="space-between">
        <div>
          <Title order={4}>Stock local Drencher</Title>
          <Text size="sm" c="dimmed">
            Disponibilités par produit et lot fabricant · sorties après validation qualité.
          </Text>
        </div>
        <Group>
          <DrencherStockDocuments path={path} catalog={catalog} />
          <Button
            disabled={!canAdd}
            onClick={() => {
              setEntry(empty());
              setError('');
              setOpened(true);
            }}
          >
            Réceptionner des produits
          </Button>
        </Group>
      </Group>
      <Group>
        <TextInput
          label="Rechercher produit, référence, lot ou bon"
          flex={1}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
            setLotPage(1);
          }}
        />
        <Select
          label="Produit en stock"
          clearable
          searchable
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
            setLotPage(1);
          }}
          data={catalog.produits.map((p) => ({ value: String(p.id), label: p.nom }))}
        />
        <Select
          label="Disponibilité"
          clearable
          value={available}
          onChange={(v) => {
            setAvailable(v);
            setLotPage(1);
          }}
          data={[
            { value: 'positif', label: 'Stock disponible' },
            { value: 'zero', label: 'Stock épuisé' },
          ]}
        />
      </Group>
      <Table.ScrollContainer minWidth={580}>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              {['Référence', 'Produit', 'Disponible', 'Lots fabricants'].map((h) => (
                <Table.Th key={h}>{h}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>{p.reference}</Table.Td>
                <Table.Td fw={600}>{p.nom}</Table.Td>
                <Table.Td>
                  {number(p.lots.reduce((n, l) => n + l.solde, 0))} {p.unite}
                </Table.Td>
                <Table.Td>{p.lots.length}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Title order={5}>Détail des lots fabricants</Title>
      <Table.ScrollContainer minWidth={580}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {['Produit', 'Lot fabricant', 'Péremption', 'Quantité disponible'].map((h) => (
                <Table.Th key={h}>{h}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lots.slice((lotPage - 1) * 25, lotPage * 25).map((l) => (
              <Table.Tr key={l.id}>
                <Table.Td>{l.nom}</Table.Td>
                <Table.Td>{l.lot}</Table.Td>
                <Table.Td>
                  {drDateText(l.peremption)}
                  {drExpired(l.peremption, today()) ? (
                    <Badge color="orange" ml="xs">
                      Périmé
                    </Badge>
                  ) : null}
                </Table.Td>
                <Table.Td>
                  {number(l.solde)} {l.unite}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {!lots.length ? <Text c="dimmed">Aucun lot ne correspond à ces filtres.</Text> : null}
      <Pagination
        value={lotPage}
        onChange={setLotPage}
        total={Math.max(1, Math.ceil(lots.length / 25))}
      />
      <Group justify="space-between">
        <Title order={4}>Réceptions et mouvements</Title>
        <Select
          aria-label="Filtrer la nature des mouvements"
          placeholder="Tous les mouvements"
          clearable
          value={nature}
          onChange={(v) => {
            setNature(v);
            setPage(1);
          }}
          data={[
            { value: 'Entree', label: 'Réceptions magasin' },
            { value: 'Consommation', label: 'Consommations validées' },
            { value: 'Correction restitution', label: 'Restitutions de correction' },
            { value: 'Correction consommation', label: 'Consommations de correction' },
          ]}
        />
      </Group>
      {movements.error ? <Alert color="red">{movements.error}</Alert> : null}
      <Table.ScrollContainer minWidth={800}>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              {['Date', 'Produit / lot', 'Nature / cycle', 'Quantité', 'Bon magasin', 'Auteur'].map(
                (h) => (
                  <Table.Th key={h}>{h}</Table.Th>
                ),
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {movements.data?.rows.map((m) => (
              <Table.Tr key={m.id}>
                <Table.Td>{drDateText(m.dateReception ?? m.dateCreation)}</Table.Td>
                <Table.Td>
                  {m.nom}
                  <Text size="xs" c="dimmed">
                    {m.lot}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {m.nature === 'Entree' ? 'Réception magasin' : m.nature}
                  {m.cycleId ? ' · #' + m.cycleId : ''}
                </Table.Td>
                <Table.Td>
                  {number(m.quantite)} {m.unite}
                </Table.Td>
                <Table.Td>{m.bon || '—'}</Table.Td>
                <Table.Td>{m.auteur}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Pagination
        value={page}
        onChange={setPage}
        total={Math.max(1, Math.ceil((movements.data?.total ?? 0) / 25))}
      />
      <Modal
        opened={opened}
        onClose={() => {
          if (!busy) setOpened(false);
        }}
        title="Réception du magasin central"
        size="lg"
        centered
      >
        <Stack>
          {error ? <Alert color="red">{error}</Alert> : null}
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label="Bon de transfert / sortie magasin"
              required
              disabled={busy}
              maxLength={100}
              value={entry.bon}
              onChange={(e) => {
                const bon = e.currentTarget.value;
                setEntry((r) => ({ ...r, bon }));
              }}
            />
            <TextInput
              type="date"
              label="Date de réception"
              required
              disabled={busy}
              value={entry.date}
              onChange={(e) => {
                const date = e.currentTarget.value;
                setEntry((r) => ({ ...r, date }));
              }}
            />
            <Select
              label="Produit reçu"
              searchable
              required
              disabled={busy}
              value={entry.produitId ? String(entry.produitId) : null}
              data={catalog.produits
                .filter((p) => p.actif)
                .map((p) => ({ value: String(p.id), label: p.nom + ' · ' + p.unite }))}
              onChange={(v) => setEntry((r) => ({ ...r, produitId: Number(v) }))}
            />
            <NumberInput
              label={`Quantité reçue (${catalog.produits.find((p) => p.id === entry.produitId)?.unite ?? 'unité produit'})`}
              required
              disabled={busy}
              min={0}
              decimalScale={6}
              value={entry.quantite}
              onChange={(v) => setEntry((r) => ({ ...r, quantite: Number(v) || 0 }))}
            />
            <TextInput
              label="Lot fabricant"
              required
              disabled={busy}
              maxLength={100}
              value={entry.lot}
              onChange={(e) => {
                const lot = e.currentTarget.value;
                setEntry((r) => ({ ...r, lot }));
              }}
            />
            <TextInput
              type="date"
              label="Péremption (si applicable)"
              disabled={busy}
              value={entry.peremption}
              onChange={(e) => {
                const peremption = e.currentTarget.value;
                setEntry((r) => ({ ...r, peremption }));
              }}
            />
          </SimpleGrid>
          <Text size="sm" c="dimmed">
            Un même bon et lot ne peut être enregistré deux fois. Les consommations restent déduites
            uniquement après validation qualité.
          </Text>
          <Group justify="end">
            <Button variant="default" disabled={busy} onClick={() => setOpened(false)}>
              Annuler
            </Button>
            <Button loading={busy} disabled={!canAdd} onClick={() => void receive()}>
              Enregistrer la réception
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
