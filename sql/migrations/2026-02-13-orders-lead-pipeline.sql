-- Migration: orders lead pipeline + notes
-- Run on existing production databases after backup.

ALTER TABLE orders
  ADD COLUMN service_type ENUM('beton','behaton','other') DEFAULT NULL AFTER concrete_type,
  ADD COLUMN quantity VARCHAR(64) DEFAULT NULL AFTER service_type,
  ADD COLUMN quantity_unit VARCHAR(32) DEFAULT NULL AFTER quantity,
  ADD COLUMN city_slug VARCHAR(120) DEFAULT NULL AFTER quantity_unit,
  ADD COLUMN pipeline_stage ENUM('new','qualified','offered','negotiation','won','lost') DEFAULT 'new' AFTER status,
  ADD COLUMN lead_score TINYINT UNSIGNED DEFAULT NULL AFTER pipeline_stage,
  ADD COLUMN next_follow_up_at DATETIME DEFAULT NULL AFTER lead_score,
  ADD COLUMN lost_reason VARCHAR(255) DEFAULT NULL AFTER next_follow_up_at,
  ADD COLUMN source_page VARCHAR(255) DEFAULT NULL AFTER lost_reason,
  ADD COLUMN utm_source VARCHAR(120) DEFAULT NULL AFTER source_page,
  ADD COLUMN utm_medium VARCHAR(120) DEFAULT NULL AFTER utm_source,
  ADD COLUMN utm_campaign VARCHAR(120) DEFAULT NULL AFTER utm_medium,
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

ALTER TABLE orders
  ADD INDEX idx_orders_pipeline_stage_created (pipeline_stage, created_at),
  ADD INDEX idx_orders_service_city (service_type, city_slug),
  ADD INDEX idx_orders_next_follow_up (next_follow_up_at);

CREATE TABLE IF NOT EXISTS order_notes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  note TEXT NOT NULL,
  created_by INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_notes_order_created (order_id, created_at),
  CONSTRAINT fk_order_notes_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_notes_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE orders CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE projects CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
