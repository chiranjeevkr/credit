-- Add shared functionality to friends table
ALTER TABLE friends ADD COLUMN is_shared BOOLEAN DEFAULT FALSE;
ALTER TABLE friends ADD COLUMN shared_with_user_id UUID REFERENCES auth.users(id);
ALTER TABLE friends ADD COLUMN connection_code VARCHAR(20) UNIQUE;

-- Create function to generate unique connection codes
CREATE OR REPLACE FUNCTION generate_connection_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    code VARCHAR(20);
BEGIN
    LOOP
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM friends WHERE connection_code = code);
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policy for shared friends
DROP POLICY IF EXISTS "Users can only see their own friends" ON friends;
CREATE POLICY "Users can see their own and shared friends" ON friends
  FOR ALL USING (
    auth.uid() = user_id OR 
    auth.uid() = shared_with_user_id
  );

-- Add shared user info to transactions
ALTER TABLE transactions ADD COLUMN created_by_user_id UUID REFERENCES auth.users(id);

-- Update transactions RLS policy
DROP POLICY IF EXISTS "Users can only see their own transactions" ON transactions;
CREATE POLICY "Users can see transactions for their friends" ON transactions
  FOR ALL USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM friends 
      WHERE friends.id = transactions.friend_id 
      AND (friends.user_id = auth.uid() OR friends.shared_with_user_id = auth.uid())
    )
  );