-- QuoteFlo Step 9: Stripe Billing
-- Run this in your Supabase SQL Editor after step8_reminders.sql

-- =============================================
-- UPDATE USER PROFILES FOR BILLING
-- =============================================

-- Add trial tracking fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS billing_cycle_anchor TIMESTAMPTZ;

-- Set trial end date for existing users (14 days from now for those still trialing)
UPDATE user_profiles 
SET trial_ends_at = created_at + INTERVAL '14 days'
WHERE subscription_status = 'trialing' AND trial_ends_at IS NULL;

-- Set trial end date for new users via trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, trade, company_name, subscription_status, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN (NEW.raw_user_meta_data->>'trade') = 'electrician' THEN 'electrician'::public.trade_type
      WHEN (NEW.raw_user_meta_data->>'trade') = 'plumber' THEN 'plumber'::public.trade_type
      WHEN (NEW.raw_user_meta_data->>'trade') = 'builder' THEN 'builder'::public.trade_type
      ELSE 'electrician'::public.trade_type 
    END,
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company'),
    'trialing',
    NOW() + INTERVAL '14 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- BILLING EVENTS LOG (for audit trail)
-- =============================================

CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  event_type TEXT NOT NULL,
  event_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own billing events
CREATE POLICY "Users can view own billing events" ON billing_events
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert billing events (via service role)
CREATE POLICY "System can insert billing events" ON billing_events
  FOR INSERT WITH CHECK (true);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_billing_events_user_id ON billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_customer_id ON billing_events(stripe_customer_id);

-- =============================================
-- HELPER FUNCTION: Check if user has active subscription
-- =============================================

CREATE OR REPLACE FUNCTION is_subscription_active(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_status subscription_status;
  v_trial_ends_at TIMESTAMPTZ;
BEGIN
  SELECT subscription_status, trial_ends_at 
  INTO v_status, v_trial_ends_at
  FROM user_profiles 
  WHERE id = p_user_id;
  
  -- Active subscription
  IF v_status = 'active' THEN
    RETURN TRUE;
  END IF;
  
  -- Valid trial
  IF v_status = 'trialing' AND v_trial_ends_at > NOW() THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER FUNCTION: Get days remaining in trial
-- =============================================

CREATE OR REPLACE FUNCTION get_trial_days_remaining(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_trial_ends_at TIMESTAMPTZ;
  v_status subscription_status;
BEGIN
  SELECT trial_ends_at, subscription_status 
  INTO v_trial_ends_at, v_status
  FROM user_profiles 
  WHERE id = p_user_id;
  
  IF v_status != 'trialing' OR v_trial_ends_at IS NULL THEN
    RETURN 0;
  END IF;
  
  RETURN GREATEST(0, EXTRACT(DAY FROM v_trial_ends_at - NOW())::INTEGER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
