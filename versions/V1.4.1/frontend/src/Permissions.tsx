import { createContext, useContext, useState } from 'react';
import { Alert, Button, Checkbox, Paper, Select, Stack, Table, Text } from '@mantine/core';
import { api, titles, useApi } from './api';
export interface ModulePermission {
  module: string;
  view: boolean;
  add: boolean;
  modify: boolean;
  delete: boolean;
}
export const PermissionContext = createContext<ModulePermission[]>([]);
export function usePermissions(module: string) {
  return (
    useContext(PermissionContext).find((p) => p.module === module) ?? {
      module,
      view: false,
      add: false,
      modify: false,
      delete: false,
    }
  );
}
const groups: [string, string[]][] = [
  ['Patrimoine agricole', ['adherent', 'verger', 'parcelle']],
  ['Variétés', ['hierarchy', 'culture', 'grpvar', 'variete', 'souvar']],
  ['Commerce / export', ['partenaire', 'destination', 'pays', 'marche']],
  ['Conditionnement', ['grpemb', 'groupart', 'defaut', 'typeecart']],
  ['Origines', ['declaration_verger']],
  [
    'Suivi / qualité',
    ['dashboard', 'receptions', 'caisserie', 'versements', 'export', 'ecarts', 'drencher'],
  ],
  ['Assistance / administration', ['assistant', 'compare', 'sync', 'journal']],
];
const names: Record<string, string> = {
  ...titles,
  hierarchy: 'Hiérarchie',
  partenaire: 'Partenaires',
  destination: 'Destinations',
  pays: 'Pays',
  grpemb: 'Groupes emballages',
  groupart: 'Groupes articles',
  defaut: 'Défauts',
  typeecart: 'Types d’écart',
  declaration_verger: 'Origines / déclarations',
  receptions: 'Réceptions',
  caisserie: 'Caisserie',
  versements: 'Versements',
  export: 'Export',
  ecarts: 'Écarts',
  dashboard: 'Tableau de bord',
  assistant: 'Assistant IA',
  drencher: 'Drencher',
  compare: 'Comparaison ZAOUIA / DIAF',
  sync: 'Synchronisation',
  journal: 'Journal',
};
const readOnly = [
  'dashboard',
  'hierarchy',
  'receptions',
  'caisserie',
  'versements',
  'export',
  'ecarts',
  'drencher',
  'assistant',
  'compare',
  'journal',
];
export function UserPermissions({
  users,
}: {
  users: { id: number; display_name: string; role: string }[];
}) {
  const [id, setId] = useState<string | null>(null),
    [draft, setDraft] = useState<ModulePermission[] | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const result = useApi<ModulePermission[]>(id ? `/admin/users/${id}/permissions` : null);
  const data = draft ?? result.data ?? [];
  const consultation = users.find((u) => String(u.id) === id)?.role === 'Consultation';
  function change(module: string, action: 'view' | 'add' | 'modify' | 'delete', value: boolean) {
    setDraft(
      data.map((p) =>
        p.module !== module
          ? p
          : action === 'view' && !value
            ? { ...p, view: false, add: false, modify: false, delete: false }
            : { ...p, [action]: value },
      ),
    );
  }
  async function save() {
    setBusy(true);
    setError('');
    try {
      await api(`/admin/users/${id}/permissions`, 'PUT', { permissions: data });
      result.refresh();
      setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Stack>
      <Alert>
        Admin conserve son accès complet. Consultation reste en lecture seule. Les exercices
        attribués et les archives restent applicables ; modifier ces droits révoque les sessions
        précédentes.
      </Alert>
      <Select
        label="Utilisateur"
        searchable
        data={users
          .filter((u) => u.role !== 'Admin')
          .map((u) => ({ value: String(u.id), label: u.display_name + ' · ' + u.role }))}
        value={id}
        onChange={(value) => {
          setId(value);
          setDraft(null);
          setError('');
        }}
      />
      {result.error || error ? <Alert color="red">{error || result.error}</Alert> : null}
      {id
        ? groups.map(([label, modules]) => (
            <Paper withBorder p="md" key={label}>
              <Text fw={750} mb="md">
                {label}
              </Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Module</Table.Th>
                    {['Voir', 'Ajouter', 'Modifier', 'Supprimer'].map((a) => (
                      <Table.Th key={a}>{a}</Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {modules.map((module) => {
                    const p = data.find((p) => p.module === module);
                    return p ? (
                      <Table.Tr key={module}>
                        <Table.Td>{names[module] ?? module}</Table.Td>
                        {(['view', 'add', 'modify', 'delete'] as const).map((action) => (
                          <Table.Td key={action}>
                            <Checkbox
                              aria-label={`${names[module] ?? module} : ${action}`}
                              checked={p[action]}
                              disabled={
                                busy ||
                                (action !== 'view' &&
                                  (!p.view ||
                                    consultation ||
                                    readOnly.includes(module) ||
                                    (module === 'sync' && action !== 'modify')))
                              }
                              onChange={(e) => change(module, action, e.currentTarget.checked)}
                            />
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ) : null;
                  })}
                </Table.Tbody>
              </Table>
            </Paper>
          ))
        : null}
      <Button loading={busy} disabled={!id || !draft} onClick={() => void save()}>
        Enregistrer les droits
      </Button>
    </Stack>
  );
}
