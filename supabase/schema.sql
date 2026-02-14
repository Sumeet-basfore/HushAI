-- Create research_sessions table
CREATE TABLE IF NOT EXISTS research_sessions (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  source_types TEXT[] DEFAULT '{}',
  results JSONB DEFAULT '[]',
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON research_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_updated_at ON research_sessions(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON research_sessions
  FOR SELECT USING (auth.uid()::text = user_id OR user_id IS NULL);

-- Create policy: Users can only insert their own sessions
CREATE POLICY "Users can insert own sessions" ON research_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

-- Create policy: Users can only update their own sessions
CREATE POLICY "Users can update own sessions" ON research_sessions
  FOR UPDATE USING (auth.uid()::text = user_id OR user_id IS NULL);

-- Create policy: Users can only delete their own sessions
CREATE POLICY "Users can delete own sessions" ON research_sessions
  FOR DELETE USING (auth.uid()::text = user_id OR user_id IS NULL);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_research_sessions_updated_at ON research_sessions;
CREATE TRIGGER update_research_sessions_updated_at
  BEFORE UPDATE ON research_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
