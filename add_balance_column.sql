-- Add balance_at_time column to existing transactions table
ALTER TABLE transactions ADD COLUMN balance_at_time DECIMAL(10,2) DEFAULT 0;