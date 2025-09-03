-- Create a leaderboard table to track user points
CREATE TABLE public.leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points DECIMAL(10,2) NOT NULL DEFAULT 0,
  quiz_points DECIMAL(10,2) NOT NULL DEFAULT 0,
  daily_quiz_points DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_quizzes_completed INTEGER NOT NULL DEFAULT 0,
  total_daily_quizzes_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies for leaderboard access
CREATE POLICY "Leaderboard is viewable by everyone" 
ON public.leaderboard 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own leaderboard entry" 
ON public.leaderboard 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard entry" 
ON public.leaderboard 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update leaderboard points
CREATE OR REPLACE FUNCTION public.update_leaderboard_points(
  p_user_id UUID,
  p_quiz_type TEXT,
  p_correct_answers INTEGER,
  p_total_questions INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  points_per_answer DECIMAL(10,2);
  points_earned DECIMAL(10,2);
BEGIN
  -- Determine points per answer based on quiz type
  IF p_quiz_type = 'daily' THEN
    points_per_answer := 0.5;
  ELSE
    points_per_answer := 0.25;
  END IF;
  
  -- Calculate points earned
  points_earned := p_correct_answers * points_per_answer;
  
  -- Insert or update leaderboard entry
  INSERT INTO public.leaderboard (
    user_id, 
    total_points,
    quiz_points,
    daily_quiz_points,
    total_quizzes_completed,
    total_daily_quizzes_completed
  )
  VALUES (
    p_user_id,
    points_earned,
    CASE WHEN p_quiz_type = 'normal' THEN points_earned ELSE 0 END,
    CASE WHEN p_quiz_type = 'daily' THEN points_earned ELSE 0 END,
    CASE WHEN p_quiz_type = 'normal' THEN 1 ELSE 0 END,
    CASE WHEN p_quiz_type = 'daily' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = leaderboard.total_points + points_earned,
    quiz_points = leaderboard.quiz_points + CASE WHEN p_quiz_type = 'normal' THEN points_earned ELSE 0 END,
    daily_quiz_points = leaderboard.daily_quiz_points + CASE WHEN p_quiz_type = 'daily' THEN points_earned ELSE 0 END,
    total_quizzes_completed = leaderboard.total_quizzes_completed + CASE WHEN p_quiz_type = 'normal' THEN 1 ELSE 0 END,
    total_daily_quizzes_completed = leaderboard.total_daily_quizzes_completed + CASE WHEN p_quiz_type = 'daily' THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leaderboard_updated_at
BEFORE UPDATE ON public.leaderboard
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();