export const referentialTitles: Record<string, string> = {
  adherent: 'Adhérents',
  verger: 'Vergers',
  parcelle: 'Parcelles',
  culture: 'Cultures',
  grpvar: 'Groupes de variétés',
  variete: 'Variétés',
  souvar: 'Sous-variétés',
  declaration_verger: 'Déclarations verger',
  partenaire: 'Partenaires',
  destination: 'Destinations',
  pays: 'Pays',
  marche: 'Marchés',
  grpemb: 'Groupes d’emballages',
  groupart: 'Groupes articles',
  defaut: 'Défauts',
  typeecart: 'Types d’écarts',
};

export function referentialTitle(name: string): string {
  return referentialTitles[name] ?? name;
}

export function authorizedReferential<T extends { name: string }>(
  catalog: T[],
  requested: string,
): T | undefined {
  return (
    catalog.find((e) => e.name === requested) ??
    catalog.find((e) => e.name === 'verger') ??
    catalog[0]
  );
}

// The server may legitimately return null records and null column values.
// Missing report structure is a contract error, rather than an empty comparison.
export function comparisonContractError(value: unknown): string {
  const object = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === 'object' && !Array.isArray(v);
  const number = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  if (
    !object(value) ||
    !Array.isArray(value.rows) ||
    !object(value.summary) ||
    !number(value.total) ||
    typeof value.comparedAt !== 'string' ||
    !Array.isArray(value.warnings) ||
    value.warnings.some((v) => typeof v !== 'string') ||
    [
      'Equal',
      'Different',
      'SourceOnly',
      'TargetOnly',
      'Ambiguous',
      'Conflict',
      'SourceRows',
      'TargetRows',
    ].some((k) => !number((value.summary as Record<string, unknown>)[k])) ||
    value.rows.some(
      (r) =>
        !object(r) ||
        !object(r.key) ||
        typeof r.status !== 'string' ||
        !number(r.sourceCount) ||
        !number(r.targetCount) ||
        !(r.source === null || object(r.source)) ||
        !(r.target === null || object(r.target)) ||
        !Array.isArray(r.differences) ||
        r.differences.some((d) => !object(d) || typeof d.field !== 'string') ||
        (r.conflictingKeys !== undefined &&
          (!Array.isArray(r.conflictingKeys) || r.conflictingKeys.some((k) => !object(k)))),
    )
  )
    return 'Le service de comparaison a renvoyé un rapport incomplet. Rechargez la page ; si le problème persiste, contactez votre administrateur.';
  return '';
}
