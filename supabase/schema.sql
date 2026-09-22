-- Habora starter schema. Run this in the Supabase SQL editor after creating a project.
create type public.asset_kind as enum ('property', 'appliance', 'vehicle', 'subscription', 'document', 'other');

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  kind public.asset_kind not null default 'other',
  description text,
  purchase_date date,
  purchase_price numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  asset_id uuid references public.assets(id) on delete cascade,
  title text not null,
  due_date date not null,
  completed_at timestamptz,
  recurrence text,
  created_at timestamptz not null default now()
);

alter table public.assets enable row level security;
alter table public.reminders enable row level security;

create policy "Users manage their own assets" on public.assets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own reminders" on public.reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
