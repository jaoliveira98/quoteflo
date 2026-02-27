-- QuoteFlo Step 23: Store notifications last seen timestamp per user
-- Enables cross-device sync and survives cache clears

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS notifications_last_seen_at TIMESTAMPTZ;

COMMENT ON COLUMN user_profiles.notifications_last_seen_at IS 'Timestamp when user last viewed notifications (syncs across devices)';
