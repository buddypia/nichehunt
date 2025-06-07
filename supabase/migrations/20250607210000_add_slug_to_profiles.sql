-- Add slug column to profiles table
-- This migration adds a slug column and generates slugs for existing users

-- Add slug column (nullable first to allow updating existing records)
ALTER TABLE profiles 
ADD COLUMN slug VARCHAR;

-- Create a function to generate slug from username
CREATE OR REPLACE FUNCTION generate_profile_slug(username_input TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert username to lowercase and replace spaces/special chars with hyphens
  base_slug := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(username_input, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
  
  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Ensure it's not empty
  IF base_slug = '' THEN
    base_slug := 'user';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing users
UPDATE profiles 
SET slug = generate_profile_slug(username) 
WHERE slug IS NULL;

-- Now make slug NOT NULL and UNIQUE
ALTER TABLE profiles 
ALTER COLUMN slug SET NOT NULL,
ADD CONSTRAINT profiles_slug_key UNIQUE (slug);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);

-- Update the handle_new_user function to include slug generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if profile doesn't exist
  INSERT INTO public.profiles (id, username, display_name, slug, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    generate_profile_slug(COALESCE(NEW.raw_user_meta_data->>'username', NEW.email)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-generate slug when username changes
CREATE OR REPLACE FUNCTION update_profile_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- If username changed, regenerate slug
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    NEW.slug := generate_profile_slug(NEW.username);
  END IF;
  
  NEW.updated_at := TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for slug update
DROP TRIGGER IF EXISTS update_profile_slug_trigger ON profiles;
CREATE TRIGGER update_profile_slug_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_slug();
