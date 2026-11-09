-- Receipt Accountant schema. Run in the Supabase SQL editor.
-- Relies on Supabase Auth (auth.users) for user accounts.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '🧾',
  color text not null default '#a855f7',
  monthly_budget numeric(12,2),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  raw_extraction jsonb,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  date date not null,
  merchant text,
  description text,
  category_id uuid references categories(id) on delete set null,
  receipt_id uuid references receipts(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null, -- first day of month
  target_amount numeric(12,2) not null,
  unique (user_id, month)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  content_md text not null,
  tips jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

create index if not exists transactions_user_date_idx on transactions (user_id, date desc);
create index if not exists receipts_user_status_idx on receipts (user_id, status);

alter table categories enable row level security;
alter table receipts enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table reports enable row level security;

create policy "own rows" on categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on receipts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows" on reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Private storage bucket for receipt images. Create once:
-- insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false);
create policy "own receipt files read" on storage.objects for select
  using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "own receipt files write" on storage.objects for insert
  with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "own receipt files delete" on storage.objects for delete
  using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

-- Seed categories for a new user. Call from the app on first sign-in (see lib/categories.ts).
