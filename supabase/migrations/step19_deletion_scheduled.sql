-- Allow scheduling account deletion with a grace period so users can recover if account was compromised.
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ;

COMMENT ON COLUMN user_profiles.deletion_scheduled_at IS 'When set, account will be permanently deleted by cron after this time. User can cancel by logging in before then.';
