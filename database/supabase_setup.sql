-- Supabase SQL setup
-- Run this in your Supabase SQL editor

-- Create blog_summaries table
CREATE TABLE IF NOT EXISTS blog_summaries (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  summary_urdu TEXT NOT NULL,
  url TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  original_length INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_summaries_created_at ON blog_summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_summaries_url ON blog_summaries(url);

-- Enable Row Level Security (optional, for security)
ALTER TABLE blog_summaries ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for now (you can customize this)
CREATE POLICY "Allow all operations on blog_summaries" ON blog_summaries
  FOR ALL USING (true);
