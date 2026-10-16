# Audit préalable V1.4.1

Date : 7 octobre 2026. Sources V1.4 conservées dans versions/V1.4, hors secrets et dépendances générées. Aucun accès aux serveurs de production.

## Schéma et relations

Les types et index proviennent du dump fourni ; le relevé sans données est dans schema-audit-v141.json. La présence et les types sont aussi contrôlés dans information_schema à chaque écriture. La recette utilise uniquement MySQL local et des bases vitasouss_test_* isolées.

- Partenaire : `ref BIGINT` possède un index unique mais accepte NULL. La colonne réelle est `fax CHAR(17)`, pas `fac`. `rep CHAR(30)` est un texte externe sans relation ; `pays CHAR(30)` est aussi du texte. Pas de migration vers VARCHAR.
- Palette : exportateur porté par `codexp BIGINT`. Dossier porte les quatre références confirmées refexp/refte/reftrp/reftm.
- Tpalette : article porté par `codgrp SMALLINT`. Palette porte aussi codgrp.
- Marché : codmar SMALLINT, nommar CHAR(10), gest CHAR(2), InnoDB sans index unique formel dans le dump. Gest contient notamment PA et MF : ces valeurs historiques doivent rester acceptées en plus de SU/NS.
- Grpemb : pas de clé SQL formelle ; doublons/nuls doivent bloquer les écritures sans ajouter de contrainte à la base historique.
- Défaut : culture INT ; catdef CHAR(25) ; lier CHAR(1). Les deux valeurs techniques doivent être « 1 » à la création.
- Déclaration : id technique auto-incrémenté, MyISAM. Le lien réception sur les quatre valeurs simultanées est maintenant confirmé par l’utilisateur. Les écritures demandent un verrou de la déclaration et des lectures dépendantes, car une transaction seule ne protège pas MyISAM.

Plusieurs tables portent les mêmes codes sans clé étrangère. Exemple : codmar signifie marché dans pays mais désigne aussi un autre référentiel `marque`. Ces noms ne suffisent pas à inventer des relations. Les suppressions contrôleront les clés étrangères réelles et les porteurs de codes candidats ; une utilisation ambiguë entraînera un blocage explicite, sans cascade ni modification du schéma historique.

## Écarts fonctionnels constatés

| Module | V1.4 | Correction demandée |
|---|---|---|
| Destination | Seul vildes modifiable ; suppression toujours bloquée | Adresses corrigeables ; pays conditionné par dossier ; suppression après toutes les dépendances |
| Partenaire | Seul nom modifiable | Coordonnées, pays et rep corrigeables ; type protégé si utilisé |
| Pays | Nom et abréviation corrigeables même avec destination | Tout changement bloqué uniquement par destination ; marché sélectionnable |
| Marché | Absent du catalogue, des permissions et formulaires | CRUD, relation pays et synchronisation contrôlée |
| Grpemb | Libellé modifiable même si articles ; suppression contrôlée | Toute modification bloquée si groupart utilise le groupe |
| Groupart | Type modifiable sans contrôle tpalette | Tout changement et suppression bloqués si tpalette utilise l’article |
| Défaut | Intitulé seul ; valeurs techniques non imposées | Famille, culture ; lier=catdef=1 ; protection agréage |
| Type écart | Libellé corrigeable sans contrôle ecart_e | Toute modification et suppression bloquées si utilisé |
| Déclaration | Modification/suppression systématiquement suspendues | Contrôle de la combinaison d’origine sur quatre champs ; doublons ; CRUD permis si inutilisée |
| Synchronisation | Préparation/aperçu/confirmation existent pour comparaison ; patch complémentaire limité aux libellés | Même contrôles sur DIAF, nouveaux champs et parents, proposition depuis formulaires |

## Diagnostic précis de la page blanche

App.tsx ajoute le catalogue complémentaire au catalogue historique pour la comparaison. ReferentialComparison.tsx construit les options Select avec `titles[e.name]`. api.ts ne contenait que sept noms historiques. Le libellé de « destination », « partenaire », etc. devient undefined. Le filtre réel de Mantine 8.3.1 appelle `item.label.toLowerCase()` dans `Combobox/OptionsDropdown/default-options-filter.mjs`.

Second défaut : le référentiel initial est toujours « verger » même si cette permission est refusée. L’assertion non nulle sur l’entité sélectionnée peut ensuite provoquer un plantage. La correction doit sélectionner uniquement une entité autorisée, gérer un catalogue vide, contrôler le rapport reçu et isoler les erreurs de page sans perdre le header/menu.

Les valeurs SQL NULL sont légitimes : elles doivent rester visibles comme absences, sans être transformées en égalités fictives. Les exports et rapprochements restent calculés côté serveur.

## Sidebar

L’audit, les maquettes et les risques sont dans SIDEBAR-V1.4.1-PROPOSITION.md. L’utilisateur a validé l’arborescence et le design dans cette conversation le 7 octobre 2026. La copie isolée pour l’implémentation se trouve dans .test-data/sidebar-v141 ; seuls les fichiers de navigation seront intégrés. Aucune modification de DrencherPanel ou du Drencher externe.

## Points de vigilance pour la recette VM

Les schémas des VM n’ont pas été interrogés. Toute différence sera refusée avant écriture. Les comptes MySQL doivent disposer des droits ciblés nécessaires aux référentiels et aux verrous ; aucun droit arbitraire supplémentaire n’est accordé par l’application. Les champs partageant un code sans relation documentée peuvent bloquer une suppression : le message précise la table à examiner. Aucune référence n’est fusionnée automatiquement.
