-- Allow admin to view all users
CREATE POLICY "Admin can view all users" 
ON public.users 
FOR SELECT 
USING ((auth.jwt() ->> 'email'::text) = 'prabinpokhrel234@gmail.com'::text);

-- Allow admin to update all users
CREATE POLICY "Admin can update all users" 
ON public.users 
FOR UPDATE 
USING ((auth.jwt() ->> 'email'::text) = 'prabinpokhrel234@gmail.com'::text);

-- Allow admin to delete users
CREATE POLICY "Admin can delete users" 
ON public.users 
FOR DELETE 
USING ((auth.jwt() ->> 'email'::text) = 'prabinpokhrel234@gmail.com'::text);

-- Allow admin to view all quiz results
CREATE POLICY "Admin can view all quiz results"
ON public.quiz_results
FOR SELECT
USING ((auth.jwt() ->> 'email'::text) = 'prabinpokhrel234@gmail.com'::text);

-- Allow admin to view all leaderboard entries (already public, but this ensures admin access)
CREATE POLICY "Admin can update all leaderboard entries"
ON public.leaderboard
FOR UPDATE
USING ((auth.jwt() ->> 'email'::text) = 'prabinpokhrel234@gmail.com'::text);

CREATE POLICY "Admin can delete leaderboard entries"
ON public.leaderboard
FOR DELETE
USING ((auth.jwt() ->> 'email'::text) = 'prabinpokhrel234@gmail.com'::text);