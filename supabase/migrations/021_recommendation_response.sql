-- 021_recommendation_response.sql
-- Add client response fields to recommendations table

ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS client_response_notes TEXT,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS responded_by UUID REFERENCES users(id);

-- Index for finding responded recommendations
CREATE INDEX IF NOT EXISTS idx_recommendations_responded
  ON recommendations(responded_at) WHERE responded_at IS NOT NULL;
