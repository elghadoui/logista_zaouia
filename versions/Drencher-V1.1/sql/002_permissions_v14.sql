-- V1.4 : exécuter explicitement dans la base d'administration existante.
-- Aucune table Logista modifiée. Idempotent : les droits déjà personnalisés ne sont pas écrasés.
CREATE TABLE IF NOT EXISTS app_module_permissions (
 user_id INT NOT NULL,module VARCHAR(40) NOT NULL,can_view BOOLEAN NOT NULL DEFAULT FALSE,
 can_add BOOLEAN NOT NULL DEFAULT FALSE,can_modify BOOLEAN NOT NULL DEFAULT FALSE,can_delete BOOLEAN NOT NULL DEFAULT FALSE,
 PRIMARY KEY(user_id,module)
) ENGINE=InnoDB;
INSERT IGNORE INTO app_module_permissions(user_id,module,can_view,can_add,can_modify,can_delete)
SELECT u.id,m.module,1,u.role<>'Consultation' AND m.writable,u.role<>'Consultation' AND m.writable,u.role<>'Consultation' AND m.deletable
FROM app_users u CROSS JOIN (
SELECT 'dashboard' module, 0 writable, 0 deletable
UNION ALL
SELECT 'adherent' module, 1 writable, 1 deletable
UNION ALL
SELECT 'verger' module, 1 writable, 1 deletable
UNION ALL
SELECT 'parcelle' module, 1 writable, 1 deletable
UNION ALL
SELECT 'hierarchy' module, 0 writable, 0 deletable
UNION ALL
SELECT 'culture' module, 1 writable, 1 deletable
UNION ALL
SELECT 'grpvar' module, 1 writable, 1 deletable
UNION ALL
SELECT 'variete' module, 1 writable, 1 deletable
UNION ALL
SELECT 'souvar' module, 1 writable, 1 deletable
UNION ALL
SELECT 'partenaire' module, 1 writable, 1 deletable
UNION ALL
SELECT 'destination' module, 1 writable, 1 deletable
UNION ALL
SELECT 'pays' module, 1 writable, 1 deletable
UNION ALL
SELECT 'grpemb' module, 1 writable, 1 deletable
UNION ALL
SELECT 'groupart' module, 1 writable, 1 deletable
UNION ALL
SELECT 'defaut' module, 1 writable, 1 deletable
UNION ALL
SELECT 'typeecart' module, 1 writable, 1 deletable
UNION ALL
SELECT 'declaration_verger' module, 1 writable, 1 deletable
UNION ALL
SELECT 'receptions' module, 0 writable, 0 deletable
UNION ALL
SELECT 'caisserie' module, 0 writable, 0 deletable
UNION ALL
SELECT 'versements' module, 0 writable, 0 deletable
UNION ALL
SELECT 'export' module, 0 writable, 0 deletable
UNION ALL
SELECT 'ecarts' module, 0 writable, 0 deletable
UNION ALL
SELECT 'drencher' module, 0 writable, 0 deletable
UNION ALL
SELECT 'assistant' module, 0 writable, 0 deletable
UNION ALL
SELECT 'compare' module, 0 writable, 0 deletable
UNION ALL
SELECT 'sync' module, 1 writable, 0 deletable
UNION ALL
SELECT 'journal' module, 0 writable, 0 deletable
) m;
