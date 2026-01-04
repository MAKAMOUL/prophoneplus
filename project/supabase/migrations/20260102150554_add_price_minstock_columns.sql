/*
  # Add price and minStock columns to products table

  1. Changes
    - Add `price` column (numeric) with default 0
    - Add `min_stock` column (integer) with default 5
  
  2. Notes
    - These columns are needed for the inventory management UI
    - Default values ensure existing products have valid data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price'
  ) THEN
    ALTER TABLE products ADD COLUMN price numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'min_stock'
  ) THEN
    ALTER TABLE products ADD COLUMN min_stock integer DEFAULT 5;
  END IF;
END $$;
