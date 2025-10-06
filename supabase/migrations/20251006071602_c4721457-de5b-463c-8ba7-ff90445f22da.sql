-- Add a public display name to leaderboard and keep it in sync with users
-- 1) Column
ALTER TABLE public.leaderboard ADD COLUMN IF NOT EXISTS display_name text;

-- 2) Function to compute a display name from users table safely
CREATE OR REPLACE FUNCTION public.get_display_name(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT COALESCE(NULLIF(TRIM(u.full_name), ''), split_part(u.email, '@', 1))
      FROM public.users u
      WHERE u.id = p_user_id
    ),
    'User ' || left(p_user_id::text, 8)
  );
$$;

-- 3) Trigger function to set display_name on leaderboard rows
CREATE OR REPLACE FUNCTION public.set_leaderboard_display_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.display_name := public.get_display_name(NEW.user_id);
  RETURN NEW;
END;
$$;

-- 4) Trigger on leaderboard (before insert/update of user_id)
DROP TRIGGER IF EXISTS trg_set_leaderboard_display_name ON public.leaderboard;
CREATE TRIGGER trg_set_leaderboard_display_name
BEFORE INSERT OR UPDATE OF user_id ON public.leaderboard
FOR EACH ROW
EXECUTE FUNCTION public.set_leaderboard_display_name();

-- 5) Propagate user name changes to leaderboard
CREATE OR REPLACE FUNCTION public.update_leaderboard_display_names_on_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.leaderboard l
  SET display_name = public.get_display_name(NEW.id),
      updated_at = now()
  WHERE l.user_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_leaderboard_names_on_user_update ON public.users;
CREATE TRIGGER trg_update_leaderboard_names_on_user_update
AFTER UPDATE OF full_name, email ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_leaderboard_display_names_on_user_update();

-- 6) Backfill existing rows
UPDATE public.leaderboard l
SET display_name = public.get_display_name(l.user_id)
WHERE l.display_name IS NULL OR TRIM(l.display_name) = '';