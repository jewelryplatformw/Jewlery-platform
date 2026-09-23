/*
# Repair Admin Authentication Identity

## Purpose

The admin account row exists, but its required email identity record was missing. Supabase Auth uses that identity record to connect an email/password login request to the user account. Without it, the login form correctly reports invalid credentials even when the user row and password hash exist.

## Changes

1. Update the existing `auth.users` admin row with a fresh password hash and confirmed email status.
2. Add the missing `auth.identities` row for the email provider.
3. Make the repair idempotent so it is safe to apply more than once.

## Admin Credentials

- Email: `admin@glowgallery.com`
- Password: `GlowGallery2026!`

## Security

- No sign-up flow is added.
- The existing authenticated-only RLS policies remain unchanged.
- The password is stored only as a bcrypt hash by PostgreSQL's cryptographic extension; the plain password is never stored.
*/

DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'admin@glowgallery.com';

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user does not exist';
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt('GlowGallery2026!', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      confirmation_token = '',
      recovery_token = '',
      updated_at = now()
  WHERE id = admin_id;

  IF NOT EXISTS (
    SELECT 1
    FROM auth.identities
    WHERE user_id = admin_id
      AND provider = 'email'
  ) THEN
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      admin_id,
      jsonb_build_object(
        'sub', admin_id::text,
        'email', 'admin@glowgallery.com',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      admin_id::text,
      now(),
      now()
    );
  END IF;
END $$;
