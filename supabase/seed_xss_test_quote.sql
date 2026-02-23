-- Seed a quote with XSS payload for E2E testing (run once in test/staging Supabase).
-- Use the returned access_token as TEST_XSS_QUOTE_TOKEN in .env.test or CI.
-- Requires at least one user in user_profiles.

INSERT INTO quotes (
  id,
  user_id,
  quote_number,
  customer_name,
  customer_email,
  status,
  subtotal,
  vat_rate,
  vat_amount,
  total,
  access_token,
  valid_until
)
SELECT
  gen_random_uuid(),
  up.id,
  'QF-XSS-TEST-001',
  '<script>alert(1)</script>',
  'xss-test@example.com',
  'sent',
  100,
  20,
  20,
  120,
  'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee'::uuid,
  (CURRENT_DATE + 7)
FROM user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM quotes WHERE access_token = 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee'::uuid
)
LIMIT 1;

-- If you need a specific access_token, run:
-- UPDATE quotes SET access_token = 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee'::uuid
-- WHERE quote_number = 'QF-XSS-TEST-001';
