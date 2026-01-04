/*
  # Allow Anonymous Access to Categories and Sales

  1. Changes
    - Add SELECT, INSERT, UPDATE, DELETE policies for categories table
    - Add SELECT, INSERT, UPDATE, DELETE policies for sales table
  
  2. Security
    - Allows anon role to perform CRUD operations on both tables
    - Required for the app to work offline-first with Supabase sync
*/

-- Categories policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Anon users can read categories'
  ) THEN
    CREATE POLICY "Anon users can read categories" ON categories FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Anon users can insert categories'
  ) THEN
    CREATE POLICY "Anon users can insert categories" ON categories FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Anon users can update categories'
  ) THEN
    CREATE POLICY "Anon users can update categories" ON categories FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Anon users can delete categories'
  ) THEN
    CREATE POLICY "Anon users can delete categories" ON categories FOR DELETE TO anon USING (true);
  END IF;
END $$;

-- Sales policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Anon users can read sales'
  ) THEN
    CREATE POLICY "Anon users can read sales" ON sales FOR SELECT TO anon USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Anon users can insert sales'
  ) THEN
    CREATE POLICY "Anon users can insert sales" ON sales FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Anon users can update sales'
  ) THEN
    CREATE POLICY "Anon users can update sales" ON sales FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'sales' AND policyname = 'Anon users can delete sales'
  ) THEN
    CREATE POLICY "Anon users can delete sales" ON sales FOR DELETE TO anon USING (true);
  END IF;
END $$;