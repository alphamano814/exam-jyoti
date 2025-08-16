-- Add missing columns to questions table
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- Add RLS policies for admin operations on questions table
CREATE POLICY "Admin can insert questions" 
ON public.questions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'prabinpokhrel234@gmail.com'
  )
);

CREATE POLICY "Admin can update questions" 
ON public.questions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'prabinpokhrel234@gmail.com'
  )
);

CREATE POLICY "Admin can delete questions" 
ON public.questions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'prabinpokhrel234@gmail.com'
  )
);