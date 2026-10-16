import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Collapse,
  Drawer,
  Group,
  NavLink,
  Popover,
  ScrollArea,
  Text,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { useState } from 'react';
import type { Context, User } from './api';
import { IconArrowLeft, IconChevronRight, IconLeaf, IconLogout, IconLock } from './icons';
import IconSun from '@tabler/icons-react/dist/esm/icons/IconSun.mjs';
import IconMoon from '@tabler/icons-react/dist/esm/icons/IconMoon.mjs';
import { navigation, visibleNavigation } from './navigation';
import type { NavigationGroup } from './navigation';
import classes from './Sidebar.module.css';

interface Props {
  user: User;
  context?: Context;
  active: string;
  compact: boolean;
  mobileOpened: boolean;
  allowed: (key: string) => boolean;
  navigate: (key: string) => void;
  onLogout: () => void;
  onToggle: () => void;
  onMobileClose: () => void;
}
const storageKey = 'vitasouss.navigation.v141';
function initialClosed(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (Array.isArray(value) && value.every((v) => typeof v === 'string'))
      return value.filter((v) => navigation.some((g) => g.id === v));
  } catch {
    /* Preferences do not prevent navigation. */
  }
  return navigation.filter((g) => !g.direct && g.id !== 'agriculture').map((g) => g.id);
}
function GroupLinks({
  group,
  active,
  navigate,
}: {
  group: NavigationGroup;
  active: string;
  navigate: (key: string) => void;
}) {
  return (
    <>
      {group.items.map((item) => (
        <NavLink
          component="button"
          key={item.key}
          label={item.label}
          leftSection={<item.icon size={16} />}
          active={active === item.key}
          aria-current={active === item.key ? 'page' : undefined}
          rightSection={
            item.readOnly ? (
              <Tooltip label="Lecture seule">
                <IconLock size={12} aria-label="Lecture seule" />
              </Tooltip>
            ) : undefined
          }
          className={classes.item}
          onClick={() => navigate(item.key)}
        />
      ))}
      {group.future ? (
        <Text size="xs" c="dimmed" p="sm">
          {group.future} · aucun module supplémentaire activé
        </Text>
      ) : null}
    </>
  );
}
function CompactGroup({
  group,
  active,
  navigate,
}: {
  group: NavigationGroup;
  active: string;
  navigate: (key: string) => void;
}) {
  const [opened, setOpened] = useState(false);
  const selected = group.items.some((i) => i.key === active);
  const trigger = (
    <ActionIcon
      className={classes.compactButton}
      variant="subtle"
      color={selected ? 'forest' : 'gray'}
      data-active={selected || undefined}
      aria-label={group.label}
      aria-expanded={group.direct ? undefined : opened}
      onClick={() => (group.direct ? navigate(group.items[0].key) : setOpened((v) => !v))}
    >
      <group.icon size={22} />
    </ActionIcon>
  );
  if (group.direct)
    return (
      <Tooltip label={group.label} position="right">
        {trigger}
      </Tooltip>
    );
  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="right-start"
      offset={14}
      shadow="md"
      trapFocus
      returnFocus
    >
      <Popover.Target>
        <Tooltip label={group.label} position="right" disabled={opened}>
          {trigger}
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown className={classes.popover}>
        <Text fw={700} size="sm" p="xs">
          {group.label}
        </Text>
        <GroupLinks
          group={group}
          active={active}
          navigate={(key) => {
            setOpened(false);
            navigate(key);
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
function NavigationBody({
  props,
  groups,
  closed,
  toggle,
  mobile = false,
}: {
  props: Props;
  groups: NavigationGroup[];
  closed: string[];
  toggle: (id: string) => void;
  mobile?: boolean;
}) {
  const compact = props.compact && !mobile;
  const scheme = useComputedColorScheme('light');
  const { setColorScheme } = useMantineColorScheme();
  return (
    <div className={classes.root}>
      <Group
        className={classes.brand}
        gap="sm"
        wrap="nowrap"
        justify={compact ? 'center' : 'space-between'}
      >
        <Group gap="sm" wrap="nowrap">
          <span className={classes.mark}>
            <IconLeaf size={24} />
          </span>
          {!compact ? (
            <Box>
              <Text fw={850} size="lg">
                VITASOUSS
              </Text>
              <Text size="8px" c="dimmed" tt="uppercase" style={{ letterSpacing: 1.2 }}>
                Cultiver la confiance
              </Text>
            </Box>
          ) : null}
        </Group>
        {!mobile && !compact ? (
          <Tooltip label="Réduire la navigation">
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label="Réduire la navigation"
              onClick={props.onToggle}
            >
              <IconArrowLeft size={16} />
            </ActionIcon>
          </Tooltip>
        ) : null}
      </Group>
      {compact ? (
        <Group justify="center" mb="sm">
          <Tooltip label="Développer la navigation" position="right">
            <ActionIcon
              variant="subtle"
              aria-label="Développer la navigation"
              onClick={props.onToggle}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ) : null}
      <ScrollArea className={classes.scroll} type="auto" offsetScrollbars scrollbars="y">
        <nav
          aria-label={mobile ? 'Navigation mobile' : 'Navigation principale'}
          className={compact ? classes.compact : undefined}
        >
          {!compact ? <Text className={classes.section}>ESPACE DE TRAVAIL</Text> : null}
          {groups.map((group) => {
            if (compact)
              return (
                <CompactGroup
                  key={group.id}
                  group={group}
                  active={props.active}
                  navigate={props.navigate}
                />
              );
            const selected = group.items.some((item) => item.key === props.active);
            const open = selected || !closed.includes(group.id);
            const id = `navigation-${mobile ? 'mobile' : 'desktop'}-${group.id}`;
            if (group.direct)
              return (
                <NavLink
                  component="button"
                  key={group.id}
                  label={group.label}
                  leftSection={<group.icon size={20} />}
                  active={selected}
                  aria-current={selected ? 'page' : undefined}
                  className={classes.group}
                  onClick={() => props.navigate(group.items[0].key)}
                />
              );
            return (
              <Box key={group.id}>
                <NavLink
                  component="button"
                  className={classes.group}
                  label={group.label}
                  leftSection={<group.icon size={20} />}
                  active={selected}
                  aria-expanded={open}
                  aria-controls={id}
                  onClick={() => toggle(group.id)}
                  rightSection={
                    <IconChevronRight
                      size={15}
                      style={{
                        transform: open ? 'rotate(90deg)' : undefined,
                        transition: 'transform 150ms',
                      }}
                    />
                  }
                />
                <Collapse in={open} transitionDuration={150}>
                  <div id={id} className={classes.children}>
                    <GroupLinks group={group} active={props.active} navigate={props.navigate} />
                  </div>
                </Collapse>
              </Box>
            );
          })}
        </nav>
      </ScrollArea>
      <div className={classes.footer}>
        <Group gap="xs" justify={compact ? 'center' : 'space-between'} wrap="nowrap">
          <Tooltip
            label={`${props.user.name} · ${props.user.role}`}
            disabled={!compact}
            position="right"
          >
            <Avatar radius="xl" color="forest" size={32}>
              {props.user.name.slice(0, 2).toUpperCase()}
            </Avatar>
          </Tooltip>
          {!compact ? (
            <Box flex={1}>
              <Text size="xs" fw={650} lineClamp={1}>
                {props.user.name}
              </Text>
              <Text size="10px" c="dimmed" lineClamp={1}>
                {props.context?.station} · {props.context?.label}
              </Text>
            </Box>
          ) : null}
        </Group>
        <Group mt="sm" justify="center" gap="xs">
          <Tooltip label={scheme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label={scheme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
              onClick={() => setColorScheme(scheme === 'dark' ? 'light' : 'dark')}
            >
              {scheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Se déconnecter">
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label="Se déconnecter"
              onClick={props.onLogout}
            >
              <IconLogout size={18} />
            </ActionIcon>
          </Tooltip>
          {!compact ? (
            <Badge variant="light" color="forest" size="xs">
              V1.5.1
            </Badge>
          ) : null}
        </Group>
      </div>
    </div>
  );
}
export function Sidebar(props: Props) {
  const [closed, setClosed] = useState(initialClosed);
  const groups = visibleNavigation(props.user.role, props.allowed);
  function toggle(id: string) {
    setClosed((previous) => {
      const next = previous.includes(id) ? previous.filter((v) => v !== id) : [...previous, id];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* Optional preference. */
      }
      return next;
    });
  }
  return (
    <>
      <NavigationBody props={props} groups={groups} closed={closed} toggle={toggle} />
      <Drawer
        opened={props.mobileOpened}
        onClose={props.onMobileClose}
        title="Navigation"
        size={290}
        padding="sm"
        styles={{ body: { height: 'calc(100dvh - 64px)', padding: 0 } }}
      >
        <NavigationBody
          props={{
            ...props,
            navigate: (key) => {
              props.navigate(key);
              props.onMobileClose();
            },
          }}
          groups={groups}
          closed={closed}
          toggle={toggle}
          mobile
        />
      </Drawer>
    </>
  );
}
