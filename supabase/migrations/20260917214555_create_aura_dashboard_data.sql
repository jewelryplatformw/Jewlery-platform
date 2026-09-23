/*
# Create Aura jewelry dashboard data

1. New Tables
- `jewelry_items` stores catalog pieces and their technical specifications, inventory, pricing, and image.
- `transactions` stores shared income and expense activity used in the finance dashboard.
- `metal_stock` stores the current physical reserve for gold and silver.
2. Security
- Row level security is enabled on all tables.
- This is a single-tenant, no-login workspace, so the anon and authenticated roles may read and manage the shared dashboard data.
3. Important Notes
- Prices and quantities are plain business values designed for the dashboard.
- Seed data is inserted only when the tables are empty.
*/

CREATE TABLE IF NOT EXISTS jewelry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  metal text NOT NULL,
  carat_weight numeric NOT NULL DEFAULT 0,
  clarity text NOT NULL DEFAULT 'VS1',
  color text NOT NULL DEFAULT 'G',
  total_weight_g numeric NOT NULL DEFAULT 0,
  stock_quantity integer NOT NULL DEFAULT 0,
  retail_price numeric NOT NULL DEFAULT 0,
  sku text NOT NULL UNIQUE,
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_code text NOT NULL UNIQUE,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('sale', 'purchase', 'expense')),
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metal_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metal text NOT NULL UNIQUE CHECK (metal IN ('gold', 'silver')),
  weight_kg numeric NOT NULL DEFAULT 0,
  spot_price numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE jewelry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metal_stock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shared_select_jewelry_items" ON jewelry_items;
CREATE POLICY "shared_select_jewelry_items" ON jewelry_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shared_insert_jewelry_items" ON jewelry_items;
CREATE POLICY "shared_insert_jewelry_items" ON jewelry_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "shared_update_jewelry_items" ON jewelry_items;
CREATE POLICY "shared_update_jewelry_items" ON jewelry_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "shared_delete_jewelry_items" ON jewelry_items;
CREATE POLICY "shared_delete_jewelry_items" ON jewelry_items FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_select_transactions" ON transactions;
CREATE POLICY "shared_select_transactions" ON transactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shared_insert_transactions" ON transactions;
CREATE POLICY "shared_insert_transactions" ON transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "shared_update_transactions" ON transactions;
CREATE POLICY "shared_update_transactions" ON transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "shared_delete_transactions" ON transactions;
CREATE POLICY "shared_delete_transactions" ON transactions FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "shared_select_metal_stock" ON metal_stock;
CREATE POLICY "shared_select_metal_stock" ON metal_stock FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "shared_insert_metal_stock" ON metal_stock;
CREATE POLICY "shared_insert_metal_stock" ON metal_stock FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "shared_update_metal_stock" ON metal_stock;
CREATE POLICY "shared_update_metal_stock" ON metal_stock FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "shared_delete_metal_stock" ON metal_stock;
CREATE POLICY "shared_delete_metal_stock" ON metal_stock FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS jewelry_items_category_idx ON jewelry_items(category);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(transaction_date DESC);

INSERT INTO jewelry_items (name, category, metal, carat_weight, clarity, color, total_weight_g, stock_quantity, retail_price, sku, image_url)
SELECT * FROM (VALUES
  ('Sculpted Halo Ring', 'Rings', '18k Yellow Gold', 1.58, 'VS1', 'G', 5.2, 8, 6500, 'AUR-RG-001', 'https://images.pexels.com/photos/942877/pexels-photo-942877.jpeg?auto=compress&cs=tinysrgb&w=900'),
  ('Sapphire Drop Studs', 'Earrings', '18k White Gold', 0.82, 'VS2', 'F', 3.8, 5, 3300, 'AUR-ER-014', 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=900'),
  ('Linea Tennis Bracelet', 'Bracelets', '18k Yellow Gold', 2.4, 'VS1', 'G', 10.1, 3, 8900, 'AUR-BR-008', 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=900'),
  ('Solstice Pendant', 'Necklaces', '18k Yellow Gold', 0.46, 'VS2', 'F', 4.6, 6, 4200, 'AUR-NK-021', 'https://images.pexels.com/photos/10983783/pexels-photo-10983783.jpeg?auto=compress&cs=tinysrgb&w=900')
) AS seed(name, category, metal, carat_weight, clarity, color, total_weight_g, stock_quantity, retail_price, sku, image_url)
WHERE NOT EXISTS (SELECT 1 FROM jewelry_items);

INSERT INTO transactions (transaction_code, transaction_date, description, kind, amount)
SELECT * FROM (VALUES
  ('AUR-2401', CURRENT_DATE - 1, 'Diamond halo engagement ring', 'sale', 6500),
  ('AUR-2400', CURRENT_DATE - 2, 'Gold bullion purchase', 'purchase', 2780),
  ('AUR-2399', CURRENT_DATE - 3, 'Private client appointment', 'sale', 3300),
  ('AUR-2398', CURRENT_DATE - 5, 'Workshop supplies', 'expense', 410),
  ('AUR-2397', CURRENT_DATE - 7, 'Tennis bracelet', 'sale', 8900)
) AS seed(transaction_code, transaction_date, description, kind, amount)
WHERE NOT EXISTS (SELECT 1 FROM transactions);

INSERT INTO metal_stock (metal, weight_kg, spot_price)
SELECT * FROM (VALUES ('gold', 5.2, 2345.67), ('silver', 22.0, 29.88)) AS seed(metal, weight_kg, spot_price)
WHERE NOT EXISTS (SELECT 1 FROM metal_stock);
