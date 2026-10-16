# Règles métier V1.4.1

Les identifiants historiques restent inchangés après création. Toutes les écritures complémentaires exigent ZAOUIA maître, un exercice actif non archivé, l’action autorisée et un schéma compatible. Les contrôles sont exécutés dans l’API et répétés sous verrou. Les formulaires présentent les protections mais ne remplacent pas ces contrôles.

| Référentiel | Corrections autorisées | Blocages de modification | Suppression |
|---|---|---|---|
| Destination | vildes, adresse, adresse2 ; codpay si aucun dossier | Changement de codpay si dossier.coddes utilise la destination | Tous les porteurs de coddes et clés étrangères contrôlés |
| Partenaire | Nom, coordonnées, pays texte, codpay, code externe rep, commentaire ; type si inutilisé | Type si utilisé par dossier.refexp/refte/reftrp/reftm, palette.codexp ou autre porteur identifié | Tous les usages et clés étrangères contrôlés |
| Pays | nompay, abrpay, codmar | Toute modification si destination.codpay utilise ce pays ; partenaire seul ne bloque pas | Tous les porteurs codpay et clés étrangères contrôlés |
| Marché | nommar, gest | Identifiant non modifiable | pays.codmar et autres porteurs candidats contrôlés ; marque.codmar est un autre référentiel |
| Groupe emballage | nomgre si aucun article lié | Toute modification si groupart.codgre l’utilise | Articles et autres porteurs codgre contrôlés |
| Groupe article | type, codgre si aucun tpalette lié | Toute modification si tpalette.codgrp l’utilise | Tpalette, palette, autres porteurs codgrp et clés étrangères contrôlés |
| Défaut | intdef, famdef, culture si aucun agréage | Toute modification si agreage.coddef l’utilise | Tous les porteurs coddef contrôlés |
| Type d’écart | destype si aucun ecart_e | Toute modification si ecart_e.codtype l’utilise | Tous les porteurs codtype contrôlés |
| Déclaration verger | Les quatre références si combinaison d’origine inutilisée | Réception correspondant simultanément aux quatre valeurs d’origine | Même contrôle exact ; aucun blocage global par verger seul |

Déclaration : `refver_reel = reception.refverreel AND refver_nreel = reception.refver AND codvar = reception.codvar AND refstat = reception.refsta`. Le verger réel peut être identique au déclaré. Les références doivent exister ; une combinaison déjà présente est refusée à la création et à la modification. La station choisie doit exister dans la base du contexte autorisé. Le contexte et ses droits ne sont jamais changés à partir des valeurs saisies.

Partenaire : le dump contient `fax`, pas `fac` ; `rep CHAR(30)` et `pays CHAR(30)` restent des textes libres, sans relation inventée. `ref BIGINT` est transmis en chaîne vers le navigateur pour préserver les grands nombres. Types proposés : EXPORTATEUR, T.ETRANGER, T.MAROC, TRANSITAIRE ; une valeur historique existante reste affichable.

Marché : gest accepte SU, NS et toute valeur de deux caractères maximum compatible avec le schéma. Les codes historiques PA/MF ne sont pas réécrits. Les noms restent limités à la longueur SQL réelle, notamment nommar CHAR(10).

Défaut : famille existante ou nouvelle famille, culture par son nom ; lier et catdef sont masqués et imposés à « 1 » à la création. Aucun champ technique ne peut être fourni par un appel API pour contourner cette valeur.

Un identifiant nul ou en double dans un référentiel sans clé SQL formelle bloque ses écritures. Les références parentes sont contrôlées par leur existence unique et leur type SQL. Aucune contrainte nouvelle n’est ajoutée au schéma historique.

Une suppression n’exécute jamais de cascade. Les dépendances SQL réelles et les porteurs de code sont inspectés. Une contrainte SQL entrante utilisée bloque aussi le changement du champ référencé, afin de ne pas déclencher d’UPDATE en cascade. L’inspection exige une visibilité de lecture couvrant le schéma ; elle échoue de façon protégée si cette visibilité n’est pas certifiée. Un porteur non confirmé contenant le même code entraîne un blocage prudent, nommé dans le message ; il n’est pas présenté comme une relation métier prouvée. Cela peut exiger une validation métier/DBA pour une suppression précise, sans empêcher les autres opérations autorisées.

Une seule mutation métier est effectuée par requête sous verrous de tables, avec contrôle optimiste de la fiche d’origine. Cette protection couvre aussi MyISAM. Le journal d’intention est durable avant la mutation ; un résultat incertain exige une réconciliation, jamais une répétition aveugle. Aucune suppression n’est synchronisée vers DIAF.
