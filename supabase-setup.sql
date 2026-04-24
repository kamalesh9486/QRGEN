-- Run this in Supabase SQL Editor (https://supabase.com → SQL Editor)

create table if not exists training_entries (
  id          uuid         primary key default gen_random_uuid(),
  code        text         not null unique,
  title       text         not null,
  trainer     text         not null,
  date        text         not null,
  venue       text,
  notes       text,
  full_url    text         not null,
  created_at  timestamptz  not null default now()
);

-- Enable Row Level Security
alter table training_entries enable row level security;

-- Allow anonymous users to read all entries
create policy "anon_read" on training_entries
  for select using (true);

-- Allow anonymous users to insert
create policy "anon_insert" on training_entries
  for insert with check (true);

-- Allow anonymous users to delete
create policy "anon_delete" on training_entries
  for delete using (true);

-- Enable real-time for live updates in History tab
alter publication supabase_realtime add table training_entries;
