-- =============================================
-- Step 13: Fix customer creation reliability
-- =============================================

-- Recreate the ensure_customer_from_quote function with better handling
-- for cases where customer has no email and no postcode
CREATE OR REPLACE FUNCTION ensure_customer_from_quote()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  -- If quote already has a customer_id, skip
  IF NEW.customer_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Try to find existing customer by email (primary match)
  IF NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
    SELECT id INTO v_customer_id
    FROM customers
    WHERE user_id = NEW.user_id
      AND (
        email = NEW.customer_email 
        OR NEW.customer_email = ANY(COALESCE(emails, '{}'))
      )
    LIMIT 1;
  END IF;
  
  -- If not found by email, try by exact name match (+ optional postcode)
  IF v_customer_id IS NULL AND NEW.customer_name IS NOT NULL THEN
    SELECT id INTO v_customer_id
    FROM customers
    WHERE user_id = NEW.user_id
      AND LOWER(TRIM(name)) = LOWER(TRIM(NEW.customer_name))
      AND (
        -- Both have postcodes and they match
        (postcode IS NOT NULL AND NEW.customer_postcode IS NOT NULL 
         AND LOWER(TRIM(postcode)) = LOWER(TRIM(NEW.customer_postcode)))
        -- Or both have no postcode
        OR (postcode IS NULL AND NEW.customer_postcode IS NULL)
        -- Or both have no postcode (empty string check)
        OR (COALESCE(postcode, '') = '' AND COALESCE(NEW.customer_postcode, '') = '')
      )
    LIMIT 1;
  END IF;
  
  -- If still not found, create new customer
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
      NEW.customer_name,
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
    -- Update existing customer with any new contact info
    UPDATE customers SET
      -- Add email if new and not already present
      emails = CASE 
        WHEN NEW.customer_email IS NOT NULL AND TRIM(NEW.customer_email) != '' 
             AND NOT (TRIM(NEW.customer_email) = ANY(COALESCE(emails, '{}')))
        THEN array_append(COALESCE(emails, '{}'), TRIM(NEW.customer_email))
        ELSE COALESCE(emails, '{}')
      END,
      -- Add phone if new and not already present
      phones = CASE 
        WHEN NEW.customer_phone IS NOT NULL AND TRIM(NEW.customer_phone) != '' 
             AND NOT (TRIM(NEW.customer_phone) = ANY(COALESCE(phones, '{}')))
        THEN array_append(COALESCE(phones, '{}'), TRIM(NEW.customer_phone))
        ELSE COALESCE(phones, '{}')
      END,
      -- Update address if we have a new one and current is empty
      address = CASE 
        WHEN (address IS NULL OR address = '') AND NEW.customer_address IS NOT NULL AND TRIM(NEW.customer_address) != ''
        THEN TRIM(NEW.customer_address)
        ELSE address
      END,
      -- Update postcode if we have a new one and current is empty
      postcode = CASE 
        WHEN (postcode IS NULL OR postcode = '') AND NEW.customer_postcode IS NOT NULL AND TRIM(NEW.customer_postcode) != ''
        THEN TRIM(NEW.customer_postcode)
        ELSE postcode
      END,
      updated_at = NOW()
    WHERE id = v_customer_id;
  END IF;
  
  -- Set the customer_id on the quote
  NEW.customer_id := v_customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS ensure_customer_from_quote_trigger ON quotes;
CREATE TRIGGER ensure_customer_from_quote_trigger
BEFORE INSERT ON quotes
FOR EACH ROW EXECUTE FUNCTION ensure_customer_from_quote();

-- =============================================
-- Backfill: Link orphan quotes to customers
-- =============================================
-- For any existing quotes that don't have a customer_id,
-- try to match them to existing customers

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
    END IF;
    
    -- Link quote to customer
    IF v_customer_id IS NOT NULL THEN
      UPDATE quotes SET customer_id = v_customer_id WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
