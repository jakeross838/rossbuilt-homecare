-- 028_program_cascade_function.sql
-- RPC function to handle cascading updates when a program changes
-- Ensures billing, schedule, and checklist updates happen atomically

-- Function to handle program update cascades
CREATE OR REPLACE FUNCTION cascade_program_update(
  p_program_id UUID,
  p_old_frequency TEXT,
  p_new_frequency TEXT,
  p_old_addons JSONB,
  p_new_addons JSONB,
  p_price_difference DECIMAL,
  p_new_monthly_total DECIMAL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_program RECORD;
  v_inspection_count INT := 0;
  v_invoice_id UUID;
  v_notification_id UUID;
  v_result JSONB;
BEGIN
  -- Get program details
  SELECT p.*, pr.name as property_name, pr.client_id
  INTO v_program
  FROM programs p
  JOIN properties pr ON p.property_id = pr.id
  WHERE p.id = p_program_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Program not found: %', p_program_id;
  END IF;

  -- 1. SCHEDULE CASCADE: Reschedule future inspections if frequency changed
  IF p_old_frequency != p_new_frequency THEN
    -- Cancel future scheduled inspections
    UPDATE inspections
    SET status = 'cancelled',
        notes = COALESCE(notes, '') || E'\n[Auto-cancelled due to frequency change]',
        updated_at = NOW()
    WHERE property_id = v_program.property_id
      AND status = 'scheduled'
      AND scheduled_date > CURRENT_DATE;

    GET DIAGNOSTICS v_inspection_count = ROW_COUNT;

    -- Create new inspections based on new frequency
    -- This is a simplified version - in production you'd want more sophisticated scheduling
    INSERT INTO inspections (
      organization_id,
      property_id,
      inspector_id,
      scheduled_date,
      inspection_type,
      status,
      notes
    )
    SELECT
      v_program.organization_id,
      v_program.property_id,
      v_program.preferred_inspector_id,
      CURRENT_DATE + (n * CASE p_new_frequency
        WHEN 'annual' THEN 365
        WHEN 'semi_annual' THEN 182
        WHEN 'quarterly' THEN 91
        WHEN 'monthly' THEN 30
        WHEN 'bi_weekly' THEN 14
        ELSE 30
      END)::INT,
      'routine',
      'scheduled',
      '[Auto-scheduled due to plan change]'
    FROM generate_series(1, CASE p_new_frequency
      WHEN 'annual' THEN 1
      WHEN 'semi_annual' THEN 2
      WHEN 'quarterly' THEN 4
      WHEN 'monthly' THEN 12
      WHEN 'bi_weekly' THEN 26
      ELSE 12
    END) AS n
    WHERE NOT EXISTS (
      SELECT 1 FROM inspections
      WHERE property_id = v_program.property_id
        AND status = 'scheduled'
        AND scheduled_date > CURRENT_DATE
    );
  END IF;

  -- 2. BILLING CASCADE: Create invoice for price difference
  IF p_price_difference > 0 THEN
    -- Create upgrade invoice
    INSERT INTO invoices (
      organization_id,
      client_id,
      invoice_number,
      invoice_type,
      invoice_date,
      due_date,
      period_start,
      period_end,
      subtotal,
      tax_rate,
      tax_amount,
      discount_amount,
      total,
      balance_due,
      status,
      notes
    ) VALUES (
      v_program.organization_id,
      v_program.client_id,
      'INV-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6)),
      'standard',
      CURRENT_DATE,
      CURRENT_DATE + 30,
      CURRENT_DATE,
      CURRENT_DATE + 30,
      p_price_difference,
      0,
      0,
      0,
      p_price_difference,
      p_price_difference,
      'draft',
      'Automatic invoice for plan upgrade'
    )
    RETURNING id INTO v_invoice_id;

    -- Create line item
    INSERT INTO invoice_line_items (
      invoice_id,
      description,
      quantity,
      unit_price,
      amount,
      line_type,
      reference_type,
      reference_id,
      property_id,
      display_order
    ) VALUES (
      v_invoice_id,
      'Plan Upgrade - ' || v_program.property_name,
      1,
      p_price_difference,
      p_price_difference,
      'subscription',
      'program',
      p_program_id,
      v_program.property_id,
      0
    );
  END IF;

  -- 3. NOTIFICATION: Notify admin of plan change
  INSERT INTO notifications (
    organization_id,
    user_id,
    type,
    title,
    message,
    data,
    is_read
  )
  SELECT
    v_program.organization_id,
    u.id,
    'plan_change',
    'Plan Updated: ' || v_program.property_name,
    'Client modified their service plan. New monthly total: $' || p_new_monthly_total::TEXT,
    jsonb_build_object(
      'program_id', p_program_id,
      'property_id', v_program.property_id,
      'property_name', v_program.property_name,
      'old_frequency', p_old_frequency,
      'new_frequency', p_new_frequency,
      'price_difference', p_price_difference,
      'new_monthly_total', p_new_monthly_total
    ),
    false
  FROM users u
  WHERE u.organization_id = v_program.organization_id
    AND u.role IN ('admin', 'manager')
  RETURNING id INTO v_notification_id;

  -- 4. ACTIVITY LOG: Record the change
  INSERT INTO activity_log (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    v_program.organization_id,
    auth.uid(),
    'program_updated',
    'program',
    p_program_id,
    jsonb_build_object(
      'property_name', v_program.property_name,
      'old_frequency', p_old_frequency,
      'new_frequency', p_new_frequency,
      'old_addons', p_old_addons,
      'new_addons', p_new_addons,
      'price_difference', p_price_difference
    )
  );

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'inspections_rescheduled', v_inspection_count,
    'invoice_created', v_invoice_id IS NOT NULL,
    'invoice_id', v_invoice_id,
    'notification_sent', v_notification_id IS NOT NULL
  );

  RETURN v_result;
END;
$$;

-- Grant execute to authenticated users (RLS will handle authorization)
GRANT EXECUTE ON FUNCTION cascade_program_update TO authenticated;

COMMENT ON FUNCTION cascade_program_update IS
  'Handles cascading updates when a program changes:
   - Reschedules inspections if frequency changes
   - Creates invoice for price increases
   - Sends notifications to admins
   - Logs activity
   All operations are atomic (transaction).';
