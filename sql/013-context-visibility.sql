-- V1.5.1 / base administrative referentiels_admin UNIQUEMENT.
-- Exécution manuelle après sauvegarde. Aucun changement des droits ni des bases métier.
SET @visibility_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
 WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='app_contexts' AND COLUMN_NAME='show_in_selectors');
SET @visibility_sql = IF(@visibility_exists=0,
 'ALTER TABLE app_contexts ADD COLUMN show_in_selectors TINYINT(1) NOT NULL DEFAULT 1',
 'SELECT ''013 déjà appliquée'' AS information');
PREPARE visibility_stmt FROM @visibility_sql;
EXECUTE visibility_stmt;
DEALLOCATE PREPARE visibility_stmt;
-- Retour arrière applicatif : UPDATE app_contexts SET show_in_selectors=1;
-- L'ancienne application ignore la colonne : inutile de la supprimer.
