import { createClient } from '@supabase/supabase-js'

// Supabase configuration with fallback values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://afbiywmeqtjvudjjygzc.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYml5d21lcXRqdnVkamp5Z3pjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4ODQ2MDQsImV4cCI6MjA3MjQ2MDYwNH0.obyPm9Nhc-UGJR-ZG09p6pxNoWtiL9aAsSh4fEvp__E'

// Validate URLs
if (!supabaseUrl || !supabaseKey || supabaseUrl === 'undefined' || supabaseKey === 'undefined') {
  console.error('Invalid Supabase configuration:', { supabaseUrl, supabaseKey: supabaseKey ? 'SET' : 'MISSING' })
  throw new Error('Supabase configuration is invalid')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database setup SQL (run this in Supabase SQL editor):
/*
-- Create expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own expenses
CREATE POLICY "Users can only see their own expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id);
*/