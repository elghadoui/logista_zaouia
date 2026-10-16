import {
  Alert,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Button,
  Divider,
  Group,
  NavLink,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconDashboard,
  IconHistory,
  IconLeaf,
  IconLogout,
  IconMap2,
  IconSettings,
  IconShieldLock,
  IconSwitchHorizontal,
  IconTrees,
  IconUsers,
} from './icons';
import { useEffect, useState } from 'react';
import type { Context, Entity, Row, User } from './api';
import { api, setCsrf, titles, useApi } from './api';
import { Administration, EmptyConfiguration } from './Administration';
import { Dashboard } from './Dashboard';
import { EntityList } from './EntityList';
import { Hierarchy } from './Hierarchy';
import { Journal, Synchronization } from './JournalSync';
import { RecordView } from './RecordView';
import { State } from './components';
interface Selection {
  entity: string;
  row: Row;
  creating: boolean;
}
export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    void api<User>('/auth/me')
      .then((u) => {
        setUser(u);
        setCsrf(u.csrf);
      })
      .catch(() => undefined)
      .finally(() => setChecking(false));
  }, []);
  if (checking)
    return (
      <State loading>
        <div />
      </State>
    );
  if (!user)
    return (
      <Login
        onLogin={(u) => {
          setCsrf(u.csrf);
          setUser(u);
        }}
      />
    );
  return (
    <Workspace
      user={user}
      onLogout={async () => {
        try {
          await api('/auth/logout', 'POST');
        } finally {
          setCsrf('');
          setUser(null);
        }
      }}
    />
  );
}
function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function login() {
    setBusy(true);
    setError('');
    try {
      onLogin(await api<User>('/auth/login', 'POST', { username, password }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connexion impossible');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <section className="login-story">
        <div className="brand-light">
          <span className="brand-mark">
            <IconLeaf size={30} />
          </span>
          <div>
            <Text fw={800} size="xl">
              VITASOUSS
            </Text>
            <Text size="xs" opacity={0.65}>
              RÉFÉRENTIELS
            </Text>
          </div>
        </div>
        <div>
          <Text className="eyebrow" c="#aecfc0">
            LE PATRIMOINE AGRICOLE, EN CONFIANCE
          </Text>
          <h1>
            Une terre.
            <br />
            Deux stations.
            <br />
            Une référence.
          </h1>
          <Text c="#c1d8ce" size="lg" maw={430}>
            Adhérents, vergers et variétés réunis dans un espace de travail commun.
          </Text>
          <Group mt={40}>
            <Badge color="forest" variant="light" size="lg">
              ZAOUIA · Maître
            </Badge>
            <Badge color="orange" variant="light" size="lg">
              DIAF
            </Badge>
          </Group>
        </div>
        <Text c="#a9c7b8" size="xs">
          VITASOUSS · Espace interne de gestion
        </Text>
      </section>
      <section className="login-form">
        <Paper p={{ base: 'lg', sm: 40 }} w="100%" maw={460}>
          <IconShieldLock size={32} color="#367d50" />
          <Text component="h2" size="30px" fw={750} mt="lg">
            Bienvenue dans votre espace.
          </Text>
          <Text c="dimmed" size="sm" mt={8} mb={30}>
            Connectez-vous pour accéder aux référentiels de votre station.
          </Text>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void login();
            }}
          >
            <Stack>
              <TextInput
                label="Identifiant"
                placeholder="Votre identifiant"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                required
              />
              <PasswordInput
                label="Mot de passe"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />
              {error ? <Alert color="red">{error}</Alert> : null}
              <Button type="submit" size="md" loading={busy} mt="sm">
                Se connecter
              </Button>
            </Stack>
          </form>
          <Divider my="xl" />
          <Text c="dimmed" size="xs">
            L’accès dépend de vos droits et des exercices autorisés. Les archives restent en lecture
            seule.
          </Text>
        </Paper>
      </section>
    </div>
  );
}
function Workspace({ user, onLogout }: { user: User; onLogout: () => void }) {
  const contexts = useApi<Context[]>('/contexts');
  const catalog = useApi<Entity[]>('/catalog');
  const [contextId, setContextId] = useState<number | null>(null);
  const [station, setStation] = useState('');
  const [page, setPage] = useState('dashboard');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [opened, setOpened] = useState(false);
  const [trail, setTrail] = useState<Selection[]>([]);
  const context =
    contexts.data?.find((c) => c.id === contextId) ??
    contexts.data?.find((c) => c.station === station) ??
    contexts.data?.find((c) => c.isMaster && !c.readOnly) ??
    contexts.data?.[0];
  const stations = [...new Set(contexts.data?.map((c) => c.station) ?? [])];
  const activeStation = context?.station ?? station;
  const canWrite = !!context && !context.readOnly && user.role !== 'Consultation';
  function navigate(name: string) {
    setPage(name);
    setSelection(null);
    setTrail([]);
    setOpened(false);
  }
  function open(name: string, row: Row) {
    if (selection) setTrail((t) => [...t, selection]);
    setSelection({ entity: name, row, creating: false });
  }
  function create(name: string, row: Row = {}) {
    if (selection) setTrail((t) => [...t, selection]);
    setSelection({ entity: name, row, creating: true });
  }
  function back() {
    if (trail.length) {
      setSelection(trail[trail.length - 1]);
      setTrail((t) => t.slice(0, -1));
    } else setSelection(null);
  }
  function changeContext(id: number | null) {
    setContextId(id);
    setSelection(null);
    setTrail([]);
  }
  const entries = [
    { key: 'adherent', icon: IconUsers },
    { key: 'verger', icon: IconTrees },
    { key: 'parcelle', icon: IconMap2 },
  ];
  return (
    <AppShell
      header={{ height: 82 }}
      navbar={{ width: 242, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding={{ base: 'md', lg: 30 }}
    >
      <AppShell.Header>
        <Group h="100%" px={{ base: 'md', lg: 30 }} justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <Burger opened={opened} onClick={() => setOpened(!opened)} hiddenFrom="sm" size="sm" />
            <div>
              <Text fw={800} size="sm" className="header-title">
                VITASOUSS RÉFÉRENTIELS
              </Text>
              <Text size="xs" c="dimmed" visibleFrom="lg">
                Patrimoine agricole & référentiels partagés
              </Text>
            </div>
          </Group>
          <Group gap="md" wrap="nowrap">
            <Select
              aria-label="Station"
              data={stations}
              value={activeStation || null}
              onChange={(v) => {
                setStation(v ?? '');
                changeContext(contexts.data?.find((c) => c.station === v)?.id ?? null);
              }}
              w={{ base: 105, md: 135 }}
              size="sm"
              leftSection={<IconTrees size={16} />}
            />
            <Select
              aria-label="Exercice"
              data={(contexts.data ?? [])
                .filter((c) => c.station === activeStation)
                .map((c) => ({ value: String(c.id), label: c.label + (c.readOnly ? ' 🔒' : '') }))}
              value={context ? String(context.id) : null}
              onChange={(v) => changeContext(v ? Number(v) : null)}
              w={{ base: 145, md: 185 }}
              size="sm"
            />
            <Group gap="sm" visibleFrom="md">
              <Avatar color="forest" radius="xl">
                {user.name.slice(0, 2).toUpperCase()}
              </Avatar>
              <div>
                <Text fw={600} size="sm">
                  {user.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {user.role}
                </Text>
              </div>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Group className="sidebar-brand" gap={10} px="sm" py="lg">
          <span className="brand-mark">
            <IconLeaf size={24} />
          </span>
          <div>
            <Text fw={850} size="lg">
              VITASOUSS
            </Text>
            <Text className="eyebrow" size="9px">
              CULTIVER LA CONFIANCE
            </Text>
          </div>
        </Group>
        <NavLink
          label="Tableau de bord"
          leftSection={<IconDashboard size={19} />}
          active={page === 'dashboard' && !selection}
          onClick={() => navigate('dashboard')}
        />
        <Text className="nav-section">AGRICULTEURS</Text>
        {entries.map(({ key, icon: Icon }) => (
          <NavLink
            key={key}
            label={titles[key]}
            leftSection={<Icon size={18} />}
            active={page === key || selection?.entity === key}
            onClick={() => navigate(key)}
          />
        ))}
        <Text className="nav-section">VARIÉTÉS</Text>
        <NavLink
          label="Explorer la hiérarchie"
          leftSection={<IconLeaf size={18} />}
          active={page === 'hierarchy'}
          onClick={() => navigate('hierarchy')}
        />
        {['culture', 'grpvar', 'variete', 'souvar'].map((key) => (
          <NavLink
            key={key}
            label={titles[key]}
            pl={38}
            active={page === key || selection?.entity === key}
            onClick={() => navigate(key)}
          />
        ))}
        <Divider my="md" />
        <NavLink
          label="Synchronisation"
          leftSection={<IconSwitchHorizontal size={18} />}
          active={page === 'sync'}
          onClick={() => navigate('sync')}
        />
        <NavLink
          label="Journal"
          leftSection={<IconHistory size={18} />}
          active={page === 'journal'}
          onClick={() => navigate('journal')}
        />
        {user.role === 'Admin' ? (
          <NavLink
            label="Administration"
            leftSection={<IconSettings size={18} />}
            active={page === 'admin'}
            onClick={() => navigate('admin')}
          />
        ) : null}
        <Box mt="auto" pt="xl">
          <Paper className="sidebar-note" p="md">
            <Text size="xs" fw={700}>
              Référentiels historiques
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              Identifiants préservés.
              <br />
              Synchronisation confirmée.
            </Text>
          </Paper>
          <Tooltip label="Fermer votre session">
            <Button
              variant="subtle"
              color="gray"
              fullWidth
              mt="md"
              leftSection={<IconLogout size={17} />}
              onClick={onLogout}
            >
              Se déconnecter
            </Button>
          </Tooltip>
        </Box>
      </AppShell.Navbar>
      <AppShell.Main>
        {context?.readOnly ? (
          <Alert color="orange" mb="lg" title="Archive — lecture seule">
            {context.station} · {context.label}. Les créations et modifications sont bloquées côté
            serveur.
          </Alert>
        ) : null}
        <State
          loading={contexts.loading || catalog.loading}
          error={contexts.error || catalog.error}
          retry={() => {
            contexts.refresh();
            catalog.refresh();
          }}
        >
          {page === 'admin' && user.role === 'Admin' ? (
            <Administration onConfigured={contexts.refresh} />
          ) : !context ? (
            user.role === 'Admin' ? (
              <EmptyConfiguration
                contexts={contexts.data ?? []}
                onAdmin={() => navigate('admin')}
              />
            ) : (
              <Alert color="orange">
                Aucun exercice ne vous a été attribué. Contactez votre administrateur.
              </Alert>
            )
          ) : selection && catalog.data ? (
            <RecordView
              key={`${context.id}:${selection.entity}:${JSON.stringify(selection.row)}`}
              context={context}
              entity={catalog.data.find((e) => e.name === selection.entity)!}
              catalog={catalog.data}
              initial={selection.row}
              creating={selection.creating}
              canWrite={canWrite}
              onBack={back}
              onOpen={open}
              onCreate={create}
              onSaved={() => {
                if (selection.creating) back();
              }}
            />
          ) : page === 'dashboard' ? (
            <Dashboard context={context} navigate={navigate} />
          ) : page === 'hierarchy' ? (
            <Hierarchy key={context.id} context={context} onOpen={open} />
          ) : page === 'sync' ? (
            <Synchronization context={context} canWrite={canWrite} admin={user.role === 'Admin'} />
          ) : page === 'journal' ? (
            <Journal context={context} admin={user.role === 'Admin'} />
          ) : catalog.data?.find((e) => e.name === page) ? (
            <EntityList
              key={`${context.id}:${page}`}
              context={context}
              entity={catalog.data.find((e) => e.name === page)!}
              canWrite={canWrite}
              onOpen={open}
              onCreate={create}
            />
          ) : null}
        </State>
        <Text className="workspace-footer">
          VITASOUSS RÉFÉRENTIELS · V1{' '}
          <span>
            {context?.station} / {context?.label}
          </span>
        </Text>
      </AppShell.Main>
    </AppShell>
  );
}
