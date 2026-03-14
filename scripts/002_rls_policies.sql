-- Enable RLS on all tables
alter table facilities enable row level security;
alter table profiles enable row level security;
alter table equipment enable row level security;
alter table sensors enable row level security;
alter table sensor_readings enable row level security;
alter table predictions enable row level security;
alter table alerts enable row level security;
alter table work_orders enable row level security;
alter table maintenance_history enable row level security;

-- Facilities: all authenticated users can read
create policy "Authenticated users can read facilities" on facilities
  for select to authenticated using (true);

-- Profiles: users can read all, update own
create policy "Authenticated users can read profiles" on profiles
  for select to authenticated using (true);

create policy "Users can update own profile" on profiles
  for update to authenticated using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert to authenticated with check (auth.uid() = id);

-- Equipment: all authenticated can read
create policy "Authenticated users can read equipment" on equipment
  for select to authenticated using (true);

-- Sensors: all authenticated can read
create policy "Authenticated users can read sensors" on sensors
  for select to authenticated using (true);

-- Sensor Readings: all authenticated can read
create policy "Authenticated users can read sensor_readings" on sensor_readings
  for select to authenticated using (true);

-- Predictions: all authenticated can read
create policy "Authenticated users can read predictions" on predictions
  for select to authenticated using (true);

-- Alerts: all authenticated can read, update
create policy "Authenticated users can read alerts" on alerts
  for select to authenticated using (true);

create policy "Authenticated users can update alerts" on alerts
  for update to authenticated using (true);

-- Work Orders: all authenticated can read, insert, update
create policy "Authenticated users can read work_orders" on work_orders
  for select to authenticated using (true);

create policy "Authenticated users can create work_orders" on work_orders
  for insert to authenticated with check (true);

create policy "Authenticated users can update work_orders" on work_orders
  for update to authenticated using (true);

-- Maintenance History: all authenticated can read
create policy "Authenticated users can read maintenance_history" on maintenance_history
  for select to authenticated using (true);
