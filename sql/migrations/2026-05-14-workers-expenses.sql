-- Prevoz Kop - prvi paket poslovnih modula: radnici, plate i troskovi
-- Pokrenuti u phpMyAdmin nad postojecom bazom.

CREATE TABLE IF NOT EXISTS workers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(190) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  position ENUM('driver','craftsman','worker','administration','other') NOT NULL DEFAULT 'worker',
  payroll_type ENUM('fixed','daily') NOT NULL DEFAULT 'fixed',
  default_monthly_salary DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  default_daily_wage DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  note TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_workers_active_name (is_active, full_name),
  INDEX idx_workers_position (position),
  INDEX idx_workers_payroll_type (payroll_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS worker_payrolls (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  worker_id INT UNSIGNED NOT NULL,
  month TINYINT UNSIGNED NOT NULL,
  year SMALLINT UNSIGNED NOT NULL,
  payroll_type ENUM('fixed','daily') NOT NULL DEFAULT 'fixed',
  work_days DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  daily_wage DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  monthly_salary DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  advances DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  bonus DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  deductions DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_due DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status ENUM('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
  paid_at DATE DEFAULT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_worker_payroll_month (worker_id, month, year),
  INDEX idx_worker_payrolls_month_year (month, year),
  INDEX idx_worker_payrolls_status (status),
  CONSTRAINT fk_worker_payrolls_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  expense_date DATE NOT NULL,
  category ENUM('fuel','material','service','registration','payroll','rent','bills','other') NOT NULL DEFAULT 'other',
  description VARCHAR(255) NOT NULL DEFAULT '',
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('cash','bank','card','other') NOT NULL DEFAULT 'cash',
  vendor VARCHAR(190) DEFAULT NULL,
  vehicle_id INT UNSIGNED DEFAULT NULL,
  worker_id INT UNSIGNED DEFAULT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_expenses_date (expense_date),
  INDEX idx_company_expenses_category_date (category, expense_date),
  INDEX idx_company_expenses_worker (worker_id),
  INDEX idx_company_expenses_vehicle (vehicle_id),
  CONSTRAINT fk_company_expenses_worker FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Plan za drugi paket:
-- 1) Vozila i servisi: dodati vehicles tabelu i vezati company_expenses.vehicle_id.
-- 2) Kalendar isporuka: dodati delivery_calendar tabelu sa vezama na orders, workers i vehicles.
