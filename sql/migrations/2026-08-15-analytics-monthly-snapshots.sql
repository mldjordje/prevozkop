-- Mesecna istorija Vercel Web Analytics podataka (posete, izvori, top stranice).
-- Popunjava se automatski jednom mesecno (Vercel Cron) i rucno iz admin panela.

CREATE TABLE IF NOT EXISTS analytics_monthly_snapshots (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  month CHAR(7) NOT NULL,
  pageviews INT UNSIGNED NOT NULL DEFAULT 0,
  visitors INT UNSIGNED NOT NULL DEFAULT 0,
  top_pages JSON DEFAULT NULL,
  top_referrers JSON DEFAULT NULL,
  top_countries JSON DEFAULT NULL,
  top_devices JSON DEFAULT NULL,
  captured_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_analytics_month (month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
