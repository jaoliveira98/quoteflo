-- =============================================
-- Step 14: Fix ensure_customer_from_quote trigger
-- =============================================
-- Fixes:
--   1. Adds exception handling so customer errors never block quote creation
--   2. Simplifies name matching (name-only fallback, no strict postcode requirement)
--   3. Sets search_path for SECURITY DEFINER safety
--   4. Fires on both INSERT and UPDATE (to re-link when customer details change)

-- Drop old trigger first
DROP TRIGGER IF EXISTS ensure_customer_from_quote_trigger ON quotes;

-- Recreate the function with fixes
CREATE OR REPLACE FUNCTION ensure_customer_from_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- If quote already has a customer_id, skip on INSERT.
  -- On UPDATE, re-evaluate only if customer details actually changed.
  IF TG_OP = 'INSERT' AND NEW.customer_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Only re-link if customer fields changed
    IF NEW.customer_name  IS NOT DISTINCT FROM OLD.customer_name
       AND NEW.customer_email IS NOT DISTINCT FROM OLD.customer_email
    THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Wrap everything in a sub-block so errors never prevent the quote from saving
  BEGIN
    v_customer_id := NULL;

    -- 1) Try to find existing customer by email (strongest match)
    IF NEW.customer_email IS NOT NULL AND TRIM(NEW.customer_email) != '' THEN
      SELECT id INTO v_customer_id
      FROM customers
      WHERE user_id = NEW.user_id
        AND (
          email = TRIM(NEW.customer_email)
          OR TRIM(NEW.customer_email) = ANY(COALESCE(emails, '{}'))
        )
      LIMIT 1;
    END IF;

    -- 2) If not found by email, try by name alone (case-insensitive)
    IF v_customer_id IS NULL AND NEW.customer_name IS NOT NULL AND TRIM(NEW.customer_name) != '' THEN
      SELECT id INTO v_customer_id
      FROM customers
      WHERE user_id = NEW.user_id
        AND LOWER(TRIM(name)) = LOWER(TRIM(NEW.customer_name))
      LIMIT 1;
    END IF;

    -- 3) Create new customer if no match found
    IF v_customer_id IS NULL THEN
      INSERT INTO customers (
        user_id,
        name,
        email,
        phone,
        address,
        postcode,
        emails,
        phones
      ) VALUES (
        NEW.user_id,
        TRIM(NEW.customer_name),
        NULLIF(TRIM(COALESCE(NEW.customer_email, '')), ''),
        NULLIF(TRIM(COALESCE(NEW.customer_phone, '')), ''),
        NULLIF(TRIM(COALESCE(NEW.customer_address, '')), ''),
        NULLIF(TRIM(COALESCE(NEW.customer_postcode, '')), ''),
        CASE WHEN NEW.customer_email IS NOT NULL AND TRIM(NEW.customer_email) != ''
             THEN ARRAY[TRIM(NEW.customer_email)] ELSE '{}' END,
        CASE WHEN NEW.customer_phone IS NOT NULL AND TRIM(NEW.customer_phone) != ''
             THEN ARRAY[TRIM(NEW.customer_phone)] ELSE '{}' END
      )
      RETURNING id INTO v_customer_id;
    ELSE
      -- 4) Update existing customer with any new contact info
      UPDATE customers SET
        emails = CASE
          WHEN NEW.customer_email IS NOT NULL AND TRIM(NEW.customer_email) != ''
               AND NOT (TRIM(NEW.customer_email) = ANY(COALESCE(emails, '{}')))
          THEN array_append(COALESCE(emails, '{}'), TRIM(NEW.customer_email))
          ELSE COALESCE(emails, '{}')
        END,
        phones = CASE
          WHEN NEW.customer_phone IS NOT NULL AND TRIM(NEW.customer_phone) != ''
               AND NOT (TRIM(NEW.customer_phone) = ANY(COALESCE(phones, '{}')))
          THEN array_append(COALESCE(phones, '{}'), TRIM(NEW.customer_phone))
          ELSE COALESCE(phones, '{}')
        END,
        address = CASE
          WHEN (address IS NULL OR address = '')
               AND NEW.customer_address IS NOT NULL AND TRIM(NEW.customer_address) != ''
          THEN TRIM(NEW.customer_address)
          ELSE address
        END,
        postcode = CASE
          WHEN (postcode IS NULL OR postcode = '')
               AND NEW.customer_postcode IS NOT NULL AND TRIM(NEW.customer_postcode) != ''
          THEN TRIM(NEW.customer_postcode)
          ELSE postcode
        END,
        updated_at = NOW()
      WHERE id = v_customer_id;
    END IF;

    -- Link the customer to the quote
    NEW.customer_id := v_customer_id;

  EXCEPTION WHEN OTHERS THEN
    -- Log the error but NEVER prevent the quote from being saved
    RAISE WARNING 'ensure_customer_from_quote failed: % — %', SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$;

-- Recreate trigger for INSERT and UPDATE
CREATE TRIGGER ensure_customer_from_quote_trigger
BEFORE INSERT OR UPDATE ON quotes
FOR EACH ROW EXECUTE FUNCTION ensure_customer_from_quote();

-- =============================================
-- Backfill: Link any orphan quotes to customers
-- =============================================
DO $$
DECLARE
  r RECORD;
  v_customer_id UUID;
BEGIN
  FOR r IN
    SELECT id, user_id, customer_name, customer_email, customer_phone,
           customer_address, customer_postcode
    FROM quotes
    WHERE customer_id IS NULL
  LOOP
    v_customer_id := NULL;

    -- Try email match
    IF r.customer_email IS NOT NULL AND TRIM(r.customer_email) != '' THEN
      SELECT c.id INTO v_customer_id
      FROM customers c
      WHERE c.user_id = r.user_id
        AND (c.email = r.customer_email OR r.customer_email = ANY(COALESCE(c.emails, '{}')))
      LIMIT 1;
    END IF;

    -- Try name match
    IF v_customer_id IS NULL AND r.customer_name IS NOT NULL THEN
      SELECT c.id INTO v_customer_id
      FROM customers c
      WHERE c.user_id = r.user_id
        AND LOWER(TRIM(c.name)) = LOWER(TRIM(r.customer_name))
      LIMIT 1;
    END IF;

    -- Create customer if not found
    IF v_customer_id IS NULL THEN
      BEGIN
        INSERT INTO customers (user_id, name, email, phone, address, postcode, emails, phones)
        VALUES (
          r.user_id,
          r.customer_name,
          NULLIF(TRIM(COALESCE(r.customer_email, '')), ''),
          NULLIF(TRIM(COALESCE(r.customer_phone, '')), ''),
          NULLIF(TRIM(COALESCE(r.customer_address, '')), ''),
          NULLIF(TRIM(COALESCE(r.customer_postcode, '')), ''),
          CASE WHEN r.customer_email IS NOT NULL AND TRIM(r.customer_email) != ''
               THEN ARRAY[TRIM(r.customer_email)] ELSE '{}' END,
          CASE WHEN r.customer_phone IS NOT NULL AND TRIM(r.customer_phone) != ''
               THEN ARRAY[TRIM(r.customer_phone)] ELSE '{}' END
        )
        RETURNING id INTO v_customer_id;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Backfill: failed to create customer for quote %: %', r.id, SQLERRM;
        CONTINUE;
      END;
    END IF;

    -- Link quote to customer
    IF v_customer_id IS NOT NULL THEN
      UPDATE quotes SET customer_id = v_customer_id WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
