-- Create a public bucket for quest photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('quest-photos', 'quest-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload quest photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'quest-photos');

-- Allow anyone to read quest photos
CREATE POLICY "Quest photos are publicly readable" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'quest-photos');

-- Allow owners to delete their own photos
CREATE POLICY "Users can delete own quest photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'quest-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add adventurer_id to quests for when someone accepts
ALTER TABLE quests ADD COLUMN IF NOT EXISTS adventurer_id UUID REFERENCES profiles(id);
