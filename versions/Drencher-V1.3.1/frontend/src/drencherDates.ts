// Normalisation sans conversion de fuseau pour les dates civiles MySQL.
export function drDay(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime())
      ? null
      : valid(value.getFullYear(), value.getMonth() + 1, value.getDate());
  if (typeof value === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:$|T|\s)/.exec(value.trim());
    return m ? valid(Number(m[1]), Number(m[2]), Number(m[3])) : null;
  }
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (v.isValidDateTime === false || v.IsValidDateTime === false) return null;
    return valid(Number(v.year ?? v.Year), Number(v.month ?? v.Month), Number(v.day ?? v.Day));
  }
  return null;
}
function valid(y: number, m: number, d: number): string | null {
  if (
    !Number.isInteger(y) ||
    y < 1000 ||
    y > 9999 ||
    !Number.isInteger(m) ||
    m < 1 ||
    m > 12 ||
    !Number.isInteger(d) ||
    d < 1 ||
    d > 31
  )
    return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d)
    return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
export const drDateText = (v: unknown) => drDay(v) ?? '—';
export const drExpired = (v: unknown, day: string) => {
  const date = drDay(v),
    reference = drDay(day);
  return date !== null && reference !== null && date < reference;
};
