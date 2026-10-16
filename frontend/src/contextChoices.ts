import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Context } from './api';

// Visibility trims existing authorized choices; it never adds a route or grants access.
export function visibleTargets<T extends { id: number }>(targets: T[] | null, contexts: Context[] | null): T[] {
  const visible = new Set((contexts ?? []).map((c) => c.id));
  return (targets ?? []).filter((t) => visible.has(t.id));
}
export function selectedVisibleTarget<T extends { id: number }>(targets: T[], selected: string | null) {
  return targets.find((t) => String(t.id) === selected)?.id ?? targets[0]?.id;
}
export function coherentContextFilters<T extends { otherContext: string; previousContext: string; previousOtherContext: string }>(filters: T): T {
  return filters.otherContext && filters.previousContext ? filters : { ...filters, previousOtherContext: '' };
}
export const initialContextLoading = (data: Context[] | null) => data === null;

/** Background refresh must not unmount an unsaved operational form. */
export function useContextList() {
  const [data, setData] = useState<Context[] | null>(null);
  const saved = useRef<Context[] | null>(null);
  const [error, setError] = useState(''), [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(true), [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(initialContextLoading(saved.current));
    setError(''); setWarning('');
    void api<Context[]>('/contexts', 'GET', undefined, controller.signal).then((next) => {
      if (controller.signal.aborted) return;
      if (JSON.stringify(saved.current) !== JSON.stringify(next)) { saved.current = next; setData(next); }
    }).catch((e: unknown) => {
      if (!controller.signal.aborted) {
        const message = e instanceof Error ? e.message : 'Actualisation des contextes indisponible.';
        if (saved.current === null) setError(message); else setWarning(message);
      }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [version]);
  useEffect(() => {
    const focus = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', focus);
    return () => window.removeEventListener('focus', focus);
  }, [refresh]);
  return { data, error, warning, loading, refresh };
}
export function useContextTargets<T extends { id: number }>(routes: { data: T[] | null; loading: boolean; error: string; refresh: () => void }) {
  const contexts = useContextList();
  return {
    data: visibleTargets(routes.data, contexts.data),
    loading: routes.loading || contexts.loading,
    error: routes.error || contexts.error,
    refresh: () => { routes.refresh(); contexts.refresh(); },
  };
}
