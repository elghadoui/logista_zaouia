import { Select } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useState } from 'react';
import type { Column, Context, Row, Value } from './api';
import { display, labels, useApi } from './api';
export function ReferenceInput({
  table,
  column,
  context,
  value,
  onChange,
  disabled,
  variety,
  error,
}: {
  table: string;
  column: Column;
  context: Context;
  value: Value;
  onChange: (value: Value) => void;
  disabled: boolean;
  variety?: Value;
  error?: string;
}) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 250);

  const query = new URLSearchParams({
    search: debounced,
    ...(value === null ? {} : { selected: String(value) }),
  });
  if (table === 'souvar') {
    query.set('variety', String(variety ?? 0));
  }
  const result = useApi<Row[]>(`/contexts/${context.id}/lookups/${table}?${query}`);
  const id =
    table === 'souvar'
      ? 'codsvar'
      : table === 'adherent'
        ? 'refadh'
        : table === 'verger'
          ? 'refver'
          : table === 'culture'
            ? 'codcul'
            : table === 'grpvar'
              ? 'codgrv'
              : 'codvar';
  const name =
    table === 'souvar'
      ? 'nomsvar'
      : table === 'adherent'
        ? 'nomadh'
        : table === 'verger'
          ? 'nomver'
          : table === 'culture'
            ? 'nomcul'
            : table === 'grpvar'
              ? 'nomgrv'
              : 'nomvar';
  const options = [
    ...new Map(
      (result.data ?? [])
        .filter((r) => r[id] !== null)
        .map((r) => [
          String(r[id]),
          { value: String(r[id]), label: `${display(r[name])} · ${r[id]}` },
        ]),
    ).values(),
  ];
  if (value !== null && !options.some((o) => o.value === String(value)))
    options.unshift({ value: String(value), label: `Référence ${value}` });
  return (
    <Select
      label={labels[column.name]}
      data={options}
      value={value === null ? null : String(value)}
      onChange={(v) => onChange(v === null ? null : Number(v))}
      searchable
      clearable={column.nullable}
      onSearchChange={setSearch}
      searchValue={search}
      disabled={disabled || (table === 'souvar' && !variety)}
      nothingFoundMessage={result.loading ? 'Chargement…' : 'Aucune référence'}
      withAsterisk={!column.nullable && !column.generated}
      error={error || result.error || undefined}
      description={table === 'souvar' ? 'Filtrée sur la variété choisie' : undefined}
    />
  );
}
