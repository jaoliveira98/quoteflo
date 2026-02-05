-- QuoteFlo Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE trade_type AS ENUM ('electrician', 'plumber', 'builder');
CREATE TYPE subscription_tier AS ENUM ('starter', 'professional', 'business');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired');
CREATE TYPE service_unit AS ENUM ('each', 'per_hour', 'per_metre', 'per_room', 'per_day');

-- =============================================
-- USER PROFILES
-- =============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  trade trade_type NOT NULL,
  company_name TEXT NOT NULL,
  phone TEXT,
  postcode VARCHAR(10),
  logo_url TEXT,
  brand_color VARCHAR(7) DEFAULT '#22c55e',
  subscription_tier subscription_tier DEFAULT 'professional',
  subscription_status subscription_status DEFAULT 'trialing',
  stripe_customer_id TEXT,
  quote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- CUSTOMERS
-- =============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  postcode VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Users can only access their own customers
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- QUOTES
-- =============================================

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  
  -- Customer snapshot (at time of quote)
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_postcode VARCHAR(10),
  
  -- Quote details
  job_description TEXT,
  status quote_status DEFAULT 'draft',
  
  -- Pricing
  subtotal DECIMAL(10,2) DEFAULT 0,
  vat_rate DECIMAL(4,2) DEFAULT 20,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  
  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  valid_until DATE,
  
  -- Follow-up tracking
  follow_up_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Public access token (for customer viewing)
  access_token UUID DEFAULT uuid_generate_v4(),
  
  UNIQUE(user_id, quote_number)
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Users can only access their own quotes
CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes" ON quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON quotes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON quotes
  FOR DELETE USING (auth.uid() = user_id);

-- Public access for customers viewing their quotes
CREATE POLICY "Anyone can view quote by access token" ON quotes
  FOR SELECT USING (true);

-- =============================================
-- QUOTE LINE ITEMS
-- =============================================

CREATE TABLE quote_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  item_order INTEGER NOT NULL DEFAULT 0,
  
  service_id UUID,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  line_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;

-- Users can access line items for their own quotes
CREATE POLICY "Users can view own quote items" ON quote_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quotes WHERE quotes.id = quote_line_items.quote_id AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own quote items" ON quote_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes WHERE quotes.id = quote_line_items.quote_id AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own quote items" ON quote_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM quotes WHERE quotes.id = quote_line_items.quote_id AND quotes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own quote items" ON quote_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM quotes WHERE quotes.id = quote_line_items.quote_id AND quotes.user_id = auth.uid()
    )
  );

-- =============================================
-- SERVICE LIBRARY (Pre-loaded services)
-- =============================================

CREATE TABLE service_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade trade_type NOT NULL,
  category TEXT NOT NULL,
  
  service_name TEXT NOT NULL,
  description TEXT,
  typical_price_min DECIMAL(10,2) NOT NULL,
  typical_price_max DECIMAL(10,2) NOT NULL,
  unit service_unit DEFAULT 'each',
  
  -- Compliance flags
  part_p_required BOOLEAN DEFAULT FALSE,
  gas_safe_required BOOLEAN DEFAULT FALSE,
  building_reg_required BOOLEAN DEFAULT FALSE,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (read-only for all authenticated users)
ALTER TABLE service_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view service library" ON service_library
  FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_year TEXT;
BEGIN
  -- Get current year
  v_year := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Increment user's quote count
  UPDATE user_profiles 
  SET quote_count = quote_count + 1 
  WHERE id = p_user_id
  RETURNING quote_count INTO v_count;
  
  -- Return formatted quote number
  RETURN 'QF-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recalculate quote totals
CREATE OR REPLACE FUNCTION recalculate_quote_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE quotes
  SET 
    subtotal = (SELECT COALESCE(SUM(line_total), 0) FROM quote_line_items WHERE quote_id = NEW.quote_id),
    vat_amount = (SELECT COALESCE(SUM(line_total), 0) FROM quote_line_items WHERE quote_id = NEW.quote_id) * (quotes.vat_rate / 100),
    total = (SELECT COALESCE(SUM(line_total), 0) FROM quote_line_items WHERE quote_id = NEW.quote_id) * (1 + quotes.vat_rate / 100)
  WHERE id = NEW.quote_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to recalculate totals when line items change
CREATE TRIGGER recalculate_quote_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON quote_line_items
FOR EACH ROW EXECUTE FUNCTION recalculate_quote_totals();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, trade, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'trade')::trade_type, 'electrician'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- SEED DATA: Service Library
-- =============================================

-- Electrician services
INSERT INTO service_library (trade, category, service_name, description, typical_price_min, typical_price_max, unit, part_p_required) VALUES
('electrician', 'Installation', 'Single socket installation', 'Install a new single socket outlet', 80, 120, 'each', true),
('electrician', 'Installation', 'Double socket installation', 'Install a new double socket outlet', 90, 140, 'each', true),
('electrician', 'Installation', 'Light fitting installation', 'Install a new ceiling light fitting', 60, 100, 'each', true),
('electrician', 'Installation', 'Downlight installation', 'Install recessed LED downlight', 70, 110, 'each', true),
('electrician', 'Installation', 'Outside light installation', 'Install external security/decorative light', 100, 180, 'each', true),
('electrician', 'Installation', 'Consumer unit upgrade', 'Replace/upgrade consumer unit (fuse box)', 400, 700, 'each', true),
('electrician', 'Installation', 'Electric shower installation', 'Install new electric shower', 250, 400, 'each', true),
('electrician', 'Installation', 'Cooker connection', 'Connect electric cooker/hob', 100, 180, 'each', true),
('electrician', 'Installation', 'EV charger installation', 'Install electric vehicle charging point', 800, 1200, 'each', true),
('electrician', 'Testing', 'EICR (Electrical Installation Condition Report)', 'Full electrical safety inspection', 150, 300, 'each', false),
('electrician', 'Testing', 'PAT testing', 'Portable appliance testing', 2, 5, 'each', false),
('electrician', 'Repair', 'Fault finding', 'Diagnose electrical fault', 60, 100, 'per_hour', false),
('electrician', 'Repair', 'Socket replacement', 'Replace faulty socket', 40, 70, 'each', false),
('electrician', 'Repair', 'Light switch replacement', 'Replace light switch', 35, 60, 'each', false);

-- Plumber services
INSERT INTO service_library (trade, category, service_name, description, typical_price_min, typical_price_max, unit, gas_safe_required) VALUES
('plumber', 'Installation', 'Tap replacement', 'Replace kitchen or bathroom tap', 80, 150, 'each', false),
('plumber', 'Installation', 'Toilet installation', 'Install new toilet', 200, 350, 'each', false),
('plumber', 'Installation', 'Basin installation', 'Install bathroom basin', 150, 280, 'each', false),
('plumber', 'Installation', 'Bath installation', 'Install new bath', 300, 500, 'each', false),
('plumber', 'Installation', 'Shower installation', 'Install new shower unit', 400, 700, 'each', false),
('plumber', 'Installation', 'Washing machine connection', 'Connect washing machine', 60, 100, 'each', false),
('plumber', 'Installation', 'Dishwasher connection', 'Connect dishwasher', 60, 100, 'each', false),
('plumber', 'Boiler', 'Boiler service', 'Annual boiler service', 70, 120, 'each', true),
('plumber', 'Boiler', 'Boiler repair', 'Diagnose and repair boiler fault', 100, 250, 'each', true),
('plumber', 'Boiler', 'Boiler installation', 'Install new combi boiler', 2000, 3500, 'each', true),
('plumber', 'Repair', 'Leak repair', 'Fix leaking pipe or joint', 80, 180, 'each', false),
('plumber', 'Repair', 'Blocked drain clearance', 'Clear blocked drain', 80, 150, 'each', false),
('plumber', 'Repair', 'Radiator replacement', 'Replace single radiator', 150, 280, 'each', false),
('plumber', 'Heating', 'Power flush', 'Full central heating power flush', 350, 600, 'each', false);

-- Builder services
INSERT INTO service_library (trade, category, service_name, description, typical_price_min, typical_price_max, unit, building_reg_required) VALUES
('builder', 'Walls', 'Stud wall construction', 'Build new stud partition wall', 400, 800, 'each', false),
('builder', 'Walls', 'Wall removal (non-load bearing)', 'Remove non-structural wall', 500, 1000, 'each', false),
('builder', 'Walls', 'Wall removal (load bearing)', 'Remove structural wall with RSJ', 1500, 3500, 'each', true),
('builder', 'Walls', 'Plastering (per room)', 'Full room replastering', 400, 700, 'per_room', false),
('builder', 'Flooring', 'Laminate flooring', 'Supply and fit laminate flooring', 25, 45, 'per_metre', false),
('builder', 'Flooring', 'Floor tiling', 'Supply and fit floor tiles', 40, 70, 'per_metre', false),
('builder', 'Flooring', 'Screed floor', 'Lay floor screed', 20, 35, 'per_metre', false),
('builder', 'Extensions', 'Single storey extension', 'Build single storey extension', 1200, 2000, 'per_metre', true),
('builder', 'Extensions', 'Loft conversion', 'Convert loft to habitable space', 30000, 60000, 'each', true),
('builder', 'Kitchen', 'Kitchen fitting', 'Fit new kitchen units', 1500, 3000, 'each', false),
('builder', 'Bathroom', 'Bathroom fitting', 'Complete bathroom installation', 2500, 5000, 'each', false),
('builder', 'Windows', 'Window replacement', 'Supply and fit UPVC window', 400, 800, 'each', true),
('builder', 'Doors', 'Internal door fitting', 'Supply and fit internal door', 150, 280, 'each', false),
('builder', 'Doors', 'External door fitting', 'Supply and fit external door', 400, 800, 'each', true);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_quotes_access_token ON quotes(access_token);
CREATE INDEX idx_quote_line_items_quote_id ON quote_line_items(quote_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_service_library_trade ON service_library(trade);
CREATE INDEX idx_service_library_category ON service_library(trade, category);
