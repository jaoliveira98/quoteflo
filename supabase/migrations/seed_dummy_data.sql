-- =============================================
-- Dummy Data Seed for email@email.com
-- Run this AFTER all migrations, in the Supabase SQL Editor
-- Assumes the user has already signed up with email@email.com
-- =============================================

DO $$
DECLARE
  v_user_id UUID;
  v_customer1_id UUID;
  v_customer2_id UUID;
  v_customer3_id UUID;
  v_customer4_id UUID;
  v_customer5_id UUID;
  v_quote1_id UUID;
  v_quote2_id UUID;
  v_quote3_id UUID;
  v_quote4_id UUID;
  v_quote5_id UUID;
  v_quote6_id UUID;
  v_quote7_id UUID;
  v_quote8_id UUID;
  v_service1_id UUID;
  v_service2_id UUID;
  v_service3_id UUID;
  v_service4_id UUID;
  v_service5_id UUID;
  v_service6_id UUID;
  v_service7_id UUID;
  v_service8_id UUID;
  v_service9_id UUID;
  v_service10_id UUID;
BEGIN
  -- ─── Get user ID ───────────────────────────
  SELECT id INTO v_user_id FROM user_profiles WHERE email = 'email@email.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email email@email.com not found. Please sign up first.';
  END IF;

  -- ─── Update user profile with realistic data ─────────
  UPDATE user_profiles SET
    company_name = 'Spark & Wire Electrical',
    phone = '07912 345678',
    postcode = 'SW1A 2AA',
    trade = 'electrician',
    brand_color = '#3b82f6',
    default_quote_expiry_days = 30,
    vat_enabled = true,
    default_vat_rate = 20,
    auto_followup_enabled = true,
    auto_followup_days = 3,
    expiry_reminder_enabled = true,
    expiry_reminder_days = 2,
    subscription_status = 'trialing',
    trial_ends_at = NOW() + INTERVAL '10 days',
    quote_count = 8,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- ─── Clean existing data for this user ─────
  DELETE FROM quote_line_items WHERE quote_id IN (SELECT id FROM quotes WHERE user_id = v_user_id);
  DELETE FROM quotes WHERE user_id = v_user_id;
  DELETE FROM customers WHERE user_id = v_user_id;
  DELETE FROM service_library WHERE user_id = v_user_id;
  DELETE FROM notification_log WHERE user_id = v_user_id;

  -- ─── Service Library (10 items) ────────────
  v_service1_id  := uuid_generate_v4();
  v_service2_id  := uuid_generate_v4();
  v_service3_id  := uuid_generate_v4();
  v_service4_id  := uuid_generate_v4();
  v_service5_id  := uuid_generate_v4();
  v_service6_id  := uuid_generate_v4();
  v_service7_id  := uuid_generate_v4();
  v_service8_id  := uuid_generate_v4();
  v_service9_id  := uuid_generate_v4();
  v_service10_id := uuid_generate_v4();

  INSERT INTO service_library (id, user_id, category, service_name, description, price, unit, is_active) VALUES
    (v_service1_id,  v_user_id, 'Installation', 'Single socket installation',  'Install a new single socket outlet',             95.00,  'each',      true),
    (v_service2_id,  v_user_id, 'Installation', 'Double socket installation',  'Install a new double socket outlet',            115.00,  'each',      true),
    (v_service3_id,  v_user_id, 'Installation', 'Light fitting installation',  'Install a new ceiling light fitting',            80.00,  'each',      true),
    (v_service4_id,  v_user_id, 'Installation', 'Consumer unit upgrade',       'Replace/upgrade consumer unit (fuse box)',       550.00,  'each',      true),
    (v_service5_id,  v_user_id, 'Installation', 'EV charger installation',     'Install electric vehicle charging point',        950.00,  'each',      true),
    (v_service6_id,  v_user_id, 'Testing',      'EICR',                        'Electrical Installation Condition Report',       225.00,  'each',      true),
    (v_service7_id,  v_user_id, 'Repair',       'Fault finding',               'Diagnose electrical fault (per hour)',            75.00,  'per_hour',  true),
    (v_service8_id,  v_user_id, 'Repair',       'Socket replacement',          'Replace faulty socket outlet',                   55.00,  'each',      true),
    (v_service9_id,  v_user_id, 'Installation', 'Downlight installation',      'Install recessed LED downlight',                 90.00,  'each',      true),
    (v_service10_id, v_user_id, 'Installation', 'Outdoor light installation',  'Install external security/decorative light',    140.00,  'each',      true);

  -- ─── Customers (5) ────────────────────────
  v_customer1_id := uuid_generate_v4();
  v_customer2_id := uuid_generate_v4();
  v_customer3_id := uuid_generate_v4();
  v_customer4_id := uuid_generate_v4();
  v_customer5_id := uuid_generate_v4();

  INSERT INTO customers (id, user_id, name, email, phone, address, postcode, emails, phones, notes) VALUES
    (v_customer1_id, v_user_id, 'James Wilson',    'james.wilson@gmail.com',    '07700 900100', '14 Oak Lane',           'E1 6AN',  ARRAY['james.wilson@gmail.com'],   ARRAY['07700 900100'], 'Returning customer, very reliable'),
    (v_customer2_id, v_user_id, 'Sarah Thompson',  'sarah.t@outlook.com',       '07700 900200', '28 Maple Avenue',       'N1 9GU',  ARRAY['sarah.t@outlook.com'],      ARRAY['07700 900200'], 'Referred by James Wilson'),
    (v_customer3_id, v_user_id, 'David Patel',     'dpatel@hotmail.com',        '07700 900300', '5 Cherry Close',        'SE1 7PB', ARRAY['dpatel@hotmail.com'],        ARRAY['07700 900300'], NULL),
    (v_customer4_id, v_user_id, 'Emma Roberts',    'emma.roberts@yahoo.co.uk',  '07700 900400', '91 Birch Street',       'W1D 3BW', ARRAY['emma.roberts@yahoo.co.uk'], ARRAY['07700 900400'], 'Landlord — manages 3 properties'),
    (v_customer5_id, v_user_id, 'Michael Chen',    'mchen@icloud.com',          '07700 900500', '7 Elm Terrace, Flat 2', 'EC2A 4NE',ARRAY['mchen@icloud.com'],         ARRAY['07700 900500'], 'New build flat');

  -- ─── Quotes (8 — mix of statuses) ─────────

  -- Quote 1: Accepted
  v_quote1_id := uuid_generate_v4();
  INSERT INTO quotes (
    id, user_id, quote_number, customer_id,
    customer_name, customer_email, customer_phone, customer_address, customer_postcode,
    job_description, status,
    subtotal, vat_rate, vat_amount, total,
    created_at, sent_at, viewed_at, accepted_at, valid_until,
    follow_up_sent, follow_up_count, reminder_sent, expiry_reminder_sent
  ) VALUES (
    v_quote1_id, v_user_id, 'QF-2026-0001', v_customer1_id,
    'James Wilson', 'james.wilson@gmail.com', '07700 900100', '14 Oak Lane', 'E1 6AN',
    'Full kitchen rewire — replace old wiring, install new consumer unit, 8 double sockets, 6 downlights.',
    'accepted',
    1625.00, 20, 325.00, 1950.00,
    NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '17 days',
    (CURRENT_DATE + 9),
    false, 0, false, false
  );

  INSERT INTO quote_line_items (quote_id, item_order, service_id, description, quantity, unit_price, line_total) VALUES
    (v_quote1_id, 0, v_service4_id, 'Consumer unit upgrade',       1,  550.00,  550.00),
    (v_quote1_id, 1, v_service2_id, 'Double socket installation',  8,  115.00,  920.00),
    (v_quote1_id, 2, v_service9_id, 'Downlight installation',      6,   90.00,  540.00),
    (v_quote1_id, 3, NULL,          'Cable routing & trunking',    1,  115.00,  115.00);

  -- Quote 2: Sent (not yet viewed)
  v_quote2_id := uuid_generate_v4();
  INSERT INTO quotes (
    id, user_id, quote_number, customer_id,
    customer_name, customer_email, customer_phone, customer_address, customer_postcode,
    job_description, status,
    subtotal, vat_rate, vat_amount, total,
    created_at, sent_at, valid_until,
    follow_up_sent, follow_up_count, reminder_sent, expiry_reminder_sent
  ) VALUES (
    v_quote2_id, v_user_id, 'QF-2026-0002', v_customer2_id,
    'Sarah Thompson', 'sarah.t@outlook.com', '07700 900200', '28 Maple Avenue', 'N1 9GU',
    'Bathroom and hallway lighting upgrade — 4 new downlights in bathroom, 3 in hallway, dimmer switches.',
    'sent',
    805.00, 20, 161.00, 966.00,
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days',
    (CURRENT_DATE + 27),
    false, 0, false, false
  );

  INSERT INTO quote_line_items (quote_id, item_order, service_id, description, quantity, unit_price, line_total) VALUES
    (v_quote2_id, 0, v_service9_id, 'Downlight installation',        7,  90.00, 630.00),
    (v_quote2_id, 1, NULL,          'Dimmer switch supply & fit',     3,  45.00, 135.00),
    (v_quote2_id, 2, NULL,          'Waste removal & making good',    1,  40.00,  40.00);

  -- Quote 3: Viewed
  v_quote3_id := uuid_generate_v4();
  INSERT INTO quotes (
    id, user_id, quote_number, customer_id,
    customer_name, customer_email, customer_phone, customer_address, customer_postcode,
    job_description, status,
    subtotal, vat_rate, vat_amount, total,
    created_at, sent_at, viewed_at, valid_until,
    follow_up_sent, follow_up_count, reminder_sent, expiry_reminder_sent
  ) VALUES (
    v_quote3_id, v_user_id, 'QF-2026-0003', v_customer3_id,
    'David Patel', 'dpatel@hotmail.com', '07700 900300', '5 Cherry Close', 'SE1 7PB',
    'EV charger installation — driveway-mounted 7kW charger, new dedicated circuit from consumer unit.',
    'viewed',
    1115.00, 20, 223.00, 1338.00,
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days',
    (CURRENT_DATE + 25),
    false, 0, false, false
  );

  INSERT INTO quote_line_items (quote_id, item_order, service_id, description, quantity, unit_price, line_total) VALUES
    (v_quote3_id, 0, v_service5_id, 'EV charger installation',      1, 950.00, 950.00),
    (v_quote3_id, 1, NULL,          'Armoured cable run (15m)',      1, 120.00, 120.00),
    (v_quote3_id, 2, NULL,          'Earth rod installation',        1,  45.00,  45.00);

  -- Quote 4: Declined
  v_quote4_id := uuid_generate_v4();
  INSERT INTO quotes (
    id, user_id, quote_number, customer_id,
    customer_name, customer_email, customer_phone, customer_address, customer_postcode,
    job_description, status,
    subtotal, vat_rate, vat_amount, total,
    created_at, sent_at, viewed_at, valid_until,
    follow_up_sent, follow_up_count, reminder_sent, expiry_reminder_sent
  ) VALUES (
    v_quote4_id, v_user_id, 'QF-2026-0004', v_customer4_id,
    'Emma Roberts', 'emma.roberts@yahoo.co.uk', '07700 900400', '91 Birch Street', 'W1D 3BW',
    'Full house EICR + remedial works on 3 rental properties.',
    'declined',
    1725.00, 20, 345.00, 2070.00,
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '12 days',
    (CURRENT_DATE + 16),
    true, 1, false, false
  );

  INSERT INTO quote_line_items (quote_id, item_order, service_id, description, quantity, unit_price, line_total) VALUES
    (v_quote4_id, 0, v_service6_id, 'EICR',                         3, 225.00,  675.00),
    (v_quote4_id, 1, v_service8_id, 'Socket replacement',           10,  55.00,  550.00),
    (v_quote4_id, 2, NULL,          'RCD upgrade per property',       3, 120.00,  360.00),
    (v_quote4_id, 3, NULL,          'Minor remedial works (est.)',    1, 140.00,  140.00);

  -- Quote 5: Draft
  v_quote5_id := uuid_generate_v4();
  INSERT INTO quotes (
    id, user_id, quote_number, customer_id,
    customer_name, customer_email, customer_phone, customer_address, customer_postcode,
    job_description, status,
    subtotal, vat_rate, vat_amount, total,
    created_at, valid_until,
    follow_up_sent, follow_up_count, reminder_sent, expiry_reminder_sent
  ) VALUES (
    v_quote5_id, v_user_id, 'QF-2026-0005', v_customer5_id,
    'Michael Chen', 'mchen@icloud.com', '07700 900500', '7 Elm Terrace, Flat 2', 'EC2A 4NE',
    'Smart home installation — 12 smart switches, hub setup, 4 outdoor lights.',
    'draft',
    1870.00, 20, 374.00, 2244.00,
    NOW() - INTERVAL '1 day',
    (CURRENT_DATE + 29),
    false, 0, false, false
  );

  INSERT INTO quote_line_items (quote_id, item_order, service_id, description, quantity, unit_price, line_total) VALUES
    (v_quote5_id, 0, NULL,           'Smart switch supply & install', 12, 85.00, 1020.00),
    (v_quote5_id, 1, NULL,           'Smart home hub configuration',   1, 150.00, 150.00),
    (v_quote5_id, 2, v_service10_id, 'Outdoor light installation',     4, 140.00, 560.00),
    (v_quote5_id, 3, NULL,           'Wi-Fi mesh point install',       1, 140.00, 140.00);

  -- Quote 6: Accepted (older)
  v_quote6_id := uuid_generate_v4();
  INSERT INTO quotes (
    id, user_id, quote_number, customer_id,
    customer_name, customer_email, customer_phone, customer_address, customer_postcode,
    job_description, status,
    subtotal, vat_rate, vat_amount, total,
    created_at, sent_at, viewed_at, accepted_at, valid_until,
    follow_up_sent, follow_up_count, reminder_sent, expiry_reminder_sent
  ) VALUES (
    v_quote6_id, v_user_id, 'QF-2026-0006', v_customer4_id,
    'Emma Roberts', 'emma.roberts@yahoo.co.uk', '07700 900400', '12 Pine Road (rental)', 'W1D 3BW',
    'Full rewire of 2-bed rental property — new consumer unit, all circuits.',
    'accepted',
    3200.00, 20, 640.00, 3840.00,
    NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days', NOW() - INTERVAL '33 days', NOW() - INTERVAL '30 days',
    (CURRENT_DATE - 5),
    false, 0, false, false
  );

  INSERT INTO quote_line_items (quote_id, item_order, service_id, description, quantity, unit_price, line_total) VALUES
    (v_quote6_id, 0, v_service4_id, 'Consumer unit upgrade',        1,  550.00,  550.00),
    (v_quote6_id, 1, NULL,          'Full rewire labour (3 days)',   3,  450.00, 1350.00),
    (v_quote6_id, 2, v_service2_id, 'Double socket installation',  10,  115.00, 1150.00),
    (v_quote6_id, 3, v_service3_id, 'Light fitting installation',   2,   80.00,  160.00);

  -- Quote 7: Expired
  v_quote7_id := uuid_generate_v4();
  INSERT INTO quotes (
    id, user_id, quote_number, customer_id,
    customer_name, customer_email, customer_phone, customer_address, customer_postcode,
    job_description, status,
    subtotal, vat_rate, vat_amount, total,
    created_at, sent_at, viewed_at, valid_until,
    follow_up_sent, follow_up_count, reminder_sent, expiry_reminder_sent
  ) VALUES (
    v_quote7_id, v_user_id, 'QF-2026-0007', v_customer3_id,
    'David Patel', 'dpatel@hotmail.com', '07700 900300', '5 Cherry Close', 'SE1 7PB',
    'Garden lighting — 6 bollard lights, 2 up-lighters, new outdoor circuit.',
    'expired',
    980.00, 20, 196.00, 1176.00,
    NOW() - INTERVAL '45 days', NOW() - INTERVAL '44 days', NOW() - INTERVAL '40 days',
    (CURRENT_DATE - 15),
    true, 2, true, true
  );

  INSERT INTO quote_line_items (quote_id, item_order, service_id, description, quantity, unit_price, line_total) VALUES
    (v_quote7_id, 0, v_service10_id, 'Outdoor light installation',  8,  100.00, 800.00),
    (v_quote7_id, 1, NULL,           'Outdoor cable run & ducting',  1,  120.00, 120.00),
    (v_quote7_id, 2, NULL,           'RCD circuit for garden',       1,   60.00,  60.00);

  -- Quote 8: Sent (recent, with follow-up)
  v_quote8_id := uuid_generate_v4();
  INSERT INTO quotes (
    id, user_id, quote_number, customer_id,
    customer_name, customer_email, customer_phone, customer_address, customer_postcode,
    job_description, status,
    subtotal, vat_rate, vat_amount, total,
    created_at, sent_at, valid_until,
    follow_up_sent, follow_up_count, last_follow_up_at, reminder_sent, expiry_reminder_sent
  ) VALUES (
    v_quote8_id, v_user_id, 'QF-2026-0008', v_customer1_id,
    'James Wilson', 'james.wilson@gmail.com', '07700 900100', '14 Oak Lane', 'E1 6AN',
    'Additional work — home office power points and data cabling.',
    'sent',
    495.00, 20, 99.00, 594.00,
    NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days',
    (CURRENT_DATE + 24),
    true, 1, NOW() - INTERVAL '2 days', false, false
  );

  INSERT INTO quote_line_items (quote_id, item_order, service_id, description, quantity, unit_price, line_total) VALUES
    (v_quote8_id, 0, v_service2_id, 'Double socket installation',   4, 115.00, 460.00),
    (v_quote8_id, 1, NULL,          'Cat6 data point install',      1,  35.00,  35.00);

  -- ─── Notification Log (sample entries) ─────
  INSERT INTO notification_log (user_id, quote_id, notification_type, channel, recipient, subject, status) VALUES
    (v_user_id, v_quote1_id, 'quote_sent',    'email', 'james.wilson@gmail.com',    'Quote QF-2026-0001 from Spark & Wire Electrical', 'sent'),
    (v_user_id, v_quote1_id, 'accepted',      'email', 'james.wilson@gmail.com',    'Quote QF-2026-0001 accepted!',                     'sent'),
    (v_user_id, v_quote2_id, 'quote_sent',    'email', 'sarah.t@outlook.com',       'Quote QF-2026-0002 from Spark & Wire Electrical', 'sent'),
    (v_user_id, v_quote3_id, 'quote_sent',    'email', 'dpatel@hotmail.com',        'Quote QF-2026-0003 from Spark & Wire Electrical', 'sent'),
    (v_user_id, v_quote4_id, 'quote_sent',    'email', 'emma.roberts@yahoo.co.uk',  'Quote QF-2026-0004 from Spark & Wire Electrical', 'sent'),
    (v_user_id, v_quote4_id, 'follow_up',     'email', 'emma.roberts@yahoo.co.uk',  'Reminder: Quote QF-2026-0004',                    'sent'),
    (v_user_id, v_quote4_id, 'declined',      'email', 'emma.roberts@yahoo.co.uk',  'Quote QF-2026-0004 declined',                     'sent'),
    (v_user_id, v_quote6_id, 'quote_sent',    'email', 'emma.roberts@yahoo.co.uk',  'Quote QF-2026-0006 from Spark & Wire Electrical', 'sent'),
    (v_user_id, v_quote6_id, 'accepted',      'email', 'emma.roberts@yahoo.co.uk',  'Quote QF-2026-0006 accepted!',                     'sent'),
    (v_user_id, v_quote7_id, 'quote_sent',    'email', 'dpatel@hotmail.com',        'Quote QF-2026-0007 from Spark & Wire Electrical', 'sent'),
    (v_user_id, v_quote7_id, 'follow_up',     'email', 'dpatel@hotmail.com',        'Reminder: Quote QF-2026-0007',                    'sent'),
    (v_user_id, v_quote7_id, 'expiry_reminder','email','dpatel@hotmail.com',       'Your quote expires soon',                          'sent'),
    (v_user_id, v_quote8_id, 'quote_sent',    'email', 'james.wilson@gmail.com',    'Quote QF-2026-0008 from Spark & Wire Electrical', 'sent'),
    (v_user_id, v_quote8_id, 'follow_up',     'email', 'james.wilson@gmail.com',    'Reminder: Quote QF-2026-0008',                    'sent');

  RAISE NOTICE 'Dummy data seeded successfully for email@email.com (user_id: %)', v_user_id;
  RAISE NOTICE 'Created: 10 services, 5 customers, 8 quotes (accepted: 2, sent: 2, viewed: 1, declined: 1, draft: 1, expired: 1)';
END $$;
