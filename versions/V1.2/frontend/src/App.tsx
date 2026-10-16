import {
  Alert,
  ActionIcon,
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
  IconArrowLeft,
  IconChevronRight,
  IconHistory,
  IconLeaf,
  IconPlant2,
  IconLogout,
  IconMap2,
  IconSettings,
  IconShieldLock,
  IconSwitchHorizontal,
  IconTrees,
  IconUsers,
} from './icons';
import { useMediaQuery } from '@mantine/hooks';
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
import { ReferentialComparison } from './ReferentialComparison';
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
  const [reduced, setReduced] = useState(() => {
    try {
      return localStorage.getItem('vitasouss.sidebar') === 'reduced';
    } catch {
      return false;
    }
  });
  const desktop = useMediaQuery('(min-width: 768px)');
  const compact = !!desktop && reduced;
  function toggleSidebar() {
    const next = !reduced;
    try {
      localStorage.setItem('vitasouss.sidebar', next ? 'reduced' : 'open');
    } catch {
      /* Le menu reste utilisable lorsque le stockage est désactivé. */
    }
    setReduced(next);
  }
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
  function navItem(key: string, label: string, Icon: typeof IconLeaf) {
    return (
      <Tooltip key={key} label={label} disabled={!compact} position="right">
        <NavLink
          label={compact ? undefined : label}
          aria-label={label}
          leftSection={<Icon size={18} />}
          active={page === key || selection?.entity === key}
          onClick={() => navigate(key)}
        />
      </Tooltip>
    );
  }
  return (
    <AppShell
      header={{ height: 82 }}
      navbar={{ width: compact ? 76 : 242, breakpoint: 'sm', collapsed: { mobile: !opened } }}
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
              w={{ base: 90, md: 135 }}
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
              w={{ base: 130, md: 185 }}
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
      <AppShell.Navbar p={compact ? 'xs' : 'md'} className={compact ? 'sidebar-reduced' : ''}>
        <Group justify="space-between" className="sidebar-brand" gap={8} py="lg" wrap="nowrap">
          <span className="brand-mark">
            <IconLeaf size={24} />
          </span>
          {!compact ? (
            <div>
              <Text fw={850} size="lg">
                VITASOUSS
              </Text>
              <Text className="eyebrow" size="9px">
                CULTIVER LA CONFIANCE
              </Text>
            </div>
          ) : null}
        </Group>
        <Tooltip label={compact ? 'Développer la navigation' : 'Réduire la navigation'}>
          <ActionIcon
            visibleFrom="sm"
            aria-label={compact ? 'Développer la navigation' : 'Réduire la navigation'}
            variant="light"
            mb="md"
            onClick={toggleSidebar}
          >
            {compact ? <IconChevronRight size={18} /> : <IconArrowLeft size={18} />}
          </ActionIcon>
        </Tooltip>
        {navItem('dashboard', 'Tableau de bord', IconDashboard)}
        {!compact ? <Text className="nav-section">AGRICULTEURS</Text> : <Divider my="sm" />}
        {entries.map(({ key, icon }) => navItem(key, titles[key], icon))}
        {!compact ? <Text className="nav-section">VARIÉTÉS</Text> : <Divider my="sm" />}
        {navItem('hierarchy', 'Explorer la hiérarchie', IconLeaf)}
        {navItem('culture', titles.culture, IconLeaf)}
        {navItem('grpvar', titles.grpvar, IconTrees)}
        {navItem('variete', titles.variete, IconPlant2)}
        {navItem('souvar', titles.souvar, IconMap2)}
        <Divider my="md" />
        {navItem('sync', 'Synchronisation', IconSwitchHorizontal)}
        {navItem('compare', 'Comparer ZAOUIA / DIAF', IconSwitchHorizontal)}
        {navItem('journal', 'Journal', IconHistory)}
        {user.role === 'Admin' ? navItem('admin', 'Administration', IconSettings) : null}
        <Box mt="auto" pt="lg">
          {!compact ? (
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
          ) : null}
          <Tooltip label="Fermer votre session">
            <Button
              variant="subtle"
              color="gray"
              fullWidth
              mt="md"
              aria-label="Se déconnecter"
              leftSection={<IconLogout size={17} />}
              onClick={onLogout}
            >
              {!compact ? 'Se déconnecter' : null}
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
          ) : page === 'compare' && catalog.data ? (
            <ReferentialComparison
              key={context.id}
              context={context}
              catalog={catalog.data}
              onOpen={open}
            />
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
          VITASOUSS RÉFÉRENTIELS · V1.2{' '}
          <span>
            {context?.station} / {context?.label}
          </span>
        </Text>
      </AppShell.Main>
    </AppShell>
  );
}
