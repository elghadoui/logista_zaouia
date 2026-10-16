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
