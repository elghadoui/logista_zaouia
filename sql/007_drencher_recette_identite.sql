-- Uniquement dans une base NEUVE vitasouss_recette_drencher_<32 caractères hex>.
-- Le générateur fournit l'identité et refuse la réutilisation d'une base existante.
CREATE TABLE vit_dr_recette_identite (
 id INT NOT NULL, identite CHAR(32) NOT NULL, database_name VARCHAR(64) NOT NULL,
 contexte_inscrit INT NULL, date_creation DATETIME NOT NULL,
 PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE vit_dr_recette_operation (
 id CHAR(32) NOT NULL, resultat LONGTEXT NOT NULL, date_execution DATETIME NOT NULL,
 PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
