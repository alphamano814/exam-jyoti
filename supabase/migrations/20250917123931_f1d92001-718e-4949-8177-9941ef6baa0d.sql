-- Function to sync user metadata from auth to users table
CREATE OR REPLACE FUNCTION sync_user_metadata()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update users table with metadata from auth.users where full_name is missing or auto-generated
  UPDATE public.users 
  SET 
    full_name = COALESCE(
      NULLIF(TRIM(auth_user.raw_user_meta_data->>'full_name'), ''),
      email_username
    ),
    email = COALESCE(
      NULLIF(TRIM(auth_user.email), ''),
      users.email
    )
  FROM auth.users auth_user,
  LATERAL (
    SELECT SPLIT_PART(auth_user.email, '@', 1) as email_username
  ) email_parts
  WHERE users.id = auth_user.id
  AND (
    users.full_name IS NULL 
    OR users.full_name = '' 
    OR users.full_name LIKE 'User %'
    OR LENGTH(TRIM(users.full_name)) < 3
  );
END;
$$;

-- Execute the sync function to fix existing data
SELECT sync_user_metadata();