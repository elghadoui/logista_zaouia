# Drencher V1.2 — tests vérifiables

2026-10-09T00:54:32.627Z

**364 contrôles automatisés réussis**, aucun échec dans les dernières suites livrées. .NET 10 Release sans avertissement/erreur ; TypeScript/Vite, 853 modules. API et MySQL 5.7.44 exclusivement locaux, données synthétiques. Aucun accès, migration ou déploiement sur les VM.

| Suite | Résultats |
|---|---:|
| tests-drencher-v12-api.json | 31 réussis |
| tests-drencher-v12-legacy.json | 56 réussis |
| tests-drencher-v12-recette.json | 45 réussis |
| tests-drencher-v12-frontend.json | 18 réussis |
| tests-drencher-v12-regression.json | 141 réussis |
| tests-drencher-v12-navigation.json | 26 réussis |
| tests-drencher-v12-assistant.json | 33 réussis |
| tests-drencher-v12-assistant-http.json | 14 réussis |

Origine du crash reproduite par le JSON réel de MySqlDateTime. Tests DATE avec et sans péremption, chaînes ISO au rechargement, rendu Stock avec anciennes dates objets, dates impossibles/nulles/zéro, dates civiles sans décalage et recherches des slice de dates. Aucun mouvement ou solde modifié pour ce correctif.

Réservations : scénario legacy 10/11/12 dans deux cycles, diagnostic avant SQL, initialisation en conflit refusée sans réécrire les cycles, arbitrage explicite avec historique, remplissage du registre, brouillon/soumis/validé indisponibles, cycle courant autorisé, modification et libération, deux utilisateurs distincts enregistrant simultanément une palette, contrainte/transaction, stock réel et calculs préservés. Nettoyages Recette : libération et restitution, cinq tables historiques inchangées par CHECKSUM.

Sélection : pagination serveur 25/50 sur 160 palettes, lot global au-delà des pages visibles, métadonnées remplacées par identifiants+résumé, multi-réceptions et groupes vérifiés. Tests logiques de conservation entre pages, dédoublonnage et annulation ; vrai rendu React/Mantine du formulaire compact et de Stock. Les erreurs API ne réinitialisent pas les champs de saisie.

Non-régression : CRUD/synchronisation/comparaison/permissions/archives/sessions, Recette interdite sur logista, confirmations/motifs/audit/récupération, Assistant en lecture seule, SQL arbitraire et mutations interdits. Aucun appel OpenAI réel. Empreintes des fichiers préservés dans tests-drencher-v12-summary.json.

Les premiers tests ont révélé une inspection de schéma sans transaction active : ajout d’un paramètre transaction optionnel, sans changer la règle d’inspection. Le compte local historique manquait de DELETE sur le nouveau registre : droit ajouté seulement à cette table de test. Les assertions V1 acceptant deux brouillons avec les mêmes palettes ont été adaptées à la nouvelle règle. La limite de connexion reste active ; une suite cumulative a reçu 429 avant reprise après relance du seul serveur local.

**Aucune recette interactive/visuelle navigateur ou impression physique revendiquée.** L’accès local avait été refusé lors des travaux précédents ; aucun contournement. La fiche opérateur décrit les contrôles à réaliser sur les équipements de station.

SHA256 DLL : 8C467E089CC18B62E3904B3ADC5F748C4CF2AFCB9054E99B01C858B011B1178D. Le manifeste update/ et la vérification de ZIP garantissent les empreintes et la conservation de marqueurs simulant configurations/clés/secrets.
