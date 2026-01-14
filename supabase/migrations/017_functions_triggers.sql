-- 017_functions_triggers.sql
-- Database functions and triggers

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT IN ('activity_log', 'notifications', 'inspection_photos', 'equipment_service_log', 'invoice_line_items', 'payments', 'service_request_comments', 'program_history', 'documents')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    ', t, t, t, t);
  END LOOP;
END;
$$;

-- Generate work order number
CREATE OR REPLACE FUNCTION generate_work_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.work_order_number IS NULL THEN
    NEW.work_order_number := 'WO-' || LPAD(nextval('work_order_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_work_order_number
  BEFORE INSERT ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_work_order_number();

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || LPAD(nextval('invoice_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- Generate service request number
CREATE OR REPLACE FUNCTION generate_service_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := 'SR-' || LPAD(nextval('service_request_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_service_request_number
  BEFORE INSERT ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION generate_service_request_number();

-- Calculate program pricing
CREATE OR REPLACE FUNCTION calculate_program_pricing(
  p_organization_id UUID,
  p_frequency inspection_frequency,
  p_tier inspection_tier,
  p_addon_digital_manual BOOLEAN,
  p_addon_warranty_tracking BOOLEAN,
  p_addon_emergency_response BOOLEAN,
  p_addon_hurricane_monitoring BOOLEAN
)
RETURNS TABLE(
  base_fee DECIMAL,
  tier_fee DECIMAL,
  addons_fee DECIMAL,
  monthly_total DECIMAL
) AS $$
DECLARE
  v_pricing pricing_config%ROWTYPE;
  v_base DECIMAL;
  v_tier DECIMAL;
  v_addons DECIMAL := 0;
BEGIN
  -- Get current pricing config
  SELECT * INTO v_pricing FROM pricing_config
  WHERE organization_id = p_organization_id AND is_current = true
  LIMIT 1;

  -- Calculate base fee from frequency
  v_base := (v_pricing.frequency_pricing->>p_frequency::TEXT)::DECIMAL;

  -- Calculate tier fee
  v_tier := (v_pricing.tier_pricing->>p_tier::TEXT)::DECIMAL;

  -- Calculate addons
  IF p_addon_digital_manual THEN
    v_addons := v_addons + (v_pricing.addon_pricing->>'digital_manual')::DECIMAL;
  END IF;
  IF p_addon_warranty_tracking THEN
    v_addons := v_addons + (v_pricing.addon_pricing->>'warranty_tracking')::DECIMAL;
  END IF;
  IF p_addon_emergency_response THEN
    v_addons := v_addons + (v_pricing.addon_pricing->>'emergency_response')::DECIMAL;
  END IF;
  IF p_addon_hurricane_monitoring THEN
    v_addons := v_addons + (v_pricing.addon_pricing->>'hurricane_monitoring')::DECIMAL;
  END IF;

  RETURN QUERY SELECT v_base, v_tier, v_addons, (v_base + v_tier + v_addons);
END;
$$ LANGUAGE plpgsql;

-- Calculate inspection duration estimate
CREATE OR REPLACE FUNCTION calculate_inspection_duration(
  p_property_id UUID,
  p_tier inspection_tier
)
RETURNS INTEGER AS $$
DECLARE
  v_property properties%ROWTYPE;
  v_pricing pricing_config%ROWTYPE;
  v_base_time INTEGER;
  v_sqft_time INTEGER;
  v_feature_time INTEGER := 0;
  v_equipment_time INTEGER;
  v_equipment_count INTEGER;
BEGIN
  -- Get property
  SELECT * INTO v_property FROM properties WHERE id = p_property_id;

  -- Get pricing config (for time estimates)
  SELECT * INTO v_pricing FROM pricing_config
  WHERE organization_id = v_property.organization_id AND is_current = true;

  -- Base time for tier
  v_base_time := (v_pricing.time_estimates->'base_times'->>p_tier::TEXT)::INTEGER;

  -- Time for square footage
  v_sqft_time := COALESCE(
    CEIL(v_property.square_footage / 1000.0) *
    (v_pricing.time_estimates->'per_1000_sqft'->>p_tier::TEXT)::INTEGER,
    0
  );

  -- Time for features
  IF (v_property.features->>'pool')::BOOLEAN THEN
    v_feature_time := v_feature_time +
      (v_pricing.time_estimates->'feature_additions'->'pool'->>p_tier::TEXT)::INTEGER;
  END IF;
  IF (v_property.features->>'dock')::BOOLEAN THEN
    v_feature_time := v_feature_time +
      (v_pricing.time_estimates->'feature_additions'->'dock'->>p_tier::TEXT)::INTEGER;
  END IF;
  IF (v_property.features->>'generator')::BOOLEAN THEN
    v_feature_time := v_feature_time +
      (v_pricing.time_estimates->'feature_additions'->'generator'->>p_tier::TEXT)::INTEGER;
  END IF;
  -- Add more features as needed

  -- Time for equipment
  SELECT COUNT(*) INTO v_equipment_count FROM equipment WHERE property_id = p_property_id AND is_active = true;
  v_equipment_time := v_equipment_count *
    CASE p_tier
      WHEN 'visual' THEN 2
      WHEN 'functional' THEN 5
      WHEN 'comprehensive' THEN 8
      WHEN 'preventative' THEN 12
    END;

  RETURN v_base_time + v_sqft_time + v_feature_time + v_equipment_time;
END;
$$ LANGUAGE plpgsql;
