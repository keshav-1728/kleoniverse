-- Create wishlists table if it doesn't exist
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own wishlist
DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlists;
CREATE POLICY "Users can view own wishlist" ON wishlists
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own wishlist
DROP POLICY IF EXISTS "Users can insert own wishlist" ON wishlists;
CREATE POLICY "Users can insert own wishlist" ON wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own wishlist
DROP POLICY IF EXISTS "Users can delete own wishlist" ON wishlists;
CREATE POLICY "Users can delete own wishlist" ON wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- Verify table exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wishlists';