-- Prevoz Kop - UX dorada admina: custom pozicije radnika i custom vrste troskova
-- Pokrenuti nakon prethodne dve migracije.

ALTER TABLE workers
  MODIFY position VARCHAR(120) NOT NULL DEFAULT 'worker';

ALTER TABLE company_expenses
  MODIFY category VARCHAR(120) NOT NULL DEFAULT 'other';
