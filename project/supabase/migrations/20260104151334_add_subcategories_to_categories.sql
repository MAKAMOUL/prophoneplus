/*
  # Add Subcategories Support to Categories Table

  1. Changes
    - Add `subcategories` column (jsonb array) to categories table
    - This allows storing multiple subcategories for each category
  
  2. Notes
    - Uses JSONB for flexible array storage
    - Defaults to empty array for existing categories
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'subcategories'
  ) THEN
    ALTER TABLE categories ADD COLUMN subcategories jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;