# Drencher V1 — audit et décisions du MVP

Base : VITASOUSS V1.4.1 existant. Copie des sources avant modification : `versions/V1.4.1/` (configurations privées, clés et secrets exclus). L'assistant, les CRUD, les archives, la comparaison et la synchronisation existants sont conservés. Ce module constitue une extension Drencher V1, pas la mission de corrections V1.4.2.

## Schéma effectivement examiné

DDL fourni : `F:\diafbacukup\logista_zaouia_051026.sql`, MySQL 5.7.44. Aucune donnée historique du dump utilisée pour les tests.

| Relation lue | Vérification |
|---|---|
| palbrut.numpal | INT, clé primaire ; identité de palette à l'intérieur d'une base d'exercice |
| palbrut.numrec → reception.numrec | INT ; réception avec clé primaire et station reception.refsta |
| palbrut.codvar → variete.codvar | Clé primaire de variété ; nomvar |
| palbrut.refver → verger.refver | Clé primaire du verger ; nomver |
| palbrut.refadh → adherent.refadh | Clé primaire de l'adhérent ; nomadh |
| palbrut.pdsfru | DOUBLE nullable ; unité non documentée dans le DDL |

Les relations de lecture sont vérifiées par leurs colonnes et clés avant la sélection et l'enregistrement. Aucun ajout de clé étrangère ni modification des tables historiques. Les noms manquants restent explicitement absents. Le verger affiché est celui de `palbrut.refver` ; aucune déduction automatique à partir d'un autre verger déclaré/réel.

Le poids est conservé tel que fourni. `Drencher:PaletteWeightUnit` accepte `kg` ou `t` après confirmation locale. Sans unité confirmée, ou si un poids manque, l'impression affiche « tonnage non calculé ». L'unité est enregistrée dans l'instantané du cycle.

## Choix de fonctionnement

- ZAOUIA uniquement, avec `local_refsta` renseigné. Les réceptions d'une autre station sont exclues. Chaque contexte/exercice conserve ses propres données ; aucune synchronisation Drencher vers DIAF.
- Traitement enregistré après fonctionnement de la machine ; aucun pilotage de machine.
- Date + début/fin le même jour. Cycles traversant minuit à discuter après recette.
- Un programme possède des versions immuables ; un cycle conserve sa version. Dosages exprimés dans l'unité du produit pour 1000 L d'eau, sans conversion implicite.
- Produits : L, mL, kg ou g. Référence et unité immuables ; désactivation disponible. Le référentiel commun `vit_traitement_produit` peut être réutilisé plus tard ; Préligne et Cire ne sont pas développés.
- Quatre valeurs distinctes : initial calculé, final théorique, machine saisie, réel saisi. Précision à six décimales. Les deux valeurs calculées sont recalculées par l'API, jamais acceptées directement du navigateur.
- Le réel est réparti entre plusieurs lots fabricants, dont la somme doit égaler le réel du produit. Un lot absent du stock doit d'abord être réceptionné avec son bon magasin.
- Produits supplémentaires et dosages modifiés restent visibles pour le contrôle qualité. Les lots périmés sont signalés ; le MVP n'invente pas une prescription ou une tolérance automatique de conformité.
- Un brouillon peut conserver des consommations non renseignées ; soumission et validation exigent les valeurs machine/réel et une répartition cohérente.
- Modifier un cycle en attente le remet en brouillon. Aucun stock n'est réservé avant validation.
- La validation est atomique : état, révision, unicité de palettes et déduction du réel par lot. Un verrou InnoDB commun au module sérialise les mutations ; limites MVP : 2000 palettes/cycle, 30 produits et 30 lots/produit.
- Une correction qualité d'un cycle validé nécessite un motif. Elle conserve les palettes, restitue les anciennes consommations puis applique les nouvelles dans une transaction. L'ancien historique n'est jamais supprimé. Une erreur de sélection de palette dans un cycle validé demande une procédure administrative ultérieure ; aucune libération automatique de palette dans ce MVP.
- Les entrées de stock sont additives et auditables. Un même bon/lot ne peut pas être réceptionné deux fois. Aucun DELETE Drencher, aucun ajustement manuel libre du stock.

## F04 et navigation

Aucun modèle Excel F04 retrouvé dans le projet. Impression HTML regroupée, inspirée de « F04 MPS-01 — Suivi du traitement au niveau du Drencher V05 » ; aucune affirmation de conformité exacte au modèle original. Les en-têtes de tableau se répètent à l'impression multipage, les révisions antérieures restent visibles.

Entrée Sidebar `drencher` conservée, désormais « Cycles, qualité & stock ». Écrans React séparés : `Drencher`, `DrencherEditor`, `DrencherManagement`, `DrencherPrint`. Les anciens composants Assistant et tableaux pilotes restent intacts.

## Points pour la recette opérateur

Confirmer l'unité de pdsfru, vérifier l'impression réelle sur l'imprimante de la station, tester la taille de l'écran opérateur et fournir le modèle Excel F04 si une reproduction fidèle est souhaitée. Examiner ensuite les cycles de nuit, la correction des palettes validées et les erreurs de bons magasin.
