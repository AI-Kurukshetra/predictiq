-- Facilities
create table if not exists facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  description text,
  created_at timestamptz default now()
);

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'technician',
  facility_id uuid references facilities(id),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Equipment
create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references facilities(id) on delete cascade,
  name text not null,
  type text not null,
  model text,
  serial_number text,
  location_zone text,
  install_date date,
  health_score integer not null default 100,
  status text not null default 'healthy',
  last_maintenance date,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sensors
create table if not exists sensors (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid references equipment(id) on delete cascade,
  type text not null,
  unit text not null,
  min_threshold float,
  max_threshold float,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Sensor Readings
create table if not exists sensor_readings (
  id uuid primary key default gen_random_uuid(),
  sensor_id uuid references sensors(id) on delete cascade,
  equipment_id uuid references equipment(id) on delete cascade,
  value float not null,
  is_anomaly boolean default false,
  recorded_at timestamptz not null default now()
);

create index if not exists idx_readings_sensor_time on sensor_readings(sensor_id, recorded_at desc);
create index if not exists idx_readings_equipment_time on sensor_readings(equipment_id, recorded_at desc);

-- Predictions
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid references equipment(id) on delete cascade,
  failure_type text not null,
  confidence float not null,
  predicted_failure_date timestamptz,
  days_until_failure integer,
  severity text not null default 'medium',
  contributing_factors jsonb,
  recommended_action text,
  status text not null default 'active',
  created_at timestamptz default now()
);

-- Alerts
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid references equipment(id) on delete cascade,
  type text not null,
  severity text not null,
  title text not null,
  message text not null,
  status text not null default 'new',
  acknowledged_by uuid references auth.users(id),
  acknowledged_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_alerts_status on alerts(status, severity);

-- Work Orders
create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid references equipment(id) on delete cascade,
  prediction_id uuid references predictions(id),
  alert_id uuid references alerts(id),
  title text not null,
  description text,
  priority text not null default 'medium',
  status text not null default 'open',
  assigned_to uuid references auth.users(id),
  assigned_to_name text,
  due_date timestamptz,
  completed_at timestamptz,
  notes text,
  estimated_cost float,
  actual_cost float,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Maintenance History
create table if not exists maintenance_history (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid references equipment(id) on delete cascade,
  work_order_id uuid references work_orders(id),
  type text not null,
  description text not null,
  performed_by uuid references auth.users(id),
  performed_by_name text,
  cost float,
  downtime_hours float,
  performed_at timestamptz default now()
);
