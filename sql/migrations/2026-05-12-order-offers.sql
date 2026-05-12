-- Migration: admin offers for orders
-- Run on existing production databases after backup.

CREATE TABLE IF NOT EXISTS order_offers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  offer_number VARCHAR(60) NOT NULL UNIQUE,
  status ENUM('draft','sent','accepted','paid','rejected') DEFAULT 'draft',
  items JSON NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(8) NOT NULL DEFAULT 'RSD',
  valid_until DATE DEFAULT NULL,
  payment_terms VARCHAR(255) DEFAULT NULL,
  delivery_terms VARCHAR(255) DEFAULT NULL,
  note TEXT,
  created_by INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_offers_order_created (order_id, created_at),
  INDEX idx_order_offers_status_created (status, created_at),
  CONSTRAINT fk_order_offers_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_offers_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
