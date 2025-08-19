/*
  # Create upcoming exams table

  1. New Tables
    - `upcoming_exams`
      - `id` (uuid, primary key)
      - `name` (text, exam name)
      - `date` (date, exam date)
      - `type` (text, exam type/category)
      - `language` (text, language preference)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `upcoming_exams` table
    - Add policy for public read access
    - Add policy for admin write access
*/

CREATE TABLE IF NOT EXISTS upcoming_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date NOT NULL,
  type text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE upcoming_exams ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read upcoming exams
CREATE POLICY "Anyone can read upcoming exams"
  ON upcoming_exams
  FOR SELECT
  USING (true);

-- Only admin can insert upcoming exams
CREATE POLICY "Admin can insert upcoming exams"
  ON upcoming_exams
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'prabinpokhrel234@gmail.com'
  );

-- Only admin can update upcoming exams
CREATE POLICY "Admin can update upcoming exams"
  ON upcoming_exams
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'prabinpokhrel234@gmail.com'
  );

-- Only admin can delete upcoming exams
CREATE POLICY "Admin can delete upcoming exams"
  ON upcoming_exams
  FOR DELETE
  USING (
    auth.jwt() ->> 'email' = 'prabinpokhrel234@gmail.com'
  );

-- Insert some sample data
INSERT INTO upcoming_exams (name, date, type, language) VALUES
('Lok Sewa - Officer Level', '2024-03-15', 'Government', 'en'),
('Banking Service', '2024-05-10', 'Financial', 'en'),
('लोक सेवा - अधिकृत तह', '2024-03-15', 'सरकारी', 'np'),
('बैंकिङ सेवा', '2024-05-10', 'वित्तीय', 'np');