-- TapCheck database schema

-- Cached water quality lookups
CREATE TABLE IF NOT EXISTS lookups (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('green', 'yellow', 'red', 'gray')),
  summary TEXT NOT NULL,
  system_name TEXT,
  violation_count INTEGER NOT NULL DEFAULT 0,
  violations_json JSONB DEFAULT '[]',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lookups_city_state ON lookups (city, state);
CREATE INDEX idx_lookups_checked_at ON lookups (checked_at DESC);

-- Recommendations per status level
CREATE TABLE IF NOT EXISTS recommendations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('green', 'yellow', 'red', 'gray')),
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Seed default recommendations
INSERT INTO recommendations (status, title, description) VALUES
  ('green', 'Stay informed', 'Your water meets safety standards. Review your utility''s annual Consumer Confidence Report for detailed testing results.'),
  ('green', 'Basic maintenance', 'Run cold water for 30 seconds before drinking if taps have been unused for several hours, especially in older homes.'),
  ('yellow', 'Check your CCR', 'Request your utility''s Consumer Confidence Report to understand what violations were found and how they were addressed.'),
  ('yellow', 'Consider a filter', 'An NSF-certified water filter can provide an extra layer of protection. Choose one rated for the specific contaminants of concern.'),
  ('yellow', 'Test your water', 'Home test kits or lab testing can tell you exactly what''s in your tap water. Contact your local health department for guidance.'),
  ('red', 'Use an alternative source', 'Consider using bottled water or a certified filtration system for drinking and cooking until violations are resolved.'),
  ('red', 'Contact your utility', 'Call your water utility to ask about the specific violations, corrective actions being taken, and expected timeline for resolution.'),
  ('red', 'Get your water tested', 'Have your water independently tested by a state-certified lab to understand your specific exposure levels.'),
  ('red', 'Report concerns', 'Contact your state drinking water agency or the EPA Safe Drinking Water Hotline at 1-800-426-4791.'),
  ('gray', 'Try a different search', 'Your city name may not match EPA records exactly. Try the county name or a nearby larger city.'),
  ('gray', 'Check directly with EPA', 'Search the EPA SDWIS database directly at epa.gov/enviro for your water system.');

-- Row Level Security
ALTER TABLE lookups ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read on lookups" ON lookups FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert on lookups" ON lookups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous read on recommendations" ON recommendations FOR SELECT USING (true);
