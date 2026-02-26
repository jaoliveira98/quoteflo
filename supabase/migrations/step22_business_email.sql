-- =============================================
-- Step 22: Business email separate from account email
-- - Add business_email to user_profiles
-- - Backfill from existing email
-- - Update handle_new_user to populate business_email
-- - Update get_public_quote_data to expose business contact email
-- =============================================

-- 1. Add business_email column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS business_email TEXT;

-- 2. Backfill existing rows so business_email matches current email
UPDATE user_profiles
SET business_email = email
WHERE business_email IS NULL;

-- 3. Update handle_new_user to set business_email from metadata (fallback to auth email)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trade text := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'trade'), ''), 'electrician');
  v_trade_safe text;
  v_business_email text := NULLIF(trim(NEW.raw_user_meta_data->>'business_email'), '');
BEGIN
  -- If trade column is still enum (electrician/plumber/builder only), map to valid value
  IF v_trade IN ('electrician', 'plumber', 'builder') THEN
    v_trade_safe := v_trade;
  ELSE
    v_trade_safe := 'electrician';
  END IF;

  INSERT INTO public.user_profiles (
    id,
    email,
    trade,
    company_name,
    subscription_status,
    trial_ends_at,
    deletion_scheduled_at,
    business_email
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_trade_safe,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    'trialing',
    NOW() + INTERVAL '14 days',
    NULL,
    COALESCE(v_business_email, NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN undefined_column THEN
    -- Minimal insert if some newer columns don't exist yet
    INSERT INTO public.user_profiles (id, email, trade, company_name)
    VALUES (
      NEW.id,
      NEW.email,
      v_trade_safe,
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company')
    );
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 4. Update get_public_quote_data to expose business contact email
--    For backwards compatibility, the JSON field remains "email" but now
--    prefers business_email when set.
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
    'email', COALESCE(up.business_email, up.email),
    'business_email', up.business_email,
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

