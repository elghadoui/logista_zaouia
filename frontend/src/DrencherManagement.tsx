import { Alert, Tabs } from '@mantine/core';
import type { Catalog } from './drencherTypes';
import { DrencherProducts } from './DrencherProducts';
import { DrencherPrograms } from './DrencherPrograms';
import { DrencherStock } from './DrencherStock';
export interface ManagementProps {
  path: string;
  catalog: Catalog;
  canAdd: boolean;
  canModify: boolean;
  refresh: () => void;
  activeTab?: string | null;
  onTabChange?: (value: string | null) => void;
}
type Access = { view: boolean; add: boolean; modify: boolean };
export function DrencherManagement(
  props: Omit<ManagementProps, 'canAdd' | 'canModify'> & {
    permissions: { products: Access; programs: Access; stock: Access };
  },
) {
  const visible = ['products', 'programs', 'stock'].filter(
    (k) => props.permissions[k as keyof typeof props.permissions].view,
  );
  const active = visible.includes(props.activeTab ?? '') ? props.activeTab : visible[0];
  if (!visible.length) return <Alert>Aucun droit de gestion Drencher attribué.</Alert>;
  const rights = (key: keyof typeof props.permissions) => ({
    ...props,
    canAdd: props.permissions[key].add,
    canModify: props.permissions[key].modify,
  });
  return (
    <Tabs value={active} onChange={props.onTabChange}>
      <Tabs.List>
        {props.permissions.products.view ? <Tabs.Tab value="products">Produits</Tabs.Tab> : null}
        {props.permissions.programs.view ? <Tabs.Tab value="programs">Programmes</Tabs.Tab> : null}
        {props.permissions.stock.view ? <Tabs.Tab value="stock">Stock local</Tabs.Tab> : null}
      </Tabs.List>
      {props.permissions.products.view ? (
        <Tabs.Panel value="products" pt="md">
          <DrencherProducts {...rights('products')} />
        </Tabs.Panel>
      ) : null}
      {props.permissions.programs.view ? (
        <Tabs.Panel value="programs" pt="md">
          <DrencherPrograms {...rights('programs')} />
        </Tabs.Panel>
      ) : null}
      {props.permissions.stock.view ? (
        <Tabs.Panel value="stock" pt="md">
          <DrencherStock {...rights('stock')} />
        </Tabs.Panel>
      ) : null}
    </Tabs>
  );
}
