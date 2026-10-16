import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { api, useApi } from './api';
import type { Catalog, Product, Program } from './drencherTypes';
import { number, today } from './drencherTypes';
const newProduct: Product = { id: 0, reference: '', nom: '', unite: 'L', actif: true };
const newProgram: Program = { id: 0, version: 0, nom: '', actif: true, produits: [] };
export function DrencherManagement({
  path,
  catalog,
  canAdd,
  canModify,
  refresh,
}: {
  path: string;
  catalog: Catalog;
  canAdd: boolean;
  canModify: boolean;
  refresh: () => void;
}) {
  const [product, setProduct] = useState<Product>(newProduct),
    [program, setProgram] = useState<Program>(newProgram),
    [entry, setEntry] = useState({
      produitId: 0,
      lot: '',
      peremption: '',
      quantite: 0,
      bon: '',
      date: today(),
    }),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [busy, setBusy] = useState(false),
    [page, setPage] = useState(1);
  const movements = useApi<{
    total: number;
    rows: {
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
    }[];
  }>(path + '/stock?page=' + page);
  async function save(endpoint: string, body: unknown) {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await api(path + '/' + endpoint, 'POST', body);
      refresh();
      movements.refresh();
      setSuccess('Enregistrement effectué.');
      if (endpoint === 'products') setProduct(newProduct);
      if (endpoint === 'programs') setProgram(newProgram);
      if (endpoint === 'stock') setEntry((e) => ({ ...e, quantite: 0, bon: '' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack>
      {error ? <Alert color="red">{error}</Alert> : null}
      {success ? <Alert color="green">{success}</Alert> : null}
      <Tabs defaultValue="stock">
        <Tabs.List>
          <Tabs.Tab value="stock">Stock local</Tabs.Tab>
          <Tabs.Tab value="products">Produits</Tabs.Tab>
          <Tabs.Tab value="programs">Programmes</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="stock" pt="md">
          <Stack>
            <Paper withBorder p="md">
              <Title order={4}>Réception du magasin central</Title>
              <Group align="end">
                <Select
                  label="Produit"
                  searchable
                  value={entry.produitId ? String(entry.produitId) : null}
                  data={catalog.produits
                    .filter((p) => p.actif)
                    .map((p) => ({ value: String(p.id), label: p.nom + ' · ' + p.unite }))}
                  onChange={(v) => setEntry((e) => ({ ...e, produitId: Number(v) }))}
                />
                <TextInput
                  label="Lot fabricant"
                  maxLength={100}
                  value={entry.lot}
                  onChange={(v) => {
                    const value = v.currentTarget.value;
                    setEntry((e) => ({ ...e, lot: value }));
                  }}
                />
                <TextInput
                  type="date"
                  label="Péremption (facultative)"
                  value={entry.peremption}
                  onChange={(v) => {
                    const value = v.currentTarget.value;
                    setEntry((e) => ({ ...e, peremption: value }));
                  }}
                />
                <NumberInput
                  label="Quantité reçue (unité produit)"
                  min={0}
                  decimalScale={6}
                  value={entry.quantite}
                  onChange={(v) => setEntry((e) => ({ ...e, quantite: Number(v) || 0 }))}
                />
                <TextInput
                  label="Bon magasin"
                  maxLength={100}
                  value={entry.bon}
                  onChange={(v) => {
                    const value = v.currentTarget.value;
                    setEntry((e) => ({ ...e, bon: value }));
                  }}
                />
                <TextInput
                  type="date"
                  label="Date réception"
                  value={entry.date}
                  onChange={(v) => {
                    const value = v.currentTarget.value;
                    setEntry((e) => ({ ...e, date: value }));
                  }}
                />
                <Button disabled={!canAdd} loading={busy} onClick={() => void save('stock', entry)}>
                  Enregistrer l'entrée
                </Button>
              </Group>
            </Paper>
            <Table.ScrollContainer minWidth={600}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    {['Produit', 'Lot', 'Péremption', 'Disponible'].map((l) => (
                      <Table.Th key={l}>{l}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {catalog.lots.map((l) => (
                    <Table.Tr key={l.id}>
                      <Table.Td>{l.nom}</Table.Td>
                      <Table.Td>{l.lot}</Table.Td>
                      <Table.Td>{l.peremption?.slice(0, 10) ?? '—'}</Table.Td>
                      <Table.Td>
                        {number(l.solde)} {l.unite}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <Title order={4}>Mouvements de stock</Title>
            {movements.error ? <Alert color="red">{movements.error}</Alert> : null}
            <Table.ScrollContainer minWidth={800}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    {['Date', 'Produit / lot', 'Nature / cycle', 'Quantité', 'Bon', 'Auteur'].map(
                      (l) => (
                        <Table.Th key={l}>{l}</Table.Th>
                      ),
                    )}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {movements.data?.rows.map((m) => (
                    <Table.Tr key={m.id}>
                      <Table.Td>{m.dateReception?.slice(0, 10) ?? m.dateCreation}</Table.Td>
                      <Table.Td>
                        {m.nom} · {m.lot}
                      </Table.Td>
                      <Table.Td>
                        {m.nature} {m.cycleId ? '#' + m.cycleId : ''}
                      </Table.Td>
                      <Table.Td>
                        {number(m.quantite)} {m.unite}
                      </Table.Td>
                      <Table.Td>{m.bon}</Table.Td>
                      <Table.Td>{m.auteur}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <Pagination
              total={Math.max(1, Math.ceil((movements.data?.total ?? 0) / 25))}
              value={page}
              onChange={setPage}
            />
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="products" pt="md">
          <Stack>
            <Group>
              <Select
                label="Modifier un produit"
                searchable
                clearable
                value={product.id ? String(product.id) : null}
                data={catalog.produits.map((p) => ({ value: String(p.id), label: p.nom }))}
                onChange={(v) =>
                  setProduct(catalog.produits.find((p) => p.id === Number(v)) ?? newProduct)
                }
              />
              <Button variant="light" mt="lg" onClick={() => setProduct(newProduct)}>
                Nouveau produit
              </Button>
            </Group>
            <Group align="end">
              <TextInput
                label="Référence"
                disabled={product.id !== 0}
                value={product.reference}
                maxLength={40}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setProduct((p) => ({ ...p, reference: value }));
                }}
              />
              <TextInput
                label="Nom"
                value={product.nom}
                maxLength={120}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setProduct((p) => ({ ...p, nom: value }));
                }}
              />
              <Select
                label="Unité de stock et consommation"
                disabled={product.id !== 0}
                data={['L', 'kg', 'g', 'mL']}
                value={product.unite}
                onChange={(v) => setProduct((p) => ({ ...p, unite: v ?? 'L' }))}
              />
              <Checkbox
                label="Actif"
                checked={product.actif}
                onChange={(e) => {
                  const value = e.currentTarget.checked;
                  setProduct((p) => ({ ...p, actif: value }));
                }}
              />
              <Button
                disabled={product.id ? !canModify : !canAdd}
                loading={busy}
                onClick={() => void save('products', product)}
              >
                Enregistrer le produit
              </Button>
            </Group>
            <Text size="sm" c="dimmed">
              Référence et unité immuables. Aucun produit utilisé n'est supprimé ; désactivez-le si
              nécessaire.
            </Text>
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="programs" pt="md">
          <Stack>
            <Group>
              <Select
                label="Modifier un programme"
                searchable
                clearable
                value={program.id ? String(program.id) : null}
                data={catalog.programmes.map((p) => ({
                  value: String(p.id),
                  label: p.nom + ' · v' + p.version,
                }))}
                onChange={(v) =>
                  setProgram(catalog.programmes.find((p) => p.id === Number(v)) ?? newProgram)
                }
              />
              <Button variant="light" mt="lg" onClick={() => setProgram(newProgram)}>
                Nouveau programme
              </Button>
            </Group>
            <Group>
              <TextInput
                label="Nom du programme"
                maxLength={120}
                value={program.nom}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setProgram((p) => ({ ...p, nom: value }));
                }}
              />
              <Checkbox
                label="Actif"
                checked={program.actif}
                onChange={(e) => {
                  const value = e.currentTarget.checked;
                  setProgram((p) => ({ ...p, actif: value }));
                }}
              />
            </Group>
            {program.produits.map((d, i) => (
              <Group key={i}>
                <Select
                  label="Produit"
                  searchable
                  value={d.produitId ? String(d.produitId) : null}
                  data={catalog.produits
                    .filter((p) => p.actif)
                    .map((p) => ({ value: String(p.id), label: p.nom + ' · ' + p.unite }))}
                  onChange={(v) =>
                    setProgram((p) => ({
                      ...p,
                      produits: p.produits.map((r, j) =>
                        j === i ? { ...r, produitId: Number(v) } : r,
                      ),
                    }))
                  }
                />
                <NumberInput
                  label="Dose (unité produit / 1000 L eau)"
                  min={0}
                  decimalScale={6}
                  value={d.dose}
                  onChange={(v) =>
                    setProgram((p) => ({
                      ...p,
                      produits: p.produits.map((r, j) =>
                        j === i ? { ...r, dose: Number(v) || 0 } : r,
                      ),
                    }))
                  }
                />
                <Button
                  mt="lg"
                  variant="subtle"
                  onClick={() =>
                    setProgram((p) => ({ ...p, produits: p.produits.filter((_, j) => j !== i) }))
                  }
                >
                  Retirer
                </Button>
              </Group>
            ))}
            <Group>
              <Button
                variant="light"
                onClick={() =>
                  setProgram((p) => ({
                    ...p,
                    produits: [...p.produits, { produitId: 0, dose: 0 }],
                  }))
                }
              >
                Ajouter un produit
              </Button>
              <Button
                disabled={program.id ? !canModify : !canAdd}
                loading={busy}
                onClick={() => void save('programs', program)}
              >
                Enregistrer une nouvelle version
              </Button>
            </Group>
            <Alert>
              Les cycles conservent la version et les dosages appliqués. Ce formulaire n'est pas une
              prescription de traitement.
            </Alert>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
