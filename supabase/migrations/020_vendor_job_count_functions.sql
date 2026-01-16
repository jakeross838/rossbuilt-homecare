-- Migration: 020_vendor_job_count_functions
-- Description: Add RPC functions for incrementing vendor job counts
-- Phase: 09 - Work Orders & Vendors

-- Function to increment vendor total_jobs
CREATE OR REPLACE FUNCTION increment_vendor_total_jobs(vendor_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE vendors
  SET total_jobs = COALESCE(total_jobs, 0) + 1,
      updated_at = NOW()
  WHERE id = vendor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment vendor completed_jobs
CREATE OR REPLACE FUNCTION increment_vendor_completed_jobs(vendor_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE vendors
  SET completed_jobs = COALESCE(completed_jobs, 0) + 1,
      updated_at = NOW()
  WHERE id = vendor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_vendor_total_jobs(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_vendor_completed_jobs(UUID) TO authenticated;
