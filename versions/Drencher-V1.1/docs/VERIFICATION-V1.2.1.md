# Vérification VITASOUSS Référentiels V1.2.1

Date : 6 octobre 2026. Tests sur API locale et MySQL **5.7.44**, sans accès de production.

## Résultats exécutés

**172 vérifications API réussies**, dans les rapports JSON livrés :

| Suite | Contrôles | Rapport |
|---|---:|---|
| V1.2.1, suppressions et protections | 50 | api-verification-v121.json |
| V1.2, transfert, synchronisation, KPI, intégrité | 46 | api-verification-v12.json |
| V1.1, fiches, relations et sélecteurs | 24 | api-verification-v11.json |
| Comparaison ZAOUIA / DIAF | 25 | comparison-verification-v12.json |
| V1, droits, archives, écritures et synchronisation | 27 | api-verification.json |

La suite V1.2 historique comptait 47 contrôles. Son ancien cas écrivait temporairement dans reception_d : il a été remplacé par les cas réception V1.2.1 sur une **nouvelle copie isolée**. La suite actuelle n'écrit plus dans reception_d. La copie isolée est initialisée avant les essais, puis les réceptions restent en lecture seule ; le compte applicatif ne possède aucun droit INSERT/UPDATE/DELETE sur cette table. Le contenu de la fixture est identique avant/après, et la table reception_d de la copie métier actuelle reste intacte. Les contextes et utilisateurs de test sont désactivés après les essais.

Cas couverts : parcelle libre, réception sur deux stations différentes, même refpar avec autre culture/verger, API directe, lots entièrement libres/protégés/mixtes, détail clé/raison, vergers avec parcelles, absence de cascade, producteurs libres/avec vergers/avec autre refadh, confirmation, CSRF, Consultation, archive, doublons, limite 25, clés incomplètes, snapshots obsolètes, journal réussi/refusé, aucune propagation de suppression DIAF, KPI cohérents après suppression. Les contrôles V1.2 conservent transfert, confirmation DIAF, refsta, FK et dépendance ajoutée après aperçu.

La copie métier actuelle possède 78 adhérents, 119 vergers et **1015 parcelles**. Les volumes et valeurs préexistants sont restaurés après les suites de non-régression ; aucune parcelle n'est supprimée pour retrouver artificiellement les 1014 du dump initial.

## Relation reception_d analysée et confirmée

Le dump fourni contient reception_d vide et sans FK. Sa clé primaire est **numrec + refpar + numcul + refver** ; parcelle possède **idparcelle + refpar + numcul + refver**, avec un index historique **refver + refpar + numcul**. reception_d ne possède ni idparcelle, ni refadh, ni colonne exercice. La relation métier a été **explicitement confirmée par l'utilisateur** : **refpar + numcul + refver dans la base de l'exercice**, blocage **quelle que soit refsta**.

Le contrôle central `CheckParcelleDependencies` examine la présence/types de ces colonnes et compte les correspondances du tuple complet. Table ou liaison absente/non reconnue : suppression suspendue. Le même contrôle est exécuté pour aperçu, fiche, lot et API directe, puis revérifié sous verrous avant chaque DELETE. Aucun filtre refsta, aucune recherche dans un autre exercice, aucune écriture reception_d.

Pour les producteurs, le schéma historique a été inspecté : verger, br, caisserie, codsvar, etiq_recep, noncomm, palbrut, palbrut_t, precal, precala, reception_vergers, resanalyse, sauvcai, sondarb, table1, tmpcais2 et xxpalbrut portent notamment refadh. Le contrôle interroge toutes les tables réellement présentes et les FK déclarées, sans cascade ; une relation nouvelle non reconnue suspend la suppression. Les colonnes de nom ne sont pas assimilées à des clés.

## Compilation et contrôle du paquet

Frontend TypeScript strict + Vite compilé ; backend .NET 10 publié en Release. Aucune nouvelle dépendance. Revue React : effets annulables, dépendances primitives, cases accessibles, confirmation verrouillée pendant traitement, résultat incertain signalé sans relance aveugle. Menu regroupé et extensible, mêmes clés de navigation et restriction Administration, même préférence localStorage et comportement mobile Mantine.

Publication `publish/` et paquet `VITASOUSS-V1.2.1-IIS.zip`, avec `app/`, `update/`, documentation et schéma admin historique. Le dossier `update/` exclut tous les appsettings, web.config, secrets, clés et logs. Le catalogue historique, SQL admin, configurations modèles et protection des secrets sont inchangés. Aucun fichier Local, données de test ou dump métier n'est livré.

## Limite visuelle et recette à effectuer

**Les tests navigateur du menu et du responsive ne sont pas validés.** Une tentative de lecture de l'interface locale a été refusée par le contrôle automatique à cause d'une préférence utilisateur enregistrée bloquant `http://127.0.0.1:5080`. Aucun contournement et aucune capture de résultat n'ont été réalisés. La revue du code ne remplace pas une recette visuelle.

À vérifier dans un navigateur autorisé, sur copie de validation :

1. Menu ouvert/réduit : icônes, tooltips, élément actif, navigation vers les mêmes pages, préférence conservée après rechargement ; Administration masquée hors Admin.
2. Téléphone/tablette : burger, fermeture après navigation, formulaires lisibles et cases de sélection dans les cartes.
3. Parcelles/Vergers : sélection ligne/en-tête, compteur limité à la page visible, changement de page/filtre sans sélection d'une autre page, confirmation SUPPRIMER.
4. Lot mixte : résumé des suppressions, éléments refusés avec réception/nombre et raisons ; compteurs et KPI actualisés après traitement.
5. Fiche adhérent : bouton « Supprimer le producteur » ; aucune case/action multiple dans sa liste. Consultation/archives : absence des actions de suppression.

## Reproduction locale

Lancer la copie locale via `tools/start.ps1`. Définir temporairement `VITASOUSS_TEST_PASSWORD` et `VITASOUSS_TEST_MYSQL_PASSWORD` sans les enregistrer. `node tools/verify-api-v121.mjs` exige le serveur MySQL de test en boucle locale port 33307 ; la préparation de copies utilise uniquement son compte root local, jamais un compte serveur réel. Les autres suites utilisent les mêmes variables et, lorsque requis, `VITASOUSS_TEST_SETUP_USER`. Respecter la limitation existante de 8 connexions/minute lors de l'enchaînement des suites.

Ne jamais exécuter ces scripts sur les bases de production. Sources de V1.2 avant modification dans `versions/V1.2/`. Liste des changements et empreintes : `modified-files-v121.json`.
