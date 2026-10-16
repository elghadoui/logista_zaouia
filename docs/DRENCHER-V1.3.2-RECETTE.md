# Recette Drencher V1.3.2 — opérateur, qualité, administrateur

À réaliser d'abord dans une base isolée, affichée RECETTE ou un contexte de test autorisé. Ne jamais réinitialiser `logista` ni utiliser de données réelles pour les tests destructifs. Le mode Recette inscrit reste réservé aux administrateurs : pour tester des comptes opérateur/qualité, utiliser un contexte synthétique isolé **non inscrit au nettoyage Recette**, ou faire observer leur parcours sans activation des nettoyages. Ne pas désigner des données existantes comme données de test.

## Préparation

Installer SQL 011 séparément puis les fichiers applicatifs. Vérifier le numéro de version et les modules existants. Créer deux produits fictifs : A en L (matière active fictive, visible F04), B en kg (masqué F04). Réceptionner 50 unités par produit/lot fabricant. Créer un programme fictif et sélectionner uniquement des palettes synthétiques. Préparer les comptes et droits distincts : opérateur saisie/modification Drencher ; qualité correction/validation ; gestion des produits/programmes ; administrateur ; Consultation.

## Opérateur

1. Créer un cycle complet : A réel 3 L, machine 2,6 L, dosage 2,5 L/1000 L ; eau totale 1000 L. Vérifier brouillon = stock 50 L et palettes réservées.
2. Envoyer pour validation qualité : stock A 47 L immédiatement. Répéter ou double-cliquer : pas de seconde sortie.
3. Essayer depuis un autre onglet de modifier le cycle soumis : blocage explicite. Aucun bouton de correction ni suppression pour l'opérateur. Vérifier la lecture et les PDF.
4. Essayer un cycle avec un produit insuffisant : aucun débit partiel et statut brouillon conservé.

## Qualité

1. Corriger 3 L vers 2,5 L avec motif et répartition lot : restitution 0,5 L, stock 47,5 L. Vérifier auteur/date/motif et anciennes révisions.
2. Valider : stock toujours 47,5 L. Corriger ensuite 2,5 vers 4 L puis 3 L ; seuls les deltas apparaissent.
3. Comparer les cinq états : stock, ouverture/clôture, entrées magasin, consommations nettes des cycles soumis/validés, journal brut. La validation sans mouvement est attestée dans l'historique du cycle.
4. Éditer les trois F04 du même cycle : réel 3 L, théorique final 2,5 L, machine 2,6 L. MA fictive visible. Produit B absent partout dans le F04, mais consommation présente dans les états de stock et la fiche interne.
5. Modifier le programme et les paramètres de la fiche produit puis rééditer l'ancien cycle : ses dosages et paramètres F04 restent historiques. Vérifier le prochain cycle avec les nouveaux paramètres.

## Administrateur

1. Supprimer séparément un brouillon, un soumis et un validé, avec phrase et motif. Brouillon : aucune restitution ; soumis/validé : restitution exacte du net et libération des palettes.
2. Rejouer la suppression : refus et aucun nouveau retour stock. Les cycles ne figurent plus dans les listes opérationnelles.
3. Consulter l'historique administratif : motif, date UTC, acteur, anciennes révisions et mouvements conservés. F04 identifié SUPPRIMÉ.
4. Vérifier l'interdiction de cette action et de l'historique pour opérateur, qualité non Admin et Consultation ; archive en lecture seule.
5. Désactiver puis réactiver un programme autorisé : confirmation, nouvelles versions, aucune altération des cycles antérieurs.
6. Si le nettoyage physique de Recette est testé, exclusivement dans une base neuve inscrite : aperçu, confirmation, motif, intégrité et historique conservé, puis preuve du refus hors Recette.

## Impression et clôture

Vérifier sur le navigateur et l'imprimante de ZAOUIA : A4 paysage, échelle 100 %, pas d'en-tête/pied ajouté par le navigateur, 5 palettes/1 produit sur une page et 164 palettes/4 produits sur une page lorsqu'ils sont tous visibles. Vérifier aperçu, export et papier pour chacun des trois modes. Le même PDF généré sert à l'aperçu, l'export et l'impression.

Consigner identité du testeur, station/exercice, cycle/versions, stocks avant/après, résultat attendu/observé et anomalies. Valider aussi connexion/sessions, permissions, référentiels, comparaison, assistant en lecture seule et consultation d'archives. Aucune impression papier ou installation VM n'est prétendue par les tests locaux de livraison.
