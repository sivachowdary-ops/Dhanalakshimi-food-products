-- Dhanalakshmi Food Products - Business Finance Dashboard Database Migrations (Kilograms Stock & Manual Sales)
-- Run these SQL statements in your Supabase SQL Editor to prepare your database.

-- 1. Create the new expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Drop previous bag-based columns if they exist
ALTER TABLE products DROP COLUMN IF EXISTS cost_price_500g;
ALTER TABLE products DROP COLUMN IF EXISTS cost_price_1kg;
ALTER TABLE products DROP COLUMN IF EXISTS stock_qty_500g;
ALTER TABLE products DROP COLUMN IF EXISTS stock_qty_1kg;

-- 3. Add kilogram-based stock and cost tracking columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_kg NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price_per_kg NUMERIC(10, 2) DEFAULT 0.00;

-- 4. Create a view to pre-calculate stock valuation in kilograms
CREATE OR REPLACE VIEW current_stock_value AS
SELECT 
  COALESCE(SUM(stock_kg * CASE WHEN cost_price_per_kg > 0 THEN cost_price_per_kg ELSE price_1kg END), 0) AS total_stock_value
FROM products;

-- 5. Create a view for daily aggregations (restricted to manual sales with prefix 'MANUAL-')
CREATE OR REPLACE VIEW daily_finance_totals AS
SELECT 
  d.date,
  COALESCE((
    SELECT SUM(total_amount) 
    FROM orders 
    WHERE (created_at AT TIME ZONE 'Asia/Kolkata')::DATE = d.date 
      AND payment_ref LIKE 'MANUAL-%'
      AND status IN ('Confirmed', 'Preparing', 'Shipped', 'Delivered')
  ), 0) AS income,
  COALESCE((
    SELECT SUM(amount) 
    FROM expenses 
    WHERE expense_date = d.date
  ), 0) AS expenses
FROM (
  SELECT DISTINCT (created_at AT TIME ZONE 'Asia/Kolkata')::DATE AS date FROM orders WHERE payment_ref LIKE 'MANUAL-%'
  UNION
  SELECT DISTINCT expense_date AS date FROM expenses
) d;

-- 6. Create a view for monthly aggregations (using India Standard Time)
CREATE OR REPLACE VIEW monthly_finance_totals AS
SELECT 
  DATE_TRUNC('month', d.date)::DATE AS month,
  SUM(d.income) AS income,
  SUM(d.expenses) AS expenses
FROM daily_finance_totals d
GROUP BY DATE_TRUNC('month', d.date);
