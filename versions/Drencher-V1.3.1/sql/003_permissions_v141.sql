-- Administration uniquement. Aucune modification d'une base métier/historique.
-- Les droits existants ne sont pas réécrits. Marchés est fermé par défaut pour
-- les utilisateurs non Admin ; un administrateur l'accorde explicitement.
INSERT IGNORE INTO app_module_permissions(user_id,module,can_view,can_add,can_modify,can_delete)
SELECT id,'marche',IF(role='Admin',1,0),IF(role='Admin',1,0),IF(role='Admin',1,0),IF(role='Admin',1,0)
FROM app_users;
