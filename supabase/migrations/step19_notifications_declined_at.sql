-- =============================================
-- Step 19: Track declined timestamp for quotes
-- - Add declined_at column to quotes
-- - Backfill existing declined quotes
-- - Ensure token-based status updates set declined_at
-- =============================================

-- Add declined_at column if it doesn't exist
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ;

-- Backfill existing declined quotes with a reasonable default.
-- We don't know the exact decline time historically, so we use NOW()
-- to ensure recent activity and notifications surfaces them.
UPDATE quotes
SET declined_at = NOW()
WHERE status = 'declined'
  AND declined_at IS NULL;

-- Ensure update_quote_status_by_token also records declined_at
CREATE OR REPLACE FUNCTION update_quote_status_by_token(
  p_token UUID,
  p_quote_id UUID,
  p_status TEXT,
  p_accepted_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  IF p_status NOT IN ('viewed', 'accepted', 'declined') THEN
    RETURN FALSE;
  END IF;

  UPDATE quotes
  SET
    status = p_status::quote_status,
    viewed_at = CASE WHEN p_status = 'viewed' THEN COALESCE(p_accepted_at, NOW()) ELSE viewed_at END,
    accepted_at = CASE WHEN p_status = 'accepted' THEN COALESCE(p_accepted_at, NOW()) ELSE accepted_at END,
    declined_at = CASE WHEN p_status = 'declined' THEN COALESCE(p_accepted_at, NOW()) ELSE declined_at END
  WHERE id = p_quote_id
    AND access_token = p_token;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

