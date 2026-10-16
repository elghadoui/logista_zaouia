# Drencher V1.3.2 — règles métier et documentaire

## Cycle et stock

Le brouillon réserve les palettes et conserve les saisies, sans débit. « Envoyer pour validation qualité » exige les consommations machine/réelles et une répartition par lots égale au réel. La transaction comptabilise uniquement cette répartition réelle ; un stock insuffisant annule tous les produits et le changement de statut. Une version optimiste, le verrou transactionnel du module et les clés du journal empêchent un double débit.

Le statut persistant `En attente de validation` correspond au cycle soumis. L'opérateur peut consulter mais ne peut plus écrire, même par API ou depuis un ancien formulaire. La qualité peut corriger un cycle soumis ou validé, avec motif obligatoire et révisions auteur/date/valeurs. Les palettes restent identiques. Chaque lot reçoit uniquement le delta entre consommation nette comptabilisée et nouvelle répartition : ancien 3 L, nouveau 2,5 L = restitution 0,5 L. Les mouvements antérieurs ne sont jamais réécrits. La validation d'un cycle déjà comptabilisé ne crée aucun second mouvement.

L'administrateur dispose d'une suppression exceptionnelle dans la liste et la fiche. Confirmation `SUPPRIMER CYCLE N` et motif obligatoires. La transaction restitue la consommation nette effectivement comptabilisée, libère réservations et palettes validées, marque `Supprimé`, ajoute une révision et un audit avec ancien instantané, état, mouvements, administrateur/date/motif. Rejouer la demande est refusé sans seconde restitution. Les cycles disparaissent des listes opérationnelles, mais restent consultables dans l'onglet administratif, en lecture seule. Le F04 d'un cycle supprimé porte la mention d'archive. Aucun cycle historique ou mouvement n'est physiquement effacé par cette action.

Les nettoyages physiques déjà existants restent exclusivement disponibles sur une base Recette explicitement inscrite, avec identité vérifiée, contrôle global des dépendances, aperçu daté, confirmation, motif et historique. Aucun nettoyage physique n'est ajouté à `logista`. La suppression logique administrative en Production est la nouvelle action explicitement demandée pour cette version.

## Produit et historique d'impression

Référence et unité restent immuables. Matière active facultative (255 caractères), sans valeur inventée. L'option « Afficher dans le F04 imprimable » vaut vrai par défaut pour les produits sans extension et anciens instantanés.

**Politique d'historisation :** matière active et visibilité sont figées lors du premier enregistrement du produit dans un cycle. Les modifications ultérieures de la fiche produit valent pour les futurs cycles ; une nouvelle révision du même cycle conserve les paramètres déjà historisés pour ce produit. Un nouveau produit ajouté à un cycle prend ses paramètres courants à cet instant. Les anciens cycles sans matière active continuent d'afficher « Non renseignée / non vérifiée » et leurs produits restent visibles. Aucune édition antérieure n'est silencieusement modifiée.

Un produit masqué disparaît uniquement du **PDF F04** : lignes, résumés produits et annexes. Il reste dans l'instantané, la consultation interne, l'édition JSON technique, les lots, le stock et les cinq documents de gestion. Les observations libres sont conservées telles que saisies.

## Trois modes F04

| Choix | Source historisée | Effet sur le stock |
|---|---|---|
| Réel (défaut) | Consommation réelle enregistrée | Aucun à l'impression |
| Théorique final | Quantité finale du cycle (eau totale × dosage / 1000) | Aucun |
| Machine | Indication machine enregistrée | Aucun |

Le titre de colonne, le libellé du résumé et, pour les modes supplémentaires, le bandeau identifient la quantité. Les quatre quantités historiques restent dans le tableau récapitulatif approuvé ; la ligne de quantité sélectionnée et le corps du formulaire suivent le mode. Les unités restent séparées. Les lots fabricants décrivent toujours la répartition **réelle physique historisée**, même lorsque la quantité principale affiche le théorique ou la machine. Le mode ne recalcule pas les dosages depuis le programme actuel et ne crée aucun mouvement.

Les grilles, dimensions, colonnes, logo, pagination et visas des deux F04 V1.3.1 sont conservés. Les produits masqués n'imposent aucune annexe. Les longues informations réellement visibles peuvent toujours produire une annexe de traçabilité ; le mode figure sur toutes les pages.

## Programmes

Activer ou désactiver crée une nouvelle version sans supprimer les précédentes. La liste propose l'action aux détenteurs du droit gestion/modification. Une désactivation est confirmée dans une fenêtre ; l'API exige sa phrase. Un programme inactif ne peut servir à un nouveau cycle, mais ses versions restent accessibles aux cycles qui les ont historisées.

## Documents de stock

Les modèles de présentation des cinq documents restent conservés. Le stock disponible et la fiche produit intègrent immédiatement la soumission. Le journal de consommations inclut les cycles soumis et validés avec leur réel net, et distingue qualité en attente/correction. Les cycles supprimés sont exclus du bilan net ; leurs anciens mouvements et restitutions restent au journal brut.

`Soumission consommation` = sortie au réel ; `Consommation` = mouvement historique ou première validation d'un ancien cycle soumis non comptabilisé ; `Correction consommation/restitution` = delta ; `Suppression restitution` = retour administratif. Une validation sans sortie est attestée par la révision du cycle, sans inventer un mouvement stock nul. Soldes d'ouverture calculés sur tous les mouvements antérieurs ; filtrer une nature ne fausse pas le solde. Les dates d'entrée magasin et d'enregistrement UTC restent distinctes.
