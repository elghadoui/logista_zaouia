-- Exécuter dans referentiels_admin. Additif : aucun contexte inscrit automatiquement.
CREATE TABLE IF NOT EXISTS app_drencher_recette (
 context_id INT NOT NULL, server_id INT NOT NULL, database_name VARCHAR(64) NOT NULL,
 identite CHAR(32) NOT NULL, auteur VARCHAR(120) NOT NULL, date_creation DATETIME NOT NULL,
 PRIMARY KEY(context_id), UNIQUE KEY(server_id,database_name),
 FOREIGN KEY(context_id) REFERENCES app_contexts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS app_drencher_nettoyage (
 id CHAR(32) NOT NULL, context_id INT NOT NULL, utilisateur_id INT NOT NULL,
 auteur VARCHAR(120) NOT NULL, operation VARCHAR(30) NOT NULL, cycle_id INT NULL,
 empreinte CHAR(64) NOT NULL, confirmation VARCHAR(100) NOT NULL,
 etat VARCHAR(30) NOT NULL, motif VARCHAR(1000) NOT NULL, details LONGTEXT NOT NULL,
 date_creation DATETIME NOT NULL, date_execution DATETIME NULL,
 PRIMARY KEY(id), KEY(context_id,date_creation), FOREIGN KEY(context_id) REFERENCES app_contexts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
