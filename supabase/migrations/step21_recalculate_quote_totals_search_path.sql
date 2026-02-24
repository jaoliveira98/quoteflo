-- Fix "relation \"quotes\" does not exist" when deleting a user from Supabase dashboard.
-- During CASCADE delete (auth.users → user_profiles → quotes → quote_line_items),
-- the trigger recalculate_quote_totals_trigger fires on quote_line_items DELETE.
-- Without search_path = public, the function runs in a context where "quotes" is not visible.
CREATE OR REPLACE FUNCTION recalculate_quote_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE quotes
  SET
    subtotal = (SELECT COALESCE(SUM(line_total), 0) FROM quote_line_items WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)),
    vat_amount = (SELECT COALESCE(SUM(line_total), 0) FROM quote_line_items WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)) * (quotes.vat_rate / 100),
    total = (SELECT COALESCE(SUM(line_total), 0) FROM quote_line_items WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)) * (1 + quotes.vat_rate / 100)
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;
