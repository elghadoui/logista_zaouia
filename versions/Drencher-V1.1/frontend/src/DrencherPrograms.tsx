import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Drawer,
  Group,
  Modal,
  NumberInput,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { api, useApi } from './api';
import type { Program } from './drencherTypes';
import { number } from './drencherTypes';
import type { ManagementProps } from './DrencherManagement';
interface Version {
  version: number;
  auteur: string;
  dateCreation: string;
  programme: Program;
}
const empty: Program = { id: 0, version: 0, nom: '', actif: true, produits: [] };
export function DrencherPrograms({ path, catalog, canAdd, canModify, refresh }: ManagementProps) {
  const [search, setSearch] = useState(''),
    [status, setStatus] = useState<string | null>(null),
    [page, setPage] = useState(1),
    [form, setForm] = useState<Program | null>(null),
    [selected, setSelected] = useState<number | null>(null),
    [version, setVersion] = useState<string | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const history = useApi<Version[]>(selected ? path + `/programs/${selected}/versions` : null);
  const current = history.data?.find((v) => String(v.version) === version) ?? history.data?.[0];
  const rows = catalog.programmes.filter(
    (p) =>
      (!status || p.actif === (status === 'actif')) &&
      p.nom.toLocaleLowerCase('fr').includes(search.trim().toLocaleLowerCase('fr')),
  );
  async function save() {
    if (!form) return;
    setBusy(true);
    setError('');
    try {
      await api(path + '/programs', 'POST', form);
      setForm(null);
      notifications.show({
        color: 'green',
        title: 'Programmes Drencher',
        message: 'Nouvelle version enregistrée. Les cycles existants sont conservés.',
      });
      refresh();
      history.refresh();
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
          <Title order={4}>Programmes de traitement</Title>
          <Text size="sm" c="dimmed">
            Chaque enregistrement crée une version ; les dosages des cycles restent inchangés.
          </Text>
        </div>
        <Button
          disabled={!canAdd}
          onClick={() => {
            setForm({ ...empty, produits: [] });
            setError('');
          }}
        >
          Ajouter un programme
        </Button>
      </Group>
      <Group>
        <TextInput
          label="Rechercher un programme"
          flex={1}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setPage(1);
          }}
        />
        <Select
          label="Statut du programme"
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
      </Group>
      <Table.ScrollContainer minWidth={600}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {['Programme', 'Statut', 'Version', 'Produits', 'Actions'].map((h) => (
                <Table.Th key={h}>{h}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.slice((page - 1) * 25, page * 25).map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td fw={600}>{p.nom}</Table.Td>
                <Table.Td>
                  <Badge color={p.actif ? 'green' : 'gray'}>{p.actif ? 'Actif' : 'Inactif'}</Badge>
                </Table.Td>
                <Table.Td>v{p.version}</Table.Td>
                <Table.Td>{p.produits.length}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setSelected(p.id);
                        setVersion(null);
                      }}
                    >
                      Consulter les versions
                    </Button>
                    <Button
                      size="xs"
                      disabled={!canModify}
                      variant="subtle"
                      onClick={() => {
                        setForm({ ...p, produits: p.produits.map((d) => ({ ...d })) });
                        setError('');
                      }}
                    >
                      Modifier
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {!rows.length ? (
        <Text c="dimmed">Aucun programme ne correspond à cette recherche.</Text>
      ) : null}
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
        title={form?.id ? 'Enregistrer une nouvelle version' : 'Ajouter un programme'}
        size="lg"
        centered
      >
        <Stack>
          {error ? <Alert color="red">{error}</Alert> : null}
          {form ? (
            <>
              <TextInput
                label="Nom du programme"
                required
                disabled={busy}
                value={form.nom}
                maxLength={120}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setForm((p) => (p ? { ...p, nom: value } : p));
                }}
              />
              <Checkbox
                label="Programme actif"
                disabled={busy}
                checked={form.actif}
                onChange={(e) => {
                  const value = e.currentTarget.checked;
                  setForm((p) => (p ? { ...p, actif: value } : p));
                }}
              />
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Produit</Table.Th>
                    <Table.Th>Dose (unité / 1000 L eau)</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {form.produits.map((d, i) => (
                    <Table.Tr key={i}>
                      <Table.Td>
                        <Select
                          aria-label={`Produit ligne ${i + 1}`}
                          searchable
                          disabled={busy}
                          value={d.produitId ? String(d.produitId) : null}
                          data={catalog.produits
                            .filter((p) => p.actif || p.id === d.produitId)
                            .map((p) => ({
                              value: String(p.id),
                              label: p.nom + ' · ' + p.unite + (p.actif ? '' : ' · Inactif'),
                            }))}
                          onChange={(v) =>
                            setForm((p) =>
                              p
                                ? {
                                    ...p,
                                    produits: p.produits.map((r, j) =>
                                      i === j ? { ...r, produitId: Number(v) } : r,
                                    ),
                                  }
                                : p,
                            )
                          }
                        />
                      </Table.Td>
                      <Table.Td>
                        <NumberInput
                          aria-label={`Dosage ligne ${i + 1}`}
                          disabled={busy}
                          min={0}
                          decimalScale={6}
                          value={d.dose}
                          onChange={(v) =>
                            setForm((p) =>
                              p
                                ? {
                                    ...p,
                                    produits: p.produits.map((r, j) =>
                                      i === j ? { ...r, dose: Number(v) || 0 } : r,
                                    ),
                                  }
                                : p,
                            )
                          }
                        />
                      </Table.Td>
                      <Table.Td>
                        <Button
                          size="xs"
                          color="red"
                          variant="subtle"
                          disabled={busy}
                          onClick={() =>
                            setForm((p) =>
                              p ? { ...p, produits: p.produits.filter((_, j) => i !== j) } : p,
                            )
                          }
                        >
                          Retirer
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              <Button
                variant="light"
                disabled={busy || form.produits.length >= 30}
                onClick={() =>
                  setForm((p) =>
                    p ? { ...p, produits: [...p.produits, { produitId: 0, dose: 0 }] } : p,
                  )
                }
              >
                Ajouter une ligne produit
              </Button>
              <Alert>
                Version à enregistrer : {form.version + 1}. Aucune modification rétroactive des
                cycles ou des versions antérieures.
              </Alert>
              <Group justify="end">
                <Button variant="default" disabled={busy} onClick={() => setForm(null)}>
                  Annuler
                </Button>
                <Button
                  loading={busy}
                  disabled={!(form.id ? canModify : canAdd)}
                  onClick={() => void save()}
                >
                  Enregistrer la version
                </Button>
              </Group>
            </>
          ) : null}
        </Stack>
      </Modal>
      <Drawer
        opened={selected !== null}
        onClose={() => setSelected(null)}
        title="Produits, dosages et versions du programme"
        position="right"
        size="lg"
      >
        <Stack>
          {history.error ? <Alert color="red">{history.error}</Alert> : null}
          <Select
            label="Version à consulter"
            value={current ? String(current.version) : null}
            onChange={setVersion}
            data={(history.data ?? []).map((v) => ({
              value: String(v.version),
              label: `Version ${v.version} · ${v.dateCreation.slice(0, 10)}`,
            }))}
          />
          {current ? (
            <>
              <Title order={4}>
                {current.programme.nom} · v{current.version}
              </Title>
              <Badge color={current.programme.actif ? 'green' : 'gray'}>
                {current.programme.actif ? 'Actif' : 'Inactif'}
              </Badge>
              <Text size="sm">
                {current.auteur} · {current.dateCreation}
              </Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Produit / référence</Table.Th>
                    <Table.Th>Dosage appliqué</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {current.programme.produits.map((d) => {
                    const p = catalog.produits.find((p) => p.id === d.produitId);
                    return (
                      <Table.Tr key={d.produitId}>
                        <Table.Td>
                          {p?.nom ?? 'Produit #' + d.produitId}
                          <Text size="xs" c="dimmed">
                            {p?.reference ?? '—'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          {number(d.dose)} {p?.unite ?? ''} / 1000 L
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </>
          ) : history.loading ? (
            <Text>Chargement des versions…</Text>
          ) : null}
        </Stack>
      </Drawer>
    </Stack>
  );
}
