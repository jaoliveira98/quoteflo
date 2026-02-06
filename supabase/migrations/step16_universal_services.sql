-- =============================================
-- Step 16: Universal Services & VAT Improvements (idempotent)
-- - Add vat_enabled (boolean) + default_vat_rate to user_profiles
-- - Simplify service_library: single price, remove trade column, remove compliance flags
-- - Make services universal (any profession can use them)
-- =============================================

-- 1. Add VAT settings to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS vat_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS default_vat_rate DECIMAL(5,2) DEFAULT 20;

-- 2. Add single `price` column to service_library, migrate data from old columns if they exist
ALTER TABLE service_library ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

DO $$
BEGIN
  -- Populate price from average of min/max if old columns still exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'service_library' AND column_name = 'typical_price_min'
  ) THEN
    UPDATE service_library SET price = (typical_price_min + typical_price_max) / 2 WHERE price IS NULL;
  ELSE
    -- Old columns already gone — just set NULLs to 0
    UPDATE service_library SET price = 0 WHERE price IS NULL;
  END IF;
END $$;

-- Set default for future rows
ALTER TABLE service_library ALTER COLUMN price SET DEFAULT 0;
ALTER TABLE service_library ALTER COLUMN price SET NOT NULL;

-- 3. Drop old price columns (safe even if already dropped)
ALTER TABLE service_library DROP COLUMN IF EXISTS typical_price_min;
ALTER TABLE service_library DROP COLUMN IF EXISTS typical_price_max;

-- 4. Drop trade-specific compliance flags (making services universal)
ALTER TABLE service_library DROP COLUMN IF EXISTS part_p_required;
ALTER TABLE service_library DROP COLUMN IF EXISTS gas_safe_required;
ALTER TABLE service_library DROP COLUMN IF EXISTS building_reg_required;

-- 5. Drop trade column from service_library (services are user-specific, not trade-specific)
ALTER TABLE service_library DROP COLUMN IF EXISTS trade;

-- 6. Drop the old trade-based indexes (no longer relevant)
DROP INDEX IF EXISTS idx_service_library_trade;
DROP INDEX IF EXISTS idx_service_library_category;

-- 7. Add new index for user + category
CREATE INDEX IF NOT EXISTS idx_service_library_user_category ON service_library(user_id, category);
