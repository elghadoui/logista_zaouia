import { Button, Group, MultiSelect, Popover, Select, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
export interface FilterItem {
  field: string;
  value: string;
}
export interface ColumnOption {
  value: string;
  label: string;
}
export function useColumns(scope: string, options: ColumnOption[], defaults: string[]) {
  const storage = 'vitasouss.columns.v13.' + scope;
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storage) ?? 'null');
      if (Array.isArray(saved) && saved.every((v) => typeof v === 'string')) return saved;
    } catch {
      /* Préférence facultative. */
    }
    return defaults;
  });
  const visible = selected.filter((v) => options.some((o) => o.value === v));
  return {
    visible: visible.length ? visible : defaults.filter((v) => options.some((o) => o.value === v)),
    change: (values: string[]) => {
      if (!values.length) return;
      setSelected(values);
      try {
        localStorage.setItem(storage, JSON.stringify(values));
      } catch {
        /* Stockage indisponible. */
      }
    },
  };
}
export function ListControls({
  columns,
  visible,
  onColumns,
  filterFields,
  filters,
  onFilters,
}: {
  columns: ColumnOption[];
  visible: string[];
  onColumns: (values: string[]) => void;
  filterFields: ColumnOption[];
  filters: FilterItem[];
  onFilters: (values: FilterItem[]) => void;
}) {
  return (
    <Group>
      <Popover width={360} position="bottom-start" withinPortal>
        <Popover.Target>
          <Button variant="default">Filtres{filters.length ? ` (${filters.length})` : ''}</Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap="sm">
            <Text size="xs" c="dimmed">
              Correspondance exacte · filtres combinés · tous les résultats et KPI
            </Text>
            {filters.map((filter, i) => (
              <Group key={i} wrap="nowrap">
                <Select
                  aria-label={`Champ du filtre ${i + 1}`}
                  data={filterFields.filter(
                    (f) => f.value === filter.field || !filters.some((v) => v.field === f.value),
                  )}
                  value={filter.field}
                  onChange={(v) =>
                    onFilters(
                      filters.map((f, index) => (index === i ? { ...f, field: v ?? f.field } : f)),
                    )
                  }
                  w={150}
                />
                <TextInput
                  aria-label={`Valeur du filtre ${i + 1}`}
                  value={filter.value}
                  onChange={(e) =>
                    onFilters(
                      filters.map((f, index) =>
                        index === i ? { ...f, value: e.currentTarget.value } : f,
                      ),
                    )
                  }
                  w={120}
                />
                <Button
                  variant="subtle"
                  aria-label={`Retirer le filtre ${i + 1}`}
                  px={5}
                  onClick={() => onFilters(filters.filter((_, index) => index !== i))}
                >
                  ×
                </Button>
              </Group>
            ))}
            <Button
              variant="light"
              disabled={filters.length >= Math.min(8, filterFields.length)}
              onClick={() => {
                const next = filterFields.find((f) => !filters.some((v) => v.field === f.value));
                if (next) onFilters([...filters, { field: next.value, value: '' }]);
              }}
            >
              Ajouter un filtre
            </Button>
            <Button variant="subtle" onClick={() => onFilters([])}>
              Effacer les filtres
            </Button>
          </Stack>
        </Popover.Dropdown>
      </Popover>
      <Popover width={320} position="bottom-start" withinPortal>
        <Popover.Target>
          <Button variant="default">Colonnes</Button>
        </Popover.Target>
        <Popover.Dropdown>
          <MultiSelect
            label="Colonnes visibles"
            description="Au moins une colonne · préférence conservée sur ce navigateur"
            data={columns}
            value={visible}
            onChange={onColumns}
            searchable
          />
        </Popover.Dropdown>
      </Popover>
    </Group>
  );
}
