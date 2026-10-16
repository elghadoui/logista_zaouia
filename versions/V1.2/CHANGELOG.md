# VITASOUSS Référentiels — V1.2

## V1.1 → V1.2 — 6 octobre 2026

- Action « Transférer vers un autre adhérent » avec recherche, ancien/nouveau propriétaire, confirmation et option DIAF. Seul verger.refadh change ; refver, parcelles et autres champs restent conservés. Audit Transfer et workflow DIAF existant.
- Suppression contrôlée Parcelle/Verger : aperçu, clé complète, snapshot, confirmation SUPPRIMER, contrôle des aliases historiques/FK et des demandes DIAF, verrous SQL et seconde vérification. Aucun contournement Admin ni cascade. Audit Delete Applied/Blocked et réconciliation d’un résultat incertain.
- Autres référentiels et suppression DIAF synchronisée restent désactivés tant que leurs règles d’intégrité ne sont pas validées.
- KPI API/SQL filtrés, indépendants de la pagination : totaux, surfaces déclarées/parcelles distinctes, moyennes, variétés/cultures. Anciennes colonnes absentes : indisponible avec explication. Les parcelles orphelines restent incluses dans les totaux de l’exercice.
- Interface « Comparer ZAOUIA / DIAF » dans le menu et le dashboard : sept référentiels, destination autorisée, fiches différentes/absentes/ambiguës, détail des valeurs, recherche et pagination. Export CSV complet des résultats filtrés, protégé contre les formules. Lecture seule, sans rapprocher arbitrairement les doublons, sans refsta ni champs générés.
- Sélecteur de références partagé entre formulaire et transfert. Actions suspendues pendant des modifications non enregistrées. Journal distingue transfert/suppression/tentative bloquée.
- V1.1 conservée dans versions/V1.1. Publication versionnée 1.2.0 et dossier update sans configurations/web.config/clés, pour préserver l’instance VM-APPS.
- Aucune migration de structure ; nouveaux privilèges DELETE sur parcelle/verger et LOCK TABLES sur la base métier. Aucun accès de production ni changement de C:\ProgramData\Vitasouss\keys.

Fichiers modifiés : backend/Program.cs, backend/Vitasouss.Api.csproj, backend/Application/Models.cs, ReferentialService.cs, SyncService.cs ; frontend/package.json, package-lock.json, src/App.tsx, RecordView.tsx, EntityList.tsx, JournalSync.tsx, components.tsx ; tools/verify-api.mjs, tools/pack.ps1 ; README.md, CHANGELOG.md, docs/DECISIONS.md et IIS-INSTALLATION.md.

Fichiers ajoutés : backend/Application/IntegrityService.cs, KpiService.cs ; frontend/src/ReferenceInput.tsx, RecordActions.tsx, ListKpis.tsx ; tools/verify-api-v12.mjs ; docs/INTEGRITE-V1.2.md, MISE-A-JOUR-V1.2.md, VERIFICATION-V1.2.md, api-verification-v12.json et modified-files-v12.json.

La liste exacte et les empreintes par rapport à V1.1 sont dans docs/modified-files-v12.json. Les rapports V1/V1.1 sont régénérés après non-régression. Source historique et configuration des secrets conservées.

Complément comparaison : `backend/Application/ComparisonService.cs`, `frontend/src/ReferentialComparison.tsx`, `frontend/src/Dashboard.tsx`, `tools/verify-comparison-v12.mjs`, `docs/comparison-verification-v12.json`.

---

# VITASOUSS Référentiels — V1.0 → V1.1

Version préparée le 6 octobre 2026, exclusivement sur copies locales MySQL 5.7.44.

## Ergonomie métier

- Navigation desktop ouverte/réduite (76 px), icônes, tooltips, préférence mémorisée. Le même menu s’ouvre sur petit écran.
- Libellés adhérent, verger, culture, groupe, variété et sous-variété prioritaires ; références historiques secondaires.
- Fiches adhérent/verger : synthèses calculées sur les relations réelles, nombres de vergers/parcelles et sommes des superficies. La superficie déclarée du verger reste distincte de celle de ses parcelles.
- Liens directs de la parcelle vers le verger et l’adhérent ; accès aux enfants conservé par onglets.
- Parcelles d’un verger : colonne verger retirée, culture issue de `variete.codcul`, résumé de toutes les parcelles filtrées, pagination conservée.
- Affichage des superficies avec deux décimales et unité ha, sans arrondir les valeurs enregistrées.
- Cartes de consultation sur téléphone ; tableaux conservés sur desktop/tablette.
- Formulaire parcelle organisé par sections, identifiant auto-incrémenté masqué. Recherche serveur bornée à 40 résultats, résolution du nom sélectionné même hors première page, cascades principale et secondaire.
- `refsta` affiché en lecture seule dans le formulaire métier. Les codes propres à la fiche restent saisis explicitement lors d’une création puis protégés.
- Marqueurs de champs obligatoires, erreurs sous les champs et badges archive/maître/destination.

## Sauvegarde ZAOUIA → DIAF

- Récapitulatif des changements, case « Synchroniser également avec DIAF » et un seul bouton de validation.
- Après enregistrement ZAOUIA, comparaison DIAF dans la fiche et confirmation explicite des différences avant application.
- Panne DIAF : confirmation de l’enregistrement ZAOUIA et reprise ultérieure depuis la file existante. Aucune annulation de la source.
- L’aperçu DIAF identifie clairement les valeurs actuelles DIAF et les valeurs ZAOUIA à appliquer ; `refsta` reste exclu.

## Compatibilité et vérification

Le schéma historique, les écritures, contrôles optimistes, clés composées, audit, droits, archives et CSRF restent conservés. L’enrichissement des listes est activé avec `presentation=true` afin de garder le contrat brut V1 pour ses clients/tests. Les fiches brutes sont séparées des données d’affichage.

27 contrôles V1 et 24 contrôles API V1.1 réussis sur copies locales. Compilation TypeScript et backend réussie. Voir `docs/VERIFICATION-V1.1.md` pour les preuves et la limite de validation visuelle.

La V1.0, ses sources et son ancien paquet sont conservés dans `versions/V1.0`. Aucun déploiement de production.

## Fichiers sources modifiés

1. `backend/Program.cs` : lectures protégées, enregistrement du service, version de santé.
2. `backend/Application/ReferentialService.cs` : enrichissement SQL optionnel et résumé paginé.
3. `backend/Vitasouss.Api.csproj` : version 1.1.0.
4. `frontend/src/App.tsx` : sidebar et version.
5. `frontend/src/EntityList.tsx` : libellés, résumé, superficies et cartes mobile.
6. `frontend/src/RecordView.tsx` : fiches, sélecteurs, protections visuelles et workflow.
7. `frontend/src/JournalSync.tsx` : intitulés de comparaison DIAF.
8. `frontend/src/api.ts` : types de présentation et format des superficies.
9. `frontend/src/components.tsx` : comparaison avec intitulés et superficies.
10. `frontend/src/style.css` : sidebar et ajustements responsive.
11. `frontend/package.json` et `frontend/package-lock.json` : version 1.1.0.
12. `README.md`, `docs/IIS-INSTALLATION.md` : livraison actualisée.

## Fichiers ajoutés

- `backend/Application/PresentationService.cs`
- `frontend/src/RecordSummary.tsx`
- `frontend/src/SyncReview.tsx`
- `tools/verify-api-v11.mjs`
- `tools/pack.ps1` (préparation locale du paquet IIS)
- `CHANGELOG.md`
- `docs/VERIFICATION-V1.1.md`
- `docs/api-verification-v11.json`
- `docs/modified-files-v11.json` (diff précis avec empreintes)
- `versions/V1.0/` (copie conservée)

Sorties générées : `frontend/dist/`, `backend/wwwroot/`, `publish/`, `release/VITASOUSS-V1.1/`, `VITASOUSS-V1.1-IIS.zip`. Le rapport `docs/api-verification.json` a été régénéré en exécutant les tests V1 inchangés.

