import { PermissionContext } from './Permissions';
import { useContextList } from './contextChoices';
import type { ModulePermission } from './Permissions';
import {
  Alert,
  AppShell,
  Avatar,
  Badge,
  Burger,
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconLeaf, IconShieldLock, IconTrees } from './icons';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import type { Entity, Row, User } from './api';
import { api, setCsrf, useApi } from './api';
import { Administration, EmptyConfiguration } from './Administration';
import { Dashboard } from './Dashboard';
import { EntityList } from './EntityList';
import { Hierarchy } from './Hierarchy';
import { Journal, Synchronization } from './JournalSync';
import { RecordView } from './RecordView';
import { State } from './components';
import { ReferentialComparison } from './ReferentialComparison';
import { PilotTable, AssistantPanel } from './PilotViews';
import { PageErrorBoundary } from './PageErrorBoundary';
import { Sidebar } from './Sidebar';
import { Drencher } from './Drencher';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ExportDashboard } from './ExportDashboard';
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
  const rights = useApi<ModulePermission[]>('/permissions');
  const allowed = (key: string, action: keyof Omit<ModulePermission, 'module'> = 'view') =>
    user.role === 'Admin' ||
    !!rights.data?.find((p) => p.module === key.split(':').pop())?.[action];
  const contexts = useContextList();
  const catalog = useApi<Entity[]>('/catalog');
  const extraCatalog = useApi<Entity[]>('/pilot-catalog');
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
  useEffect(() => {
    if (contexts.data && contextId !== null && !contexts.data.some((c) => c.id === contextId)) {
      setContextId(context?.id ?? null);
      setSelection(null);
      setTrail([]);
    }
  }, [contexts.data, contextId, context?.id]);
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
  return (
    <PermissionContext.Provider value={rights.data ?? []}>
      <AppShell
        header={{ height: 68 }}
        navbar={{ width: compact ? 76 : 272, breakpoint: 'sm', collapsed: { mobile: true } }}
        padding={{ base: 'md', lg: 30 }}
      >
        <AppShell.Header>
          <Group h="100%" px={{ base: 'md', lg: 30 }} justify="space-between" wrap="nowrap">
            <Group gap="sm">
              <Burger
                opened={opened}
                aria-label={opened ? 'Fermer la navigation' : 'Ouvrir la navigation'}
                onClick={() => setOpened(!opened)}
                hiddenFrom="sm"
                size="sm"
              />
              <div>
                <Text fw={800} size="sm" className="header-title" visibleFrom="sm">
                  VITASOUSS
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
                  .map((c) => ({
                    value: String(c.id),
                    label: c.label + (c.readOnly ? ' 🔒' : ''),
                  }))}
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
        <AppShell.Navbar p={0} visibleFrom="sm" className="navigation-sidebar">
          <Sidebar
            user={user}
            context={context}
            active={selection?.entity ?? page}
            compact={compact}
            mobileOpened={opened}
            allowed={allowed}
            navigate={navigate}
            onLogout={onLogout}
            onToggle={toggleSidebar}
            onMobileClose={() => setOpened(false)}
          />
        </AppShell.Navbar>
        <AppShell.Main>
          {contexts.warning ? <Alert color="orange" mb="sm" title="Actualisation des contextes indisponible">{contexts.warning} La saisie en cours reste conservée ; les droits restent contrôlés par le serveur.</Alert> : null}
          <PageErrorBoundary key={`${context?.id}:${page}:${selection?.entity ?? ''}`}>
            {context?.readOnly ? (
              <Alert color="orange" mb="lg" title="Archive — lecture seule">
                {context.station} · {context.label}. Les créations et modifications sont bloquées
                côté serveur.
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
              {page.startsWith('admin') && user.role === 'Admin' ? (
                <Administration
                  key={page}
                  initialTab={page.split(':')[1]}
                  onConfigured={contexts.refresh}
                />
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
              ) : !allowed(selection?.entity ?? page) ? (
                <Alert color="orange">
                  Accès refusé pour ce module. Sélectionnez un module autorisé dans le menu.
                </Alert>
              ) : selection && catalog.data ? (
                <RecordView
                  key={`${context.id}:${selection.entity}:${JSON.stringify(selection.row)}`}
                  context={context}
                  entity={catalog.data.find((e) => e.name === selection.entity)!}
                  catalog={catalog.data}
                  initial={selection.row}
                  creating={selection.creating}
                  canWrite={
                    canWrite && allowed(selection.entity, selection.creating ? 'add' : 'modify')
                  }
                  onBack={back}
                  onOpen={open}
                  onCreate={create}
                  onSaved={() => {
                    if (selection.creating) back();
                  }}
                />
              ) : page === 'analytics:export' ? (
                <ExportDashboard key={context.id} context={context} contexts={contexts.data ?? []} onContextChange={changeContext}/>
              ) : page.startsWith('analytics:') ? (
                <AnalyticsDashboard
                  key={context.id}
                  context={context}
                  contexts={contexts.data ?? []}
                  module={page === 'analytics:receptions' ? 'receptions' : 'caisserie'}
                  onContextChange={changeContext}
                />
              ) : page.startsWith('pilot:') || page.startsWith('board:') ? (
                <PilotTable
                  key={`${context.id}:${page}`}
                  context={context}
                  module={page.split(':')[1]}
                  board={page.startsWith('board:')}
                  canWrite={canWrite}
                />
              ) : page === 'assistant' ? (
                <AssistantPanel key={context.id} context={context} />
              ) : page === 'drencher' ? (
                <Drencher key={context.id} context={context} admin={user.role === 'Admin'} />
              ) : page === 'dashboard' ? (
                <Dashboard context={context} navigate={navigate} />
              ) : page === 'hierarchy' ? (
                <Hierarchy key={context.id} context={context} onOpen={open} />
              ) : page === 'sync' ? (
                <Synchronization
                  context={context}
                  canWrite={canWrite}
                  admin={user.role === 'Admin'}
                />
              ) : page === 'compare' && catalog.data ? (
                <ReferentialComparison
                  key={context.id}
                  context={context}
                  catalog={[...catalog.data, ...(extraCatalog.data ?? [])].filter((e) =>
                    allowed(e.name),
                  )}
                  canWrite={canWrite && allowed('sync', 'modify')}
                  onOpen={(name, row) =>
                    catalog.data?.some((e) => e.name === name)
                      ? open(name, row)
                      : navigate('pilot:' + name)
                  }
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
          </PageErrorBoundary>
          <Text className="workspace-footer">
            VITASOUSS · V1.6.0{' '}
            <span>
              {context?.station} / {context?.label}
            </span>
          </Text>
        </AppShell.Main>
      </AppShell>
    </PermissionContext.Provider>
  );
}
