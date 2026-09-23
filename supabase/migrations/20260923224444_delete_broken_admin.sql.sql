/*
# Clean up admin user for fresh API-based creation

## What this migration does

Deletes the manually inserted admin user and its identity so the Auth
signup API can create it fresh through GoTrue's proper internal logic.
*/

DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@glowgallery.com'
);
DELETE FROM auth.users WHERE email = 'admin@glowgallery.com';
