-- ─────────────────────────────────────────────────────────────────────────────
-- FRESH INSTALL — run this if you have no table yet
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists training_entries (
  id          uuid         primary key default gen_random_uuid(),
  code        text         not null unique,
  title       text         not null,
  trainer     text         not null,
  date        text         not null,
  time        text,
  venue       text,
  notes       text,
  full_url    text         not null,
  created_at  timestamptz  not null default now()
);

alter table training_entries enable row level security;

create policy "anon_read"   on training_entries for select using (true);
create policy "anon_insert" on training_entries for insert with check (true);
create policy "anon_delete" on training_entries for delete using (true);

alter publication supabase_realtime add table training_entries;


-- ─────────────────────────────────────────────────────────────────────────────
-- EXISTING TABLE MIGRATION — run this if you deployed before the time field
-- was added (skip if doing a fresh install above)
-- ─────────────────────────────────────────────────────────────────────────────

-- alter table training_entries add column if not exists time text;
