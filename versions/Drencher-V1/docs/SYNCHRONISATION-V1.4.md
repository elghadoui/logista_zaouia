# Synchronisation ZAOUIA → DIAF — V1.4

ZAOUIA est maître. Les créations complémentaires sont effectuées dans son contexte modifiable, avec clé attribuée côté serveur si l’utilisateur n’en fournit pas. La création directe DIAF est refusée. La comparaison expose les identités nécessaires à vérifier le même code ; elle ne renumérote aucune fiche.

## Périmètre

Comparaison disponible pour les référentiels historiques et les complémentaires. Réplication validable : partenaire, destination, pays, grpemb, groupart, defaut, typeecart, lorsque les schémas/types, identifiants uniques/non nuls et déclencheurs sont validés. Déclarations : comparaison possible, application/création DIAF protégée tant que leur identité interstations et usage réception ne sont pas établis. Fonctions de synchronisation historiques conservées.

Lors d’une création DIAF, la requête INSERT contient explicitement **la clé ZAOUIA**, jamais une nouvelle identité automatique. Les références parentes doivent déjà exister dans DIAF : synchroniser pays avant destination/partenaire, famille d’emballage avant article. Les mises à jour complémentaires ne portent que sur les libellés autorisés ; les champs structurels d’une fiche DIAF existante restent protégés.

## Recette d’une référence

1. Sélectionner l’exercice ZAOUIA maître. Créer/corriger le référentiel et enregistrer.
2. Ouvrir Comparer ZAOUIA / DIAF ; choisir le même exercice DIAF autorisé et le référentiel. Lancer la comparaison.
3. Examiner absent, différent, identique (compteur), ambigu et **même libellé/autre code**. La détection de libellé normalise la casse et les espaces extérieurs ; elle signale un conflit potentiel, sans déduire une identité métier par simple ressemblance.
4. Sélectionner des fiches absentes/différentes de la page visible, au maximum 25. Préparer chaque demande, examiner son aperçu DIAF puis confirmer humainement l’application. Les résultats sont individuels.
5. Refaire la comparaison et vérifier que les fiches sont identiques. Aucune donnée DIAF n’est supprimée automatiquement, notamment les lignes absentes de ZAOUIA.

Un conflit même libellé/autre code n’est pas sélectionnable pour application. Le détail explique le blocage et permet d’ouvrir le référentiel maître. L’administrateur doit examiner usages/historique et faire valider un éventuel remappage ; aucune fusion ou correction structurelle automatique n’est livrée.

## Sécurité et reprises

Routes ZAOUIA maître → DIAF explicitement configurées ; exercices accessibles et modifiables ; permissions Comparaison/Voir et Synchronisation/Modifier + droits du référentiel requis. Les snapshots source/cible sont revérifiés. Les valeurs station locales refsta/refstat sont exclues de la réplication. Les nouvelles écritures complémentaires utilisent des verrous de tables et parents, sans ajouter PK/FK.

La sauvegarde ZAOUIA et la confirmation DIAF sont séparées. Une panne DIAF ne remet jamais en cause le maître. Une demande validée reste Pending/Error ou Applying si son résultat est incertain. Réconciliation administrateur avant reprise d’un Applying ; jamais de nouvel INSERT aveugle. La synchronisation de nouvelles références demande de refaire une comparaison explicite après enregistrement ZAOUIA : aucune propagation cachée.

Les contrôles de concurrence déjà appliqués aux référentiels historiques restent inchangés. La comparaison des tables MyISAM est une observation à l’instant de lecture ; les verrous et snapshots de confirmation protègent l’application réelle.

## GRANT exacts, par table, à adapter par le DBA

Remplacer BASE_MAITRE, BASE_DIAF, comptes et hôtes par les valeurs **existantes** de chaque exercice. Ne pas appliquer aux archives. Aucun GRANT de production n’a été exécuté pendant le développement.

```sql
-- ZAOUIA : création et libellés
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_MAITRE`.`partenaire` TO 'COMPTE_MAITRE'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_MAITRE`.`destination` TO 'COMPTE_MAITRE'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_MAITRE`.`pays` TO 'COMPTE_MAITRE'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON `BASE_MAITRE`.`grpemb` TO 'COMPTE_MAITRE'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_MAITRE`.`groupart` TO 'COMPTE_MAITRE'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_MAITRE`.`defaut` TO 'COMPTE_MAITRE'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_MAITRE`.`typeecart` TO 'COMPTE_MAITRE'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, TRIGGER ON `BASE_MAITRE`.`declaration_verger` TO 'COMPTE_MAITRE'@'HOTE_EXISTANT';
GRANT SELECT ON `BASE_MAITRE`.`station` TO 'COMPTE_MAITRE'@'HOTE_EXISTANT';
-- DIAF : aucun DELETE
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_DIAF`.`partenaire` TO 'COMPTE_DIAF'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_DIAF`.`destination` TO 'COMPTE_DIAF'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_DIAF`.`pays` TO 'COMPTE_DIAF'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_DIAF`.`grpemb` TO 'COMPTE_DIAF'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_DIAF`.`groupart` TO 'COMPTE_DIAF'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_DIAF`.`defaut` TO 'COMPTE_DIAF'@'HOTE_EXISTANT';
GRANT SELECT, INSERT, UPDATE, TRIGGER ON `BASE_DIAF`.`typeecart` TO 'COMPTE_DIAF'@'HOTE_EXISTANT';
```

LOCK TABLES est un privilège **au niveau base** dans MySQL 5.7, pas une permission de table. Vérifier ce droit déjà requis par la V1.2 sur ZAOUIA, et nécessaire maintenant pour la nouvelle application complémentaire DIAF :

```sql
GRANT LOCK TABLES ON `BASE_MAITRE`.* TO 'COMPTE_MAITRE'@'HOTE_EXISTANT';
GRANT LOCK TABLES ON `BASE_DIAF`.* TO 'COMPTE_DIAF'@'HOTE_EXISTANT';
```

Aucun `ON *.*`, aucun DELETE ON base.*, aucune écriture archive. Les SELECT déjà utilisés pour la cartographie/lectures métier restent nécessaires. TRIGGER sert à l’inspection effective ; le runtime ne crée/modifie/supprime jamais de trigger. Si le DBA refuse ce privilège, les nouvelles écritures restent protégées ; les consultations fonctionnent.
