# Drencher V1.3.1 — rapport final des tests et de non-régression

58 contrôles réussis : 5 contrôles de modèle, 48 de mise en page/préservation et 5 comparaisons des états de stock avec le backend final. Backend publié en .NET 10 Release, sans avertissement ni erreur. Les présentations simple et complexe ont été validées par le demandeur et leurs PDF sont conservés exactement, avec empreintes SHA256 dans `tests-drencher-v131-summary.json`.

- Deux démonstrations réellement produites par le moteur PDF .NET intégré : cinq palettes / un produit = une page ; 164 palettes / deux réceptions / deux variétés / quatre produits = une page. Quatre quantités, écarts, deux visas et palette exacte sur la fiche principale, sans annexe forcée.
- Cas de volume avec 30 groupes, huit produits, observation longue : plusieurs formulaires, sous-totaux, mention des quantités reprises, annexe pour les débordements. Dernier lot et dernier produit présents ; observation longue conservée intégralement. En-tête, identité du cycle, avertissement Recette/non validé et pagination répétés.
- Totaux kg/tonnes, unités séparées L/mL/kg/g, produit supplémentaire, péremption et absence de matière active vérifiée contrôlés. Aucune décision C/NC inventée.
- Instantané synthétique source identique avant/après la génération. Compression des numéros de palettes testée avec des trous, doublons et ordre initial variable ; aucune palette manquante inventée.
- Contrat JSON des rapports conservé : données supplémentaires utilisées par le rendu F04 internes au serveur et ignorées dans sa sérialisation générique.
- Les cinq états stock, fiche produit, entrées, consommations et mouvements ont chacun été générés avec le backend final et l'ancien moteur V1.3 : pagination et PNG identiques pixel par pixel. L'assemblage chargé pour ces contrôles est identique à la DLL publiée. Méthodes des cinq états de stock strictement inchangées. Empreintes des vingt sources métier protégées identiques au rapport V1.3 ; JavaScript et HTML existants identiques.
- Exports de référence effectués avec Microsoft Excel en lecture seule ; originaux vérifiés par SHA256. Les PNG des PDF générés sont réellement examinés, avec comparaison côte à côte et planche des pages du cas de volume.

Les anciennes 445 vérifications V1.3 ne sont pas présentées comme une nouvelle exécution. Les suites d'écriture MySQL n'ont pas été relancées : cette correction n'autorise aucune modification MySQL. Une seule lecture d'un instantané de la base locale synthétique existante fournit les exemples ; adaptations et traitements ont ensuite lieu en mémoire. Aucun accès aux VM, aucun appel OpenAI réel, aucune écriture de cycle ou mouvement de stock.

Le paquet IIS fait également l'objet d'une vérification de manifeste, de DLL, de logo F04, des PDF approuvés, d'exclusion des secrets et d'une simulation de copie conservant configurations, clés et secrets existants. Aucun script SQL, aucune suppression ou modification d'utilisateur n'est livré. Le frontend existant n'est pas remplacé.

Limites : le navigateur de station et l'impression physique ne sont pas testés ici. Cette validation porte sur le PDF réel, son export et son rendu visuel. La présentation est approuvée pour livraison ; votre équipe vérifiera l'impression papier après installation sur ZAOUIA.
