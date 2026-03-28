-- quest_interactions table
CREATE TABLE IF NOT EXISTS quest_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  adventurer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  proof_photo TEXT,
  status TEXT DEFAULT 'pending_approval', -- pending_approval, verified, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_interactions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Quests: anyone authenticated can read, only creator can update/delete
CREATE POLICY "Quests are viewable by everyone" ON quests
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create quests" ON quests
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own quests" ON quests
  FOR UPDATE USING (auth.uid() = created_by);

-- Quest Interactions: users can see their own, create their own
CREATE POLICY "Users can view own interactions" ON quest_interactions
  FOR SELECT USING (auth.uid() = adventurer_id);

CREATE POLICY "Users can create interactions" ON quest_interactions
  FOR INSERT WITH CHECK (auth.uid() = adventurer_id);

-- Admin policy: admins can do everything on quests
CREATE POLICY "Admins can manage all quests" ON quests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Auto-create profile on user signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, is_admin)
  VALUES (new.id, new.raw_user_meta_data->>'username', false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Realtime for quest_interactions too
ALTER PUBLICATION supabase_realtime ADD TABLE quest_interactions;
