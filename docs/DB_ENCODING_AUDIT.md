# DB Encoding Audit and Repair Runbook

## 1) Backup before changes
1. Export full DB dump from cPanel/phpMyAdmin.
2. Verify dump restore on staging before production changes.

## 2) Dry-run detection query
Run `sql/migrations/2026-02-13-encoding-audit.sql` and inspect candidate rows only.

## 3) Manual verification
1. Open candidate IDs in admin.
2. Compare with expected Serbian text from source docs/import files.
3. Prepare targeted `UPDATE` statements only for confirmed broken rows.

## 4) Apply targeted repair
1. Execute updates in small batches (10-50 rows).
2. Re-check frontend and admin display.
3. Keep rollback script based on backup dump.

## 5) Post-check
1. Re-run audit query, verify no new mojibake rows.
2. Create one new record with `čćžšđ` through admin and confirm roundtrip.
