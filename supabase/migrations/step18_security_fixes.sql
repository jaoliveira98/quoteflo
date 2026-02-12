-- =============================================
-- Step 18: Security Fixes
-- - Replace permissive quote policies with token-based RPCs
-- - Restrict public quote access to token validation only
-- =============================================

-- Drop permissive policies
DROP POLICY IF EXISTS "Anyone can view quote by access token" ON quotes;
DROP POLICY IF EXISTS "Anyone can update quote by access token" ON quotes;

-- RPC: Get public quote data by token (quote, line items, profile)
-- Only returns data when access_token matches - no access by quote ID
CREATE OR REPLACE FUNCTION get_public_quote_data(p_token UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quote quotes%ROWTYPE;
  v_line_items JSON;
  v_profile JSON;
  v_result JSON;
BEGIN
  SELECT * INTO v_quote FROM quotes WHERE access_token = p_token LIMIT 1;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(json_agg(row_to_json(li) ORDER BY li.item_order), '[]'::json)
  INTO v_line_items
  FROM quote_line_items li
  WHERE li.quote_id = v_quote.id;

  SELECT json_build_object(
    'company_name', up.company_name,
    'phone', up.phone,
    'email', up.email,
    'trade', up.trade,
    'logo_url', up.logo_url,
    'brand_color', up.brand_color
  ) INTO v_profile
  FROM user_profiles up
  WHERE up.id = v_quote.user_id;

  v_result := json_build_object(
    'quote', row_to_json(v_quote),
    'line_items', v_line_items,
    'profile', v_profile
  );
  RETURN v_result;
END;
$$;

-- RPC: Update quote status by token (accept/decline/viewed)
-- Validates that token matches quote_id before updating
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
    accepted_at = CASE WHEN p_status = 'accepted' THEN COALESCE(p_accepted_at, NOW()) ELSE accepted_at END
  WHERE id = p_quote_id
    AND access_token = p_token;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

-- Grant execute to anon for public quote access
GRANT EXECUTE ON FUNCTION get_public_quote_data(UUID) TO anon;
GRANT EXECUTE ON FUNCTION update_quote_status_by_token(UUID, UUID, TEXT, TIMESTAMPTZ) TO anon;
