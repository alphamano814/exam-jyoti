-- Drop existing policies
DROP POLICY IF EXISTS "Admin can insert questions" ON public.questions;
DROP POLICY IF EXISTS "Admin can update questions" ON public.questions;
DROP POLICY IF EXISTS "Admin can delete questions" ON public.questions;

-- Create new policies using JWT email claim
CREATE POLICY "Admin can insert questions" 
ON public.questions 
FOR INSERT 
WITH CHECK (
  auth.jwt() ->> 'email' = 'prabinpokhrel234@gmail.com'
);

CREATE POLICY "Admin can update questions" 
ON public.questions 
FOR UPDATE 
USING (
  auth.jwt() ->> 'email' = 'prabinpokhrel234@gmail.com'
);

CREATE POLICY "Admin can delete questions" 
ON public.questions 
FOR DELETE 
USING (
  auth.jwt() ->> 'email' = 'prabinpokhrel234@gmail.com'
);