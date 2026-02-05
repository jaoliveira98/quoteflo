-- QuoteFlo Step 11: Enhanced Customers
-- Run this migration in your Supabase SQL Editor

-- =============================================
-- UPDATE CUSTOMERS TABLE
-- =============================================

-- Add columns for multiple emails and phones (stored as JSON arrays)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS emails TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS phones TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS merged_from UUID[] DEFAULT '{}';

-- Migrate existing email/phone to arrays
UPDATE customers 
SET emails = CASE WHEN email IS NOT NULL THEN ARRAY[email] ELSE '{}' END,
    phones = CASE WHEN phone IS NOT NULL THEN ARRAY[phone] ELSE '{}' END
WHERE emails = '{}' OR emails IS NULL;

-- =============================================
-- FUNCTION: Create/Update customer from quote
-- =============================================

-- This function ensures a customer record exists when a quote is created
CREATE OR REPLACE FUNCTION ensure_customer_from_quote()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
  v_existing_email TEXT;
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
        OR NEW.customer_email = ANY(emails)
      )
    LIMIT 1;
  END IF;
  
  -- If not found by email, try by name + postcode
  IF v_customer_id IS NULL AND NEW.customer_name IS NOT NULL THEN
    SELECT id INTO v_customer_id
    FROM customers
    WHERE user_id = NEW.user_id
      AND LOWER(name) = LOWER(NEW.customer_name)
      AND (
        (postcode IS NOT NULL AND LOWER(postcode) = LOWER(NEW.customer_postcode))
        OR (postcode IS NULL AND NEW.customer_postcode IS NULL)
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
      NEW.customer_email,
      NEW.customer_phone,
      NEW.customer_address,
      NEW.customer_postcode,
      CASE WHEN NEW.customer_email IS NOT NULL AND NEW.customer_email != '' 
           THEN ARRAY[NEW.customer_email] ELSE '{}' END,
      CASE WHEN NEW.customer_phone IS NOT NULL AND NEW.customer_phone != '' 
           THEN ARRAY[NEW.customer_phone] ELSE '{}' END
    )
    RETURNING id INTO v_customer_id;
  ELSE
    -- Update existing customer with any new contact info
    UPDATE customers
    SET 
      -- Add email if not already present
      emails = CASE 
        WHEN NEW.customer_email IS NOT NULL 
             AND NEW.customer_email != '' 
             AND NOT (NEW.customer_email = ANY(emails))
        THEN array_append(emails, NEW.customer_email)
        ELSE emails
      END,
      -- Add phone if not already present
      phones = CASE 
        WHEN NEW.customer_phone IS NOT NULL 
             AND NEW.customer_phone != '' 
             AND NOT (NEW.customer_phone = ANY(phones))
        THEN array_append(phones, NEW.customer_phone)
        ELSE phones
      END,
      -- Update address if provided and different
      address = COALESCE(NULLIF(NEW.customer_address, ''), address),
      postcode = COALESCE(NULLIF(NEW.customer_postcode, ''), postcode),
      updated_at = NOW()
    WHERE id = v_customer_id;
  END IF;
  
  -- Link quote to customer
  NEW.customer_id := v_customer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create customers from quotes
DROP TRIGGER IF EXISTS ensure_customer_from_quote_trigger ON quotes;
CREATE TRIGGER ensure_customer_from_quote_trigger
BEFORE INSERT ON quotes
FOR EACH ROW EXECUTE FUNCTION ensure_customer_from_quote();

-- =============================================
-- FUNCTION: Merge customers
-- =============================================

CREATE OR REPLACE FUNCTION merge_customers(
  p_user_id UUID,
  p_primary_customer_id UUID,
  p_secondary_customer_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_secondary_customer RECORD;
BEGIN
  -- Verify both customers belong to user
  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_primary_customer_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Primary customer not found or access denied';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_secondary_customer_id AND user_id = p_user_id) THEN
    RAISE EXCEPTION 'Secondary customer not found or access denied';
  END IF;
  
  -- Get secondary customer data
  SELECT * INTO v_secondary_customer FROM customers WHERE id = p_secondary_customer_id;
  
  -- Merge emails and phones into primary customer
  UPDATE customers
  SET 
    emails = (
      SELECT array_agg(DISTINCT e) 
      FROM (
        SELECT unnest(emails) AS e 
        UNION 
        SELECT unnest(v_secondary_customer.emails)
        UNION
        SELECT v_secondary_customer.email WHERE v_secondary_customer.email IS NOT NULL
      ) sub
      WHERE e IS NOT NULL AND e != ''
    ),
    phones = (
      SELECT array_agg(DISTINCT p) 
      FROM (
        SELECT unnest(phones) AS p 
        UNION 
        SELECT unnest(v_secondary_customer.phones)
        UNION
        SELECT v_secondary_customer.phone WHERE v_secondary_customer.phone IS NOT NULL
      ) sub
      WHERE p IS NOT NULL AND p != ''
    ),
    -- Append to notes if secondary has notes
    notes = CASE 
      WHEN v_secondary_customer.notes IS NOT NULL AND v_secondary_customer.notes != ''
      THEN COALESCE(notes || E'\n\n--- Merged from ' || v_secondary_customer.name || ' ---\n' || v_secondary_customer.notes, v_secondary_customer.notes)
      ELSE notes
    END,
    -- Track merged IDs
    merged_from = array_append(COALESCE(merged_from, '{}'), p_secondary_customer_id),
    updated_at = NOW()
  WHERE id = p_primary_customer_id;
  
  -- Update all quotes from secondary to primary
  UPDATE quotes
  SET customer_id = p_primary_customer_id
  WHERE customer_id = p_secondary_customer_id AND user_id = p_user_id;
  
  -- Delete secondary customer
  DELETE FROM customers WHERE id = p_secondary_customer_id;
  
  RETURN p_primary_customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- BACKFILL: Create customers for existing quotes without customer_id
-- =============================================

-- This will create customer records for any quotes that don't have one
DO $$
DECLARE
  r RECORD;
  v_customer_id UUID;
BEGIN
  FOR r IN 
    SELECT DISTINCT ON (user_id, LOWER(customer_name), LOWER(COALESCE(customer_email, '')))
      user_id, customer_name, customer_email, customer_phone, customer_address, customer_postcode
    FROM quotes 
    WHERE customer_id IS NULL
  LOOP
    -- Check if customer already exists
    SELECT id INTO v_customer_id
    FROM customers
    WHERE user_id = r.user_id
      AND (
        (r.customer_email IS NOT NULL AND (email = r.customer_email OR r.customer_email = ANY(emails)))
        OR (r.customer_email IS NULL AND LOWER(name) = LOWER(r.customer_name))
      )
    LIMIT 1;
    
    -- Create if not exists
    IF v_customer_id IS NULL THEN
      INSERT INTO customers (user_id, name, email, phone, address, postcode, emails, phones)
      VALUES (
        r.user_id, 
        r.customer_name, 
        r.customer_email, 
        r.customer_phone, 
        r.customer_address, 
        r.customer_postcode,
        CASE WHEN r.customer_email IS NOT NULL THEN ARRAY[r.customer_email] ELSE '{}' END,
        CASE WHEN r.customer_phone IS NOT NULL THEN ARRAY[r.customer_phone] ELSE '{}' END
      )
      RETURNING id INTO v_customer_id;
    END IF;
    
    -- Link quotes to customer
    UPDATE quotes
    SET customer_id = v_customer_id
    WHERE user_id = r.user_id
      AND LOWER(customer_name) = LOWER(r.customer_name)
      AND (
        (customer_email IS NOT NULL AND customer_email = r.customer_email)
        OR (customer_email IS NULL AND r.customer_email IS NULL)
      )
      AND customer_id IS NULL;
  END LOOP;
END $$;
