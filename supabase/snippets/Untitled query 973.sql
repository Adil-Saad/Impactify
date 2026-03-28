-- 1. Create Profiles for Users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Quests Table
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'Litter', 'Shopping', 'Pothole', etc.
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  w3w_address TEXT, -- What3Words for deliveries
  reward_points INTEGER DEFAULT 20,
  tip_amount DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'open', -- 'open', 'active', 'completed'
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Set up Row Level Security (RLS) 
-- This makes the database secure by default
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view quests
CREATE POLICY "Quests are viewable by everyone" ON public.quests 
  FOR SELECT USING (true);

-- Allow authenticated users to create quests
CREATE POLICY "Users can create quests" ON public.quests 
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 4. Enable Realtime (This makes the "Kindness Pulse" map work!)
ALTER PUBLICATION supabase_realtime ADD TABLE public.quests;