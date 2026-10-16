import { drExpired } from './drencherDates';
import { Alert, Table, Text, Title } from '@mantine/core';
import type { Detail } from './drencherTypes';
import { number } from './drencherTypes';
export function DrencherPrint({ detail }: { detail: Detail }) {
  const s = detail.revisions[0].snapshot;
  const known = s.palettes.every((p) => p.poids !== null),
    weight = s.palettes.reduce((n, p) => n + (p.poids ?? 0), 0),
    tonnage = known && s.unitePoids ? (s.unitePoids === 'kg' ? weight / 1000 : weight) : null;
  return (
    <div className="dr-print">
      <Title order={3}>VITASOUSS · Suivi Drencher · cycle #{detail.id}</Title>
      <Text size="sm">
        Consultation du cycle et de son historique. Utilisez « Aperçu F04 » pour le document F04
        MPS-01 V06.
      </Text>
      <Text>
        {s.date} · {s.debut}–{s.fin} · {detail.statut} · Programme {s.programmeNom} v
        {s.programmeVersion}
      </Text>
      <Text>
        Opérateur : {detail.auteur} · Création : {detail.dateCreation} · Validation :{' '}
        {detail.validateur ?? 'En attente'} {detail.dateValidation ?? ''}
      </Text>
      <Text>
        {s.palettes.length} palettes · Tonnage :{' '}
        {tonnage === null ? 'non calculé — unité/poids à confirmer' : number(tonnage) + ' t'} · Eau
        initiale : {number(s.eauInitiale)} L · Eau consommée : {number(s.eauConsommee)} L
      </Text>
      <Table mt="md" withTableBorder>
        <Table.Thead>
          <Table.Tr>
            {[
              'Produit / dose',
              'Initial calculé',
              'Final théorique',
              'Machine',
              'Réel',
              'Δ réel/théorie',
              'Δ réel/machine',
              'Lots fabricants',
            ].map((l) => (
              <Table.Th key={l}>{l}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {s.produits.map((p) => (
            <Table.Tr key={p.produitId}>
              <Table.Td>
                {p.nom}
                <br />
                {number(p.dose)} {p.unite}/1000 L{p.horsProgramme ? ' · HORS PROGRAMME' : ''}
                {p.doseModifiee ? ' · DOSE MODIFIÉE' : ''}
              </Table.Td>
              {[p.initial, p.final, p.machine, p.reel, p.ecartTheorique, p.ecartMachine].map(
                (n, i) => (
                  <Table.Td key={i}>
                    {number(n)} {p.unite}
                  </Table.Td>
                ),
              )}
              <Table.Td>
                {p.lots.map((l) => (
                  <div key={l.lotId}>
                    {l.lot} : {number(l.quantite)} {p.unite}
                    {drExpired(l.peremption, s.date) ? ' · PÉRIMÉ' : ''}
                  </div>
                ))}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {s.produits.some(
        (p) =>
          p.horsProgramme ||
          p.doseModifiee ||
          p.ecartTheorique !== 0 ||
          p.ecartMachine !== 0 ||
          p.lots.some((l) => drExpired(l.peremption, s.date)),
      ) ? (
        <Alert color="orange" mt="sm">
          Écarts à examiner par le responsable qualité. Aucune consommation réelle n'est omise.
        </Alert>
      ) : null}
      <Text mt="md">Observations : {s.observations || '—'}</Text>
      <Table mt="md" withTableBorder>
        <Table.Thead>
          <Table.Tr>
            {['Réception', 'Palette', 'Variété', 'Verger', 'Adhérent', 'Poids Logista'].map((l) => (
              <Table.Th key={l}>{l}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {s.palettes.map((p) => (
            <Table.Tr key={p.numpal}>
              <Table.Td>{p.numrec}</Table.Td>
              <Table.Td>{p.numpal}</Table.Td>
              <Table.Td>{p.variete ?? p.codvar ?? '—'}</Table.Td>
              <Table.Td>{p.verger ?? p.refver ?? '—'}</Table.Td>
              <Table.Td>{p.adherent ?? p.refadh ?? '—'}</Table.Td>
              <Table.Td>
                {number(p.poids)} {s.unitePoids || '(unité non confirmée)'}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      <Title order={4} mt="lg">
        Historique conservé
      </Title>
      {[...detail.revisions].reverse().map((r) => (
        <div key={r.version} className="dr-revision">
          <Text fw={600}>
            Révision {r.version} · {r.action} · {r.auteur} · {r.dateCreation}
          </Text>
          <Text>{r.motif || '—'}</Text>
          {r.version !== detail.version ? (
            <Text size="sm">
              {r.snapshot.produits
                .map(
                  (p) =>
                    `${p.nom} : machine ${number(p.machine)}, réel ${number(p.reel)} ${p.unite}, lots ${p.lots.map((l) => `${l.lot}=${number(l.quantite)}`).join(', ')}`,
                )
                .join(' ; ')}
            </Text>
          ) : null}
        </div>
      ))}
    </div>
  );
}
