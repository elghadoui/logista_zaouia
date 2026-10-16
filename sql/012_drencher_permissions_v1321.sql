-- V1.3.2.1 : à exécuter manuellement dans referentiels_admin, après sauvegarde.
-- Optionnel : l'écran complète les droits absents à false sans écriture ;
-- l'enregistrement administratif crée les lignes explicitement choisies.
-- Aucun droit ancien, mot de passe, rôle, exercice ou journal métier modifié.
INSERT IGNORE INTO app_module_permissions(user_id,module,can_view,can_add,can_modify,can_delete)
 SELECT id,'drencher_products',0,0,0,0 FROM app_users;
INSERT IGNORE INTO app_module_permissions(user_id,module,can_view,can_add,can_modify,can_delete)
 SELECT id,'drencher_programs',0,0,0,0 FROM app_users;
INSERT IGNORE INTO app_module_permissions(user_id,module,can_view,can_add,can_modify,can_delete)
 SELECT id,'drencher_stock',0,0,0,0 FROM app_users;
