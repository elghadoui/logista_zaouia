# Cartographie métier — V1.4

Trois niveaux de preuve sont distingués. Aucune normalisation globale, aucune PK/FK ajoutée aux schémas Logista. Les relations ci-dessous ne constituent pas une cartographie exhaustive de tous les programmes historiques.

## 1. Contraintes SQL réelles

Le dump fourni et les copies locales ont été inspectés. La copie pilote ne présente aucune FOREIGN KEY dans information_schema.KEY_COLUMN_USAGE. Les clés techniques/uniques réelles sont conservées : declaration_verger.id PRIMARY KEY AUTO_INCREMENT, groupart.codgrp UNIQUE nullable, partenaire.ref UNIQUE nullable BIGINT, destination.coddes UNIQUE nullable, pays.codpay PRIMARY KEY, defaut.coddef PRIMARY KEY, typeecart.codtype PRIMARY KEY. grpemb.codgre n’a pas de PK/contrainte unique formelle ; son usage applicatif exige un contrôle d’unicité/nulls à chaque écriture. souvar reste sans clé unique validée.

Le dump complet contient toutefois de vraies contraintes hors de ce périmètre : fk_detail_order (detail → orderfabrication) et FK_model_fab_pal_detail_model_fab_pal, avec cascades SQL historiques. Elles ne sont ni supprimées ni utilisées pour des suppressions applicatives V1.4. Les procédures de réception/tonnage existent dans le dump ; aucune occurrence de declaration_verger hors de sa définition/chargement n’établit le prédicat d’usage recherché. L’absence de FK dans les copies de validation ne doit pas être généralisée à toute la base Logista.

declaration_verger utilise MyISAM dans le dump : une transaction InnoDB ne suffit pas à protéger ses écritures. Les écritures complémentaires utilisent des verrous de tables, y compris les référentiels parents consultés, et un journal d’intention séparé. Un résultat incertain reste à réconcilier, jamais réessayé aveuglément.

## 2. Relations métier confirmées

| Relation | Preuve / traitement |
|---|---|
| adherent.refadh → verger.refadh | Relation agricole existante V1 ; compteurs/présentations et contrôles de suppression existants conservés. |
| verger.refver → parcelle.refver | Relation V1 conservée ; aucune cascade. |
| parcelle(refpar,numcul,refver) → reception_d(refpar,numcul,refver) | Confirmation utilisateur antérieure : même exercice, **toute refsta**. Blocage des suppressions existantes conservé. |
| grpemb.codgre → groupart.codgre | Confirmation utilisateur V1.4. Code famille applicatif après vérification null/doublons. Suppression d’une famille utilisée interdite ; libellé corrigeable. |
| declaration_verger.refver_reel → verger.refver | Confirmation utilisateur : origine réelle. Sélection producteur/verger. |
| declaration_verger.refver_nreel → verger.refver | Confirmation utilisateur : verger sous lequel le fruit est déclaré. Peut égaler le verger réel. |
| declaration_verger.codvar → variete.codvar | Confirmation utilisateur. Existence non ambiguë contrôlée. |
| declaration_verger.refstat → station.refsta | Sémantique station confirmée ; seules les stations présentes sans ambiguïté dans la table historique sont proposées. Pas de réinterprétation/normalisation du code. |

## 3. Relations observées / à valider

Culture → Variété est matérialisée dans les lectures existantes par variete.codcul ; groupe de variétés → variété par variete.codgrv ; variété → sous-variété par souvar.codvar. Aucun lien direct Culture → Groupe n’est inventé : la hiérarchie déduit les groupes des variétés de la culture. Les contraintes SQL peuvent manquer ; souvar est regroupée seulement si le couple est non ambigu.

Les colonnes codpay de destination/partenaire et pays.codpay sont utilisées comme références de pays dans les sélections et créations complémentaires. Les références doivent exister ; les mises à jour de ces champs structurels restent bloquées. Leur cartographie opérationnelle complète, notamment dossiers/transactions, reste à valider avant suppression.

Le dump reception contient **refver, refverreel, codvar, refsta**, mais aucun id de declaration_verger. Le dump declaration_verger contient **refver_reel, refver_nreel, codvar, refstat, id**. Aucune FK, règle SQL ou procédure de réception établissant le prédicat exact d’usage d’une déclaration n’a été trouvée dans les éléments examinés. Une correspondance hypothétique de quatre colonnes ne constitue pas une preuve : **toutes les modifications/suppressions de déclarations restent protégées**, y compris une déclaration apparemment inutilisée. La création contrôlée reste possible et refuse un quadruplet déjà présent.

Dossier porte coddes ; l’usage destination → dossier est à formaliser avec le programme historique. partenaire.codgrp est VARCHAR(4) alors que groupart.codgrp est SMALLINT : l’égalité du nom de colonne ne prouve pas un lien entre ces deux tables. Aucun rapprochement ni combo arbitraire n’est créé pour ce champ.

Les dépendances complètes des partenaires, pays, destinations, défauts, types d’écart et articles ne sont pas démontrées. Leurs suppressions restent donc bloquées. Les libellés peuvent être corrigés ; les relations/champs structurels existants restent immuables dans ce périmètre.

## Identifiants et affichage

Les clés restent dans les API et snapshots de comparaison. L’interface métier privilégie les libellés ; les clés numériques complémentaires sont attribuées côté maître. **groupart.type contient les références d’articles comme PEG310/PHG123 dans le dump**, contrairement à codgrp, numérique technique : ce champ reste visible sous « Référence article ». Aucun champ « Type » supplémentaire n’a été inventé.

Les références agricoles existantes restent visibles lorsqu’elles servent à distinguer des vergers/producteurs. Culture, groupe, variété et sous-variété s’affichent par nom ; les listes/formulaires ne demandent plus leurs codes techniques de création. Les journaux et différences conservent les identités nécessaires au contrôle d’une synchronisation : leur valeur métier est la vérification explicite du même code interstations.
