# Recette opérateur / responsable qualité — Drencher V1.3

Date : __________ Station : __________ Exercice : __________ Responsable : __________

Effectuer les essais uniquement dans un contexte Recette inscrit et isolé. Vérifier la mention RECETTE dans l'application et sur chaque PDF. Les exemples du paquet sont fictifs et ne sont pas des fiches de production.

| Contrôle | Résultat attendu | Visa / résultat |
|---|---|---|
| Une réception, un produit | Réception, palettes, libellés et quatre quantités identiques au cycle | |
| Plusieurs réceptions / variétés / produits | Regroupements corrects, annexe exhaustive, aucune multiplication des poids par le nombre de produits | |
| Poids 1 500 kg | 1,5 t, unités imprimées explicitement | |
| 164 palettes / plusieurs pages | En-têtes, cycle, révision et pagination répétés ; aucune ligne coupée ou masquée | |
| Écart, produit supplémentaire, dose modifiée | Chaque écart effectivement enregistré reste visible | |
| Programme modifié après cycle | PDF historique conserve programme, version et doses appliquées | |
| Brouillon / cycle soumis | NON VALIDÉE — DOCUMENT DE TRAVAIL | |
| Cycle d'essai validé | Validateur/date visibles ; mention RECETTE conservée | |
| Fabricant, péremption, matières actives | Lots réels ; péremption sans décalage ; matière active absente indiquée non vérifiée | |
| Stock initial antérieur à la période | Ouverture reconstruite depuis les mouvements ; solde final identique au contrôle MySQL | |
| Correction qualité | Journal brut garde consommation, restitution et remplacement ; bilan net compte une seule consommation finale | |
| Période vide / produit sans mouvement / stock nul | Pas de valeur inventée ; soldes et absence de lignes explicites | |
| L, mL, kg et g | Totaux séparés, aucune addition inter-unités | |
| Produit, lot, actif/inactif, nature | Filtres respectés ; solde non faussé par les lignes masquées | |
| Consultation / utilisateur sans droits / mauvais exercice | Lecture autorisée uniquement dans les contextes permis ; Recette Admin uniquement | |
| Aperçu / téléchargement / impression | Même identifiant et mêmes valeurs, même pagination sur le fichier ouvert | |
| Impression papier A4 paysage | Lisibilité réelle, marges de l'imprimante, totaux, visas et annexe contrôlés | |
| Non-régression V1.2 | Sélection des palettes, réservations, eaux, dosages, qualité, stock et nettoyages inchangés | |
| Autres modules | Référentiels, comparaison, synchronisation, Assistant et sessions fonctionnels | |

## Validation documentaire obligatoire

Confirmer avec le responsable qualité : version V06, structure F04 et annexe, liste de distribution, libellés et unités de dose (unité du produit / 1 000 L), distinction eau initiale/eau totale, contenu des visas et procédure C/NC. Décider séparément si un futur référentiel de matières actives vérifiées doit être enregistré et historisé. Cette version n'invente ni cette attestation ni une signature électronique.

Les coupures des fiches/mouvements utilisent l'enregistrement UTC ; le journal des entrées utilise la réception et celui des consommations la date du traitement. Valider cette convention et la présentation du bilan net actuel après corrections tardives.

Le développement a vérifié les PDF par rendu de fichiers et les interfaces par tests automatisés sans navigation interactive. L'affichage PDF dans le navigateur de la station et l'impression physique restent à contrôler ici.

Décision qualité : ☐ Accepté pour utilisation officielle ☐ Ajustements requis

Nom / date / signature : ___________________________________________

Réserves : ________________________________________________________
