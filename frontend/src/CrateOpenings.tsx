import { Alert, Badge, Button, Checkbox, Drawer, Group, NumberInput, Paper, Select, Stack, Table, Text, Textarea, TextInput } from '@mantine/core';
import { useState } from 'react';
import { api, useApi } from './api';
import { State } from './components';

interface Inventory { id: number; crate_type: number; revision: number; opening_date: string; campaign_label: string; campaign_start: string; owned_total: number; physical_quantity: number | null; note: string; created_by: string; created_at: string }
interface Due { opening_id: number; producer_id: number; orchard_id: number; quantity: number }
interface Result { installed: boolean; campaignStart?: string; revisions?: { crate_type: number; revision: number }[]; rows: Inventory[]; dues: Due[]; types: { value: number; label: string }[]; producers?: { value: number; label: string }[]; orchards?: { value: number; label: string; producer: number }[] }
export function CrateOpenings({ contextId, label, close }: { contextId: number; label: string; close: () => void }) {
  const result = useApi<Result>(`/admin/contexts/${contextId}/crate-openings`);
  const [type, setType] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [owned, setOwned] = useState<number | string>('');
  const [physical, setPhysical] = useState<number | string>('');
  const [dues, setDues] = useState<{ producerId: number | string; orchardId: number | string; quantity: number | string }[]>([]);
  const [note, setNote] = useState(''), [confirmed, setConfirmed] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState('');
  async function save() {
    if (owned === '' || !type || !date || dues.some((d) => d.producerId === '' || d.quantity === '')) { setError('Renseignez les quantités et références obligatoires.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await api<{ message: string }>(`/admin/contexts/${contextId}/crate-openings`, 'POST', { crateType: Number(type), openingDate: date, ownedTotal: Number(owned), physicalQuantity: physical === '' ? null : Number(physical), dues: dues.map((d) => ({ producerId: Number(d.producerId), orchardId: d.orchardId === '' ? null : Number(d.orchardId), quantity: Number(d.quantity) })), note, confirmed, expectedRevision: result.data?.revisions?.find((r) => r.crate_type === Number(type))?.revision ?? 0 });
      setMessage(response.message); setConfirmed(false); result.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Enregistrement indisponible.'); } finally { setBusy(false); }
  }
  return <Drawer opened onClose={close} position="right" size="xl" title={`Inventaires d’ouverture · ${label}`}>
    <State loading={result.loading} error={result.error} retry={result.refresh}>
      <Stack>
        <Alert color="orange">Inventaires déclaratifs réservés aux administrateurs. Les anciennes révisions sont conservées. Aucun mouvement historique n’est modifié. L’enregistrement ne certifie pas les soldes courants.</Alert>
        {result.data && !result.data.installed ? <Alert>La migration administrative 014 doit être appliquée pour enregistrer les ouvertures.</Alert> : null}
        {result.data?.installed ? <>
          <Group grow><Select label="Type de caisse" searchable data={result.data.types.map((t) => ({ value: String(t.value), label: `${t.label} [${t.value}]` }))} value={type} onChange={setType}/><TextInput type="date" label="Date d’ouverture · début de journée" value={date} onChange={(e) => setDate(e.currentTarget.value)}/></Group>
          <Group grow><NumberInput label="Total appartenant à la station" min={0} max={1e12} allowDecimal={false} value={owned} onChange={setOwned}/><NumberInput label="Physiquement présent · facultatif" description="Laisser vide si inconnu, ne pas saisir zéro par défaut." min={0} max={1e12} allowDecimal={false} value={physical} onChange={setPhysical}/></Group>
          <Text fw={600} size="sm">Quantités initiales dues connues et validées · facultatif</Text>
          <Text size="xs" c="dimmed">Une ligne par producteur/verger. Laisser le verger vide si l’attribution n’est pas prouvée. Une liste partielle ne représente pas toutes les dettes.</Text>
          {dues.map((d,i) => <Paper p="sm" withBorder key={i}><Group grow><Select label="Producteur" searchable data={(result.data?.producers ?? []).map((p) => ({ value: String(p.value), label: `${p.label} [${p.value}]` }))} value={d.producerId === '' ? null : String(d.producerId)} onChange={(v) => setDues((rows) => rows.map((r,j) => j === i ? { ...r, producerId: v ?? '', orchardId: '' } : r))}/><Select label="Verger · facultatif" searchable clearable data={(result.data?.orchards ?? []).filter((p) => p.producer === Number(d.producerId)).map((p) => ({ value: String(p.value), label: `${p.label} [${p.value}]` }))} value={d.orchardId === '' ? null : String(d.orchardId)} onChange={(v) => setDues((rows) => rows.map((r,j) => j === i ? { ...r, orchardId: v ?? '' } : r))}/><NumberInput label="Quantité due" min={0} max={1e12} allowDecimal={false} value={d.quantity} onChange={(v) => setDues((rows) => rows.map((r,j) => j === i ? { ...r, quantity: v } : r))}/></Group><Button variant="subtle" size="xs" onClick={() => setDues((rows) => rows.filter((_,j) => j !== i))}>Retirer cette ligne non enregistrée</Button></Paper>)}
          <Button variant="light" disabled={dues.length >= 200} onClick={() => setDues((rows) => [...rows, { producerId: '', orchardId: '', quantity: '' }])}>Ajouter un solde initial producteur</Button>
          <Textarea label="Justification / référence de l’inventaire" maxLength={500} value={note} onChange={(e) => setNote(e.currentTarget.value)}/>
          <Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.currentTarget.checked)} label="Je confirme l’inventaire et les seules quantités initiales renseignées, après contrôle. Une nouvelle révision sera historisée."/>
          {error ? <Alert color="red">{error}</Alert> : null}{message ? <Alert color="green">{message}</Alert> : null}
          <Button loading={busy} disabled={!confirmed} onClick={() => void save()}>Enregistrer une révision d’ouverture</Button>
          <Text fw={700}>Historique des inventaires</Text><Text size="xs" c="dimmed">200 dernières révisions. Les ouvertures ne sont pas additionnées entre révisions.</Text>
          {result.data.rows.map((r) => <Paper withBorder p="md" key={r.id}><Group justify="space-between"><Text fw={600}>{result.data?.types.find((t) => t.value === r.crate_type)?.label ?? r.crate_type} · {r.campaign_label}</Text><Badge>Révision {r.revision}</Badge></Group><Text size="sm">{r.opening_date} · Propriété {r.owned_total} · Physique {r.physical_quantity ?? 'inconnu'}</Text><Text size="xs" c="dimmed">{r.created_by} · {r.created_at} · {r.note}</Text>{result.data?.dues.some((d) => d.opening_id === r.id) ? <Table><Table.Thead><Table.Tr><Table.Th>Adhérent</Table.Th><Table.Th>Verger</Table.Th><Table.Th>Initial dû</Table.Th></Table.Tr></Table.Thead><Table.Tbody>{result.data.dues.filter((d) => d.opening_id === r.id).map((d) => <Table.Tr key={`${d.producer_id}:${d.orchard_id}`}><Table.Td>{d.producer_id}</Table.Td><Table.Td>{d.orchard_id || 'Non attribué'}</Table.Td><Table.Td>{d.quantity}</Table.Td></Table.Tr>)}</Table.Tbody></Table> : null}</Paper>)}
        </> : null}
      </Stack>
    </State>
  </Drawer>;
}
