-- Enable Row Level Security (RLS)
-- Run these SQL commands in your Supabase SQL Editor

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  explanation TEXT,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ne')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  total_quizzes INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  category TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Questions: Allow all users to read, only admin to insert/update/delete
CREATE POLICY "Anyone can read questions" ON questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert questions" ON questions FOR INSERT TO authenticated WITH CHECK (
  auth.jwt() ->> 'email' = 'prabinpokhrel234@gmail.com'
);
CREATE POLICY "Admin can update questions" ON questions FOR UPDATE TO authenticated USING (
  auth.jwt() ->> 'email' = 'prabinpokhrel234@gmail.com'
);
CREATE POLICY "Admin can delete questions" ON questions FOR DELETE TO authenticated USING (
  auth.jwt() ->> 'email' = 'prabinpokhrel234@gmail.com'
);

-- Users: Users can read/update their own profile
CREATE POLICY "Users can read their own profile" ON users FOR SELECT TO authenticated USING (
  auth.uid() = id
);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE TO authenticated USING (
  auth.uid() = id
);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = id
);

-- Quiz Results: Users can read their own results, insert new results
CREATE POLICY "Users can read their own quiz results" ON quiz_results FOR SELECT TO authenticated USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can insert their own quiz results" ON quiz_results FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id
);

-- Sample data (optional)
INSERT INTO questions (question, options, correct_answer, explanation, category, subject, difficulty, language) VALUES
('नेपालको राजधानी कहाँ छ?', ARRAY['काठमाडौं', 'पोखरा', 'भैरहवा', 'धरान'], 0, 'नेपालको राजधानी काठमाडौं हो।', 'general-knowledge', 'Geography', 'easy', 'ne'),
('What is 2 + 2?', ARRAY['3', '4', '5', '6'], 1, 'Basic addition: 2 + 2 = 4', 'mathematics', 'Basic Math', 'easy', 'en'),
('Who is the current Prime Minister of Nepal (as of 2024)?', ARRAY['KP Sharma Oli', 'Sher Bahadur Deuba', 'Pushpa Kamal Dahal', 'Madhav Kumar Nepal'], 2, 'As of 2024, Pushpa Kamal Dahal (Prachanda) is serving as Prime Minister.', 'current-affairs', 'Politics', 'medium', 'en'),
('भारतीय संविधानमा कति धारा छन्?', ARRAY['395', '448', '396', '400'], 1, 'भारतीय संविधानमा 448 धारा छन्।', 'lok-sewa', 'Constitution', 'hard', 'ne');