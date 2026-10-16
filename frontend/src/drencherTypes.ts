export interface Product {
  id: number;
  reference: string;
  nom: string;
  unite: string;
  actif: boolean;
  matiereActive?: string | null;
  afficherF04?: boolean;
}
export interface Dose {
  produitId: number;
  dose: number;
}
export interface Program {
  id: number;
  version: number;
  nom: string;
  actif: boolean;
  produits: Dose[];
}
export interface Lot {
  id: number;
  produitId: number;
  lot: string;
  peremption: string | null;
  solde: number;
  nom: string;
  unite: string;
}
export interface Palette {
  numpal: number;
  numrec: number;
  codvar: number | null;
  variete: string | null;
  refver: number | null;
  verger: string | null;
  refadh: number | null;
  adherent: string | null;
  poids: number | null;
  cycleTraite: number | null;
}
export interface Usage {
  produitId: number;
  dose: number;
  machine: number | null;
  reel: number | null;
  lots: { lotId: number; quantite: number }[];
}
export interface UsageSnapshot extends Usage {
  matiereActive?: string | null;
  afficherF04?: boolean;
  reference: string;
  nom: string;
  unite: string;
  doseProgramme: number | null;
  initial: number;
  final: number;
  ecartTheorique: number | null;
  ecartMachine: number | null;
  horsProgramme: boolean;
  doseModifiee: boolean;
  lots: { lotId: number; lot: string; peremption: string | null; quantite: number }[];
}
export interface Snapshot {
  date: string;
  debut: string;
  fin: string;
  programmeId: number;
  programmeVersion: number;
  programmeNom: string;
  eauInitiale: number;
  eauConsommee: number;
  unitePoids: string;
  palettes: Palette[];
  produits: UsageSnapshot[];
  observations: string;
}
export interface Cycle {
  id: number;
  version: number;
  statut: string;
  auteur: string;
  dateValidation: string | null;
  validateur: string | null;
}
export interface Revision {
  version: number;
  action: string;
  motif: string;
  auteur: string;
  dateCreation: string;
  snapshot: Snapshot;
}
export interface Detail extends Cycle {
  canEditDraft?: boolean;
  dateCreation: string;
  revisions: Revision[];
}
export interface Catalog {
  produits: Product[];
  programmes: Program[];
  lots: Lot[];
  unitePoids: string;
}
export interface CycleRequest {
  version: number;
  date: string;
  debut: string;
  fin: string;
  programmeId: number;
  programmeVersion: number;
  eauInitiale: number;
  eauConsommee: number;
  palettes: number[];
  produits: Usage[];
  observations: string;
  motif: string;
}
export const amount = (water: number, dose: number) =>
  Math.round(((water * dose) / 1000) * 1e6) / 1e6;
export const number = (v: number | null | undefined) =>
  v == null ? '—' : v.toLocaleString('fr-MA', { maximumFractionDigits: 6 });
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
