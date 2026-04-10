-- Create albums table
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE NOT NULL,
  imagekit_file_id TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - Modify policies as per your security needs
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read and insert (you can customize this)
CREATE POLICY "Users can create their own albums" ON albums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own albums" ON albums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own albums" ON albums FOR DELETE USING (auth.uid() = user_id);

-- For prototype/ease-of-use, if you don't even have user auth set up yet, you can just use open policies:
-- CREATE POLICY "allow_all" ON albums FOR ALL USING (true);
-- CREATE POLICY "allow_all_images" ON images FOR ALL USING (true);

CREATE POLICY "Users can create images" ON images FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM albums WHERE id = album_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view their images" ON images FOR SELECT USING (
  EXISTS (SELECT 1 FROM albums WHERE id = album_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete their images" ON images FOR DELETE USING (
  EXISTS (SELECT 1 FROM albums WHERE id = album_id AND user_id = auth.uid())
);
