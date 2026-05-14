-- Prevoz Kop - drugi paket poslovnih modula: vozila, servisi i kalendar isporuka
-- Pokrenuti u phpMyAdmin nakon migracije za radnike, plate i troskove.

CREATE TABLE IF NOT EXISTS vehicles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  vehicle_type ENUM('mixer','truck','pump','van','machine','other') NOT NULL DEFAULT 'other',
  registration_number VARCHAR(80) DEFAULT NULL,
  registration_expires_at DATE DEFAULT NULL,
  last_service_at DATE DEFAULT NULL,
  next_service_at DATE DEFAULT NULL,
  mileage DECIMAL(12,2) DEFAULT NULL,
  work_hours DECIMAL(12,2) DEFAULT NULL,
  status ENUM('active','inactive','service') NOT NULL DEFAULT 'active',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vehicles_status_name (status, name),
  INDEX idx_vehicles_registration_expires (registration_expires_at),
  INDEX idx_vehicles_next_service (next_service_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS delivery_calendar (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED DEFAULT NULL,
  customer_name VARCHAR(190) NOT NULL,
  address VARCHAR(255) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  quantity VARCHAR(120) DEFAULT NULL,
  service_type VARCHAR(80) DEFAULT NULL,
  vehicle_id INT UNSIGNED DEFAULT NULL,
  worker_id INT UNSIGNED DEFAULT NULL,
  status ENUM('scheduled','in_progress','done','cancelled') NOT NULL DEFAULT 'scheduled',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_delivery_calendar_scheduled (scheduled_at),
  INDEX idx_delivery_calendar_status_scheduled (status, scheduled_at),
  INDEX idx_delivery_calendar_vehicle (vehicle_id),
  INDEX idx_delivery_calendar_worker (worker_id),
  INDEX idx_delivery_calendar_order (order_id),
  CONSTRAINT fk_delivery_calendar_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  CONSTRAINT fk_delivery_calendar_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  CONSTRAINT fk_delivery_calendar_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ako je company_expenses tabela vec kreirana iz prve migracije, vehicle_id kolona je vec tu.
-- Strani kljuc ka vehicles je ukljucen u punoj sql/schema.sql semi; za postojecu bazu ga dodajte rucno
-- samo ako constraint vec ne postoji:
-- ALTER TABLE company_expenses
--   ADD CONSTRAINT fk_company_expenses_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;
