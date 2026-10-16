# Drencher V1 — résultats vérifiables

2026-10-08T17:03:52.858Z

.NET 10 Release : compilation sans erreur/avertissement. React/TypeScript/Vite : compilation réussie, 846 modules, JS index-XeXbMB54.js (649,75 Ko), CSS index-72vBRqMG.css (206,95 Ko). API locale sur 127.0.0.1:5080 ; MySQL 5.7.44 sur 127.0.0.1:33307, schémas isolés et données synthétiques. Aucun appel OpenAI réel, aucune connexion production.

**287 contrôles automatisés réussis**, zéro échec dans la dernière exécution des suites livrées.

| Suite | Résultats |
|---|---:|
| tests-drencher-api.json | 56 réussis |
| tests-drencher-frontend.json | 17 réussis |
| tests-drencher-regression.json | 141 réussis |
| tests-drencher-assistant.json | 33 réussis |
| tests-drencher-assistant-http.json | 14 réussis |
| tests-drencher-navigation.json | 26 réussis |

API Drencher : quatre quantités et décimales, lots multiples/hors programme, pagination 160 palettes, permissions/Consultation/archives/station/exercice/CSRF, unicité palettes, validation concurrente, stock insuffisant avec rollback, corrections/historique, déclencheur inattendu et type SQL incompatible bloqués. Empreinte des cinq tables historiques identique avant/après.

Non-régression : CRUD complémentaires et protections métier, comparaison nulle et BIGINT, synchronisation ZAOUIA→DIAF confirmée, conflits/reprise après indisponibilité, révocation des sessions, navigation et Assistant en lecture seule. Les tests OpenAI utilisent un fournisseur HTTP simulé et une clé factice.

Rendu React/Mantine serveur : quatre colonnes distinctes, deux champs manuels, multi-lots, écarts/péremption/hors programme, impression avec anciennes consommations, nulls, et route Sidebar conservée. **Ce rendu ne remplace pas une interaction dans le navigateur.**

L'accès navigateur local avait été refusé par la préférence enregistrée lors des vérifications précédentes ; aucune vérification visuelle navigateur n'a été réalisée pour ce MVP. Aucun contournement, aucune capture du MVP prétendument validée. Tests visuels, responsive, clavier et impression physique à effectuer avec l'opérateur.

Le premier essai a révélé une incompatibilité de matérialisation Dapper (TINYINT et constructeur de record), corrigée par constructeurs adaptés. Le contrôle de schéma a ensuite détecté une valeur EXTRA vide absente du manifeste, normalisée. Toutes les suites finales passent après correction. La compilation frontend a nécessité une limite mémoire Node locale ; aucun réglage serveur/IIS modifié.

SHA256 DLL livrée : `F573611F281632865EB22E19948BE7824CD56007D458F9E4E4614BD27C8F1C4F`. Le manifeste du paquet détaille les empreintes de update/. Voir aussi le rapport de vérification de paquet généré après compression.

Le contexte local DEMO DRENCHER V1 est distinct des schémas de tests, avec 164 palettes et trois lots fabricants synthétiques ; les comptes/contexts des suites sont désactivés. Aucune donnée de démonstration n'est chargée automatiquement dans logista ou incluse dans update/.

Recette opérateur et validation utilisateur restent obligatoires avant production.
