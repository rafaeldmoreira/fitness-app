-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Extends auth.users with public profile info and gamification stats
CREATE TABLE profiles (
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
CREATE TABLE exercises (
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
CREATE TABLE routines (
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
CREATE TABLE routine_exercises (
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
CREATE TABLE workout_sessions (
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
CREATE TABLE workout_logs (
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
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Exercises Policies
CREATE POLICY "Exercises are viewable by everyone" 
  ON exercises FOR SELECT USING (true);

CREATE POLICY "Users can create exercises" 
  ON exercises FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own unverified exercises" 
  ON exercises FOR UPDATE USING (auth.uid() = created_by AND is_verified = FALSE);

-- Routines Policies
CREATE POLICY "Users can view own routines" 
  ON routines FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create routines" 
  ON routines FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routines" 
  ON routines FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routines" 
  ON routines FOR DELETE USING (auth.uid() = user_id);

-- Routine Exercises Policies (Inherit from Routine)
CREATE POLICY "Users can view routine exercises for visible routines" 
  ON routine_exercises FOR SELECT USING (
    EXISTS (SELECT 1 FROM routines WHERE routines.id = routine_exercises.routine_id AND (routines.user_id = auth.uid() OR routines.is_public = TRUE))
  );

CREATE POLICY "Users can manage exercises in own routines" 
  ON routine_exercises FOR ALL USING (
    EXISTS (SELECT 1 FROM routines WHERE routines.id = routine_exercises.routine_id AND routines.user_id = auth.uid())
  );

-- Workout Sessions Policies
CREATE POLICY "Users manage own sessions" 
  ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- Workout Logs Policies (Inherit from Session)
CREATE POLICY "Users manage own logs" 
  ON workout_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = workout_logs.session_id AND workout_sessions.user_id = auth.uid())
  );

-- TRIGGERS & FUNCTIONS

-- Function to handle new user creation (Supabase Auth Hook)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', -- Assumes metadata passed from provider or client
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_routines_modtime BEFORE UPDATE ON routines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
