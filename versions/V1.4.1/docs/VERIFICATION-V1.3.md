# VITASOUSS V1.3 pilote — vérification

6 octobre 2026 · MySQL **5.7.44**, .NET **10**, React/Vite/TypeScript strict/Mantine. Toutes les opérations de test ont visé la boucle locale et des copies identifiées de validation. Aucune connexion de production, modification d'IIS, réimportation de dump, migration admin ou modification des archives réelles.

## Résultats API

**237 contrôles réussis** dans les rapports JSON livrés :

| Suite | Nombre | Rapport |
|---|---:|---|
| V1.3 pilote | 65 | api-verification-v13.json |
| Non-régression V1.2.1 | 50 | api-verification-v121.json |
| V1.2, intégrité/KPI/transfert/synchronisation | 46 | api-verification-v12.json |
| V1.1, relations/synthèses/sélecteurs | 24 | api-verification-v11.json |
| Comparaison V1.2 | 25 | comparison-verification-v12.json |
| V1, sécurité/archives/écritures | 27 | api-verification.json |

La suite V1.3 utilise deux nouvelles copies dédiées, avec tables du schéma fourni et fixtures initialisées avant les essais. Elle couvre : filtres combinés cohérents liste/KPI/recherche/pagination ; refus de noms SQL/JSON invalides ; huit nouveaux référentiels et cardinalités ; bigint exact et hors limites ; libellés contrôlés sur clés uniques ; MyISAM/sans clé unique protégés ; rôles/archive/CSRF/snapshot ; table absente dans archive ; cinq tableaux de bord avec total SQL, détail paginé, période/évolution ; route et confirmation DIAF ; source inchangée et refsta destination préservé ; création contrôlée culture ; création dépendante refusée ; audit ; assistant non configuré/outils bornés/SQL libre et contexte non attribué refusés.

Les suites précédentes vérifient suppression individuelle/multiple, réception protégée par tuple complet toutes stations, lots partiels, dépendance apparue après aperçu, FK/cascades refusées, producteurs libres/protégés, audit des refus, KPI et transferts, comparaison CSV, synchronisation et droits. L'ancien test écrivant temporairement dans reception_d est remplacé par la fixture V1.2.1 isolée : aucune réception existante n'a été modifiée. Les données source/destination préexistantes sont restaurées après les tests et les contextes/utilisateurs de fixtures sont désactivés. Seul le dernier jeu V1.3 a ensuite été réactivé pour la recette manuelle sous les libellés TEST PILOTE V1.3 - ZAOUIA/DIAF (copie locale), avec une culture DEMO PILOTE V13 absente de DIAF ; les utilisateurs automatisés restent désactivés. Ces deux contextes sont limités au MySQL local port 33307 et ne sont pas des bases de production.

La copie métier source actuelle reste à **78 adhérents / 119 vergers / 1015 parcelles**. Les anciennes 1014 parcelles du dump ne sont pas imposées en supprimant une ligne supplémentaire.

## Compilation et paquet

Frontend compilé avec TypeScript strict puis Vite ; backend publié **Release .NET 10**. Aucune nouvelle dépendance. Les erreurs temporaires de compilation/publication rencontrées pendant la réalisation ont été corrigées avant livraison ; un verrou provenait de la copie locale lancée trop tôt. Un contrôle initial du libellé partenaire via la sortie Windows du client MySQL avait un encodage accentué différent ; le test final vérifie le libellé via l'API UTF-8 et l'identifiant exact via SQL, sans réduire le contrôle.

Livrable : **VITASOUSS-V1.3-IIS.zip**, publication app/ et mise à jour update/. Contrôle de présence de pilot-schema.json, DLL et assets compilés ; empreintes comparées entre publication et update. Appsettings.Local, secrets, clés, données de test et dumps exclus ; update sans appsettings ni web.config. Catalogue historique schema.json, SQL admin, configuration modèles et mécanismes Data Protection inchangés. Aucun code n'exécute les DDL du catalogue pilote en production.

Snapshot source : versions/V1.2.1/. Empreintes des modifications : modified-files-v13.json. Documentation d'installation : MISE-A-JOUR-V1.3.md. Limites : QUESTIONS-V1.3.md.

## Revue et limites de l'interface

Filtres/colonnes communs réutilisés par les listes historiques et pilotes ; préférences de colonnes locales versionnées, recherche/filtres temporisés, pages de 25 lignes, aucune agrégation côté React sur une table complète. Les KPI reçoivent les mêmes filtres SQL. Colonnes de verger incluent notamment **GGN (codggn)** et **Blocage**, indépendamment configurables.

Groupes de navigation repliables, preference localStorage, mêmes routes historiques/rôles, sidebar réduite/tooltips et mobile Mantine. Écrans de confirmation protégés pendant le traitement ; demandes DIAF et résultats individuels visibles ; aucun DELETE automatique dans les nouveaux modules. Les dossiers graphiques restent les styles Mantine validés.

**Validation navigateur non réalisée.** Le dernier accès à http://127.0.0.1:5080 a été rejeté par une préférence utilisateur enregistrée. Cette livraison n'a pas utilisé d'autre navigateur ou voie indirecte pour contourner cette restriction. Compilation et revue ne prouvent pas les interactions visuelles. Aucun faux screenshot, résultat E2E navigateur ou validation responsive n'est revendiqué.

Recette visuelle à effectuer sur la copie pilote autorisée :

1. Recherche + deux filtres : totaux, pagination et KPI cohérents ; filtrer par propriétaire/verger puis certification/région. Enlever les filtres.
2. Colonnes Verger : ajouter GGN, masquer Blocage, recharger et retrouver la préférence. Vérifier les cartes/tableaux, le scroll horizontal et les champs absents d'une archive.
3. Ouvrir/fermer chaque groupe de menu ; sous-menus masqués, navigation et actif corrects ; recharger. Sidebar réduite : tooltips/icônes et ouverture des groupes. Tablette : burger et fermeture après navigation.
4. Comparaison : sélectionner une page, préparer puis confirmer, vérifier refus et réussites, source inchangée/refsta local, rafraîchissement. Une ligne uniquement DIAF/ambiguë ne doit pas être cochable.
5. Nouveaux référentiels : fiches complètes, création explicite et libellés autorisés ; clés NULL, grpemb, déclaration et suppression protégés. Consultation/archives sans boutons d'écriture.
6. Tableaux de bord : KPI vers le détail, jour du graphique vers sa période ; champs/colonnes réels, aucun tonnage supposé ; table absente indique non disponible.
7. Assistant : état non configuré, consultation adhérent et parcelles, tableaux de lecture ; aucun bouton d'écriture. Drencher : emplacement préparatoire clairement indiqué.

## Portée métier

Les tableaux de bord sont des **explorateurs opérationnels pilotes**, pas des bilans de tonnage validés. Les écritures complémentaires sont limitées aux identifiants explicites/libellés et aux schémas uniques validés. Les relations/origines, suppressions complémentaires, quantités métier, Drencher et provider IA ont leurs décisions répertoriées dans QUESTIONS-V1.3. Les fonctions V1.2.1 restent disponibles.

## Reproduction

tools/build.ps1 -SkipInstall, tools/start.ps1 puis suites tools/verify-api*.mjs et verify-comparison-v12.mjs. Secrets temporaires uniquement dans VITASOUSS_TEST_PASSWORD / VITASOUSS_TEST_MYSQL_PASSWORD ; préparation root limitée au MySQL local port 33307. VITASOUSS_EXPECTED_VERSION=1.3 pour la suite V1.2.1 ; VITASOUSS_EXPECTED_PARCELLES=1015 pour la copie actuelle. Les suites utilisent les 8 connexions/minute existantes : les exécuter en groupes espacés, sans désactiver la limite. Ne pas les exécuter en production.



