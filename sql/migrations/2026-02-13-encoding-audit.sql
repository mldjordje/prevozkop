-- Dry-run only: detect possible mojibake sequences in key text columns.
-- Do not run updates from this file directly.

SELECT 'orders' AS tbl, id, name AS sample_text
FROM orders
WHERE name REGEXP 'Å|Ä|Â|â'
UNION ALL
SELECT 'orders', id, subject
FROM orders
WHERE subject REGEXP 'Å|Ä|Â|â'
UNION ALL
SELECT 'orders', id, message
FROM orders
WHERE message REGEXP 'Å|Ä|Â|â';

SELECT 'projects' AS tbl, id, title AS sample_text
FROM projects
WHERE title REGEXP 'Å|Ä|Â|â'
UNION ALL
SELECT 'projects', id, excerpt
FROM projects
WHERE excerpt REGEXP 'Å|Ä|Â|â';

SELECT 'products' AS tbl, id, name AS sample_text
FROM products
WHERE name REGEXP 'Å|Ä|Â|â'
UNION ALL
SELECT 'products', id, short_description
FROM products
WHERE short_description REGEXP 'Å|Ä|Â|â'
UNION ALL
SELECT 'products', id, description
FROM products
WHERE description REGEXP 'Å|Ä|Â|â';

-- Verify table and column collation:
SELECT TABLE_NAME, TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('orders', 'projects', 'products');

SELECT TABLE_NAME, COLUMN_NAME, CHARACTER_SET_NAME, COLLATION_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('orders', 'projects', 'products')
  AND DATA_TYPE IN ('varchar', 'text', 'longtext');
