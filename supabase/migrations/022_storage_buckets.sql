-- 022_storage_buckets.sql
-- Storage buckets for file uploads (logos, avatars, documents)

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('organization-assets', 'organization-assets', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('inspection-photos', 'inspection-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE POLICIES FOR organization-assets BUCKET
-- =============================================================================

-- Anyone can view organization logos (they're public)
CREATE POLICY "Public can view organization assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'organization-assets');

-- Admin/Manager can upload organization assets
CREATE POLICY "Admin/Manager can upload organization assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'organization-assets' AND
    (storage.foldername(name))[1] = (SELECT organization_id::text FROM users WHERE id = auth.uid()) AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Admin/Manager can update organization assets
CREATE POLICY "Admin/Manager can update organization assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'organization-assets' AND
    (storage.foldername(name))[1] = (SELECT organization_id::text FROM users WHERE id = auth.uid()) AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Admin/Manager can delete organization assets
CREATE POLICY "Admin/Manager can delete organization assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'organization-assets' AND
    (storage.foldername(name))[1] = (SELECT organization_id::text FROM users WHERE id = auth.uid()) AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- =============================================================================
-- STORAGE POLICIES FOR avatars BUCKET
-- =============================================================================

-- Anyone can view avatars (they're public)
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- STORAGE POLICIES FOR inspection-photos BUCKET
-- =============================================================================

-- Staff can view inspection photos from their organization
CREATE POLICY "Staff can view inspection photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'inspection-photos' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role != 'client'
    )
  );

-- Staff can upload inspection photos
CREATE POLICY "Staff can upload inspection photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'inspection-photos' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role != 'client'
    )
  );

-- Admin/Manager can delete inspection photos
CREATE POLICY "Admin/Manager can delete inspection photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'inspection-photos' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- =============================================================================
-- STORAGE POLICIES FOR documents BUCKET
-- =============================================================================

-- Staff can view documents from their organization
CREATE POLICY "Staff can view documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role != 'client'
    )
  );

-- Staff can upload documents
CREATE POLICY "Staff can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role != 'client'
    )
  );

-- Admin/Manager can delete documents
CREATE POLICY "Admin/Manager can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );
