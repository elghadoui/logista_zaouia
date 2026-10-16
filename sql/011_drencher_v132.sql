-- V1.3.2 : exécution manuelle après sauvegarde, application arrêtée.
-- Tables additionnelles uniquement. Aucune modification des tables Logista.
-- Aucun solde ou cycle existant n'est recalculé par cette migration.
CREATE TABLE IF NOT EXISTS vit_dr_produit_document (
 produit_id INT NOT NULL, matiere_active VARCHAR(255) NULL,
 afficher_f04 TINYINT NOT NULL DEFAULT 1,
 PRIMARY KEY(produit_id), FOREIGN KEY(produit_id) REFERENCES vit_traitement_produit(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS vit_dr_cycle_v132 (
 cycle_id INT NOT NULL, politique VARCHAR(30) NOT NULL,
 stock_comptabilise TINYINT NOT NULL DEFAULT 0, supprime TINYINT NOT NULL DEFAULT 0,
 date_suppression DATETIME NULL, administrateur VARCHAR(120) NULL, motif VARCHAR(1000) NULL,
 PRIMARY KEY(cycle_id), FOREIGN KEY(cycle_id) REFERENCES vit_dr_cycle(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
