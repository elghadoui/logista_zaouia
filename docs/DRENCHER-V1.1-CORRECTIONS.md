# Drencher V1.1 — changements

- Produits : tableau, recherche référence/nom, filtre actif/inactif, pagination, ajout/modification en fenêtre, désactivation/réactivation. Référence et unité restent immuables.
- Programmes : liste structurée, statuts/versions, édition des lignes de produits/dosages, enregistrement versionné, tiroir de consultation de toutes les versions. L'onglet sélectionné est conservé après l'enregistrement et le rechargement du catalogue. Les versions et instantanés des cycles ne sont pas réécrits. Un programme peut être rendu inactif même si l'un de ses produits est déjà désactivé ; un programme actif continue d'exiger des produits actifs.
- Stock : totaux par produit, détail fabricant/péremption, recherche/filtres et historique paginé, réception en fenêtre lisible. Aucune modification des calculs ou des règles de validation/déstockage.
- Recette : registre administratif explicite et identité de base isolée, accès Admin, badge RECETTE/PRODUCTION, aperçu ciblé, confirmation/motif, suppressions transactionnelles limitées aux données de test du module. Les bases existantes avec des données Drencher ne peuvent pas être inscrites comme tests.
- Audit : journal dans referentiels_admin et reçu métier, conservés après resets ; recontrôle d'état et de dépendances globales ; aucune suppression possible sur logista ni de table historique.
- Poids : kg confirmé par l'utilisateur le 8 octobre 2026. Valeur par défaut pour les nouveaux instantanés ; tonnage en tonnes. L'ancien avertissement reste pertinent pour un ancien instantané dont l'unité n'avait pas été renseignée.

L'écran `DrencherEditor.tsx` et l'impression `DrencherPrint.tsx` sont identiques à V1. L'Assistant OpenAI, les référentiels, la comparaison, la synchronisation, les utilisateurs, la configuration IIS et les secrets n'ont pas été modifiés. Sources V1 conservées dans `versions/Drencher-V1/`, hors fichiers privés.

Après les essais : discuter la présentation des mouvements, les volumes de données de recette, les cycles traversant minuit, la correction des palettes déjà validées et l'éventuel modèle Excel F04 original. Préligne/Cire et les corrections VITASOUSS V1.4.2 ne sont pas incluses.
