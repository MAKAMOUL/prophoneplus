/*
  # Fix RLS Performance and Security Issues

  ## Changes Made

  1. **RLS Performance Optimization**
     - Wrap all `auth.uid()` calls in `(select auth.uid())` to evaluate once per query instead of per row
     - This significantly improves query performance at scale

  2. **Consolidate Multiple Permissive Policies**
     - Combine redundant SELECT policies for users table into one policy
     - Combine redundant SELECT policies for sales table into one policy
     - Combine redundant DELETE policies for sales table into one policy
     - This simplifies policy evaluation and improves performance

  3. **Fix Function Security**
     - Set stable search_path for `update_updated_at_column` function to prevent security issues

  4. **Index Optimization**
     - Keep indexes as they may be used in future queries and are beneficial for data integrity

  ## Security Notes
  - All tables maintain proper RLS protection
  - Admin role checks are optimized but still secure
  - Users can only access their own data unless they are admins
*/

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Admin can read all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admin can insert users" ON users;
DROP POLICY IF EXISTS "Admin can update users" ON users;

-- Drop existing policies for sales table
DROP POLICY IF EXISTS "Admin can read all sales" ON sales;
DROP POLICY IF EXISTS "Workers can read own sales" ON sales;
DROP POLICY IF EXISTS "Authenticated users can create sales" ON sales;
DROP POLICY IF EXISTS "Users can update own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete own sales" ON sales;
DROP POLICY IF EXISTS "Admin can delete any sale" ON sales;

-- Create optimized policies for users table
CREATE POLICY "Users can view accessible data"
  ON users FOR SELECT
  TO authenticated
  USING (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) AND u.role = 'admin'
    )
  );

-- Create optimized policies for sales table
CREATE POLICY "Users can view accessible sales"
  ON sales FOR SELECT
  TO authenticated
  USING (
    sold_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) AND u.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (sold_by = (select auth.uid()));

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (sold_by = (select auth.uid()))
  WITH CHECK (sold_by = (select auth.uid()));

CREATE POLICY "Users can delete accessible sales"
  ON sales FOR DELETE
  TO authenticated
  USING (
    sold_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid()) AND u.role = 'admin'
    )
  );

-- Fix function search path security issue
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
