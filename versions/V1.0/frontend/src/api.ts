import { useCallback, useEffect, useState } from 'react';
export type Value = string | number | null;
export type Row = Record<string, Value>;
export interface Column {
  name: string;
  definition: string;
  generated: boolean;
  nullable: boolean;
  numeric: boolean;
  date: boolean;
  maxLength: number | null;
}
export interface Entity {
  name: string;
  keys: string[];
  label: string;
  columns: Column[];
}
export interface Context {
  id: number;
  station: string;
  label: string;
  databaseName: string;
  readOnly: boolean | number;
  isMaster: boolean | number;
  localRefsta: number | null;
}
export interface User {
  name: string;
  role: 'Admin' | 'Gestionnaire' | 'Consultation';
  csrf: string;
}
export interface Page {
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
}
let csrf = '';
export function setCsrf(value: string) {
  csrf = value;
}
export async function api<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch('/api' + path, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as { title?: string } | null;
    throw new Error(
      result?.title ??
        (response.status === 401
          ? 'Connectez-vous pour accéder à votre espace.'
          : `Service indisponible (${response.status}).`),
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setError('');
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void api<T>(path, 'GET', undefined, controller.signal)
      .then(setData)
      .catch((e: unknown) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : 'Erreur inconnue');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [path, version]);
  return { data, error, loading, refresh };
}
export function keyOf(entity: Entity, row: Row) {
  return Object.fromEntries(entity.keys.map((k) => [k, row[k]]));
}
export function keyQuery(entity: Entity, row: Row) {
  return encodeURIComponent(JSON.stringify(keyOf(entity, row)));
}
export const titles: Record<string, string> = {
  adherent: 'Adhérents',
  verger: 'Vergers',
  parcelle: 'Parcelles',
  culture: 'Cultures',
  grpvar: 'Groupes de variétés',
  variete: 'Variétés',
  souvar: 'Sous-variétés',
};
export const labels: Record<string, string> = {
  refadh: 'Référence adhérent',
  nomadh: 'Nom de l’adhérent',
  cinadh: 'CIN',
  adradh: 'Adresse',
  viladh: 'Ville',
  teladh: 'Téléphone',
  faxadh: 'Fax',
  certif: 'Certification',
  Type: 'Type',
  nompro: 'Nom du producteur',
  txtref: 'Référence complémentaire',
  refver: 'Référence verger',
  letver: 'Lettre du verger',
  refsta: 'Station locale (refsta)',
  nomver: 'Nom du verger',
  supver: 'Superficie (ha)',
  region: 'Région',
  locver: 'Localisation',
  tecver: 'Technicien historique',
  disvera: 'Distance A',
  disverf: 'Distance F',
  tarif: 'Tarif',
  coment: 'Commentaire',
  codggn: 'GGN',
  geoloc: 'Géolocalisation',
  libelle: 'Libellé',
  blocker: 'Blocage',
  refremp: 'Référence remplacement',
  technicien: 'Technicien',
  douar: 'Douar',
  refpar: 'Référence parcelle',
  numcul: 'Numéro de culture',
  codvar: 'Variété',
  suppar: 'Superficie (ha)',
  nbrarb: 'Nombre d’arbres',
  ecarte: 'Écartement',
  espace: 'Espacement',
  irriga: 'Irrigation',
  portgref: 'Porte-greffe',
  dtepln: 'Date de plantation',
  dtearr: 'Date d’arrachage',
  traite: 'Traitement',
  codsvar: 'Sous-variété',
  idparcelle: 'Identifiant interne',
  latitude: 'Latitude',
  longitude: 'Longitude',
  codvar2: 'Variété secondaire',
  souvar2: 'Sous-variété secondaire',
  couverture: 'Couverture',
  typefilet: 'Type de filet',
  estimation: 'Estimation',
  UpdatedAt: 'Dernière mise à jour',
  codcul: 'Culture',
  nomcul: 'Nom de la culture',
  codgrv: 'Groupe',
  nomgrv: 'Nom du groupe',
  nomvar: 'Nom de la variété',
  nomsvar: 'Nom de la sous-variété',
  nomimp: 'Nom imprimé',
  catII: 'Catégorie II',
  prixmoy: 'Prix moyen',
  lier: 'Code historique de liaison',
};
export function display(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}
export function dateDisplay(value: unknown) {
  return value
    ? new Date(String(value) + (String(value).endsWith('Z') ? '' : 'Z')).toLocaleString('fr-MA')
    : '—';
}
