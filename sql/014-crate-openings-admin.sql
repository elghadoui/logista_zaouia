-- V1.5.1 : exécuter MANUELLEMENT dans referentiels_admin, après sauvegarde.
-- Inventaires déclaratifs versionnés. Aucune écriture dans logista/typecaisse/caisserie.
-- Les contrôles métier sont dans l'API (MySQL 5.7 n'applique pas les CHECK).
CREATE TABLE IF NOT EXISTS app_crate_openings (
 id BIGINT PRIMARY KEY AUTO_INCREMENT,
 context_id INT NOT NULL, local_refsta SMALLINT NOT NULL, crate_type INT NOT NULL,
 revision INT NOT NULL, opening_date DATE NOT NULL,
 campaign_start DATE NOT NULL, campaign_end DATE NOT NULL, campaign_label VARCHAR(100) NOT NULL,
 owned_total BIGINT NOT NULL, physical_quantity BIGINT NULL,
 note VARCHAR(500) NOT NULL, created_by INT NOT NULL, created_at DATETIME(6) NOT NULL,
 UNIQUE KEY uq_crate_opening_revision(context_id,crate_type,campaign_start,revision),
 FOREIGN KEY(context_id) REFERENCES app_contexts(id),
 FOREIGN KEY(created_by) REFERENCES app_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS app_crate_opening_dues (
 opening_id BIGINT NOT NULL, producer_id INT NOT NULL, orchard_id INT NOT NULL DEFAULT 0,
 quantity BIGINT NOT NULL,
 PRIMARY KEY(opening_id,producer_id,orchard_id),
 FOREIGN KEY(opening_id) REFERENCES app_crate_openings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Historique append-only ; pas de cascade, pas de suppression ou remise à zéro.
-- Retour arrière applicatif : restaurer les binaires V1.5.0 et conserver ces tables.
