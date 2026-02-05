-- QuoteFlo Step 8: Automated Follow-ups & Reminders
-- Run this in your Supabase SQL Editor after schema.sql

-- =============================================
-- NOTIFICATION PREFERENCES (per user)
-- =============================================

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS auto_followup_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS auto_followup_days INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS expiry_reminder_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS expiry_reminder_days INTEGER DEFAULT 2;

COMMENT ON COLUMN user_profiles.auto_followup_enabled IS 'Auto-send follow-up emails for unviewed quotes';
COMMENT ON COLUMN user_profiles.auto_followup_days IS 'Days to wait before sending follow-up (1-7)';
COMMENT ON COLUMN user_profiles.expiry_reminder_enabled IS 'Send reminder before quote expires';
COMMENT ON COLUMN user_profiles.expiry_reminder_days IS 'Days before expiry to send reminder (1-7)';

-- =============================================
-- QUOTE REMINDER TRACKING
-- =============================================

-- Add more granular tracking to quotes
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS follow_up_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_follow_up_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS expiry_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expiry_reminder_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN quotes.follow_up_count IS 'Number of follow-up emails sent';
COMMENT ON COLUMN quotes.last_follow_up_at IS 'Timestamp of last follow-up email';
COMMENT ON COLUMN quotes.expiry_reminder_sent IS 'Whether expiry reminder has been sent';
COMMENT ON COLUMN quotes.expiry_reminder_sent_at IS 'When expiry reminder was sent';

-- =============================================
-- NOTIFICATION LOG (for audit trail)
-- =============================================

CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  
  notification_type TEXT NOT NULL CHECK (notification_type IN ('quote_sent', 'follow_up', 'expiry_reminder', 'accepted', 'declined')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  recipient TEXT NOT NULL,
  
  subject TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notification logs
CREATE POLICY "Users can view own notification logs" ON notification_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification logs" ON notification_log
  FOR INSERT WITH CHECK (true);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_notification_log_user_id ON notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_quote_id ON notification_log(quote_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_created_at ON notification_log(created_at DESC);

-- =============================================
-- HELPER FUNCTION: Get quotes needing follow-up
-- =============================================

CREATE OR REPLACE FUNCTION get_quotes_needing_followup()
RETURNS TABLE (
  quote_id UUID,
  user_id UUID,
  quote_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  total DECIMAL,
  sent_at TIMESTAMPTZ,
  follow_up_count INTEGER,
  company_name TEXT,
  phone TEXT,
  brand_color VARCHAR(7),
  auto_followup_days INTEGER,
  access_token UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as quote_id,
    q.user_id,
    q.quote_number,
    q.customer_name,
    q.customer_email,
    q.total,
    q.sent_at,
    q.follow_up_count,
    p.company_name,
    p.phone,
    p.brand_color,
    p.auto_followup_days,
    q.access_token
  FROM quotes q
  JOIN user_profiles p ON q.user_id = p.id
  WHERE 
    q.status = 'sent'
    AND q.customer_email IS NOT NULL
    AND q.viewed_at IS NULL
    AND q.follow_up_count < 3
    AND p.auto_followup_enabled = TRUE
    AND (
      -- First follow-up: auto_followup_days after sent
      (q.follow_up_count = 0 AND q.sent_at < NOW() - (p.auto_followup_days || ' days')::INTERVAL)
      -- Subsequent follow-ups: 3 days after last follow-up
      OR (q.follow_up_count > 0 AND q.last_follow_up_at < NOW() - INTERVAL '3 days')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- HELPER FUNCTION: Get quotes expiring soon
-- =============================================

CREATE OR REPLACE FUNCTION get_quotes_expiring_soon()
RETURNS TABLE (
  quote_id UUID,
  user_id UUID,
  quote_number TEXT,
  customer_name TEXT,
  customer_email TEXT,
  total DECIMAL,
  valid_until DATE,
  company_name TEXT,
  phone TEXT,
  brand_color VARCHAR(7),
  access_token UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as quote_id,
    q.user_id,
    q.quote_number,
    q.customer_name,
    q.customer_email,
    q.total,
    q.valid_until,
    p.company_name,
    p.phone,
    p.brand_color,
    q.access_token
  FROM quotes q
  JOIN user_profiles p ON q.user_id = p.id
  WHERE 
    q.status IN ('sent', 'viewed')
    AND q.customer_email IS NOT NULL
    AND q.valid_until IS NOT NULL
    AND q.expiry_reminder_sent = FALSE
    AND p.expiry_reminder_enabled = TRUE
    AND q.valid_until BETWEEN CURRENT_DATE AND CURRENT_DATE + (p.expiry_reminder_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
