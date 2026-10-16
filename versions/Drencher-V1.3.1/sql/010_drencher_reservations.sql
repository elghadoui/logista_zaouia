-- V1.2 : lancer d'abord le diagnostic administrateur sur les instantanés existants.
-- Création additive, aucun cycle ni table historique modifié.
-- L'initialisation explicite via l'API reste refusée tant que des conflits existent.
CREATE TABLE IF NOT EXISTS vit_dr_palette_reservee (
 numpal INT NOT NULL, cycle_id INT NOT NULL, PRIMARY KEY(numpal), KEY(cycle_id),
 FOREIGN KEY(cycle_id) REFERENCES vit_dr_cycle(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS vit_dr_reservation_etat (
 id INT NOT NULL, initialise TINYINT NOT NULL DEFAULT 0, date_initialisation DATETIME NULL,
 PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
INSERT IGNORE INTO vit_dr_reservation_etat(id,initialise) VALUES(1,0);
