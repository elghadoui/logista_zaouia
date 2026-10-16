# Vérification V1.2 — 6 octobre 2026

Environnement : copies locales MySQL **5.7.44**, API boucle locale `127.0.0.1:5080`. Aucun serveur de production contacté. La structure historique de production n’est pas modifiée.

## Contrôles fonctionnels

**123 contrôles réussis : 47 V1.2 + 25 comparaison + 27 V1 + 24 V1.1**, avec rapports `api-verification-v12.json`, `comparison-verification-v12.json`, `api-verification.json` et `api-verification-v11.json`. `/api/health` confirme la version 1.2 sur la publication testée.

Suite `tools/verify-api-v12.mjs` : transfert Gestionnaire A → B, conservation de refver et des autres champs, parcelles intactes, audit avant/après et utilisateur/date/contexte, refus Consultation/archive/CSRF/snapshot obsolète/adhérent inexistant. File DIAF préparée sans écriture implicite, comparaison puis confirmation, refsta DIAF conservé.

Suppressions réelles de fiches de test isolées : verger et parcelle. Refus lorsqu’un verger possède une parcelle, lorsqu’une dépendance idpar est ajoutée après l’aperçu, lorsqu’une réception référence la clé parcelle et lorsqu’une FK à nom différent prévoit une cascade. Les données dépendantes restent intactes. Confirmation `SUPPRIMER`, snapshot complet, autorisations et audit Applied/Blocked vérifiés. Autres référentiels : suppression refusée.

KPI confrontés aux requêtes SQL directes : totaux, surfaces, moyennes, variétés/cultures, filtres et contexte DIAF/archive ; pagination sans effet sur les totaux. Archive de test sans colonne suppar : surface/moyenne nulles avec explication, aucune valeur inventée. Totaux adhérents incluant les parcelles orphelines ; moyennes sur relations complètes uniquement.

Suites V1 et V1.1 relancées pour les droits, archives, clés, CSRF, audit, schéma, pagination, écritures avec dates historiques, panne/reprise DIAF et conservation de refsta. Le total attendu de parcelles est celui vérifié directement en SQL dans la copie actuelle (1 015), plutôt que l’ancien total de 1 014 du dump. Aucune ligne préexistante n’a été supprimée pour adapter ce total.

Les fixtures de suppression sont créées dans la copie locale puis supprimées/nettoyées ; les propriétaires avant tests sont restaurés, les comptes de validation désactivés, le contexte d’archive incomplète désactivé. La table temporaire de test de cascade est retirée. Les traces de ces opérations restent dans le journal local.

L’authentification conserve sa limite de huit connexions par minute : les suites complètes doivent être espacées en deux lots pour ne pas déclencher ce contrôle. La protection n’a pas été désactivée pour les tests.

Comparaison : différences de valeurs, absences ZAOUIA/DIAF, compteurs, pagination et filtres, recherche sur l’une des stations sans faux absent, volumes SQL des sept référentiels, doublon souvar signalé sans choisir une valeur arbitraire, Consultation autorisée seulement avec accès aux deux contextes, route/référentiel/état non autorisés refusés. Export CSV de tous les résultats filtrés et neutralisation des formules. Aucun UPDATE/DELETE métier pendant une comparaison ; fixtures et comptes de validation nettoyés/désactivés.

Le rapprochement utilise les clés historiques complètes, comparées exactement ; aucun mapping ou rapprochement approximatif entre stations. Le service lit les données en flux et ne conserve que la page demandée pour l’interface. Les colonnes absentes/hors catalogue sont signalées et non inventées. InnoDB bénéficie d’une lecture transactionnelle par serveur ; les tables MyISAM restent observées pendant la lecture. Aucune transaction distribuée entre les stations n’est revendiquée.

## Publication et limites

Frontend : TypeScript strict et compilation Vite de production. Backend : .NET 10 Release / publication IIS. Les rapports JSON détaillent les résultats ; la compilation et les suites sont vérifiées à nouveau sur le livrable final.

Le paquet contient un dossier `update/` sans appsettings, web.config, Local ni clés. La configuration IIS, svc_vitasouss, Data Protection, la base admin, les droits, routes et journaux existants sont réutilisés. Aucune migration de table requise. Nouveaux privilèges SQL uniquement, à faire valider/appliquer par le DBA ; archives inchangées.

Les interactions visuelles navigateur ne sont pas revendiquées : l’accès local avait été refusé par une préférence navigateur enregistrée. Les contrôles établis sont les compilations et les tests API/SQL réels, pas une validation visuelle automatisée.
