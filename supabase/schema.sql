-- Habora schema. Run this in the Supabase SQL editor.
do $$
begin
  create type public.asset_kind as enum ('property', 'appliance', 'vehicle', 'subscription', 'document', 'other');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.assets (
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

create table if not exists public.reminders (
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

drop policy if exists "Users manage their own assets" on public.assets;
create policy "Users manage their own assets" on public.assets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage their own reminders" on public.reminders;
create policy "Users manage their own reminders" on public.reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists assets_user_created_at_idx on public.assets (user_id, created_at desc);
create index if not exists assets_user_kind_idx on public.assets (user_id, kind);
create index if not exists reminders_user_due_date_idx on public.reminders (user_id, due_date) where completed_at is null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assets_set_updated_at on public.assets;
create trigger assets_set_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

notify pgrst, 'reload schema';
