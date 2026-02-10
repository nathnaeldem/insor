-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  hint TEXT NOT NULL,
  question TEXT NOT NULL,
  yes_message TEXT NOT NULL DEFAULT 'You''ve made me the happiest person alive! 💍❤️',
  no_message TEXT NOT NULL DEFAULT 'I understand. Thank you for being honest with me. 💔',
  response TEXT CHECK (response IN ('yes', 'no')),
  email TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since proposals are shared via QR)
-- Anyone can create a proposal
CREATE POLICY "Anyone can create proposals"
  ON proposals
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anyone can read proposals (needed for QR code access)
CREATE POLICY "Anyone can read proposals"
  ON proposals
  FOR SELECT
  TO anon
  USING (true);

-- Anyone can update the response (for answering)
CREATE POLICY "Anyone can update proposal response"
  ON proposals
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS proposals_id_idx ON proposals(id);
