-- 051_ensure_organization_exists.sql
-- Ensure the Ross Built organization exists

INSERT INTO organizations (id, name, slug, phone, email, website, timezone, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Ross Built Custom Homes',
  'ross-built',
  '941-555-0100',
  'info@rossbuilt.com',
  'https://rossbuilt.com',
  'America/New_York',
  '{
    "business_hours": {
      "start": "08:00",
      "end": "17:00",
      "lunch_start": "12:00",
      "lunch_end": "13:00"
    },
    "scheduling": {
      "buffer_minutes": 15,
      "max_daily_hours": 8,
      "lead_days": 14
    },
    "notifications": {
      "email_enabled": true,
      "sms_enabled": false
    }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  website = EXCLUDED.website,
  timezone = EXCLUDED.timezone,
  settings = COALESCE(organizations.settings, EXCLUDED.settings);
