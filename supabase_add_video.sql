-- Add video_url column to proposals table
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS video_url TEXT;
