-- Create upcoming_exams table
CREATE TABLE public.upcoming_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  exam_date DATE NOT NULL,
  exam_time TIME,
  venue TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.upcoming_exams ENABLE ROW LEVEL SECURITY;

-- Create policies for upcoming_exams
CREATE POLICY "Upcoming exams are viewable by everyone" 
ON public.upcoming_exams 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can insert upcoming exams" 
ON public.upcoming_exams 
FOR INSERT 
WITH CHECK ((auth.jwt() ->> 'email'::text) = 'prabinpokhrel234@gmail.com'::text);

CREATE POLICY "Admin can update upcoming exams" 
ON public.upcoming_exams 
FOR UPDATE 
USING ((auth.jwt() ->> 'email'::text) = 'prabinpokhrel234@gmail.com'::text);

CREATE POLICY "Admin can delete upcoming exams" 
ON public.upcoming_exams 
FOR DELETE 
USING ((auth.jwt() ->> 'email'::text) = 'prabinpokhrel234@gmail.com'::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_upcoming_exams_updated_at
BEFORE UPDATE ON public.upcoming_exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();