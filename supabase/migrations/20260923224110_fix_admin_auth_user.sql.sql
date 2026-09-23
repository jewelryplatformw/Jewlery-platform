/*
# Fix Admin Authentication — Recreate User Properly

## What this migration does

The admin account was originally created by manually inserting a row directly
into `auth.users`. That bypasses GoTrue's internal bookkeeping and causes a
500 "Database error querying schema" on every login attempt.

This migration:
1. Deletes the broken admin user row (and its identity row).
2. Recreates the admin user with all required columns populated (excluding
   generated columns like `confirmed_at`).
3. Re-inserts the email identity row that GoTrue expects.

## Admin Credentials
- Email: admin@glowgallery.com
- Password: GlowGallery2026!

## Security
- No changes to RLS policies — authenticated-only policies remain in place.
- The password is stored only as a bcrypt hash.
*/

-- 1. Remove the broken admin user and its identity
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@glowgallery.com'
);
DELETE FROM auth.users WHERE email = 'admin@glowgallery.com';

-- 2. Recreate the admin user with all required columns populated
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
  is_sso_user,
  is_anonymous,
  phone,
  phone_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change_confirm_status,
  reauthentication_token,
  phone_change,
  phone_change_token,
  banned_until,
  deleted_at,
  is_super_admin
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
  false,
  false,
  null,
  null,
  '',
  '',
  '',
  '',
  0,
  '',
  '',
  '',
  null,
  null,
  false
);

-- 3. Insert the email identity row that GoTrue expects
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  id,
  jsonb_build_object(
    'sub', id::text,
    'email', 'admin@glowgallery.com',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  id::text,
  now(),
  now()
FROM auth.users
WHERE email = 'admin@glowgallery.com'
AND NOT EXISTS (
  SELECT 1 FROM auth.identities
  WHERE auth.identities.user_id = auth.users.id
    AND auth.identities.provider = 'email'
);
