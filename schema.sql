-- Dhanalakshmi Food Products Database Schema (PostgreSQL for Supabase)

-- 1. CLEANUP EXISTING TABLES (IF ANY)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS shipping_rates CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 2. CREATE PRODUCTS TABLE
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  image VARCHAR(255) DEFAULT 'assets/hero_lifestyle.png',
  price_500g NUMERIC(10, 2) NOT NULL DEFAULT 125.00,
  price_1kg NUMERIC(10, 2) NOT NULL DEFAULT 250.00,
  in_stock BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE ORDERS TABLE
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY, -- Formatted like DFP-123456
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  total_weight VARCHAR(50) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping_charge NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_ref VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CREATE ORDER ITEMS TABLE
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  weight VARCHAR(20) NOT NULL, -- "500g" or "1kg"
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL
);

-- 5. CREATE SHIPPING RATES TABLE
CREATE TABLE shipping_rates (
  state VARCHAR(100) PRIMARY KEY,
  rate NUMERIC(10, 2) NOT NULL
);

-- 6. CREATE SETTINGS TABLE
CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);

-- 7. SEED INITIAL PRODUCTS DATA
INSERT INTO products (name, category, description, image, price_500g, price_1kg, in_stock, is_bestseller) VALUES
('Special Mixture', 'Mixtures', 'A crunchy and savory blend of sev, boondi, roasted peanuts, cashews, and traditional Andhra spices.', 'assets/product_mixture.jpg', 125.00, 250.00, true, true),
('Dal Mixture', 'Mixtures', 'Crispy fried lentils mixed with roasted spices, curry leaves, and a touch of chili.', 'assets/product_dal_mixture.jpg', 125.00, 250.00, true, false),
('Chekodi', 'Chekodilu', 'Classic golden-fried rings made of rice flour and sesame seeds, offering a perfect traditional crunch.', 'assets/product_chekodi.jpg', 125.00, 250.00, true, true),
('Pappu Chekodi', 'Chekodilu', 'Traditional crunchy ring snack enriched with chana dal (lentils) for an extra layer of texture and taste.', 'assets/product_pappu_chekodi.jpg', 125.00, 250.00, true, false),
('Arra Karapusa', 'Karapusa', 'Super fine, spicy gram flour sev seasoned with hand-ground red chilies and garlic.', 'assets/product_arra_karapusa.jpg', 125.00, 250.00, true, false),
('Vammu Pusa', 'Karapusa', 'Traditional savory sev flavored with carom seeds (ajwain), gentle on the stomach and extremely flavorful.', 'assets/product_vammu_pusa.jpg', 125.00, 250.00, true, true),
('Janthukulu', 'Traditional Snacks', 'Traditional spiral snack made of rice flour and black gram, flavored with cumin and sesame seeds.', 'assets/product_janthukulu.jpg', 125.00, 250.00, true, true),
('Star Kommulu', 'Traditional Snacks', 'Crispy star-shaped snack sticks seasoned with mild spices, perfect for tea time.', 'assets/product_star_kommulu.jpg', 125.00, 250.00, true, false),
('Panchadhara Kommulu', 'Traditional Snacks', 'Sweet, crispy snack sticks coated with sugar syrup. A traditional festive favorite.', 'assets/product_panchadhara_kommulu.jpg', 125.00, 250.00, true, false),
('Bellam Gavvalu', 'Gavvalu', 'Shell-shaped sweet crisps made of wheat flour, fried to golden perfection and soaked in pure jaggery syrup.', 'assets/product_bellam_gavvalu.jpg', 125.00, 250.00, true, true),
('Hot Gavvalu', 'Gavvalu', 'Savory shell-shaped crisps spiced with red chili powder, garlic, and curry leaves.', 'assets/product_hot_gavvalu.jpg', 125.00, 250.00, true, false),
('Chitti Appadalu', 'Appadalu', 'Mini-sized, sun-dried lentil papads. Deep fry or roast for a crunchy companion to your meals.', 'assets/product_chitti_appadalu.jpg', 125.00, 250.00, true, false),
('Pedda Appadalu', 'Appadalu', 'Large, traditional papadums hand-rolled with premium quality black gram flour and spices.', 'assets/product_pedda_appadalu.jpg', 125.00, 250.00, true, false),
('Diamond Chips', 'Others', 'Sweet and crunchy diamond-cut flour pastries. Light, crispy, and mildly sweet.', 'assets/product_diamond_chips.jpg', 125.00, 250.00, true, false),
('Little Hearts Biscuits', 'Others', 'Puff pastry biscuits baked in the shape of hearts, glazed with caramelized sugar.', 'assets/product_little_hearts.jpg', 125.00, 250.00, true, false);

-- 8. SEED SHIPPING RATES
INSERT INTO shipping_rates (state, rate) VALUES
('Andhra Pradesh', 60.00),
('Telangana', 60.00),
('Tamil Nadu', 80.00),
('Karnataka', 80.00),
('Kerala', 80.00),
('Maharashtra', 100.00),
('Gujarat', 120.00),
('Delhi', 120.00),
('Uttar Pradesh', 120.00),
('West Bengal', 120.00),
('Rajasthan', 120.00),
('Madhya Pradesh', 120.00),
('Bihar', 120.00),
('Punjab', 120.00),
('Haryana', 120.00),
('Odisha', 120.00),
('Assam', 140.00),
('Jammu & Kashmir', 140.00),
('Goa', 100.00),
('Other States', 120.00);

-- 9. SEED DEFAULT SETTINGS
INSERT INTO settings (key, value) VALUES
('businessName', 'Dhanalakshmi Food Products'),
('tagline', 'Authentic Andhra Snacks Delivered Across India'),
('description', 'Serving authentic homemade sweets and traditional food products for over 10 years.'),
('whatsappNumber', '+918919051435'),
('upiId', '8919051435@axl'),
('instagramUrl', 'https://instagram.com/dhanalakshmifoods'),
('emailAddress', 'amarnadhkarella664@gmail.com'),
('contactAddress', 'Door No. 18/87, Nimmathota, Undrajavaram, West Godavari District, Andhra Pradesh - 534216');
