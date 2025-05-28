-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Create storage policies for product images

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own product images" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own product images" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view product images
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');
