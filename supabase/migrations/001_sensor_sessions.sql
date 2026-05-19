-- Sensor Box OS — session storage
-- Run in Supabase SQL Editor or via CLI: supabase db push

-- Optional: enable UUID generation
create extension if not exists "pgcrypto";

create table if not exists public.sensor_sessions (
  id uuid primary key default gen_random_uuid(),

  -- Client-generated session id (matches app RecordingSession.id)
  client_session_id text not null unique,

  started_at timestamptz not null,
  ended_at timestamptz not null,

  duration_ms integer not null check (duration_ms >= 0),
  sample_count integer not null default 0 check (sample_count >= 0),

  -- e.g. ["temperature","humidity","pressure","volatileGas"]
  selected_metrics text[] not null default '{}',

  -- Full time series: [{ timestamp, temperature?, humidity?, pressure?, volatileGas?, ... }]
  readings jsonb not null default '[]'::jsonb,

  -- Optional metadata for future auth / multi-device
  device_label text,
  app_version text,

  created_at timestamptz not null default now()
);

create index if not exists sensor_sessions_started_at_idx
  on public.sensor_sessions (started_at desc);

create index if not exists sensor_sessions_created_at_idx
  on public.sensor_sessions (created_at desc);

-- GIN index for querying readings (optional analytics)
create index if not exists sensor_sessions_readings_gin_idx
  on public.sensor_sessions using gin (readings);

comment on table public.sensor_sessions is
  'Environmental recording sessions from Sensor Box OS desktop app';

-- Row Level Security (anon key can insert; tighten when you add auth)
alter table public.sensor_sessions enable row level security;

create policy "Allow anonymous insert"
  on public.sensor_sessions
  for insert
  to anon, authenticated
  with check (true);

create policy "Allow anonymous read own sessions by client id"
  on public.sensor_sessions
  for select
  to anon, authenticated
  using (true);

-- For production with auth, replace policies with user_id checks, e.g.:
-- alter table public.sensor_sessions add column user_id uuid references auth.users(id);
-- create policy "Users read own sessions" on public.sensor_sessions for select using (auth.uid() = user_id);
