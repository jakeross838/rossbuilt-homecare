# Service Request Photo Storage Setup

## Required Supabase Storage Configuration

1. Create a new storage bucket in Supabase Dashboard:
   - Name: `service-request-photos`
   - Public: Yes (for viewing photos in portal)
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

2. Add RLS policies:

```sql
-- Anyone authenticated can upload
CREATE POLICY "Authenticated users can upload service request photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-request-photos');

-- Anyone can read (public bucket)
CREATE POLICY "Public read access for service request photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-request-photos');

-- Clients can delete their own uploads (optional)
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'service-request-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

3. The bucket will store photos at:
   `service-requests/{request-id}-{timestamp}.{ext}`

## Usage Notes

- Photos are uploaded via `useUploadServiceRequestPhoto` hook
- Public URLs are returned immediately after upload
- Consider implementing cleanup for orphaned temp photos
