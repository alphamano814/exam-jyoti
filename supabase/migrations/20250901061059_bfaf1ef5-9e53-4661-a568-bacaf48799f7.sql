-- Enable Row Level Security (RLS)
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

-- Sample data with updated subjects
INSERT INTO questions (question, options, correct_answer, explanation, category, subject, difficulty, language) VALUES
('नेपालको राजधानी कहाँ छ?', ARRAY['काठमाडौं', 'पोखरा', 'भैरहवा', 'धरान'], 0, 'नेपालको राजधानी काठमाडौं हो।', 'general-knowledge', 'Geography', 'easy', 'ne'),
('What is 2 + 2?', ARRAY['3', '4', '5', '6'], 1, 'Basic addition: 2 + 2 = 4', 'mathematics', 'Universe', 'easy', 'en'),
('Who discovered gravity?', ARRAY['Einstein', 'Newton', 'Galileo', 'Darwin'], 1, 'Sir Isaac Newton discovered the law of universal gravitation.', 'science', 'Universe', 'medium', 'en'),
('भारतीय संविधानमा कति धारा छन्?', ARRAY['395', '448', 'चार सय छियान्नब्बे', '400'], 1, 'भारतीय संविधानमा 448 धारा छन्।', 'political-science', 'Nepal History', 'hard', 'ne'),
('What is the capital of France?', ARRAY['London', 'Berlin', 'Paris', 'Madrid'], 2, 'Paris is the capital and largest city of France.', 'geography', 'Geography', 'easy', 'en'),
('When was Nepal declared a republic?', ARRAY['2006', '2007', '2008', '2009'], 2, 'Nepal was declared a federal democratic republic on May 28, 2008.', 'history', 'Nepal History', 'medium', 'en'),
('What is the main greenhouse gas?', ARRAY['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], 1, 'Carbon dioxide is the primary greenhouse gas responsible for climate change.', 'environment', 'Eco system', 'medium', 'en'),
('Which organization regulates international trade?', ARRAY['WHO', 'WTO', 'UNESCO', 'UNICEF'], 1, 'The World Trade Organization (WTO) regulates international trade.', 'economics', 'International Relations', 'medium', 'en');