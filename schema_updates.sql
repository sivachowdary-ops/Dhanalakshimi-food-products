-- Dhanalakshmi Food Products - Business Finance Dashboard Database Migrations
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

-- 2. Add stock and cost tracking columns to the existing products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price_500g NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price_1kg NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty_500g INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty_1kg INTEGER DEFAULT 0;

-- 3. Create a view for daily aggregations (using India Standard Time for order timestamps)
CREATE OR REPLACE VIEW daily_finance_totals AS
SELECT 
  d.date,
  COALESCE((
    SELECT SUM(total_amount) 
    FROM orders 
    WHERE (created_at AT TIME ZONE 'Asia/Kolkata')::DATE = d.date 
      AND status IN ('Confirmed', 'Preparing', 'Shipped', 'Delivered')
  ), 0) AS income,
  COALESCE((
    SELECT SUM(amount) 
    FROM expenses 
    WHERE expense_date = d.date
  ), 0) AS expenses
FROM (
  SELECT DISTINCT (created_at AT TIME ZONE 'Asia/Kolkata')::DATE AS date FROM orders
  UNION
  SELECT DISTINCT expense_date AS date FROM expenses
) d;

-- 4. Create a view for monthly aggregations (using India Standard Time)
CREATE OR REPLACE VIEW monthly_finance_totals AS
SELECT 
  DATE_TRUNC('month', d.date)::DATE AS month,
  SUM(d.income) AS income,
  SUM(d.expenses) AS expenses
FROM daily_finance_totals d
GROUP BY DATE_TRUNC('month', d.date);

-- 5. Create a view to pre-calculate stock valuation
CREATE OR REPLACE VIEW current_stock_value AS
SELECT 
  COALESCE(SUM((stock_qty_500g * cost_price_500g) + (stock_qty_1kg * cost_price_1kg)), 0) AS total_stock_value
FROM products;
