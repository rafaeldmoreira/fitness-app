-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Extends auth.users with public profile info and gamification stats
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  
  -- Onboarding Data
  height NUMERIC(5,2), -- in cm
  weight NUMERIC(5,2), -- in kg
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  fitness_goal TEXT CHECK (fitness_goal IN ('hypertrophy', 'strength', 'weight_loss', 'endurance')),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Gamification
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. EXERCISES TABLE
-- The "Wiki". System exercises (created_by IS NULL) and User exercises.
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL, -- e.g., 'chest', 'back', 'legs'
  equipment TEXT NOT NULL, -- e.g., 'dumbbell', 'barbell', 'machine'
  instructions TEXT,
  video_url TEXT, -- Loop video/gif
  image_url TEXT, -- Cover image
  
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Null implies "System Created"
  is_verified BOOLEAN DEFAULT FALSE, -- True for system exercises or approved user contributions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ROUTINES TABLE
-- Planned workouts (e.g., "Pull Day")
CREATE TABLE IF NOT EXISTS routines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE, -- For sharing features later
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ROUTINE_EXERCISES TABLE
-- Join table for Routines <-> Exercises with target metrics
CREATE TABLE IF NOT EXISTS routine_exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  
  order_index INTEGER NOT NULL, -- For drag-and-drop ordering
  target_sets INTEGER DEFAULT 3,
  target_reps TEXT DEFAULT '10-12', -- Text to allow ranges
  rest_seconds INTEGER DEFAULT 60,
  notes TEXT
);

-- 5. WORKOUT_SESSIONS TABLE
-- The actual history of a workout performed
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL, -- Nullable for "Freestyle" workouts
  
  name TEXT, -- Defaults to Routine name, but user can change it
  start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE, -- Null implies "In Progress"
  notes TEXT
);

-- 6. WORKOUT_LOGS TABLE
-- Granular data for every set performed
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  
  set_number INTEGER NOT NULL,
  weight NUMERIC(6,2),
  reps INTEGER,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
  completed BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SECURITY POLICIES (RLS)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Exercises Policies
DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON exercises;
CREATE POLICY "Exercises are viewable by everyone" 
  ON exercises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create exercises" ON exercises;
CREATE POLICY "Users can create exercises" 
  ON exercises FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own unverified exercises" ON exercises;
CREATE POLICY "Users can update their own unverified exercises" 
  ON exercises FOR UPDATE USING (auth.uid() = created_by AND is_verified = FALSE);

-- Routines Policies
DROP POLICY IF EXISTS "Users can view own routines" ON routines;
CREATE POLICY "Users can view own routines" 
  ON routines FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

DROP POLICY IF EXISTS "Users can create routines" ON routines;
CREATE POLICY "Users can create routines" 
  ON routines FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own routines" ON routines;
CREATE POLICY "Users can update own routines" 
  ON routines FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own routines" ON routines;
CREATE POLICY "Users can delete own routines" 
  ON routines FOR DELETE USING (auth.uid() = user_id);

-- Routine Exercises Policies (Inherit from Routine)
DROP POLICY IF EXISTS "Users can view routine exercises for visible routines" ON routine_exercises;
CREATE POLICY "Users can view routine exercises for visible routines" 
  ON routine_exercises FOR SELECT USING (
    EXISTS (SELECT 1 FROM routines WHERE routines.id = routine_exercises.routine_id AND (routines.user_id = auth.uid() OR routines.is_public = TRUE))
  );

DROP POLICY IF EXISTS "Users can manage exercises in own routines" ON routine_exercises;
CREATE POLICY "Users can manage exercises in own routines" 
  ON routine_exercises FOR ALL USING (
    EXISTS (SELECT 1 FROM routines WHERE routines.id = routine_exercises.routine_id AND routines.user_id = auth.uid())
  );

-- Workout Sessions Policies
DROP POLICY IF EXISTS "Users manage own sessions" ON workout_sessions;
CREATE POLICY "Users manage own sessions" 
  ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- Workout Logs Policies (Inherit from Session)
DROP POLICY IF EXISTS "Users manage own logs" ON workout_logs;
CREATE POLICY "Users manage own logs" 
  ON workout_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = workout_logs.session_id AND workout_sessions.user_id = auth.uid())
  );

-- TRIGGERS & FUNCTIONS

-- Function to handle new user creation (Supabase Auth Hook)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
BEGIN
  -- Fallback to part of email if username meta is missing
  default_username := COALESCE(
    new.raw_user_meta_data->>'username', 
    SPLIT_PART(new.email, '@', 1)
  );

  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id, 
    default_username,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to allow re-running script safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger to call the function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_routines_modtime ON routines;
CREATE TRIGGER update_routines_modtime BEFORE UPDATE ON routines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- STORAGE SETUP
-- You must enable Storage in your Supabase Dashboard first.
-- This SQL attempts to insert the bucket configuration.

INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercise-media', 'exercise-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Allow public access to view images
CREATE POLICY "Public Access" 
  ON storage.objects FOR SELECT 
  USING ( bucket_id = 'exercise-media' );

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated Upload" 
  ON storage.objects FOR INSERT 
  WITH CHECK ( bucket_id = 'exercise-media' AND auth.role() = 'authenticated' );

-- Allow users to update/delete their own uploads (optional, simplistic check based on owner)
CREATE POLICY "Users manage own media"
  ON storage.objects FOR ALL
  USING ( bucket_id = 'exercise-media' AND auth.uid() = owner );
