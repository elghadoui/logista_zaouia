import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { api } from './api';
import type { Product } from './drencherTypes';
import type { ManagementProps } from './DrencherManagement';
const empty: Product = { id: 0, reference: '', nom: '', unite: 'L', actif: true };
export function DrencherProducts({ path, catalog, canAdd, canModify, refresh }: ManagementProps) {
  const [search, setSearch] = useState(''),
    [status, setStatus] = useState<string | null>(null),
    [page, setPage] = useState(1),
    [form, setForm] = useState<Product | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const q = search.trim().toLocaleLowerCase('fr');
  const rows = catalog.produits.filter(
    (p) =>
      (!status || p.actif === (status === 'actif')) &&
      (p.reference + ' ' + p.nom).toLocaleLowerCase('fr').includes(q),
  );
  async function save(p: Product) {
    setBusy(true);
    setError('');
    try {
      await api(path + '/products', 'POST', p);
      setForm(null);
      notifications.show({
        color: 'green',
        title: 'Produits Drencher',
        message: p.id ? 'Produit mis à jour.' : 'Produit ajouté.',
      });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack>
      <Group justify="space-between">
        <div>
          <Title order={4}>Produits enregistrés</Title>
          <Text size="sm" c="dimmed">
            Référentiel commun · références et unités conservées après création.
          </Text>
        </div>
        <Button
          disabled={!canAdd}
          onClick={() => {
            setForm({ ...empty });
            setError('');
          }}
        >
          Ajouter un produit
        </Button>
      </Group>
      {!form && error ? <Alert color="red">{error}</Alert> : null}
      <Group>
        <TextInput
          label="Recherche par référence ou nom"
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
          flex={1}
        />
        <Select
          label="Statut du produit"
          clearable
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          data={[
            { value: 'actif', label: 'Actifs' },
            { value: 'inactif', label: 'Inactifs' },
          ]}
        />
        <Badge variant="light">{rows.length} produits</Badge>
      </Group>
      <Table.ScrollContainer minWidth={620}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {['Référence', 'Produit', 'Unité', 'Statut', 'Actions'].map((h) => (
                <Table.Th key={h}>{h}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.slice((page - 1) * 25, page * 25).map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>{p.reference}</Table.Td>
                <Table.Td fw={600}>{p.nom}</Table.Td>
                <Table.Td>{p.unite}</Table.Td>
                <Table.Td>
                  <Badge color={p.actif ? 'green' : 'gray'}>{p.actif ? 'Actif' : 'Inactif'}</Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      disabled={!canModify || busy}
                      onClick={() => {
                        setForm({ ...p });
                        setError('');
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color={p.actif ? 'orange' : 'green'}
                      disabled={!canModify || busy}
                      onClick={() => void save({ ...p, actif: !p.actif })}
                    >
                      {p.actif ? 'Désactiver' : 'Réactiver'}
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {!rows.length ? <Text c="dimmed">Aucun produit ne correspond à cette recherche.</Text> : null}
      <Pagination
        value={page}
        onChange={setPage}
        total={Math.max(1, Math.ceil(rows.length / 25))}
      />
      <Modal
        opened={form !== null}
        onClose={() => {
          if (!busy) setForm(null);
        }}
        title={form?.id ? 'Modifier le produit' : 'Ajouter un produit'}
        centered
      >
        <Stack>
          {error ? <Alert color="red">{error}</Alert> : null}
          {form ? (
            <>
              <TextInput
                label="Référence"
                required
                disabled={form.id !== 0 || busy}
                maxLength={40}
                value={form.reference}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setForm((p) => (p ? { ...p, reference: value } : p));
                }}
              />
              <TextInput
                label="Nom du produit"
                required
                maxLength={120}
                disabled={busy}
                value={form.nom}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setForm((p) => (p ? { ...p, nom: value } : p));
                }}
              />
              <SimpleGrid cols={2}>
                <Select
                  label="Unité"
                  required
                  disabled={form.id !== 0 || busy}
                  value={form.unite}
                  data={['L', 'kg', 'g', 'mL']}
                  onChange={(v) => setForm((p) => (p ? { ...p, unite: v ?? 'L' } : p))}
                />
                <Checkbox
                  label="Produit actif"
                  mt="xl"
                  disabled={busy}
                  checked={form.actif}
                  onChange={(e) => {
                    const value = e.currentTarget.checked;
                    setForm((p) => (p ? { ...p, actif: value } : p));
                  }}
                />
              </SimpleGrid>
              {form.id ? (
                <Text size="xs" c="dimmed">
                  La référence et l'unité sont immuables. La désactivation conserve les usages et
                  l'historique.
                </Text>
              ) : null}
              <Group justify="end">
                <Button variant="default" disabled={busy} onClick={() => setForm(null)}>
                  Annuler
                </Button>
                <Button
                  loading={busy}
                  disabled={!(form.id ? canModify : canAdd)}
                  onClick={() => void save(form)}
                >
                  Enregistrer
                </Button>
              </Group>
            </>
          ) : null}
        </Stack>
      </Modal>
    </Stack>
  );
}
