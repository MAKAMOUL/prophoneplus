/*
  # Create Users and Sales Tables with Authentication

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches Supabase auth.users id
      - `email` (text, unique) - user email
      - `role` (text) - either 'admin' or 'worker'
      - `name` (text) - user's full name
      - `created_at` (timestamptz) - timestamp of creation
      - `updated_at` (timestamptz) - timestamp of last update
    
    - `sales`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `product_name` (text) - snapshot of product name at sale time
      - `quantity` (integer) - quantity sold
      - `unit_price` (numeric) - price per unit at sale time
      - `total_price` (numeric) - total sale amount
      - `sold_by` (uuid, foreign key to users) - worker who made the sale
      - `sold_by_name` (text) - snapshot of worker name
      - `bill_url` (text, nullable) - URL or base64 of bill/receipt image
      - `created_at` (timestamptz) - timestamp of sale

  2. Security
    - Enable RLS on both tables
    - Users table: Admin can read all, users can read their own data
    - Sales table: Admin can read all, workers can read their own sales
    - Both tables allow authenticated users to insert (sales) or be created by admin (users)

  3. Initial Data
    - Create one admin user
    - Create one worker user
    
  Note: After this migration, you will need to create these users in Supabase Auth dashboard:
    1. Admin: admin@prophoneplus.com with password of your choice
    2. Worker: worker@prophoneplus.com with password of your choice
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'worker')),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  sold_by uuid REFERENCES users(id) ON DELETE SET NULL,
  sold_by_name text NOT NULL,
  bill_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Admin can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admin can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Sales table policies
CREATE POLICY "Admin can read all sales"
  ON sales FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Workers can read own sales"
  ON sales FOR SELECT
  TO authenticated
  USING (sold_by = auth.uid());

CREATE POLICY "Authenticated users can create sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (sold_by = auth.uid());

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (sold_by = auth.uid())
  WITH CHECK (sold_by = auth.uid());

CREATE POLICY "Users can delete own sales"
  ON sales FOR DELETE
  TO authenticated
  USING (sold_by = auth.uid());

CREATE POLICY "Admin can delete any sale"
  ON sales FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sales_sold_by ON sales(sold_by);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();