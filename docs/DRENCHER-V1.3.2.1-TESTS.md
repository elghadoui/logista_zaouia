# Drencher V1.3.2.1 — tests d'autorisation et non-régression

Les résultats détaillés et leurs dates figurent dans `tests-drencher-v1321-summary.json` et les rapports de chaque suite. Le paquet final ne peut être construit que si toutes les suites requises ont réussi et si la DLL publiée est exactement celle vérifiée par les tests.

**Résultat final : 206 vérifications réussies, aucun échec** (93 API/MySQL, 8 brouillons propriétaires, 12 contrôles API sur la compilation finale, 67 règles backend, 14 rendu interface, 12 conservation). Les 10 contrôles supplémentaires du paquet IIS sont également réussis. La compilation backend et TypeScript, ainsi que le bundle frontend, sont validés.

## Environnement

API locale `127.0.0.1:5080`, MySQL 5.7.44 local `127.0.0.1:33307`. Les services ont été démarrés/relancés manuellement par l'utilisateur après refus du contrôle automatique. Aucun accès aux VM, aucune connexion à `logista` et aucun déploiement de production.

Bases synthétiques neuves `vitasouss_test_dr1321_<identité>` : DDL historique sans lignes de production, produits/lots/programmes/palettes fictifs. Comptes Gestionnaire représentant Hicham, Mbark et Samira, plus Consultation et Admin de test. Les droits de l'opérateur sont limités à la saisie ; un ancien droit groupé volontairement coché sert à vérifier qu'il ne permet plus la gestion des programmes. Les comptes/contextes de fixture sont désactivés à la fin, sans supprimer les bases ou historiques automatiquement.

SQL 012 testé deux fois dans une **administration synthétique distincte**, avec copie des seuls comptes fictifs : les trois nouvelles lignes restent fermées ; les anciennes permissions et les empreintes des utilisateurs/mots de passe restent identiques. Aucune application du script aux comptes réels.

## Suites

| Suite | Vérifications |
|---|---|
| API/MySQL | Création réelle d'un brouillon par l'opérateur, sélections bornées à ZAOUIA, refus des mutations produits/programmes/stock et de l'administration, programme actif lisible, refus qualité opérateur, qualité/programmes sous rôle Gestionnaire, suppression réservée Admin |
| Brouillon propriétaire API/MySQL | Création/modification réelles, auteur en base, visibilité d'édition, refus sur autre auteur, soumission puis verrouillage, zéro mouvement pour réel nul |
| Politique backend | Permissions indépendantes, absence fermée, legacy conservé sans repli, Consultation, matrice complète sans écriture, propriété, droits Admin et lookups limités |
| Interface React/Mantine | Vrai bouton Nouveau cycle actif pour profil opérateur, Ajouter/Modifier attribuables, gestion cachée ou désactivée, programme séparé des produits/stock, qualité sans saisie implicite, Admin conservé |
| Conservation | Sources F04/PDF, rapports, stock, suppression/restitution et réservations identiques à V1.3.2 ; SQL 010/011 identiques ; autres sources inchangées hors correctif ; DLL publiée identique à celle testée |

La dernière compilation a été relancée et testée avec 12 contrôles transactionnels ciblés : création et modification du brouillon propriétaire, verrouillage après soumission, refus sur autre auteur et refus des contournements PUT /cycles/0 et identifiant négatif. Un compte disposant de Modifier sans Ajouter ne crée aucun cycle ni mouvement par ces appels. La suite complète de 93 contrôles précède ce dernier garde-fou ; les tests ciblés et la politique backend portent sur la DLL finale livrée.

## Stock, états et documents

La suite API vérifie les quantités en base : 50 L, soumission de 3 L = 47 L, correction à 2,5 L = 47,5 L, correction à 4 L = 46 L, puis retour à 3 L = 47 L. La validation ne crée aucun second débit. Deux soumissions concurrentes donnent une réussite et un refus 409. Un stock insuffisant annule tous les produits et laisse le brouillon intact. Suppression logique Admin restitue le net, conserve les révisions/audits et libère les palettes ; rejeu sans restitution supplémentaire.

Mbark et Samira corrigent/valident sans rôle Admin ni droit saisie implicite ; Samira dispose également d'un programme créé/désactivé/réactivé avec conservation des versions. L'opérateur ne peut ni corriger ni valider, modifier ses cycles soumis ou les brouillons d'autrui, ni accéder aux gestions interdites, même par requête directe.

Les cinq rapports de stock et les trois modes F04 sont appelés en lecture, avec empreintes de tables avant/après, compatibilité d'archives V1.3.1 sans migration métier, matière active et historique. Les sources des moteurs/templates PDF, y compris F04 validé, sont conservées exactement. Aucun document approuvé n'est remplacé : les PDF d'essai sont uniquement dans le dossier de sortie de tests.

## Reproduction

```powershell
dotnet run --project tests/DrencherPermissionTests -c Release
node tools/verify-drencher-v1321-ui.mjs
node tools/verify-drencher-v1321-conservation.mjs
```

Pour les tests transactionnels, utiliser exclusivement la configuration locale de fixture et fournir le mot de passe **applicatif fictif** via `VITASOUSS_TEST_PASSWORD` temporaire, puis exécuter `verify-drencher-v1321-api.mjs` et `verify-drencher-v1321-own-draft.mjs`, puis `verify-drencher-v1321-final-api.mjs`. Les scripts refusent un serveur métier autre que 127.0.0.1:33307. Ne jamais adapter ces garde-fous aux VM. Le service testé doit charger `publish-v1321-ready/Vitasouss.Api.dll` correspondant au SHA256 du rapport.

Deux anomalies du banc de test ont été corrigées avant la passe finale : nom de base de fixture trop long pour MySQL, et décodage du statut accentué avec le charset client par défaut. Le client de vérification utilise désormais explicitement UTF-8 ; les soldes observés étaient déjà corrects. Les essais préliminaires ne sont pas comptés comme validation finale.

## Limites

Tests de rendu interface en SSR, pas de clics navigateur ni d'installation IIS sur les VM. Après installation, l'administrateur doit attribuer explicitement les droits du guide, reconnecter les utilisateurs et effectuer la recette réelle Hicham/Mbark/Samira. Les dépendances existantes restent conservées ; NuGet a signalé des avertissements NU1902/NU1903 sur la dépendance transitive existante `System.Security.Cryptography.Pkcs 8.0.1`, non modifiée dans ce correctif d'autorisation. Aucun secret ni aucune configuration locale n'est livré.

