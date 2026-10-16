-- Exécuter seulement sur le serveur d'administration choisi. Aucune table logista touchée.
CREATE DATABASE IF NOT EXISTS referentiels_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE referentiels_admin;
CREATE TABLE IF NOT EXISTS app_servers (
 id INT PRIMARY KEY AUTO_INCREMENT, label VARCHAR(100) NOT NULL, host VARCHAR(255) NOT NULL,
 port INT NOT NULL DEFAULT 3306, username VARCHAR(100) NOT NULL, protected_password TEXT NOT NULL,
 ssl_mode VARCHAR(30) NOT NULL DEFAULT 'Required'
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS app_stations (
 id INT PRIMARY KEY AUTO_INCREMENT, code VARCHAR(20) NOT NULL UNIQUE, label VARCHAR(100) NOT NULL,
 server_id INT NOT NULL, is_master BOOLEAN NOT NULL DEFAULT FALSE,
 FOREIGN KEY(server_id) REFERENCES app_servers(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS app_contexts (
 id INT PRIMARY KEY AUTO_INCREMENT, station_id INT NOT NULL, database_name VARCHAR(64) NOT NULL,
 label VARCHAR(100) NOT NULL, read_only BOOLEAN NOT NULL DEFAULT TRUE,
 local_refsta SMALLINT NULL, enabled BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE(station_id,database_name), FOREIGN KEY(station_id) REFERENCES app_stations(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS app_users (
 id INT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(100) NOT NULL UNIQUE,
 display_name VARCHAR(100) NOT NULL, password_hash VARCHAR(500) NOT NULL,
 role ENUM('Admin','Gestionnaire','Consultation') NOT NULL,
 enabled BOOLEAN NOT NULL DEFAULT TRUE, auth_version INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS app_user_contexts (
 user_id INT NOT NULL, context_id INT NOT NULL, PRIMARY KEY(user_id,context_id),
 FOREIGN KEY(user_id) REFERENCES app_users(id), FOREIGN KEY(context_id) REFERENCES app_contexts(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS app_sync_routes (
 id INT PRIMARY KEY AUTO_INCREMENT, source_context_id INT NOT NULL, target_context_id INT NOT NULL,
 enabled BOOLEAN NOT NULL DEFAULT TRUE, UNIQUE(source_context_id,target_context_id),
 FOREIGN KEY(source_context_id) REFERENCES app_contexts(id), FOREIGN KEY(target_context_id) REFERENCES app_contexts(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS app_changes (
 id CHAR(36) PRIMARY KEY, user_id INT NOT NULL, context_id INT NOT NULL,
 entity VARCHAR(30) NOT NULL, record_key TEXT NOT NULL, operation VARCHAR(20) NOT NULL,
 before_json LONGTEXT NULL, after_json LONGTEXT NOT NULL, patch_json LONGTEXT NOT NULL,
 sync_requested BOOLEAN NOT NULL DEFAULT FALSE,
 status VARCHAR(30) NOT NULL DEFAULT 'Prepared', created_at DATETIME(6) NOT NULL,
 completed_at DATETIME(6) NULL, error TEXT NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS app_sync_jobs (
 id CHAR(36) PRIMARY KEY, change_id CHAR(36) NOT NULL, target_context_id INT NOT NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'Pending', attempts INT NOT NULL DEFAULT 0,
 before_json LONGTEXT NULL, after_json LONGTEXT NULL, error TEXT NULL, last_user_id INT NULL,
 created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL,
 UNIQUE(change_id,target_context_id), FOREIGN KEY(change_id) REFERENCES app_changes(id),
 FOREIGN KEY(target_context_id) REFERENCES app_contexts(id)
) ENGINE=InnoDB;
