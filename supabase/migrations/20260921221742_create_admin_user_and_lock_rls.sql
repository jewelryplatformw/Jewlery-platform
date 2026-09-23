/*
# Create Admin User & Lock RLS to Authenticated Only

## What this migration does

1. **Creates a single admin user** in `auth.users` with email `admin@glowgallery.com` and password `GlowGallery2026!`. This is the only account that can log in — there is no sign-up.

2. **Tightens RLS policies** on all three existing tables (`jewelry_items`, `metal_stock`, `transactions`). Previously they allowed `anon` (unauthenticated) access. Now only `authenticated` users (i.e. the logged-in admin) can read, insert, update, or delete data. This prevents anyone from seeing or modifying business data without logging in.

## New Objects
- One row in `auth.users` — the admin account.

## Modified Tables
- `jewelry_items` — policies replaced: `anon` removed, `authenticated` only.
- `metal_stock` — policies replaced: `anon` removed, `authenticated` only.
- `transactions` — policies replaced: `anon` removed, `authenticated` only.

## Security Changes
- All four CRUD policies per table rewritten to `TO authenticated` with `USING (true)` / `WITH CHECK (true)` (data is shared among authenticated admins, no per-user ownership needed since there's a single admin).
- `anon` role loses all access — unauthenticated requests get zero rows.

## Admin Credentials
- **Email:** admin@glowgallery.com
- **Password:** GlowGallery2026!
*/

-- 1. Create the admin user in auth.users (idempotent: skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@glowgallery.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_sso_user
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@glowgallery.com',
      crypt('GlowGallery2026!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false
    );
  END IF;
END $$;

-- 2. Revoke anon grants on all three tables
REVOKE ALL ON jewelry_items FROM anon;
REVOKE ALL ON metal_stock FROM anon;
REVOKE ALL ON transactions FROM anon;

-- 3. Re-grant authenticated CRUD on all three tables
GRANT SELECT, INSERT, UPDATE, DELETE ON jewelry_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON metal_stock TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;

-- 4. Replace policies: authenticated-only, shared data (single admin model)

-- ─── jewelry_items ───
DROP POLICY IF EXISTS "shared_select_jewelry_items" ON jewelry_items;
DROP POLICY IF EXISTS "shared_insert_jewelry_items" ON jewelry_items;
DROP POLICY IF EXISTS "shared_update_jewelry_items" ON jewelry_items;
DROP POLICY IF EXISTS "shared_delete_jewelry_items" ON jewelry_items;

CREATE POLICY "auth_select_jewelry_items" ON jewelry_items FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_insert_jewelry_items" ON jewelry_items FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_jewelry_items" ON jewelry_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_jewelry_items" ON jewelry_items FOR DELETE
  TO authenticated USING (true);

-- ─── metal_stock ───
DROP POLICY IF EXISTS "shared_select_metal_stock" ON metal_stock;
DROP POLICY IF EXISTS "shared_insert_metal_stock" ON metal_stock;
DROP POLICY IF EXISTS "shared_update_metal_stock" ON metal_stock;
DROP POLICY IF EXISTS "shared_delete_metal_stock" ON metal_stock;

CREATE POLICY "auth_select_metal_stock" ON metal_stock FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_insert_metal_stock" ON metal_stock FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_metal_stock" ON metal_stock FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_metal_stock" ON metal_stock FOR DELETE
  TO authenticated USING (true);

-- ─── transactions ───
DROP POLICY IF EXISTS "shared_select_transactions" ON transactions;
DROP POLICY IF EXISTS "shared_insert_transactions" ON transactions;
DROP POLICY IF EXISTS "shared_update_transactions" ON transactions;
DROP POLICY IF EXISTS "shared_delete_transactions" ON transactions;

CREATE POLICY "auth_select_transactions" ON transactions FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_insert_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_transactions" ON transactions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_transactions" ON transactions FOR DELETE
  TO authenticated USING (true);
