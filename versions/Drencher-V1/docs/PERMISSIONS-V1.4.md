# Permissions par module et action — V1.4

Admin conserve son accès complet par défaut. Gestionnaire et Consultation utilisent une matrice persistée dans referentiels_admin.app_module_permissions. Chaque module comporte Voir/Ajouter/Modifier/Supprimer ; Consultation ne peut jamais écrire, même si une valeur SQL contradictoire est enregistrée. Les archives et contextes autorisés restent des restrictions supplémentaires, jamais remplacées par les permissions de module.

## Migration explicite

Exécuter sql/002_permissions_v14.sql dans la base d’administration existante, par le DBA, avant la mise en service V1.4. Elle crée uniquement app_module_permissions (InnoDB, clé user_id/module), sans modifier les schémas Logista ou recréer les comptes. INSERT IGNORE initialise les modules selon les rôles existants ; une seconde exécution conserve les personnalisations. Aucun script de migration n’est lancé automatiquement par l’application.

Les nouveaux utilisateurs créés depuis Administration reçoivent les droits compatibles avec leur rôle. Un compte créé directement en SQL doit être doté explicitement de sa matrice ; sinon l’accès à ses modules échoue fermé. Si la table de permissions manque, les comptes non administrateurs sont refusés pour les modules métier ; Admin reste accessible pour diagnostiquer et terminer la migration.

## Configuration

Administration → Droits par module : sélectionner l’utilisateur, ajuster les cases par groupe fonctionnel, puis enregistrer. Décocher Voir retire les trois droits d’écriture. Les comptes Admin ne sont pas proposés pour retirer leur accès. Modifier la matrice incrémente auth_version et révoque les sessions anciennes ; l’utilisateur doit se reconnecter. Modifier un rôle vers Consultation retire les flags d’écriture.

Les accès station/exercice sont toujours configurés dans Administration → Utilisateurs. Une case de module ne donne aucun accès à un nouvel exercice.

27 modules : dashboard, adherent, verger, parcelle, hierarchy, culture, grpvar, variete, souvar, partenaire, destination, pays, grpemb, groupart, defaut, typeecart, declaration_verger, receptions, caisserie, versements, export, ecarts, drencher, assistant, compare, sync, journal. Les modules opérationnels, l’assistant, le tableau de bord, la hiérarchie, la comparaison et le journal ne proposent que Voir. L’action Modifier de Synchronisation autorise la préparation/application des demandes ; elle exige aussi Ajouter ou Modifier du référentiel concerné. Aucun droit de suppression synchronisée n’existe.

## Vérifications serveur

Le contrôle central des routes est effectué après authentification/autorisation et avant l’exécution métier. Les créations et modifications typées vérifient également leur action dans le service. Lire, modifier ou supprimer un référentiel via une URL API directe exige les mêmes droits que l’écran : accès refusé 403. Les anciens cookies révoqués renvoient 401.

Les catalogues décrivent le schéma et ne renvoient aucune fiche métier. Les menus sont filtrés sur Voir ; les boutons sont adaptés aux actions. Les journaux et files sont filtrés sur les référentiels visibles, afin de ne pas contourner un module interdit avec ses snapshots d’audit. Les sélections liées exigent également l’accès au module parent consulté. Prévoir les permissions de consultation des référentiels parents nécessaires aux formulaires.

L’assistant exige Voir sur Assistant IA et sur l’outil métier demandé. Les outils adhérent/parcelles vérifient aussi les permissions Vergers/Parcelles utilisées pour les compteurs ; les droits du compte et du contexte sont revérifiés avant chaque outil. Il ne peut accéder à un module masqué en demandant au modèle d’appeler ses outils.

## Droits SQL de l’application d’administration

Si les privilèges existants ne couvrent pas la nouvelle table, le DBA accorde seulement :

```sql
GRANT SELECT, INSERT, UPDATE ON `referentiels_admin`.`app_module_permissions`
TO 'COMPTE_ADMIN_APPLICATIF_EXISTANT'@'HOTE_EXISTANT';
```

Les privilèges déjà nécessaires sur app_users/app_user_contexts restent inchangés. Aucun DROP/ALTER ni privilège global n’est attribué au runtime. Les droits DDL nécessaires à la migration appartiennent au compte DBA utilisé pour cette opération explicite.
