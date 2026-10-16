import { UserPermissions } from './Permissions';
import { CrateOpenings } from './CrateOpenings';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import type { Context } from './api';
import { api, display, useApi } from './api';
import { PageHeading, State } from './components';
interface Server {
  id: number;
  label: string;
  host: string;
  port: number;
  username: string;
  ssl_mode: string;
}
interface Station {
  id: number;
  code: string;
  label: string;
  server_id: number;
  is_master: boolean;
}
interface ConfigContext {
  id: number;
  station_id: number;
  database_name: string;
  label: string;
  read_only: boolean;
  local_refsta: number | null;
  show_in_selectors?: boolean | number;
}
interface AppUser {
  id: number;
  username: string;
  display_name: string;
  role: string;
  enabled: boolean;
}
interface Config {
  servers: Server[];
  stations: Station[];
  contexts: ConfigContext[];
  users: AppUser[];
  grants: { user_id: number; context_id: number }[];
  routes: { id: number; source_context_id: number; target_context_id: number; enabled: boolean }[];
}
export function Administration({
  onConfigured,
  initialTab,
}: {
  onConfigured: () => void;
  initialTab?: string;
}) {
  const result = useApi<Config>('/admin/configuration');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [server, setServer] = useState({
    label: '',
    host: '',
    port: 3306,
    username: '',
    password: '',
    sslMode: 'Required',
  });
  const [serverId, setServerId] = useState<number | null>(null);
  const [station, setStation] = useState({
    code: 'ZAOUIA',
    label: '',
    serverId: '',
    isMaster: true,
  });
  const [context, setContext] = useState({
    stationId: '',
    databaseName: 'logista',
    label: '',
    readOnly: true,
    showInSelectors: true,
    localRefsta: '' as number | string,
  });
  const [contextId, setContextId] = useState<number | null>(null);
  const [inventory, setInventory] = useState<ConfigContext | null>(null);
  const [user, setUser] = useState({
    username: '',
    displayName: '',
    password: '',
    role: 'Consultation',
    contextIds: [] as string[],
  });
  const [route, setRoute] = useState({ sourceContextId: '', targetContextId: '' });
  const [access, setAccess] = useState({
    id: '',
    role: 'Consultation',
    enabled: true,
    contextIds: [] as string[],
  });
  const servers = result.data?.servers.map((s) => ({ value: String(s.id), label: s.label })) ?? [];
  const stations = result.data?.stations.map((s) => ({ value: String(s.id), label: s.code })) ?? [];
  const contexts =
    result.data?.contexts.map((c) => ({
      value: String(c.id),
      label: `${result.data?.stations.find((s) => s.id === c.station_id)?.code} · ${c.label}${c.read_only ? ' (archive)' : ''}`,
    })) ?? [];
  async function submit(path: string, body: unknown, method = 'POST') {
    setBusy(true);
    setError('');
    try {
      const r = await api<{ message: string }>(path, method, body);
      notifications.show({ message: r.message, color: 'forest' });
      result.refresh();
      onConfigured();
      setServer((s) => ({ ...s, password: '' }));
      setUser((u) => ({ ...u, password: '' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }
  async function test(id: number) {
    setBusy(true);
    setError('');
    try {
      const r = await api<{ connected: boolean; errors: string[]; ambiguousSubvarieties: number }>(
        `/admin/contexts/${id}/test`,
        'POST',
      );
      notifications.show({
        title: 'Contrôle de la base',
        message: `Connexion réussie. ${r.errors.length} colonne(s) manquante(s), ${r.ambiguousSubvarieties} clé(s) sous-variété ambiguë(s). ${r.errors.join(', ')}`,
        color: r.errors.length ? 'orange' : 'forest',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {inventory ? <CrateOpenings contextId={inventory.id} label={inventory.label} close={() => setInventory(null)}/> : null}
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="Stations, accès et exercices"
        subtitle="Configurez les bases autorisées. Les secrets MySQL sont protégés et ne sont jamais renvoyés au navigateur."
      />
      {error ? (
        <Alert color="red" mb="lg">
          {error}
        </Alert>
      ) : null}
      <State loading={result.loading} error={result.error} retry={result.refresh}>
        <Tabs defaultValue={initialTab ?? 'servers'}>
          <Tabs.List mb="lg">
            <Tabs.Tab value="permissions">Droits par module</Tabs.Tab>
            <Tabs.Tab value="servers">Serveurs</Tabs.Tab>
            <Tabs.Tab value="stations">Stations</Tabs.Tab>
            <Tabs.Tab value="contexts">Exercices</Tabs.Tab>
            <Tabs.Tab value="users">Utilisateurs & droits</Tabs.Tab>
            <Tabs.Tab value="routes">Routes DIAF</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="permissions" pt="lg">
            <UserPermissions users={result.data?.users ?? []} />
          </Tabs.Panel>
          <Tabs.Panel value="servers">
            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              <Paper withBorder p="xl">
                <Text fw={700} mb="lg">
                  {serverId ? 'Modifier le serveur' : 'Ajouter un serveur MySQL'}
                </Text>
                <Stack>
                  <TextInput
                    label="Libellé"
                    value={server.label}
                    onChange={(e) => setServer({ ...server, label: e.currentTarget.value })}
                  />
                  <TextInput
                    label="Adresse serveur"
                    value={server.host}
                    onChange={(e) => setServer({ ...server, host: e.currentTarget.value })}
                  />
                  <NumberInput
                    label="Port"
                    value={server.port}
                    min={1}
                    max={65535}
                    onChange={(v) => setServer({ ...server, port: Number(v) })}
                  />
                  <TextInput
                    label="Compte MySQL"
                    value={server.username}
                    onChange={(e) => setServer({ ...server, username: e.currentTarget.value })}
                  />
                  <PasswordInput
                    label={serverId ? 'Nouveau secret (vide = conserver)' : 'Secret MySQL'}
                    value={server.password}
                    onChange={(e) => setServer({ ...server, password: e.currentTarget.value })}
                    autoComplete="new-password"
                  />
                  <Select
                    label="Transport TLS"
                    value={server.sslMode}
                    data={['Required', 'VerifyCA', 'VerifyFull', 'Preferred', 'None']}
                    onChange={(v) => setServer({ ...server, sslMode: v ?? 'Required' })}
                  />
                  <Text size="xs" c="dimmed">
                    TLS requis par défaut. Une exception pour un ancien serveur doit être validée
                    avec l’administrateur réseau.
                  </Text>
                  <Group>
                    <Button
                      loading={busy}
                      onClick={() =>
                        void submit(
                          `/admin/servers${serverId ? `/${serverId}` : ''}`,
                          server,
                          serverId ? 'PUT' : 'POST',
                        )
                      }
                    >
                      Enregistrer le serveur
                    </Button>
                    {serverId ? (
                      <Button
                        variant="default"
                        onClick={() => {
                          setServerId(null);
                          setServer({
                            label: '',
                            host: '',
                            port: 3306,
                            username: '',
                            password: '',
                            sslMode: 'Required',
                          });
                        }}
                      >
                        Nouveau
                      </Button>
                    ) : null}
                  </Group>
                </Stack>
              </Paper>
              <Paper withBorder p="xl">
                <Text fw={700} mb="lg">
                  Serveurs configurés
                </Text>
                <Stack>
                  {result.data?.servers.map((s) => (
                    <Paper key={s.id} withBorder p="md">
                      <Group justify="space-between">
                        <div>
                          <Text fw={600}>{s.label}</Text>
                          <Text size="sm" c="dimmed">
                            {s.host}:{s.port} · {s.username}
                          </Text>
                          <Badge mt={5} variant="light">
                            {s.ssl_mode}
                          </Badge>
                        </div>
                        <Button
                          variant="light"
                          size="xs"
                          onClick={() => {
                            setServerId(s.id);
                            setServer({
                              label: s.label,
                              host: s.host,
                              port: s.port,
                              username: s.username,
                              password: '',
                              sslMode: s.ssl_mode,
                            });
                          }}
                        >
                          Modifier
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </SimpleGrid>
          </Tabs.Panel>
          <Tabs.Panel value="stations">
            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              <Paper withBorder p="xl">
                <Stack>
                  <Text fw={700}>Ajouter une station</Text>
                  <TextInput
                    label="Code"
                    value={station.code}
                    onChange={(e) =>
                      setStation({
                        ...station,
                        code: e.currentTarget.value.toUpperCase(),
                        isMaster: e.currentTarget.value.toUpperCase() === 'ZAOUIA',
                      })
                    }
                  />
                  <TextInput
                    label="Libellé"
                    value={station.label}
                    onChange={(e) => setStation({ ...station, label: e.currentTarget.value })}
                  />
                  <Select
                    label="Serveur"
                    data={servers}
                    value={station.serverId}
                    onChange={(v) => setStation({ ...station, serverId: v ?? '' })}
                  />
                  <Checkbox
                    label="Base maître des référentiels"
                    checked={station.isMaster}
                    disabled={station.code !== 'ZAOUIA'}
                    onChange={(e) => setStation({ ...station, isMaster: e.currentTarget.checked })}
                  />
                  <Button
                    loading={busy}
                    onClick={() =>
                      void submit('/admin/stations', {
                        ...station,
                        serverId: Number(station.serverId),
                      })
                    }
                  >
                    Ajouter
                  </Button>
                </Stack>
              </Paper>
              <Paper withBorder p="xl">
                <Stack>
                  {result.data?.stations.map((s) => (
                    <Group key={s.id} justify="space-between">
                      <Text fw={600}>
                        {s.code} · {s.label}
                      </Text>
                      <Badge variant="light">{s.is_master ? 'Maître' : 'Station locale'}</Badge>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </SimpleGrid>
          </Tabs.Panel>
          <Tabs.Panel value="contexts">
            <Alert color="orange" mb="lg">
              Les nouveaux contextes sont en lecture seule par défaut. Confirmez vous-même le
              libellé de l’exercice ; le suffixe de la base ne le détermine pas.
            </Alert>
            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              <Paper withBorder p="xl">
                <Stack>
                  <Text fw={700}>{contextId ? 'Modifier l’exercice' : 'Ajouter un exercice'}</Text>
                  <Select
                    label="Station"
                    data={stations}
                    value={context.stationId}
                    disabled={!!contextId}
                    onChange={(v) => setContext({ ...context, stationId: v ?? '' })}
                  />
                  <TextInput
                    label="Nom réel de la base"
                    value={context.databaseName}
                    disabled={!!contextId}
                    onChange={(e) =>
                      setContext({ ...context, databaseName: e.currentTarget.value })
                    }
                  />
                  <TextInput
                    label="Libellé confirmé de l’exercice"
                    placeholder="2026/2027"
                    value={context.label}
                    onChange={(e) => setContext({ ...context, label: e.currentTarget.value })}
                  />
                  <NumberInput
                    label="refsta local (facultatif)"
                    value={context.localRefsta}
                    onChange={(v) => setContext({ ...context, localRefsta: v })}
                  />
                  <Checkbox
                    label="Archive / lecture seule"
                    checked={context.readOnly}
                    onChange={(e) => setContext({ ...context, readOnly: e.currentTarget.checked })}
                  />
                  <Checkbox
                    label="Afficher dans les sélecteurs"
                    description="Masquer conserve la configuration et les autorisations. Réactivation possible ici."
                    checked={context.showInSelectors}
                    onChange={(e) => setContext({ ...context, showInSelectors: e.currentTarget.checked })}
                  />
                  <Group>
                    <Button
                      loading={busy}
                      onClick={() =>
                        void submit(
                          `/admin/contexts${contextId ? `/${contextId}` : ''}`,
                          {
                            ...context,
                            stationId: Number(context.stationId),
                            localRefsta:
                              context.localRefsta === '' ? null : Number(context.localRefsta),
                          },
                          contextId ? 'PUT' : 'POST',
                        )
                      }
                    >
                      Enregistrer
                    </Button>
                    {contextId ? (
                      <Button
                        variant="default"
                        onClick={() => {
                          setContextId(null);
                          setContext({
                            stationId: '',
                            databaseName: 'logista',
                            label: '',
                            readOnly: true,
                            showInSelectors: true,
                            localRefsta: '',
                          });
                        }}
                      >
                        Nouveau
                      </Button>
                    ) : null}
                  </Group>
                </Stack>
              </Paper>
              <Paper withBorder p="xl">
                <Stack>
                  {result.data?.contexts.map((c) => (
                    <Paper key={c.id} withBorder p="md">
                      <Text fw={600}>
                        {result.data?.stations.find((s) => s.id === c.station_id)?.code} · {c.label}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {c.database_name} · refsta {display(c.local_refsta)}
                      </Text>
                      <Badge color={c.read_only ? 'gray' : 'forest'} variant="light" my="sm">
                        {c.read_only ? 'Archive · lecture seule' : 'Modifiable'}
                      </Badge>
                      <Badge color={c.show_in_selectors === false || c.show_in_selectors === 0 ? 'orange' : 'gray'} variant="light" ml="xs">
                        {c.show_in_selectors === false || c.show_in_selectors === 0 ? 'Masqué des sélecteurs' : 'Visible dans les sélecteurs'}
                      </Badge>
                      <Group>
                        <Button
                          size="xs"
                          variant="light"
                          loading={busy}
                          onClick={() => void test(c.id)}
                        >
                          Tester le schéma
                        </Button>
                        {!c.read_only ? <Button size="xs" variant="light" onClick={() => setInventory(c)}>Inventaires caisserie</Button> : null}
                        <Button
                          size="xs"
                          variant="subtle"
                          onClick={() => {
                            setContextId(c.id);
                            setContext({
                              stationId: String(c.station_id),
                              databaseName: c.database_name,
                              label: c.label,
                              readOnly: !!c.read_only,
                              showInSelectors: c.show_in_selectors !== false && c.show_in_selectors !== 0,
                              localRefsta: c.local_refsta ?? '',
                            });
                          }}
                        >
                          Modifier
                        </Button>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </SimpleGrid>
          </Tabs.Panel>
          <Tabs.Panel value="users">
            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              <Paper withBorder p="xl">
                <Stack>
                  <Text fw={700}>Créer un utilisateur</Text>
                  <TextInput
                    label="Identifiant"
                    value={user.username}
                    onChange={(e) => setUser({ ...user, username: e.currentTarget.value })}
                  />
                  <TextInput
                    label="Nom affiché"
                    value={user.displayName}
                    onChange={(e) => setUser({ ...user, displayName: e.currentTarget.value })}
                  />
                  <PasswordInput
                    label="Mot de passe (12 caractères minimum)"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.currentTarget.value })}
                    autoComplete="new-password"
                  />
                  <Select
                    label="Rôle"
                    data={['Admin', 'Gestionnaire', 'Consultation']}
                    value={user.role}
                    onChange={(v) => setUser({ ...user, role: v ?? 'Consultation' })}
                  />
                  <MultiSelect
                    label="Exercices autorisés"
                    data={contexts}
                    value={user.contextIds}
                    onChange={(v) => setUser({ ...user, contextIds: v })}
                  />
                  <Button
                    loading={busy}
                    onClick={() =>
                      void submit('/admin/users', {
                        ...user,
                        contextIds: user.contextIds.map(Number),
                      })
                    }
                  >
                    Créer le compte
                  </Button>
                  <Text size="xs" c="dimmed">
                    Les administrateurs accèdent à tous les contextes configurés. Les autres rôles
                    nécessitent une attribution explicite.
                  </Text>
                </Stack>
              </Paper>
              <Paper withBorder p="xl">
                <Stack>
                  <Text fw={700}>Modifier les droits</Text>
                  <Select
                    label="Utilisateur"
                    data={
                      result.data?.users.map((u) => ({
                        value: String(u.id),
                        label: `${u.display_name} (${u.username})`,
                      })) ?? []
                    }
                    value={access.id}
                    onChange={(v) => {
                      const u = result.data?.users.find((x) => x.id === Number(v));
                      if (u)
                        setAccess({
                          id: String(u.id),
                          role: u.role,
                          enabled: !!u.enabled,
                          contextIds:
                            result.data?.grants
                              .filter((g) => g.user_id === u.id)
                              .map((g) => String(g.context_id)) ?? [],
                        });
                    }}
                  />
                  <Select
                    label="Rôle"
                    data={['Admin', 'Gestionnaire', 'Consultation']}
                    value={access.role}
                    onChange={(v) => setAccess({ ...access, role: v ?? 'Consultation' })}
                  />
                  <MultiSelect
                    label="Exercices autorisés"
                    data={contexts}
                    value={access.contextIds}
                    onChange={(v) => setAccess({ ...access, contextIds: v })}
                  />
                  <Checkbox
                    label="Compte actif"
                    checked={access.enabled}
                    onChange={(e) => setAccess({ ...access, enabled: e.currentTarget.checked })}
                  />
                  <Button
                    loading={busy}
                    disabled={!access.id}
                    variant="light"
                    onClick={() =>
                      void submit(
                        `/admin/users/${access.id}/access`,
                        { ...access, contextIds: access.contextIds.map(Number) },
                        'PUT',
                      )
                    }
                  >
                    Appliquer les droits
                  </Button>
                </Stack>
              </Paper>
            </SimpleGrid>
          </Tabs.Panel>
          <Tabs.Panel value="routes">
            <Paper withBorder p="xl">
              <Stack>
                <Text fw={700}>Associer les exercices ZAOUIA et DIAF</Text>
                <Alert color="orange">
                  Vérifiez que les deux contextes représentent le même exercice. La route conserve
                  les identifiants et exclut refsta.
                </Alert>
                <Select
                  label="Source ZAOUIA maître"
                  data={contexts.filter(
                    (c) =>
                      result.data?.stations.find(
                        (s) =>
                          s.id ===
                          result.data?.contexts.find((x) => String(x.id) === c.value)?.station_id,
                      )?.code === 'ZAOUIA',
                  )}
                  value={route.sourceContextId}
                  onChange={(v) => setRoute({ ...route, sourceContextId: v ?? '' })}
                />
                <Select
                  label="Destination DIAF"
                  data={contexts.filter(
                    (c) =>
                      result.data?.stations.find(
                        (s) =>
                          s.id ===
                          result.data?.contexts.find((x) => String(x.id) === c.value)?.station_id,
                      )?.code === 'DIAF',
                  )}
                  value={route.targetContextId}
                  onChange={(v) => setRoute({ ...route, targetContextId: v ?? '' })}
                />
                <Button
                  loading={busy}
                  onClick={() =>
                    void submit('/admin/routes', {
                      sourceContextId: Number(route.sourceContextId),
                      targetContextId: Number(route.targetContextId),
                    })
                  }
                >
                  Ajouter la route
                </Button>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Source</Table.Th>
                      <Table.Th>Destination</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {result.data?.routes.map((r) => (
                      <Table.Tr key={r.id}>
                        <Table.Td>
                          {contexts.find((c) => c.value === String(r.source_context_id))?.label}
                        </Table.Td>
                        <Table.Td>
                          {contexts.find((c) => c.value === String(r.target_context_id))?.label}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </State>
    </>
  );
}
export function EmptyConfiguration({
  contexts,
  onAdmin,
}: {
  contexts: Context[];
  onAdmin: () => void;
}) {
  return (
    <Paper withBorder p={50}>
      <Stack align="center">
        <Text fw={700} size="xl">
          {contexts.length
            ? 'Choisissez votre station et votre exercice'
            : 'Configurez votre premier exercice'}
        </Text>
        <Text c="dimmed" ta="center">
          Ajoutez le serveur MySQL, la station ZAOUIA puis la base courante. Les données restent
          dans votre base historique.
        </Text>
        <Button onClick={onAdmin}>Ouvrir l’administration</Button>
      </Stack>
    </Paper>
  );
}
