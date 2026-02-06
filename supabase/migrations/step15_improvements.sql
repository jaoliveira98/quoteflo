-- =============================================
-- Step 15: Improvements Migration (idempotent)
-- - Convert trade_type enum to TEXT for flexibility
-- - Add more trade support + custom trade name
-- - Add user-specific service library (user_id column)
-- - Add default_quote_expiry_days to user_profiles
-- - Remove global seed data from service_library
-- =============================================

-- 1. Convert trade columns from enum to TEXT (only if they are still enum type)
DO $$
BEGIN
  -- Convert user_profiles.trade if it's still an enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'trade'
      AND udt_name = 'trade_type'
  ) THEN
    ALTER TABLE user_profiles ALTER COLUMN trade TYPE TEXT USING trade::TEXT;
  END IF;

  -- Convert service_library.trade if the column exists and is still an enum
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'service_library' AND column_name = 'trade'
      AND udt_name = 'trade_type'
  ) THEN
    ALTER TABLE service_library ALTER COLUMN trade TYPE TEXT USING trade::TEXT;
  END IF;
END $$;

-- Drop the old enum (safe even if already dropped)
DROP TYPE IF EXISTS trade_type;

-- 2. Add custom_trade_name for 'other' trade
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS custom_trade_name TEXT;

-- 3. Add default_quote_expiry_days
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS default_quote_expiry_days INTEGER DEFAULT 30;

-- 4. Add user_id to service_library for user-specific services
ALTER TABLE service_library ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE;

-- 5. Remove all global seed data (no user_id = global/default)
DELETE FROM service_library WHERE user_id IS NULL;

-- 6. Make user_id NOT NULL going forward (only if not already NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'service_library' AND column_name = 'user_id'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE service_library ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- 7. Update RLS policies for service_library
DROP POLICY IF EXISTS "Authenticated users can view service library" ON service_library;
DROP POLICY IF EXISTS "Users can view own services" ON service_library;
DROP POLICY IF EXISTS "Users can insert own services" ON service_library;
DROP POLICY IF EXISTS "Users can update own services" ON service_library;
DROP POLICY IF EXISTS "Users can delete own services" ON service_library;

CREATE POLICY "Users can view own services" ON service_library
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services" ON service_library
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services" ON service_library
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services" ON service_library
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Add index for user_id
CREATE INDEX IF NOT EXISTS idx_service_library_user_id ON service_library(user_id);

-- 9. Update handle_new_user function to support new fields
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, trade, custom_trade_name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'trade', 'electrician'),
    NEW.raw_user_meta_data->>'custom_trade_name',
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
