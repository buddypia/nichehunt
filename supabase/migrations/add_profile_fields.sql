/*
  # Add profile fields

  1. Changes
    - Add new fields to profiles table:
      - bio (text)
      - location (text)
      - website (text)
      - twitter (text)
      - github (text)
      - linkedin (text)
      - email (text)
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS twitter text,
ADD COLUMN IF NOT EXISTS github text,
ADD COLUMN IF NOT EXISTS linkedin text,
ADD COLUMN IF NOT EXISTS email text;
