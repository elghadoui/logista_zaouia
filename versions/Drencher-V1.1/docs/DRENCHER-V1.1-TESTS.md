# Drencher V1.1 — résultats des tests

2026-10-08T21:34:58.752Z

**338 contrôles automatisés réussis**, zéro échec dans les dernières suites livrées. Compilation .NET 10 Release sans erreur/avertissement ; TypeScript/Vite, 850 modules. Les ressources réellement compilées sont référencées par le manifeste update/.

| Suite | Résultats |
|---|---:|
| tests-drencher-v11-api.json | 45 réussis |
| tests-drencher-v11-legacy.json | 56 réussis |
| tests-drencher-v11-frontend.json | 23 réussis |
| tests-drencher-v11-regression.json | 141 réussis |
| tests-drencher-v11-navigation.json | 26 réussis |
| tests-drencher-v11-assistant.json | 33 réussis |
| tests-drencher-v11-assistant-http.json | 14 réussis |

MySQL 5.7.44 local sur 127.0.0.1:33307, API 127.0.0.1:5080. Structures du dump et données exclusivement synthétiques. Aucun accès aux serveurs de production, aucune migration/deploiement distant, aucun appel OpenAI réel. Les contextes et utilisateurs des suites sont désactivés après les tests. Un contexte local de démonstration distinct reste disponible.

Contrôles Recette : nom logista refusé avant ouverture de la base, inscription explicite, identité liée au contexte, données Drencher préexistantes refusées, Admin seul, confirmations/motifs/CSRF, aperçu sans mutation, expiration/péremption, ticket unique/concurrence, stock net restitué après correction d'un cycle validé, autre cycle conservé, entrées magasin conservées, remise à zéro limitée au périmètre, registre/audit/reçus préservés, absence de mutation des cinq tables historiques par empreinte CHECKSUM, dépendance externe et FK dans une autre base bloquées, inspection PROCESS obligatoire, marqueur altéré refusé et réconciliation du journal sans nouvelle suppression.

Ergonomie : vrai rendu React/Mantine serveur des listes Produits, Programmes, Stock et Recette ; recherches/filtres/actions/statuts/versions, droits sans écriture, cas vides, stock agrégé par produit, lots/péremptions. Les formulaires et tiroirs sont compilés et typés. API des anciennes versions testée avec dosages distincts ; désactivation sans effacer l'historique.

Les composants Nouveau cycle et impression ont la même empreinte qu'en V1. Les calculs, quatre consommations, validations, corrections, concurrence et protections stock ont été rejoués par la suite V1 (56 contrôles). Nouveau cycle kg et impression poids/1000 testés ; ancien instantané sans unité garde son avertissement.

Non-régression : 141 contrôles métier/synchronisation/comparaison et 26 contrôles de contrat/rendu/navigation ; Assistant, erreurs/timeout/tool calling/SQL arbitraire/mutations interdits, permissions/archives/sessions et ressources frontend. Les fichiers critiques préservés sont détaillés dans tests-drencher-v11-summary.json.

Un premier essai de révocation PROCESS a révélé que MySQL conserve des privilèges dans une connexion déjà ouverte. La vérification explicite des privilèges publiés a été ajoutée en plus de l'accès réel à l'inventaire global ; le test final de révocation passe. Un contexte de garde logista était désactivé après la première suite ; le montage de test a été corrigé pour le réactiver temporairement sans ouvrir cette base et restaurer ensuite son état.

**Limite : aucun test visuel/interactif navigateur, responsive/clavier ou impression physique revendiqué.** L'accès local avait été refusé par la préférence enregistrée lors des travaux précédents ; aucune tentative de contournement. La fiche opérateur permet de terminer ces vérifications sur la station. Le module reste à valider avant production.

SHA256 de la DLL livrée : `16A81D2AFBCD3B391114B9EAD506842991703F7F1097F100C12A6C79F9007906`. La copie des ressources frontend n'a pas changé l'assemblage testé. Le contrôle du paquet vérifie les exclusions, les fichiers référencés et la conservation de marqueurs simulant configurations/clés/secrets.
