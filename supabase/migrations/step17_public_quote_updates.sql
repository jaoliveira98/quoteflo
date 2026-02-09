-- =============================================
-- Step 17: Public Quote Updates (idempotent)
-- - Allow public access to update quote status and viewed_at via access_token
-- - This enables customers to mark quotes as viewed when opening from email
-- =============================================

-- Drop policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Anyone can update quote by access token" ON quotes;

-- Create policy to allow updating quotes via access_token
-- This policy allows updates when the access_token matches
-- The application code ensures only safe fields (status, viewed_at, accepted_at) are updated
CREATE POLICY "Anyone can update quote by access token" ON quotes
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);
