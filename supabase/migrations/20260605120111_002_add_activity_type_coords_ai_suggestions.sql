-- Add activity_type, latitude, longitude to activities
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS activity_type text DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

-- AI suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  prompt_text text DEFAULT '',
  response_json jsonb,
  model_used text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_ai_suggestions" ON ai_suggestions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = ai_suggestions.trip_id AND trips.user_id = auth.uid())
  );
CREATE POLICY "insert_own_ai_suggestions" ON ai_suggestions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = ai_suggestions.trip_id AND trips.user_id = auth.uid())
  );
CREATE POLICY "update_own_ai_suggestions" ON ai_suggestions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = ai_suggestions.trip_id AND trips.user_id = auth.uid())
  );
CREATE POLICY "delete_own_ai_suggestions" ON ai_suggestions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = ai_suggestions.trip_id AND trips.user_id = auth.uid())
  );
