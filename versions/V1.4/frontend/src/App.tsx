import { PermissionContext } from './Permissions';
import type { ModulePermission } from './Permissions';
import {
  Alert,
  ActionIcon,
  AppShell,
  Collapse,
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
import { PilotTable, AssistantPanel, DrencherPanel } from './PilotViews';
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
  const contexts = useApi<Context[]>('/contexts');
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
  const [closedGroups, setClosedGroups] = useState<string[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('vitasouss.groups.v14') ?? '[]');
      return Array.isArray(stored) && stored.every((v) => typeof v === 'string') ? stored : [];
    } catch {
      return [];
    }
  });
  function toggleGroup(label: string) {
    const next = closedGroups.includes(label)
      ? closedGroups.filter((v) => v !== label)
      : [...closedGroups, label];
    setClosedGroups(next);
    try {
      localStorage.setItem('vitasouss.groups.v14', JSON.stringify(next));
    } catch {
      /* Préférence facultative. */
    }
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
  // Groupes extensibles : les clés existantes et les restrictions de rôle restent stables.
  const navigation = [
    {
      family: '',
      label: '',
      items: [{ key: 'dashboard', label: 'Tableau de bord', icon: IconDashboard }],
    },
    {
      family: 'Référentiels',
      label: 'Patrimoine agricole',
      items: [
        { key: 'adherent', label: titles.adherent, icon: IconUsers },
        { key: 'verger', label: titles.verger, icon: IconTrees },
        { key: 'parcelle', label: titles.parcelle, icon: IconMap2 },
      ],
    },
    {
      family: 'Référentiels',
      label: 'Variétés',
      items: [
        { key: 'hierarchy', label: 'Explorer la hiérarchie', icon: IconLeaf },
        ...['culture', 'grpvar', 'variete', 'souvar'].map((key) => ({
          key,
          label: titles[key],
          icon: IconLeaf,
        })),
      ],
    },
    {
      family: 'Référentiels',
      label: 'Commerce / Export',
      items: [
        ['partenaire', 'Partenaires'],
        ['destination', 'Destinations'],
        ['pays', 'Pays'],
      ].map(([key, label]) => ({ key: 'pilot:' + key, label, icon: IconLeaf })),
    },
    {
      family: 'Référentiels',
      label: 'Conditionnement',
      items: [
        ['grpemb', 'Groupes emballages'],
        ['groupart', 'Groupes articles'],
        ['defaut', 'Défauts'],
        ['typeecart', 'Types d’écart'],
      ].map(([key, label]) => ({ key: 'pilot:' + key, label, icon: IconLeaf })),
    },
    {
      family: 'Référentiels',
      label: 'Origines / Déclarations',
      items: [{ key: 'pilot:declaration_verger', label: 'Déclarations verger', icon: IconTrees }],
    },
    {
      family: 'Suivi',
      label: '',
      items: [
        ['receptions', 'Réceptions'],
        ['caisserie', 'Caisserie'],
        ['versements', 'Versements'],
        ['export', 'Export'],
        ['ecarts', 'Écarts'],
      ].map(([key, label]) => ({ key: 'board:' + key, label, icon: IconDashboard })),
    },
    {
      family: 'Qualité',
      label: '',
      items: [{ key: 'drencher', label: 'Drencher', icon: IconPlant2 }],
    },
    {
      family: 'Assistant IA',
      label: '',
      items: [{ key: 'assistant', label: 'Assistant IA', icon: IconLeaf }],
    },
    {
      family: 'Administration',
      label: 'Suivi des références',
      items: [
        { key: 'sync', label: 'Synchronisation', icon: IconSwitchHorizontal },
        { key: 'compare', label: 'Comparer ZAOUIA / DIAF', icon: IconSwitchHorizontal },
        { key: 'journal', label: 'Journal', icon: IconHistory },
      ],
    },
    {
      family: 'Administration',
      label: 'Configuration',
      items: [
        { key: 'admin:users', label: 'Utilisateurs', icon: IconUsers, role: 'Admin' },
        {
          key: 'admin:permissions',
          label: 'Droits par module',
          icon: IconShieldLock,
          role: 'Admin',
        },
        { key: 'admin:contexts', label: 'Serveurs / contextes', icon: IconSettings, role: 'Admin' },
      ],
    },
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
    <PermissionContext.Provider value={rights.data ?? []}>
      <AppShell
        header={{ height: 82 }}
        navbar={{ width: compact ? 76 : 242, breakpoint: 'sm', collapsed: { mobile: !opened } }}
        padding={{ base: 'md', lg: 30 }}
      >
        <AppShell.Header>
          <Group h="100%" px={{ base: 'md', lg: 30 }} justify="space-between" wrap="nowrap">
            <Group gap="sm">
              <Burger
                opened={opened}
                onClick={() => setOpened(!opened)}
                hiddenFrom="sm"
                size="sm"
              />
              <div>
                <Text fw={800} size="sm" className="header-title">
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
          {navigation.map((group, groupIndex) => {
            const items = group.items.filter((item) =>
              'role' in item ? item.role === user.role : allowed(item.key),
            );
            if (!items.length) return null;
            const firstFamily =
              !!group.family &&
              !navigation
                .slice(0, groupIndex)
                .some(
                  (previous) =>
                    previous.family === group.family &&
                    previous.items.some((item) =>
                      'role' in item ? item.role === user.role : allowed(item.key),
                    ),
                );
            const familyOpen = !group.family || !closedGroups.includes('family:' + group.family);
            if (!familyOpen && !firstFamily) return null;
            return (
              <Box key={group.family + group.label} mt="sm">
                {firstFamily ? (
                  <Button
                    variant="subtle"
                    color="gray"
                    fullWidth
                    size="compact-sm"
                    fw={800}
                    tt="uppercase"
                    mt="lg"
                    mb="sm"
                    px={8}
                    aria-expanded={familyOpen}
                    onClick={() => toggleGroup('family:' + group.family)}
                  >
                    {compact ? group.family.slice(0, 1) : group.family}
                  </Button>
                ) : null}
                {group.label && familyOpen ? (
                  <Tooltip label={group.label} disabled={!compact} position="right">
                    <Button
                      variant="subtle"
                      color={
                        items.some((item) => page === item.key || selection?.entity === item.key)
                          ? 'forest'
                          : 'gray'
                      }
                      fullWidth
                      px={compact ? 3 : 8}
                      size="compact-sm"
                      my="sm"
                      aria-expanded={!closedGroups.includes(group.label)}
                      aria-label={group.label}
                      onClick={() => toggleGroup(group.label)}
                    >
                      {compact
                        ? closedGroups.includes(group.label)
                          ? '+'
                          : '−'
                        : `${closedGroups.includes(group.label) ? '▸' : '▾'} ${group.label}`}
                    </Button>
                  </Tooltip>
                ) : null}
                <Collapse in={familyOpen && (!group.label || !closedGroups.includes(group.label))}>
                  <Box pl={compact ? 0 : 12}>
                    {items.map((item) => navItem(item.key, item.label, item.icon))}
                  </Box>
                </Collapse>
              </Box>
            );
          })}{' '}
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
              <DrencherPanel />
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
          <Text className="workspace-footer">
            VITASOUSS · V1.4{' '}
            <span>
              {context?.station} / {context?.label}
            </span>
          </Text>
        </AppShell.Main>
      </AppShell>
    </PermissionContext.Provider>
  );
}
