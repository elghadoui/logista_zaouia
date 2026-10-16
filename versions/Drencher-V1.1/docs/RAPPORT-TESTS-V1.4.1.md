# Rapport de tests V1.4.1

Généré le 2026-10-07T23:16:59.898Z. **415 contrôles automatisés réussis, aucun échec dans les rapports finaux.** .NET 10 Release et TypeScript/Vite compilés. Aucun appel OpenAI réel. Aucun déploiement production.

| Suite | Réussis | Preuve |
|---|---:|---|
| Métier et synchronisation | 141 | api-verification-v141.json |
| Frontend : contrat, rendu React serveur, navigation | 26 | frontend-verification-v141.json |
| Opérations, relations, absence de cascade et inspection | 16 | boards-verification-v141.json |
| Assistant provider et outils locaux | 46 | assistant-verification-v141.json |
| Assistant HTTP et fichiers statiques | 14 | assistant-http-verification-v141.json |
| CRUD historiques, sécurité, sessions | 27 | core-verification-v141.json |
| Présentations et relations historiques | 24 | presentation-verification-v141.json |
| Transferts et suppressions historiques | 46 | operations-core-verification-v141.json |
| Réceptions et suppressions par lots | 50 | receipt-protection-verification-v141.json |
| Comparaison et exports historiques | 25 | comparison-core-verification-v141.json |

Les nouveaux tests métier, opérations et relations utilisent des données synthétiques dans vitasouss_test_v141_*, sur MySQL 5.7.44 local 127.0.0.1:33307. Les suites historiques réutilisent leurs copies locales de recette et restaurent leurs fixtures. Elles ne contactent pas les VM et ne modifient pas logista de production.

Les scénarios V1.4 devenus contraires aux nouvelles règles sont remplacés par la suite métier V1.4.1 ; leurs anciens rapports ne sont pas présentés comme une preuve de la nouvelle version. Les tests sont lancés en séquence pour les sessions partagées ; un refus 429 pendant une première tentative parallèle a confirmé que la limite de connexion reste active. La limite n’a pas été désactivée.

## Limites

Le rendu React serveur teste le contrat et les composants réels, mais ne remplace pas les interactions du navigateur. **Tests visuels, responsive, focus et animations non validés** : l’accès à http://127.0.0.1:5080 est refusé par une préférence enregistrée. Les maquettes ont été validées par l’utilisateur ; ce ne sont pas des captures de l’application finale. La recette VM et les droits/schémas réellement installés restent à vérifier avant production.

Le contrôle du paquet et la simulation de mise à jour sont consignés séparément dans payload-verification-v141.json après fabrication.

Assemblage API SHA256 : 9DAB83A69744C3417C14764EB0AABE24D7D1CE208CACB2104765586A22FE1E5E.
