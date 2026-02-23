-- Fix "Database error saving new user" after adding deletion_scheduled_at.
-- Works whether trade is enum (pre-step15) or TEXT (post-step15).
-- Sets subscription_status and trial_ends_at so it works if step9 was applied.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trade text := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'trade'), ''), 'electrician');
  v_trade_safe text;
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
    deletion_scheduled_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_trade_safe,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    'trialing',
    NOW() + INTERVAL '14 days',
    NULL
  );
  RETURN NEW;
EXCEPTION
  WHEN undefined_column THEN
    -- Minimal insert if some columns (e.g. deletion_scheduled_at, subscription_status) don't exist yet
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
