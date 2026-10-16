-- Exécuter dans referentiels_admin. Les droits qualité/administration sont fermés par défaut.
INSERT IGNORE INTO app_module_permissions(user_id,module,can_view,can_add,can_modify,can_delete)
 SELECT id,'drencher_quality',0,0,0,0 FROM app_users;
INSERT IGNORE INTO app_module_permissions(user_id,module,can_view,can_add,can_modify,can_delete)
 SELECT id,'drencher_manage',0,0,0,0 FROM app_users;
-- Le droit Voir Drencher existant est conservé. Attribuer Ajouter/Modifier explicitement
-- à l'opérateur depuis Administration > Droits par module après installation.
