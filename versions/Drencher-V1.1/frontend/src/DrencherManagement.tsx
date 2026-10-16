import { Tabs } from '@mantine/core';
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
export function DrencherManagement(props: ManagementProps) {
  return (
    <Tabs value={props.activeTab ?? 'products'} onChange={props.onTabChange}>
      <Tabs.List>
        <Tabs.Tab value="products">Produits</Tabs.Tab>
        <Tabs.Tab value="programs">Programmes</Tabs.Tab>
        <Tabs.Tab value="stock">Stock local</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="products" pt="md">
        <DrencherProducts {...props} />
      </Tabs.Panel>
      <Tabs.Panel value="programs" pt="md">
        <DrencherPrograms {...props} />
      </Tabs.Panel>
      <Tabs.Panel value="stock" pt="md">
        <DrencherStock {...props} />
      </Tabs.Panel>
    </Tabs>
  );
}
