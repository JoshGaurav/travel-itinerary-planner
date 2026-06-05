-- Trips table
CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  notes text DEFAULT '',
  cover_image text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Itinerary days table
CREATE TABLE itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_date date NOT NULL,
  day_number int NOT NULL,
  notes text DEFAULT ''
);

-- Activities table
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id uuid NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  start_time time,
  end_time time,
  location text DEFAULT '',
  sort_order int DEFAULT 0
);

-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Trips policies
CREATE POLICY "select_own_trips" ON trips FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_trips" ON trips FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_trips" ON trips FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_trips" ON trips FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Itinerary days policies (via trip ownership)
CREATE POLICY "select_own_days" ON itinerary_days FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = itinerary_days.trip_id AND trips.user_id = auth.uid())
  );
CREATE POLICY "insert_own_days" ON itinerary_days FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = itinerary_days.trip_id AND trips.user_id = auth.uid())
  );
CREATE POLICY "update_own_days" ON itinerary_days FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = itinerary_days.trip_id AND trips.user_id = auth.uid())
  );
CREATE POLICY "delete_own_days" ON itinerary_days FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = itinerary_days.trip_id AND trips.user_id = auth.uid())
  );

-- Activities policies (via day -> trip ownership)
CREATE POLICY "select_own_activities" ON activities FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM itinerary_days
      JOIN trips ON trips.id = itinerary_days.trip_id
      WHERE itinerary_days.id = activities.day_id AND trips.user_id = auth.uid()
    )
  );
CREATE POLICY "insert_own_activities" ON activities FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM itinerary_days
      JOIN trips ON trips.id = itinerary_days.trip_id
      WHERE itinerary_days.id = activities.day_id AND trips.user_id = auth.uid()
    )
  );
CREATE POLICY "update_own_activities" ON activities FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM itinerary_days
      JOIN trips ON trips.id = itinerary_days.trip_id
      WHERE itinerary_days.id = activities.day_id AND trips.user_id = auth.uid()
    )
  );
CREATE POLICY "delete_own_activities" ON activities FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM itinerary_days
      JOIN trips ON trips.id = itinerary_days.trip_id
      WHERE itinerary_days.id = activities.day_id AND trips.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_itinerary_days_trip_id ON itinerary_days(trip_id);
CREATE INDEX idx_activities_day_id ON activities(day_id);
