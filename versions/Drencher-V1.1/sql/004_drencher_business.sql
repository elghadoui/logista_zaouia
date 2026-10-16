-- Exécuter dans la base métier ZAOUIA de l'exercice (logista), jamais dans DIAF.
-- Création additive uniquement. Aucun ALTER/DELETE sur les tables historiques.
CREATE TABLE IF NOT EXISTS vit_traitement_produit (
 id INT NOT NULL AUTO_INCREMENT, reference VARCHAR(40) NOT NULL, nom VARCHAR(120) NOT NULL,
 unite VARCHAR(8) NOT NULL, actif TINYINT NOT NULL DEFAULT 1,
 PRIMARY KEY(id), UNIQUE KEY(reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS vit_dr_programme (
 id INT NOT NULL AUTO_INCREMENT, nom VARCHAR(120) NOT NULL, actif TINYINT NOT NULL DEFAULT 1,
 version INT NOT NULL, PRIMARY KEY(id), UNIQUE KEY(nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS vit_dr_programme_revision (
 programme_id INT NOT NULL, version INT NOT NULL, contenu LONGTEXT NOT NULL,
 auteur VARCHAR(120) NOT NULL, date_creation DATETIME NOT NULL,
 PRIMARY KEY(programme_id,version), FOREIGN KEY(programme_id) REFERENCES vit_dr_programme(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS vit_dr_mutex (
 id INT NOT NULL, PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT IGNORE INTO vit_dr_mutex(id) VALUES(1);
CREATE TABLE IF NOT EXISTS vit_dr_stock_lot (
 id INT NOT NULL AUTO_INCREMENT, produit_id INT NOT NULL, lot VARCHAR(100) NOT NULL,
 peremption DATE NULL, solde DECIMAL(18,6) NOT NULL DEFAULT 0,
 PRIMARY KEY(id), UNIQUE KEY(produit_id,lot),
 FOREIGN KEY(produit_id) REFERENCES vit_traitement_produit(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS vit_dr_cycle (
 id INT NOT NULL AUTO_INCREMENT, statut VARCHAR(30) NOT NULL, version INT NOT NULL,
 date_traitement DATE NOT NULL, debut VARCHAR(5) NOT NULL, fin VARCHAR(5) NOT NULL,
 auteur_id INT NOT NULL, auteur VARCHAR(120) NOT NULL, date_creation DATETIME NOT NULL,
 validateur VARCHAR(120) NULL, date_validation DATETIME NULL,
 PRIMARY KEY(id), KEY(date_traitement,statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS vit_dr_revision (
 cycle_id INT NOT NULL, version INT NOT NULL, contenu LONGTEXT NOT NULL,
 action VARCHAR(30) NOT NULL, motif VARCHAR(1000) NOT NULL,
 auteur VARCHAR(120) NOT NULL, date_creation DATETIME NOT NULL,
 PRIMARY KEY(cycle_id,version), FOREIGN KEY(cycle_id) REFERENCES vit_dr_cycle(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS vit_dr_palette_validee (
 numpal INT NOT NULL, cycle_id INT NOT NULL, PRIMARY KEY(numpal),
 FOREIGN KEY(cycle_id) REFERENCES vit_dr_cycle(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS vit_dr_mouvement (
 id BIGINT NOT NULL AUTO_INCREMENT, lot_id INT NOT NULL, cycle_id INT NULL, revision INT NULL,
 nature VARCHAR(30) NOT NULL, quantite DECIMAL(18,6) NOT NULL, bon VARCHAR(100) NOT NULL,
 date_reception DATE NULL, auteur VARCHAR(120) NOT NULL, date_creation DATETIME NOT NULL,
 PRIMARY KEY(id), UNIQUE KEY(cycle_id,revision,lot_id,nature),
 FOREIGN KEY(lot_id) REFERENCES vit_dr_stock_lot(id), FOREIGN KEY(cycle_id) REFERENCES vit_dr_cycle(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS vit_dr_admin_historique (
 id BIGINT NOT NULL AUTO_INCREMENT, objet VARCHAR(30) NOT NULL, objet_id INT NOT NULL,
 avant LONGTEXT NULL, apres LONGTEXT NOT NULL, auteur VARCHAR(120) NOT NULL, date_creation DATETIME NOT NULL,
 PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
