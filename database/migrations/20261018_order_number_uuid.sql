-- Run once against the existing database before deploying UUID order numbers.
-- Widens the column; existing values and its UNIQUE index are preserved.
ALTER TABLE orders MODIFY COLUMN order_number VARCHAR(40) NOT NULL;
