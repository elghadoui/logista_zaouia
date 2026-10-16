# VITASOUSS V1.3 pilote — décisions après essai

Ces points ne bloquent pas la compilation ni les modules indépendants. Aucune décision destructive, migration automatique ou normalisation de station n'a été prise.

## 1. Origine réelle / déclarée

Table réelle **declaration_verger** : `id INT AUTO_INCREMENT` primaire, `refver_reel INT NULL`, `refver_nreel INT NOT NULL`, `codvar INT NOT NULL`, `refstat INT NOT NULL`, moteur **MyISAM**. Aucune FK ni unicité du tuple de déclaration dans le dump. Les noms suggèrent des origines réelle/déclarée mais ne définissent pas leur portée, sens, durée ou cardinalité ; `refstat` n'est pas assimilé automatiquement à `refsta`.

Livré : consultation paginée, recherche, filtres exacts, colonnes configurables et fiche complète. **Ajout/modification/suppression protégés** côté API. À préciser : sens exact de refver_nreel/refstat ; relation avec verger/variete/station ; une déclaration peut-elle avoir plusieurs correspondances pour le même tuple ? Quels historiques interdisent son retrait ? Aucun moteur ni archive n'a été modifié.

## 2. Référentiels complémentaires

| Table | Identité du dump | Pilote livré | À valider |
|---|---|---|---|
| partenaire | ref BIGINT nullable, unique ix154_1 | lecture, création avec ref non nul explicite, édition nom | rôles/type et relations refexp/refcli/refte ; autres champs |
| destination | coddes nullable, unique ix106_1 | lecture, création avec code non nul, édition vildes | codpay et usages dans dossiers/export |
| pays | codpay primaire | lecture, création explicite, édition nompay/abrpay | coddev/codmar et leurs référentiels |
| grpemb | codgre nullable, aucune clé unique | lecture seulement, doublons visibles | stratégie d'identité/unicité et dépendances |
| groupart | codgrp nullable, unique ix344_1 | lecture, création explicite, édition type | codgre et relation au groupe d'emballage |
| defaut | coddef primaire unsigned SMALLINT | lecture, création explicite, édition intdef | famdef/catdef/culture et tables d'analyse |
| typeecart | codtype primaire unsigned INT | lecture, création explicite, édition destype | usages codtype et sens des catégories d'écarts |

Les créations sont limitées aux identifiants et libellés listés ; les autres champs gardent leurs valeurs par défaut SQL (notamment les références nullable). Les clés NULL restent non modifiables ; aucune allocation MAX+1. Les bigint sont exposés comme chaînes exactes et validés en entier 64 bits. **Suppression de tous ces nouveaux référentiels protégée** : les correspondances de noms de colonnes du dump ne suffisent pas à autoriser un DELETE sûr. Aucun DELETE CASCADE. Les suppressions V1.2.1 sont conservées.

## 3. Comparaison et création DIAF

Comparaison en lecture des sept référentiels historiques ; application protégée pour souvar sans clé primaire/MyISAM. Les mises à jour des six autres utilisent le moteur existant, une sélection de page, des snapshots, une préparation durable et une confirmation. La nouvelle action exige un schéma primaire InnoDB validé et une inspection réelle des déclencheurs de la cible. La source n'est pas réécrite. refsta n'est jamais un champ de patch, jamais transmis comme valeur à appliquer ni modifié dans DIAF.

Création DIAF autorisée dans ce pilote seulement pour **adherent, culture, grpvar**, avec clé explicite, table InnoDB, clé primaire et colonnes/types exacts, sans déclencheur, absence de la fiche et recontrôle à l'insertion. Ces trois tables n'exigent aucune création en chaîne de parents dans le modèle validé. **Vergers/parcelles/variétés/sous-variétés absents restent protégés** pour initialisation contrôlée ; pas de mapping arbitraire d'idparcelle ou de sous-variété MyISAM. Les lignes présentes uniquement dans DIAF et les identités ambiguës ne sont jamais sélectionnables pour une correction automatique.

À valider avant élargissement : ordre de création des dépendances, identité commune des parcelles, doublons de souvar, station locale à affecter aux nouveaux vergers et tables exactes des nouveaux référentiels à synchroniser.

## 4. Tableaux de bord — portée actuelle

Vues réelles utilisées : Réceptions → **reception** / dterec ; Caisserie → **caisserie** / dtecai ; Versements → **versement** / datver ; Export → **dossier** / dtedep ; Écarts → **ecart_e** / dtepal. Chaque vue livre un **nombre de lignes physiques filtrées**, détail paginé, recherche, colonnes configurables, filtres exacts et évolution des lignes par jour sur les 60 dernières dates disponibles. Le KPI ouvre son détail ; un jour du graphique applique la période correspondante.

Ce compteur n'est pas présenté comme tonnage, solde de caisserie ou bilan d'export. **Quantités/poids, palettes liées aux dossiers, répartitions par libellé et comparaisons réel/déclaré restent à valider.** Le schéma seul ne démontre ni l'unité de netrec/pdsver/pdsfru, ni les signes/flux de typmvt, ni les joints qui éviteraient des doubles comptes. Les poids ne sont donc pas additionnés en kilogrammes/tonnes supposés. refadh n'est pas ajouté par une jointure verger pour les réceptions sans validation de la portée historique. Les champs existants restent consultables dans le détail.

Questions : unités des poids ; définition d'un lot/palette ; sens des mouvements caisserie ; date métier pertinente pour export ; rôle de ecart_e/ecart_d/ecart_vers ; critères de rapprochement réel/déclaré ; périodes et nomenclatures de catégories. Les tableaux de bord ne modifient aucune donnée.

## 5. Drencher

**Projet Drencher source requis pour intégration complète.** Aucun projet identifiable n'a été trouvé dans le dépôt courant, les projets enregistrés, les répertoires de développement/qualité et les dossiers de projets inspectés sur C: et F:. Les anciens exécutables Qualité ne sont pas considérés comme les sources ASP.NET/React demandées. Aucun autre projet n'a été modifié.

Emplacement livré : **Qualité → Drencher**, dans la même session/navigation. Traitements, produits, eau, quantités consommées/calculées, suivi magasin et F04 ne sont pas reconstruits. Fournir ultérieurement le dossier source exact permettra d'analyser ses endpoints, permissions, référentiels et stratégie d'intégration avant tout raccordement.

## 6. Assistant IA

Interface et couche `IAssistantProvider` livrées, avec état **Assistant IA non configuré**. Outils de lecture disponibles dès maintenant : synthèse adhérent, première page des parcelles d'un adhérent, réceptions, versements, écarts. Authentification et autorisation du contexte appliquées avant chaque outil. Aucun SQL arbitraire, aucune écriture, aucun appel externe, aucun secret IA.

Réponse conversationnelle par modèle reportée jusqu'au choix/provider/adapter. Décider du modèle, de l'hébergement et des données autorisées à sortir de l'environnement. Voir `ASSISTANT-IA-V1.3.md`. L'écran ne prétend pas qu'un modèle est actif lorsque seul le mode lecture est disponible.

## 7. Validation visuelle et préférence navigateur

Les interactions du menu hiérarchique, les colonnes persistées et le responsive sont compilés et revus dans le code, **pas validés visuellement**. Le dernier contrôle navigateur a refusé http://127.0.0.1:5080 à cause d'une préférence utilisateur enregistrée. Aucun accès indirect ou autre navigateur n'a été utilisé pour contourner cette restriction. Effectuer la recette de `VERIFICATION-V1.3.md` dans un navigateur autorisé.

La V1.3 pilote reste testable. Les points protégés ci-dessus ne désactivent pas les fonctions V1.2.1. Pour les nouvelles écritures seulement, TRIGGER table par table est nécessaire à l'inspection des déclencheurs MySQL ; faute de permission, les actions concernées restent protégées. Ce privilège et son périmètre sont détaillés dans MISE-A-JOUR-V1.3.
