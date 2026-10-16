# Fiche opérateur Drencher V1.2

Utiliser une Recette isolée, avec l'administrateur. Aucun essai sur les traitements réels. Les exemples de consommations ne sont pas des prescriptions.

1. Réceptionner un produit avec péremption, puis un autre lot sans péremption. Vérifier que le Stock s'ouvre, affiche les deux lots et les mouvements. Recharger complètement la page : aucune erreur React. Les données et soldes restent identiques.
2. Nouveau cycle → **Sélectionner les palettes**. Rechercher palette/réception, filtrer variété, producteur/adhérent, verger. Tester 25 puis 50 lignes par page.
3. Cocher des palettes sur plusieurs pages. Revenir à la première : cases et compteur conservés. Utiliser Sélectionner la page, puis Toutes les palettes disponibles du lot : un lot de 160 palettes doit être traité côté API, pas seulement les lignes affichées.
4. Ajouter une seconde réception, retirer quelques palettes, confirmer. Le formulaire principal ne montre que compteur, poids kg, nombre de réceptions et groupes variété/producteur/verger. Annuler une modification de sélection conserve la sélection précédente.
5. Enregistrer le brouillon A avec palettes 10/11/12. Dans un second cycle, elles doivent être indisponibles et afficher A + Brouillon. Une requête concurrente de deux utilisateurs ne doit permettre qu'une affectation.
6. Modifier A : ses propres palettes restent accessibles. Retirer 12 et enregistrer ; 12 redevient disponible. Soumettre A : son état doit devenir En attente et ses palettes restent indisponibles ailleurs.
7. Valider A : palettes toujours indisponibles. Vérifier les quatre quantités inchangées, stock déduit du réel seulement. Exemple eau 1200/1000 L, dose 2,5 : initial 3, final 2,5, machine 2,6, réel 2,7. Entrée 20 L → solde 17,3 L après validation.
8. Supprimer A selon la procédure Recette (aperçu, confirmation, motif). Vérifier restitution, palettes libérées et journal administratif conservé. Test identique pour un brouillon.
9. Vérifier qu'une erreur de conflit laisse les eaux, consommations, observations et la sélection saisies dans le formulaire. Ajuster la sélection puis enregistrer sans tout ressaisir.
10. Pour les cycles déjà en conflit avant V1.2 : diagnostic administrateur, arbitrage explicite et historique conservé. Aucun cycle validé ne doit pouvoir être arbitré ou supprimé en production.

Contrôler la taille de la fenêtre, son défilement, les cases, le clavier, le résumé et l'impression sur les équipements de station. Les tests automatisés de rendu ne remplacent pas ces interactions visuelles.
