-- Run this SQL in Supabase SQL Editor to set up the database

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_notes table
CREATE TABLE IF NOT EXISTS calendar_notes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table (post-it notes)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  color TEXT NOT NULL,
  position_x NUMERIC NOT NULL,
  position_y NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- RLS Policies for calendar_notes
CREATE POLICY "Users can view own notes" 
ON calendar_notes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" 
ON calendar_notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" 
ON calendar_notes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" 
ON calendar_notes FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for notes
CREATE POLICY "Users can view own notes" 
ON notes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" 
ON notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" 
ON notes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" 
ON notes FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS calendar_notes_user_id_idx ON calendar_notes(user_id);
CREATE INDEX IF NOT EXISTS calendar_notes_date_idx ON calendar_notes(date);
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
