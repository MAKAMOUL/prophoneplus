/*
  # Allow Anonymous Access to Products

  1. Changes
    - Add SELECT policy for anonymous users (anon role)
    - Add INSERT policy for anonymous users
    - Add UPDATE policy for anonymous users
    - Add DELETE policy for anonymous users
  
  2. Security
    - Allows anon role to perform CRUD operations on products table
    - Required for the app to work with Supabase anon key
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anon users can read products'
  ) THEN
    CREATE POLICY "Anon users can read products" ON products FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anon users can insert products'
  ) THEN
    CREATE POLICY "Anon users can insert products" ON products FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anon users can update products'
  ) THEN
    CREATE POLICY "Anon users can update products" ON products FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anon users can delete products'
  ) THEN
    CREATE POLICY "Anon users can delete products" ON products FOR DELETE TO anon USING (true);
  END IF;
END $$;