-- Fix checklist format inconsistencies
-- Ensure all checklists have both 'label'/'text' and 'title'/'name' for compatibility
-- The inspector UI expects 'label' and 'title', while the generator historically used 'text' and 'name'

-- Create a function to normalize checklist format
CREATE OR REPLACE FUNCTION normalize_checklist(checklist jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  section jsonb;
  item jsonb;
  sections jsonb := '[]'::jsonb;
  items jsonb;
  i int;
  j int;
BEGIN
  -- Return empty if no checklist
  IF checklist IS NULL OR checklist = '{}'::jsonb THEN
    RETURN checklist;
  END IF;

  -- Return as-is if no sections
  IF NOT checklist ? 'sections' THEN
    RETURN checklist;
  END IF;

  -- Process each section
  FOR i IN 0..jsonb_array_length(checklist->'sections') - 1 LOOP
    section := checklist->'sections'->i;
    items := '[]'::jsonb;

    -- Add 'title' if missing (copy from 'name')
    IF NOT section ? 'title' AND section ? 'name' THEN
      section := section || jsonb_build_object('title', section->>'name');
    END IF;

    -- Add 'name' if missing (copy from 'title')
    IF NOT section ? 'name' AND section ? 'title' THEN
      section := section || jsonb_build_object('name', section->>'title');
    END IF;

    -- Process each item in the section
    IF section ? 'items' THEN
      FOR j IN 0..jsonb_array_length(section->'items') - 1 LOOP
        item := section->'items'->j;

        -- Add 'label' if missing (copy from 'text')
        IF NOT item ? 'label' AND item ? 'text' THEN
          item := item || jsonb_build_object('label', item->>'text');
        END IF;

        -- Add 'text' if missing (copy from 'label')
        IF NOT item ? 'text' AND item ? 'label' THEN
          item := item || jsonb_build_object('text', item->>'label');
        END IF;

        -- Add 'item_type' if missing (derive from 'type' or default to 'boolean')
        IF NOT item ? 'item_type' THEN
          IF item ? 'type' THEN
            -- Map 'status' to 'boolean', keep others as-is
            IF item->>'type' = 'status' THEN
              item := item || jsonb_build_object('item_type', 'boolean');
            ELSE
              item := item || jsonb_build_object('item_type', item->>'type');
            END IF;
          ELSE
            item := item || jsonb_build_object('item_type', 'boolean');
          END IF;
        END IF;

        -- Add 'required' if missing
        IF NOT item ? 'required' THEN
          item := item || jsonb_build_object('required', false);
        END IF;

        items := items || jsonb_build_array(item);
      END LOOP;

      -- Replace items in section
      section := jsonb_set(section, '{items}', items);
    END IF;

    sections := sections || jsonb_build_array(section);
  END LOOP;

  -- Build result with normalized sections
  result := jsonb_set(checklist, '{sections}', sections);

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Apply the normalization to all inspections
UPDATE inspections
SET checklist = normalize_checklist(checklist)
WHERE checklist IS NOT NULL AND checklist != '{}'::jsonb;

-- Drop the function after use (optional, keeping it might be useful for future migrations)
-- DROP FUNCTION normalize_checklist(jsonb);
