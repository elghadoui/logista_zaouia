# Drencher V1.1 — fiche de test

À effectuer en contexte isolé **RECETTE**, avec un administrateur accompagnant l'opérateur. Les valeurs ci-dessous sont des exemples numériques, jamais des prescriptions de traitement.

## Produits et programmes

1. Vérifier le badge RECETTE. Ajouter Produit A, référence TEST-A, unité L. Rechercher par référence puis nom ; vérifier colonnes, statut et pagination.
2. Modifier son nom puis désactiver/réactiver. Référence et unité restent non modifiables. Un compte sans droits de gestion ne doit pas pouvoir enregistrer en Production ; les comptes non Admin n'accèdent pas à Recette.
3. Ajouter un programme avec une ligne Produit A, dose 2,5 L/1000 L. Consulter version 1. Modifier à 3 L/1000 L puis enregistrer version 2 : version 1 conserve 2,5, version 2 affiche 3.
4. Désactiver le programme et vérifier son statut. Un programme actif exige des produits actifs ; un programme inactif peut conserver ses produits désactivés pour son historique.

## Stock et parcours conservé

5. Réceptionner des produits : bon, date, produit, quantité, fabricant, péremption éventuelle. Vérifier stock agrégé, détail des lots et mouvements ; rechercher par nom/lot/bon et filtrer les réceptions. Rejouer le même bon/lot : refus.
6. Tester Nouveau cycle tel qu'en V1 : lots/palettes, programme, eaux initiale/consommée, quatre quantités distinctes, lots fabricants. Enregistrer brouillon puis soumettre et valider en qualité. Le stock diminue uniquement à validation.
7. Vérifier kg pour les poids et tonnage /1000 dans l'impression ; un poids manquant conserve un tonnage non calculé. Vérifier l'historique et les anciennes valeurs après correction qualité.

## Nettoyages

8. Créer deux cycles d'essai, dont un validé. Dans Mode Recette · admin, demander la suppression du cycle validé. Lire les lignes concernées et la restitution par fabricant. Annuler : aucun changement.
9. Refaire l'aperçu, saisir la phrase exacte et un motif. Vérifier cycle supprimé, stock restitué, palettes libérées, autre cycle conservé et historique administratif renseigné.
10. Demander un aperçu puis modifier un produit : l'ancien aperçu doit être refusé. Une confirmation incorrecte, un aperçu expiré ou un ticket rejoué doivent être refusés.
11. Réinitialiser cycles et stock : programmes/produits restent présents. Puis Tout réinitialiser : programmes/produits disparaissent, les traces administratives et structures historiques restent présentes.
12. Revenir au contexte réel `logista` 2026/2027 : badge PRODUCTION, aucun nettoyage autorisé. Les produits et programmes précédemment créés sont conservés ; aucun cycle validé réel ne peut être supprimé.

Consigner les remarques sur la lisibilité des tableaux, les fenêtres, la recherche et la navigation. Tester sur l'écran et l'imprimante de la station. Les interactions navigateur et l'impression physique restent à valider par cette recette ; le rapport automatisé ne les remplace pas.
