# Mise à jour V1.2.1 → V1.3 pilote

1. Sauvegarder le dossier de l'application, la base d'administration et les bases métier selon votre procédure habituelle. Arrêter le pool IIS existant.
2. Extraire **VITASOUSS-V1.3-IIS.zip**. Copier **uniquement le contenu de update/** vers le dossier de l'installation actuelle. Le dossier app/ est la publication complète ; il ne doit pas remplacer les paramètres de production.
3. Conserver tous les appsettings actuels, **appsettings.Local.json**, secrets MySQL/IA, **web.config de production**, **C:\ProgramData\Vitasouss\keys**, identité/profil **svc_vitasouss**, bindings et réglages IIS. L'update exclut toutes les configurations, clés et logs.
4. Aucun changement de structure requis. Ne pas recréer referentiels_admin, réexécuter 001_admin.sql, relancer le bootstrap, réimporter un dump ni ALTER les archives. Les nouveaux modules utilisent les tables existantes ; une table absente est indiquée non disponible.
5. Faire vérifier les permissions ci-dessous par le DBA, uniquement pour les exercices modifiables concernés. Redémarrer le même pool ; /api/health doit annoncer **1.3**. Tester connexion/exercices/archives et suivre la recette du rapport de vérification. Lire QUESTIONS-V1.3 avant d'étendre les opérations protégées.

## Privilèges minimaux

Les permissions V1.2.1 restent inchangées : SELECT pour la lecture et les dépendances ; INSERT/UPDATE sur les référentiels historiques selon votre périmètre ; DELETE uniquement sur **adherent, verger, parcelle**, et LOCK TABLES pour leurs contrôles. reception_d reste **SELECT uniquement pour les données**. Ne jamais attribuer DELETE ON base.* ni étendre les droits d'archives.

Pour consulter les nouveaux référentiels/tableaux de bord : SELECT sur les tables **declaration_verger, partenaire, destination, pays, grpemb, groupart, defaut, typeecart, reception, caisserie, versement, dossier, ecart_e**. Aucun droit d'écriture opérationnelle ni privilège IA spécifique.

Pour utiliser les créations/libellés pilotes : **INSERT, UPDATE et TRIGGER table par table** sur **partenaire, destination, pays, groupart, defaut, typeecart**, si ces droits sont absents. TRIGGER permet de vérifier réellement les déclencheurs. Exemple à adapter au compte/hôte et à chaque base modifiable réelle, par le DBA :

```sql
GRANT INSERT, UPDATE, TRIGGER ON `BASE_EXERCICE`.`partenaire` TO 'COMPTE_METIER'@'HOTE_EXISTANT';
GRANT INSERT, UPDATE, TRIGGER ON `BASE_EXERCICE`.`destination` TO 'COMPTE_METIER'@'HOTE_EXISTANT';
GRANT INSERT, UPDATE, TRIGGER ON `BASE_EXERCICE`.`pays` TO 'COMPTE_METIER'@'HOTE_EXISTANT';
GRANT INSERT, UPDATE, TRIGGER ON `BASE_EXERCICE`.`groupart` TO 'COMPTE_METIER'@'HOTE_EXISTANT';
GRANT INSERT, UPDATE, TRIGGER ON `BASE_EXERCICE`.`defaut` TO 'COMPTE_METIER'@'HOTE_EXISTANT';
GRANT INSERT, UPDATE, TRIGGER ON `BASE_EXERCICE`.`typeecart` TO 'COMPTE_METIER'@'HOTE_EXISTANT';
```

MySQL 5.7 masque les déclencheurs lorsque le compte ne possède pas TRIGGER ; SELECT seul ne prouve pas leur absence. TRIGGER inclut leur gestion au niveau MySQL, mais le code ne propose aucune commande de création/suppression de déclencheur. Le DBA peut refuser cette extension : seules les nouvelles écritures concernées restent protégées. Ne pas attribuer TRIGGER ON base.*. La consultation et les fonctions historiques restent disponibles.

Aucun nouveau DELETE. Aucun INSERT/UPDATE/DELETE nécessaire sur declaration_verger ou grpemb dans ce pilote. Aucun privilège supplémentaire pour Drencher préparatoire ou l'assistant.

Comparaison appliquée : UPDATE DIAF utilise les droits de synchronisation déjà présents, avec **TRIGGER table par table sur adherent, verger, parcelle, culture, grpvar, variete de la destination** pour inspecter réellement les déclencheurs. Les sous-variétés MyISAM sans clé primaire sont protégées dans cette nouvelle action. Pour les créations contrôlées, **INSERT sur adherent, culture, grpvar de la destination DIAF** seulement, si absent des droits existants. Aucun nouveau droit DELETE DIAF, aucun droit d'écriture sur les archives. Les erreurs de permission restent contrôlées ; l'application n'attribue aucun GRANT.

## Index et retour arrière

**Aucune migration appliquée ni obligatoire.** MIGRATIONS-PROPOSEES-V1.3.sql contient uniquement des propositions commentées d'index de date à étudier avec EXPLAIN/volumétrie avant approbation DBA ; aucune modification automatique de production.

Pour revenir à V1.2.1 : arrêter le pool et restaurer ses fichiers sauvegardés, en conservant configurations, identité et clés. Les mutations métier/DIAF déjà confirmées ne sont pas annulées par le retour arrière applicatif ; utiliser la sauvegarde et le journal si une restauration métier est nécessaire. Les audits et demandes Pending sont conservés.

Data Protection inchangée : Vitasouss.Referentiels.V1 / Vitasouss.MySqlSecrets.v1. Aucune intervention de production n'a été effectuée pendant le développement. La source V1.2.1 est conservée dans versions/V1.2.1/.
