## V1.6.0 Export — candidat finalisé

Tableau de bord Export en lecture seule : seuls les dossiers codmaj=2 alimentent les KPI et graphiques exportés, poids officiel bdq.pdscom (kg), Client destination.vildes. Statuts En cours/Chargé/Inconnu consultables séparément, détails transport et Excel filtré avec récapitulatif. Drencher 1.3.2.1, droits et migrations conservés. Aucun déploiement; revue visuelle réelle restante. Voir docs/V1.6.0-TESTS.md et docs/V1.6.0-MISE-A-JOUR.md.

## V1.5.0 — 15 octobre 2026

Tableaux de bord Réceptions et Caisserie, filtres communs, consolidation par contextes autorisés, comparaison d'archives par jours écoulés, détail paginé et export Excel. Net officiel des en-têtes sans duplication, semaines ISO MySQL 5.7, données incomplètes signalées. Estimations partielles sans taux de réalisation ; caisserie sans soldes physiques/propriété non démontrés. Droits existants réutilisés, aucun SQL de migration, aucune modification des sources Drencher 1.3.2.1.

## V1.4.1 — 8 octobre 2026

CRUD complémentaires et déclarations corrigés selon les règles validées ; Marchés ajouté. Protections d’usage partagées avec la synchronisation, dépendances/familles/libellés, contrôle de visibilité du schéma et refus des cascades. Offre de synchronisation après formulaire, aperçu/confirmation, reprise après panne DIAF. Comparaison corrigée (libellés undefined, permissions, NULL, contrat et isolation des erreurs). Sidebar modernisé après validation, travaillé en copie isolée ; routes et Drencher conservés. Rapport détaillé : docs/RAPPORT-TESTS-V1.4.1.md. Paquet update/ sans configuration/secrets ; migration administration idempotente 003_permissions_v141.sql. Recette visuelle/VM restant à effectuer.

## V1.4 — 7 octobre 2026

Référentiels complémentaires métier, groupes/articles et créations de déclarations contrôlées ; comparaison/réplication ZAOUIA → DIAF avec code maître explicite et conflits bloqués ; permissions par module/action et menu hiérarchisé. Assistant OpenAI, secrets/IIS/DPAPI et fonctions historiques conservés. 359 tests locaux réussis, compilation frontend/backend Release. Migration admin idempotente 002_permissions_v14.sql uniquement ; aucune modification des schémas Logista. Suppressions non prouvées et déclaration utilisée/non vérifiable protégées. Paquet update/ : VITASOUSS-V1.4-IIS.zip. Documentation de mise à jour, recette, cartographie et questions jointe.
## V1.3-AI — 7 octobre 2026

- Assistant activé via OpenAI Responses, modèle configurable serveur, outils métier stricts en lecture seule et contrôles de droits par exercice.
- Conversation Mantine, nouvelle conversation, état de génération et diagnostic technique administrateur seulement.
- Clé chiffrée Data Protection/DPAPI hors site, saisie masquée sous svc_vitasouss via --protect-openai-secret ; aucune clé incluse dans les livrables.
- Limites question, contexte, lignes, outils, tokens de sortie, timeout et fréquence ; audit de métadonnées sans prompts, résultats ou secrets.
- 46 vérifications provider/outils, 14 HTTP et 27 de régression réussies sur copies locales, sans appel OpenAI réel. Frontend/backend Release compilés. Recette réelle VM-APPS et visuelle restant à réaliser.
- Petite mise à jour VITASOUSS-V1.3-AI-IIS.zip : update/ sans appsettings, web.config, clés ni journaux ; aucune migration SQL ou modification des droits MySQL/IIS.

Activation : docs/ACTIVATION-OPENAI.md. Vérification : docs/VERIFICATION-ASSISTANT-IA.md. Snapshot avant modification : versions/V1.3/.
# VITASOUSS — V1.3 PILOTE

## V1.2.1 → V1.3 pilote — 6 octobre 2026

- Listes historiques : filtres exacts combinés (8 maximum), mêmes conditions SQL pour recherche/pagination/KPI, gestion contrôlée des filtres absents d'un ancien schéma. Colonnes configurables et préférence locale, GGN disponible, fonctions de sélection/suppression V1.2.1 conservées.
- Navigation regroupée et repliable, état de groupes mémorisé, groupe actif identifiable, icônes/tooltips en mode réduit et burger mobile conservés. Identité interface VITASOUSS ; noms techniques/permissions/routes historiques inchangés.
- Huit nouveaux référentiels consultables, fiches/filtres/colonnes réutilisés. Créations explicites et libellés limités pour partenaire/destination/pays/groupart/defaut/typeecart, après validation d'un index unique, types, InnoDB et absence de trigger. Bigint préservé exactement. grpemb et declaration_verger protégés ; suppressions complémentaires non autorisées.
- Comparaison : sélection de page, préparation durable puis confirmation par moteur de synchronisation, contrôle optimiste source/cible, résultats individuels, aucune écriture source ni suppression DIAF. Création DIAF contrôlée adherent/culture/grpvar seulement ; refsta et champs générés exclus. Audit CompareUpdate/CompareCreate et réconciliation conservés, y compris nouveaux référentiels.
- Réceptions/caisserie/versements/export/écarts : explorateurs SQL en lecture seule, comptage de lignes, périodes, évolution quotidienne, détail et drill-down. Unités et rapprochements métier non démontrés non inventés ; limites dans QUESTIONS-V1.3.
- Qualité/Drencher préparatoire : source existante non trouvée, pas de reconstruction des traitements/F04. Assistant IA : interface, provider abstrait désactivé et outils de lecture bornés au contexte autorisé, sans SQL libre, mutation, secret ou appel externe.
- 237 contrôles API réussis et frontend/backend compilés. Validation visuelle/responsive restant à effectuer, restriction navigateur respectée.
- VITASOUSS-V1.3-IIS.zip avec app/update ; configurations, secrets, web.config/keys de production préservés. Aucune migration admin, archive, normalisation refsta ou intervention de production. Privilèges supplémentaires éventuels : INSERT/UPDATE sur six tables et TRIGGER d'inspection limité aux tables des nouvelles écritures ; aucun nouveau DELETE. Index proposés uniquement commentés.

Documentation : docs/MISE-A-JOUR-V1.3.md, VERIFICATION-V1.3.md, QUESTIONS-V1.3.md et ASSISTANT-IA-V1.3.md. Snapshot : versions/V1.2.1/. Liste exacte/empreintes : docs/modified-files-v13.json.
## V1.2 → V1.2.1 — 6 octobre 2026

- Cases de sélection Parcelle/Verger, sélection de la page visible uniquement (25 maximum), compteur et confirmation SUPPRIMER. Aperçu de chaque fiche, suppression indépendante, bilan réussites/refus/résultats incertains et raisons détaillées ; rechargement de la liste et des KPI.
- Contrôle reception_d explicite et centralisé, selon la relation confirmée par l'utilisateur : refpar + numcul + refver dans la base de l'exercice, toute refsta. Table/types non reconnus : suppression suspendue. Nombre de références et message métier. Aucun changement des réceptions existantes.
- Suppression producteur/adherent uniquement dans sa fiche, avec contrôle vergers, autres refadh et FK. Aucune suppression multiple d'adhérents, cascade ou propagation DIAF.
- Audit des réussites, dépendances refusées et états obsolètes. Même sécurité API, rôles, archives, CSRF, verrous et protection des secrets.
- Menu réductible conservé ; groupes extensibles Référentiels/Suivi/Administration, clés et rôles inchangés. Aucun nouveau module développé.
- 172 contrôles API réussis, frontend/backend compilés. La validation visuelle reste à effectuer : refus automatique de l'accès navigateur local par une préférence enregistrée.
- Livraison VITASOUSS-V1.2.1-IIS.zip et update/ sans configurations/web.config/clés/secrets. Aucune migration de structure ; seul DELETE sur adherent s'ajoute aux privilèges de suppression V1.2. Pas de changement des droits archives ou de l'instance de production.

Documentation : docs/MISE-A-JOUR-V1.2.1.md et VERIFICATION-V1.2.1.md. Sources précédentes : versions/V1.2/. Fichiers exacts et empreintes : docs/modified-files-v121.json.

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








