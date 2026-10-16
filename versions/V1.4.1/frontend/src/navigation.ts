import {
  IconDashboard,
  IconTrees,
  IconSettings,
  IconLeaf,
  IconSwitchHorizontal,
  IconPlant2,
  IconUsers,
  IconMap2,
  IconHistory,
  IconShieldLock,
} from './icons';
import IconWorld from '@tabler/icons-react/dist/esm/icons/IconWorld.mjs';
import IconBox from '@tabler/icons-react/dist/esm/icons/IconBox.mjs';
import IconRosetteDiscountCheck from '@tabler/icons-react/dist/esm/icons/IconRosetteDiscountCheck.mjs';
import IconSparkles from '@tabler/icons-react/dist/esm/icons/IconSparkles.mjs';
import type { User } from './api';
export interface NavigationItem {
  key: string;
  label: string;
  icon: typeof IconLeaf;
  admin?: boolean;
  readOnly?: boolean;
}
export interface NavigationGroup {
  id: string;
  label: string;
  icon: typeof IconLeaf;
  items: NavigationItem[];
  direct?: boolean;
  future?: string;
}
export const navigation: NavigationGroup[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: IconDashboard,
    direct: true,
    items: [{ key: 'dashboard', label: 'Vue générale', icon: IconDashboard }],
  },
  {
    id: 'agriculture',
    label: 'Référentiels agricoles',
    icon: IconTrees,
    items: [
      { key: 'adherent', label: 'Adhérents', icon: IconUsers },
      { key: 'verger', label: 'Vergers', icon: IconTrees },
      { key: 'parcelle', label: 'Parcelles', icon: IconMap2 },
      { key: 'hierarchy', label: 'Explorer la hiérarchie', icon: IconLeaf },
      { key: 'culture', label: 'Cultures', icon: IconLeaf },
      { key: 'grpvar', label: 'Groupes de variétés', icon: IconLeaf },
      { key: 'variete', label: 'Variétés', icon: IconLeaf },
      { key: 'souvar', label: 'Sous-variétés', icon: IconLeaf },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce & Export',
    icon: IconWorld,
    items: [
      { key: 'pilot:partenaire', label: 'Partenaires', icon: IconUsers },
      { key: 'pilot:destination', label: 'Destinations', icon: IconMap2 },
      { key: 'pilot:pays', label: 'Pays', icon: IconWorld },
      { key: 'pilot:marche', label: 'Marchés', icon: IconWorld },
    ],
  },
  {
    id: 'conditioning',
    label: 'Conditionnement',
    icon: IconBox,
    items: [
      { key: 'pilot:grpemb', label: 'Groupes d’emballages', icon: IconBox },
      { key: 'pilot:groupart', label: 'Groupes articles', icon: IconBox },
    ],
  },
  {
    id: 'quality',
    label: 'Qualité',
    icon: IconRosetteDiscountCheck,
    items: [
      { key: 'pilot:defaut', label: 'Défauts', icon: IconRosetteDiscountCheck },
      { key: 'pilot:typeecart', label: 'Types d’écarts', icon: IconRosetteDiscountCheck },
      { key: 'pilot:declaration_verger', label: 'Déclarations verger', icon: IconTrees },
    ],
  },
  {
    id: 'operations',
    label: 'Opérations',
    icon: IconSwitchHorizontal,
    items: [
      { key: 'board:receptions', label: 'Réceptions', icon: IconDashboard, readOnly: true },
      { key: 'board:caisserie', label: 'Caisserie', icon: IconBox, readOnly: true },
      { key: 'board:versements', label: 'Versements', icon: IconDashboard, readOnly: true },
      { key: 'board:export', label: 'Export', icon: IconWorld, readOnly: true },
      { key: 'board:ecarts', label: 'Écarts', icon: IconDashboard, readOnly: true },
    ],
  },
  {
    id: 'drencher',
    label: 'Drencher',
    icon: IconPlant2,
    future: 'Intégration future',
    items: [{ key: 'drencher', label: 'Présentation existante', icon: IconPlant2, readOnly: true }],
  },
  {
    id: 'assistant',
    label: 'Assistant IA',
    icon: IconSparkles,
    direct: true,
    items: [{ key: 'assistant', label: 'Assistant IA', icon: IconSparkles, readOnly: true }],
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: IconSettings,
    items: [
      { key: 'admin:users', label: 'Utilisateurs', icon: IconUsers, admin: true },
      { key: 'admin:permissions', label: 'Droits par module', icon: IconShieldLock, admin: true },
      { key: 'admin:contexts', label: 'Serveurs et contextes', icon: IconSettings, admin: true },
      { key: 'sync', label: 'Synchronisation', icon: IconSwitchHorizontal },
      {
        key: 'compare',
        label: 'Comparer ZAOUIA / DIAF',
        icon: IconSwitchHorizontal,
        readOnly: true,
      },
      { key: 'journal', label: 'Journal', icon: IconHistory, readOnly: true },
    ],
  },
];
export function visibleNavigation(
  role: User['role'],
  allowed: (key: string) => boolean,
): NavigationGroup[] {
  return navigation
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => (i.admin ? role === 'Admin' : allowed(i.key))),
    }))
    .filter((g) => g.items.length > 0);
}
