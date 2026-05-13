-- Prevoz Kop - osnovna sema za projekte, proizvode i lead pipeline
-- Napomena: koristite utf8mb4 i InnoDB; pokrenuti u phpMyAdmin.

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(190) NOT NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  excerpt TEXT,
  body LONGTEXT,
  hero_image VARCHAR(255),
  status ENUM('draft','published') DEFAULT 'draft',
  tags JSON NULL,
  published_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_published_at (status, published_at),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  category VARCHAR(120) NOT NULL,
  product_type VARCHAR(120) DEFAULT NULL,
  short_description TEXT,
  description LONGTEXT,
  applications TEXT,
  specs JSON NULL,
  image VARCHAR(255),
  document_path VARCHAR(255),
  status ENUM('draft','published') DEFAULT 'draft',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_category (status, category),
  INDEX idx_sort_order (sort_order),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS project_media (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_media_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_media (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_media_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  subject VARCHAR(255) DEFAULT NULL,
  concrete_type VARCHAR(190) DEFAULT NULL,
  service_type ENUM('beton','behaton','other') DEFAULT NULL,
  quantity VARCHAR(64) DEFAULT NULL,
  quantity_unit VARCHAR(32) DEFAULT NULL,
  city_slug VARCHAR(120) DEFAULT NULL,
  message TEXT NOT NULL,
  status ENUM('new','in_progress','done') DEFAULT 'new',
  pipeline_stage ENUM('new','qualified','offered','negotiation','won','lost') DEFAULT 'new',
  lead_score TINYINT UNSIGNED DEFAULT NULL,
  next_follow_up_at DATETIME DEFAULT NULL,
  lost_reason VARCHAR(255) DEFAULT NULL,
  source_page VARCHAR(255) DEFAULT NULL,
  utm_source VARCHAR(120) DEFAULT NULL,
  utm_medium VARCHAR(120) DEFAULT NULL,
  utm_campaign VARCHAR(120) DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_pipeline_stage_created (pipeline_stage, created_at),
  INDEX idx_orders_service_city (service_type, city_slug),
  INDEX idx_orders_next_follow_up (next_follow_up_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS order_offers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  offer_number VARCHAR(60) NOT NULL UNIQUE,
  title VARCHAR(190) DEFAULT NULL,
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

-- Seed primera (uklonite u produkciji):
-- INSERT INTO admins (email, password_hash) VALUES ('admin@example.com', '<hash>');
-- Primer kreiranja hash-a u PHP: password_hash('lozinka123', PASSWORD_DEFAULT);
