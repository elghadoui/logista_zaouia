import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Group,
  Modal,
  NumberInput,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { api, useApi } from './api';
import type { Palette } from './drencherTypes';
import { number } from './drencherTypes';
export interface PaletteSummary {
  ids: number[];
  count: number;
  poids: number | null;
  receptions: number;
  groups: {
    variete: string | null;
    adherent: string | null;
    verger: string | null;
    count: number;
    poids: number | null;
  }[];
  skipped: number;
}
export function summarizePalettes(rows: Palette[]): PaletteSummary {
  const groups = new Map<string, PaletteSummary['groups'][number]>();
  for (const p of rows) {
    const key = JSON.stringify([p.codvar, p.refadh, p.refver]);
    const g = groups.get(key) ?? {
      variete: p.variete,
      adherent: p.adherent,
      verger: p.verger,
      count: 0,
      poids: 0,
    };
    g.count++;
    g.poids = g.poids === null || p.poids === null ? null : g.poids + p.poids;
    groups.set(key, g);
  }
  return {
    ids: rows.map((p) => p.numpal),
    count: rows.length,
    poids: rows.every((p) => p.poids !== null)
      ? rows.reduce((n, p) => n + (p.poids ?? 0), 0)
      : null,
    receptions: new Set(rows.map((p) => p.numrec)).size,
    groups: Array.from(groups.values()),
    skipped: 0,
  };
}
export const paletteMerge = (ids: number[], more: number[]) =>
  Array.from(new Set([...ids, ...more]));
export const paletteAvailable = (p: Palette & { cycleAffecte?: number | null }, cycleId?: number) =>
  p.cycleAffecte == null || p.cycleAffecte === cycleId;
export function DrencherPalettePicker({
  path,
  cycleId,
  ids,
  onCancel,
  onConfirm,
}: {
  path: string;
  cycleId?: number;
  ids: number[];
  onCancel: () => void;
  onConfirm: (s: PaletteSummary) => void;
}) {
  const [draft, setDraft] = useState(ids),
    [reception, setReception] = useState<number | string>(''),
    [numpal, setNumpal] = useState<number | string>(''),
    [search, setSearch] = useState(''),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState<string | null>('50'),
    [codvar, setCodvar] = useState<string | null>(null),
    [refadh, setRefadh] = useState<string | null>(null),
    [refver, setRefver] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [info, setInfo] = useState('');
  const [query] = useDebouncedValue(search, 200);
  const filters = useApi<{
    varietes: { value: number; label: string }[];
    adherents: { value: number; label: string }[];
    vergers: { value: number; label: string }[];
  }>(path + '/palettes/filters');
  const args = new URLSearchParams({
    page: String(page),
    pageSize: pageSize ?? '50',
    search: query,
  });
  for (const [k, v] of Object.entries({ reception, numpal, codvar, refadh, refver }))
    if (v) args.set(k, String(v));
  const result = useApi<{
    rows: (Palette & { cycleAffecte: number | null; etatCycle: string | null })[];
    total: number;
  }>(path + '/palettes/choices?' + args.toString());
  const options = (rows?: { value: number; label: string }[]) =>
    rows?.map((r) => ({ value: String(r.value), label: r.label })) ?? [];
  async function allLot() {
    if (!reception) {
      setError('Indiquer un numéro de réception.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const s = await api<PaletteSummary>(path + '/palettes/selection', 'POST', {
        cycleId,
        ids: draft,
        ajouterLot: Number(reception),
      });
      setDraft(s.ids);
      setInfo(
        `${s.count} palettes sélectionnées. ${s.skipped} palettes indisponibles du lot exclues.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sélection impossible.');
    } finally {
      setBusy(false);
    }
  }
  async function confirm() {
    setBusy(true);
    setError('');
    try {
      onConfirm(
        await api<PaletteSummary>(path + '/palettes/selection', 'POST', { cycleId, ids: draft }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Confirmation impossible.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      opened
      onClose={() => {
        if (!busy) onCancel();
      }}
      title="Sélectionner les palettes"
      size="95%"
      centered
    >
      <Stack>
        {error ? <Alert color="red">{error}</Alert> : null}
        {info ? <Alert color="blue">{info}</Alert> : null}
        <Group align="end">
          <NumberInput
            label="Numéro de réception"
            min={1}
            value={reception}
            onChange={(v) => {
              setReception(v);
              setPage(1);
            }}
          />
          <NumberInput
            label="Numéro de palette"
            min={1}
            value={numpal}
            onChange={(v) => {
              setNumpal(v);
              setPage(1);
            }}
          />
          <TextInput
            label="Recherche rapide"
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
          />
          <Select
            label="Variété"
            searchable
            clearable
            value={codvar}
            data={options(filters.data?.varietes)}
            onChange={(v) => {
              setCodvar(v);
              setPage(1);
            }}
          />
          <Select
            label="Producteur / adhérent"
            searchable
            clearable
            value={refadh}
            data={options(filters.data?.adherents)}
            onChange={(v) => {
              setRefadh(v);
              setPage(1);
            }}
          />
          <Select
            label="Verger"
            searchable
            clearable
            value={refver}
            data={options(filters.data?.vergers)}
            onChange={(v) => {
              setRefver(v);
              setPage(1);
            }}
          />
        </Group>
        {result.error || filters.error ? (
          <Alert color="red">{result.error || filters.error}</Alert>
        ) : null}
        <Group justify="space-between">
          <Group>
            <Button
              variant="light"
              disabled={busy || !result.data}
              onClick={() =>
                setDraft((old) =>
                  paletteMerge(
                    old,
                    result
                      .data!.rows.filter((p) => paletteAvailable(p, cycleId))
                      .map((p) => p.numpal),
                  ),
                )
              }
            >
              Sélectionner la page
            </Button>
            <Button
              variant="light"
              loading={busy}
              disabled={!reception}
              onClick={() => void allLot()}
            >
              Toutes les palettes disponibles du lot
            </Button>
            <Button variant="subtle" disabled={busy} onClick={() => setDraft([])}>
              Retirer toute la sélection
            </Button>
          </Group>
          <Badge>{draft.length} sélectionnées</Badge>
        </Group>
        <Table.ScrollContainer minWidth={900} h={430}>
          <Table stickyHeader striped>
            <Table.Thead>
              <Table.Tr>
                {[
                  '',
                  'Réception',
                  'Palette',
                  'Variété',
                  'Producteur / adhérent',
                  'Verger',
                  'Poids (kg)',
                  'Disponibilité',
                ].map((h, i) => (
                  <Table.Th key={i}>{h}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {result.data?.rows.map((p) => (
                <Table.Tr key={p.numpal}>
                  <Table.Td>
                    <Checkbox
                      aria-label={`Palette ${p.numpal}`}
                      disabled={
                        busy || (!paletteAvailable(p, cycleId) && !draft.includes(p.numpal))
                      }
                      checked={draft.includes(p.numpal)}
                      onChange={(e) => {
                        const selected = e.currentTarget.checked;
                        setDraft((old) =>
                          selected
                            ? paletteMerge(old, [p.numpal])
                            : old.filter((n) => n !== p.numpal),
                        );
                      }}
                    />
                  </Table.Td>
                  <Table.Td>{p.numrec}</Table.Td>
                  <Table.Td>{p.numpal}</Table.Td>
                  <Table.Td>{p.variete ?? '—'}</Table.Td>
                  <Table.Td>{p.adherent ?? '—'}</Table.Td>
                  <Table.Td>{p.verger ?? '—'}</Table.Td>
                  <Table.Td>{number(p.poids)}</Table.Td>
                  <Table.Td>
                    {p.cycleAffecte
                      ? `Cycle #${p.cycleAffecte} (${p.etatCycle})${p.cycleAffecte === cycleId ? ' · ce cycle' : ''}`
                      : 'Disponible'}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        <Group justify="space-between">
          <Pagination
            value={page}
            onChange={setPage}
            total={Math.max(1, Math.ceil((result.data?.total ?? 0) / Number(pageSize)))}
          />
          <Select
            label="Palettes par page"
            value={pageSize}
            data={['25', '50']}
            onChange={(v) => {
              setPageSize(v);
              setPage(1);
            }}
          />
        </Group>
        <Text size="sm" c="dimmed">
          La sélection reste conservée entre les pages et les réceptions. Les palettes sont
          réservées à l'enregistrement du brouillon ; l'API recontrôle les conflits.
        </Text>
        <Group justify="end">
          <Button variant="default" disabled={busy} onClick={onCancel}>
            Annuler
          </Button>
          <Button loading={busy} onClick={() => void confirm()}>
            Confirmer la sélection
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
