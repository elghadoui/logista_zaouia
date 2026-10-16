# Drencher V1.3.2.1 — périmètre

- Retrait de Saisie Drencher de la liste de lecture seule de l'administration.
- Trois modules de gestion explicites, fermés lorsqu'absents, sans héritage depuis Saisie ou ancien droit groupé.
- Matrice administrative complétée à false sans migration obligatoire et sans changer les anciennes permissions.
- Contrôles spécifiques dans les routes API produits, programmes/état et stock/journaux/documents.
- Gestion séparée des boutons/panneaux React, sans propagation d'un droit commun aux trois gestionnaires de module.
- Édition/soumission des brouillons limitée à leur auteur, avec exception Admin, et visibilité d'édition calculée par le serveur.
- Sélection de palettes sous droit de saisie/correction dans le contexte Drencher, sans attribuer de droits globaux sur les référentiels.
- Refus des identifiants zéro ou négatifs sur PUT cycles : aucun contournement du droit Ajouter par le droit Modifier.
- Version de santé `1.3.2.1`.

Le calcul de consommation, les requêtes de mouvement et soldes, les états après soumission, les deltas, les réservations et les moteurs/templates PDF sont conservés. Les quelques ajouts au service de cycles sont des contrôles d'accès précédant toute écriture et une information d'édition dans sa réponse. Aucun rôle propre aux noms Hicham/Mbark/Samira n'est codé en dur : les comptes de test portent des identités synthétiques et les droits sont attribuables à tout Gestionnaire par Admin.

SQL 012 est administratif, additif et optionnel. SQL 010/011, données historiques, utilisateurs/mots de passe, clés/secrets et configurations IIS restent conservés. Aucun paramétrage de vos comptes réels ou aucune opération sur les VM n'a été effectué.

