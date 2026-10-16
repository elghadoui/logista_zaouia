import { Alert, Paper, SimpleGrid, Skeleton, Text } from '@mantine/core';
import type { Context } from './api';
import { area, useApi } from './api';
const fields: Record<string, [string, string, boolean?][]> = {
  adherent: [
    ['count', 'Adhérents'],
    ['vergers', 'Vergers liés'],
    ['parcelles', 'Parcelles liées'],
    ['surface', 'Surface des parcelles', true],
    ['meanVergers', 'Vergers / adhérent'],
    ['meanParcelles', 'Parcelles / adhérent'],
  ],
  verger: [
    ['count', 'Vergers'],
    ['parcelles', 'Parcelles liées'],
    ['surface', 'Surface déclarée des vergers', true],
    ['parcelSurface', 'Surface des parcelles', true],
    ['meanSurface', 'Surface moyenne / verger', true],
  ],
  parcelle: [
    ['count', 'Parcelles'],
    ['surface', 'Surface totale', true],
    ['meanSurface', 'Surface moyenne', true],
    ['varieties', 'Variétés représentées'],
    ['cultures', 'Cultures représentées'],
  ],
};
export function ListKpis({
  context,
  name,
  query,
}: {
  context: Context;
  name: string;
  query: URLSearchParams;
}) {
  const params = new URLSearchParams();
  for (const k of ['search', 'filter', 'value']) if (query.has(k)) params.set(k, query.get(k)!);
  const result = useApi<{ metrics: Record<string, number | null>; warnings: string[] }>(
    `/contexts/${context.id}/entities/${name}/kpis?${params}`,
  );
  return (
    <div style={{ marginBottom: 20 }}>
      <SimpleGrid cols={{ base: 2, sm: 3, lg: fields[name].length }} spacing="sm">
        {fields[name].map(([key, label, surface]) => (
          <Paper withBorder p="md" key={key}>
            <Text size="xs" c="dimmed">
              {name === 'adherent' && !params.get('search') && !params.has('filter')
                ? label.replace(' liés', '')
                : label}
            </Text>
            {result.loading ? (
              <Skeleton height={27} mt={8} />
            ) : (
              <Text size="xl" fw={750} c="forest" mt={6}>
                {surface
                  ? area(result.data?.metrics[key])
                  : result.data?.metrics[key] === null || result.data?.metrics[key] === undefined
                    ? '—'
                    : Number(result.data.metrics[key]).toLocaleString('fr-MA', {
                        maximumFractionDigits: key.startsWith('mean') ? 2 : 0,
                      })}
              </Text>
            )}
          </Paper>
        ))}
      </SimpleGrid>
      <Text size="xs" c="dimmed" mt={6}>
        Ensemble des résultats filtrés · indépendamment de la pagination
      </Text>
      {result.error ? (
        <Alert color="orange" mt="xs">
          Indicateurs indisponibles : {result.error}
        </Alert>
      ) : null}
      {result.data?.warnings.length ? (
        <Alert color="orange" mt="xs">
          {result.data.warnings.join(' ')}
        </Alert>
      ) : null}
    </div>
  );
}
