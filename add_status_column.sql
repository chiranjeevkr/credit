-- Add status column to track transaction changes
ALTER TABLE transactions ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'edited', 'deleted'));