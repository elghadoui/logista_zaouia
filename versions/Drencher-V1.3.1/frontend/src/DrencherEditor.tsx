import { DrencherPalettePicker, summarizePalettes } from './DrencherPalettePicker';
import type { PaletteSummary } from './DrencherPalettePicker';
import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { api } from './api';
import type { Catalog, CycleRequest, Detail, Usage } from './drencherTypes';
import { amount, number, today } from './drencherTypes';
const numeric = (v: string | number) => Number(v) || 0;
const nullable = (v: string | number) => (v === '' ? null : Number(v));
export function DrencherEditor({
  path,
  catalog,
  initial,
  onCancel,
  onSaved,
}: {
  path: string;
  catalog: Catalog;
  initial?: Detail;
  onCancel: () => void;
  onSaved: (id: number) => void;
}) {
  const s = initial?.revisions[0]?.snapshot;
  const [form, setForm] = useState<CycleRequest>(() => ({
    version: initial?.version ?? 0,
    date: s?.date ?? today(),
    debut: s?.debut ?? '08:00',
    fin: s?.fin ?? '09:00',
    programmeId: s?.programmeId ?? 0,
    programmeVersion: s?.programmeVersion ?? 0,
    eauInitiale: s?.eauInitiale ?? 0,
    eauConsommee: s?.eauConsommee ?? 0,
    palettes: s?.palettes.map((p) => p.numpal) ?? [],
    produits:
      s?.produits.map((p) => ({
        produitId: p.produitId,
        dose: p.dose,
        machine: p.machine,
        reel: p.reel,
        lots: p.lots.map((l) => ({ lotId: l.lotId, quantite: l.quantite })),
      })) ?? [],
    observations: s?.observations ?? '',
    motif: '',
  }));
  const [selected, setSelected] = useState<number[]>(s?.palettes.map((p) => p.numpal) ?? []),
    [summary, setSummary] = useState<PaletteSummary | null>(
      s ? summarizePalettes(s.palettes) : null,
    ),
    [picker, setPicker] = useState(false),
    [extra, setExtra] = useState<string | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const correction = initial?.statut === 'Validé';
  function change<K extends keyof CycleRequest>(key: K, value: CycleRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function usage(index: number, value: Partial<Usage>) {
    setForm((f) => ({
      ...f,
      produits: f.produits.map((p, i) => (i === index ? { ...p, ...value } : p)),
    }));
  }
  function chooseProgram(id: string | null) {
    const p = catalog.programmes.find((p) => p.id === Number(id));
    if (!p) return;
    setForm((f) => {
      const retained = f.produits.filter((u) => (u.reel ?? 0) > 0 || (u.machine ?? 0) > 0);
      return {
        ...f,
        programmeId: p.id,
        programmeVersion: p.version,
        produits: [
          ...p.produits.map(
            (d) =>
              retained.find((u) => u.produitId === d.produitId) ?? {
                produitId: d.produitId,
                dose: d.dose,
                machine: null,
                reel: null,
                lots: [],
              },
          ),
          ...retained.filter((u) => !p.produits.some((d) => d.produitId === u.produitId)),
        ],
      };
    });
  }
  async function save() {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ id: number }>(
        path + `/cycles${initial ? `/${initial.id}${correction ? '/correct' : ''}` : ''}`,
        initial && !correction ? 'PUT' : 'POST',
        { ...form, palettes: selected },
      );
      onSaved(result.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>
          {correction
            ? 'Corriger le cycle validé'
            : initial
              ? 'Modifier le cycle'
              : 'Nouveau cycle'}
        </Title>
        <Button variant="default" onClick={onCancel}>
          Retour
        </Button>
      </Group>
      {error ? <Alert color="red">{error}</Alert> : null}
      {correction ? (
        <Alert color="orange">
          Correction qualité : motif obligatoire, palettes conservées, ajustement du stock et
          historique préservé.
        </Alert>
      ) : (
        <Alert color="blue">
          L'enregistrement conserve un brouillon sans sortie de stock. La qualité valide ensuite le
          cycle. Toute modification d'un cycle en attente le remet en brouillon.
        </Alert>
      )}
      <Paper withBorder p="md">
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <TextInput
            type="date"
            label="Date du traitement"
            value={form.date}
            onChange={(e) => change('date', e.currentTarget.value)}
          />
          <TextInput
            type="time"
            label="Début"
            value={form.debut}
            onChange={(e) => change('debut', e.currentTarget.value)}
          />
          <TextInput
            type="time"
            label="Fin (même jour)"
            value={form.fin}
            onChange={(e) => change('fin', e.currentTarget.value)}
          />
        </SimpleGrid>
      </Paper>
      <Paper withBorder p="md">
        <Group justify="space-between">
          <Title order={4}>Réceptions & palettes</Title>
          <Badge>{selected.length} sélectionnées</Badge>
        </Group>
        <Group mt="sm">
          <Text>Poids total : {number(summary?.poids)} kg</Text>
          <Text>Réceptions : {summary?.receptions ?? 0}</Text>
          {!correction ? (
            <Button onClick={() => setPicker(true)}>
              {selected.length ? 'Modifier la sélection' : 'Sélectionner les palettes'}
            </Button>
          ) : null}
        </Group>
        {summary?.groups.length ? (
          <Table mt="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Variété</Table.Th>
                <Table.Th>Producteur / adhérent</Table.Th>
                <Table.Th>Verger</Table.Th>
                <Table.Th>Palettes</Table.Th>
                <Table.Th>Poids kg</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {summary.groups.map((g, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{g.variete ?? '—'}</Table.Td>
                  <Table.Td>{g.adherent ?? '—'}</Table.Td>
                  <Table.Td>{g.verger ?? '—'}</Table.Td>
                  <Table.Td>{g.count}</Table.Td>
                  <Table.Td>{number(g.poids)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : null}
      </Paper>
      {picker ? (
        <DrencherPalettePicker
          path={path}
          cycleId={initial?.id}
          ids={selected}
          onCancel={() => setPicker(false)}
          onConfirm={(v) => {
            setSelected(v.ids);
            setSummary(v);
            setPicker(false);
          }}
        />
      ) : null}
      <Paper withBorder p="md">
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Select
            label="Programme de traitement"
            searchable
            value={form.programmeId ? String(form.programmeId) : null}
            data={catalog.programmes
              .filter((p) => p.actif || p.id === form.programmeId)
              .map((p) => ({ value: String(p.id), label: `${p.nom} · v${p.version}` }))}
            onChange={chooseProgram}
          />
          <NumberInput
            label="Eau initiale (L)"
            min={0}
            decimalScale={6}
            value={form.eauInitiale}
            onChange={(v) => change('eauInitiale', numeric(v))}
          />
          <NumberInput
            label="Eau totale consommée (L)"
            min={0}
            decimalScale={6}
            value={form.eauConsommee}
            onChange={(v) => change('eauConsommee', numeric(v))}
          />
        </SimpleGrid>
        <Text size="xs" c="dimmed" mt="sm">
          Version appliquée au cycle : {form.programmeVersion || '—'}. Les consommations déjà
          saisies sont conservées lors d’un changement de programme pour examen qualité.
        </Text>
      </Paper>
      <Paper withBorder p="md">
        <Title order={4}>Produits & consommations</Title>
        <Table.ScrollContainer minWidth={1080}>
          <Table>
            <Table.Thead>
              <Table.Tr>
                {[
                  'Produit',
                  'Dose / 1000 L',
                  'Initial calculé',
                  'Final théorique',
                  'Machine',
                  'Réel physique',
                  'Écarts réel',
                  'Lots fabricants / quantités',
                ].map((h) => (
                  <Table.Th key={h}>{h}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {form.produits.map((p, i) => {
                const ref = catalog.produits.find((r) => r.id === p.produitId),
                  unit = ref?.unite ?? '',
                  initialAmount = amount(form.eauInitiale, p.dose),
                  final = amount(form.eauConsommee, p.dose);
                return (
                  <Table.Tr key={p.produitId}>
                    <Table.Td>
                      {ref?.nom} <Text size="xs">{unit}</Text>
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        aria-label={`Dosage ${ref?.nom}`}
                        min={0}
                        w={110}
                        decimalScale={6}
                        value={p.dose}
                        onChange={(v) => usage(i, { dose: numeric(v) })}
                      />
                    </Table.Td>
                    <Table.Td>
                      {number(initialAmount)} {unit}
                    </Table.Td>
                    <Table.Td>
                      {number(final)} {unit}
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        aria-label={`Machine ${ref?.nom}`}
                        min={0}
                        w={100}
                        decimalScale={6}
                        value={p.machine ?? ''}
                        onChange={(v) => usage(i, { machine: nullable(v) })}
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        aria-label={`Réel ${ref?.nom}`}
                        min={0}
                        w={100}
                        decimalScale={6}
                        value={p.reel ?? ''}
                        onChange={(v) => usage(i, { reel: nullable(v) })}
                      />
                    </Table.Td>
                    <Table.Td>
                      Théorie : {number(p.reel === null ? null : p.reel - final)}
                      <br />
                      Machine :{' '}
                      {number(p.reel === null || p.machine === null ? null : p.reel - p.machine)}
                    </Table.Td>
                    <Table.Td>
                      <Stack gap="xs">
                        {p.lots.map((l, j) => (
                          <Group key={j} gap="xs" wrap="nowrap">
                            <Select
                              aria-label={`Lot ${ref?.nom} ${j + 1}`}
                              searchable
                              w={210}
                              value={l.lotId ? String(l.lotId) : null}
                              data={catalog.lots
                                .filter((lot) => lot.produitId === p.produitId)
                                .map((lot) => ({
                                  value: String(lot.id),
                                  label: `${lot.lot} · stock ${number(lot.solde)} ${unit}`,
                                }))}
                              onChange={(v) =>
                                usage(i, {
                                  lots: p.lots.map((r, k) =>
                                    k === j ? { ...r, lotId: Number(v) } : r,
                                  ),
                                })
                              }
                            />
                            <NumberInput
                              aria-label={`Quantité lot ${j + 1}`}
                              w={100}
                              min={0}
                              decimalScale={6}
                              value={l.quantite}
                              onChange={(v) =>
                                usage(i, {
                                  lots: p.lots.map((r, k) =>
                                    k === j ? { ...r, quantite: numeric(v) } : r,
                                  ),
                                })
                              }
                            />
                            <Button
                              variant="subtle"
                              aria-label="Retirer cette répartition"
                              onClick={() => usage(i, { lots: p.lots.filter((_, k) => k !== j) })}
                            >
                              ×
                            </Button>
                          </Group>
                        ))}
                        <Button
                          variant="light"
                          size="xs"
                          onClick={() =>
                            usage(i, {
                              lots: [
                                ...p.lots,
                                { lotId: 0, quantite: p.lots.length ? 0 : (p.reel ?? 0) },
                              ],
                            })
                          }
                        >
                          Ajouter un lot
                        </Button>
                        <Text size="xs">
                          Réparti : {number(p.lots.reduce((n, l) => n + l.quantite, 0))} {unit}
                        </Text>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Group mt="md">
          <Select
            label="Produit supplémentaire réellement utilisé"
            searchable
            clearable
            value={extra}
            onChange={setExtra}
            data={catalog.produits
              .filter((p) => p.actif && !form.produits.some((u) => u.produitId === p.id))
              .map((p) => ({ value: String(p.id), label: p.nom }))}
          />
          <Button
            mt="lg"
            disabled={!extra}
            variant="light"
            onClick={() => {
              change('produits', [
                ...form.produits,
                { produitId: Number(extra), dose: 0, machine: null, reel: null, lots: [] },
              ]);
              setExtra(null);
            }}
          >
            Ajouter ce produit
          </Button>
        </Group>
      </Paper>
      <Textarea
        label="Observations / écarts de traitement"
        maxLength={2000}
        value={form.observations}
        onChange={(e) => change('observations', e.currentTarget.value)}
      />
      {correction ? (
        <Textarea
          label="Motif obligatoire de correction"
          maxLength={1000}
          value={form.motif}
          onChange={(e) => change('motif', e.currentTarget.value)}
        />
      ) : null}
      <Group justify="end">
        <Button variant="default" onClick={onCancel}>
          Annuler
        </Button>
        <Button loading={busy} onClick={() => void save()}>
          {correction ? 'Enregistrer la correction & ajuster le stock' : 'Enregistrer le brouillon'}
        </Button>
      </Group>
    </Stack>
  );
}
