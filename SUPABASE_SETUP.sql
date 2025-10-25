-- Run this SQL in Supabase SQL Editor to set up the database

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT NOT NULL,
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

-- Create food_entries table
CREATE TABLE IF NOT EXISTS food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_foods table
CREATE TABLE IF NOT EXISTS custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER DEFAULT 0,
  carbs INTEGER DEFAULT 0,
  fat INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tier_categories table
CREATE TABLE IF NOT EXISTS tier_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tier_food_items table
CREATE TABLE IF NOT EXISTS tier_food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES tier_categories(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_votes table
CREATE TABLE IF NOT EXISTS user_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES tier_food_items(id) ON DELETE CASCADE,
  taste_rating INTEGER NOT NULL CHECK (taste_rating >= 0 AND taste_rating <= 10),
  look_rating INTEGER NOT NULL CHECK (look_rating >= 0 AND look_rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, food_item_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Allow username lookup for login" 
ON profiles FOR SELECT 
USING (true);

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

-- RLS Policies for food_entries
CREATE POLICY "Users can view own food entries" 
ON food_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food entries" 
ON food_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food entries" 
ON food_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food entries" 
ON food_entries FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for custom_foods
CREATE POLICY "Users can view own custom foods" 
ON custom_foods FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom foods" 
ON custom_foods FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom foods" 
ON custom_foods FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom foods" 
ON custom_foods FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for tier_categories
CREATE POLICY "Users can view own tier categories" 
ON tier_categories FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tier categories" 
ON tier_categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tier categories" 
ON tier_categories FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tier categories" 
ON tier_categories FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for tier_food_items
CREATE POLICY "Users can view own tier food items" 
ON tier_food_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tier food items" 
ON tier_food_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tier food items" 
ON tier_food_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tier food items" 
ON tier_food_items FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for user_votes
CREATE POLICY "All users can view all votes" 
ON user_votes FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can insert own votes" 
ON user_votes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes" 
ON user_votes FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" 
ON user_votes FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS calendar_notes_user_id_idx ON calendar_notes(user_id);
CREATE INDEX IF NOT EXISTS calendar_notes_date_idx ON calendar_notes(date);
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS food_entries_user_id_idx ON food_entries(user_id);
CREATE INDEX IF NOT EXISTS food_entries_date_idx ON food_entries(date);
CREATE INDEX IF NOT EXISTS custom_foods_user_id_idx ON custom_foods(user_id);
CREATE INDEX IF NOT EXISTS tier_categories_user_id_idx ON tier_categories(user_id);
CREATE INDEX IF NOT EXISTS tier_food_items_user_id_idx ON tier_food_items(user_id);
CREATE INDEX IF NOT EXISTS tier_food_items_category_id_idx ON tier_food_items(category_id);
CREATE INDEX IF NOT EXISTS user_votes_user_id_idx ON user_votes(user_id);
CREATE INDEX IF NOT EXISTS user_votes_food_item_id_idx ON user_votes(food_item_id);
