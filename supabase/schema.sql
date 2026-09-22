-- Habora schema. Run this in the Supabase SQL editor.
do $$
begin
  create type public.asset_kind as enum ('property', 'appliance', 'vehicle', 'subscription', 'document', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.repair_status as enum ('planned', 'in_progress', 'completed', 'cancelled');
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

create table if not exists public.repairs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  asset_id uuid references public.assets(id) on delete set null,
  title text not null,
  description text,
  provider text,
  scheduled_date date,
  cost numeric(12,2),
  status public.repair_status not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  provider text,
  amount numeric(12,2),
  billing_cycle text not null default 'monthly',
  next_billing_date date,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  asset_id uuid references public.assets(id) on delete set null,
  name text not null,
  document_type text not null default 'other',
  storage_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assets enable row level security;
alter table public.reminders enable row level security;
alter table public.repairs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.documents enable row level security;

drop policy if exists "Users manage their own assets" on public.assets;
drop policy if exists "Users read their own assets" on public.assets;
drop policy if exists "Users create their own assets" on public.assets;
drop policy if exists "Users update their own assets" on public.assets;
drop policy if exists "Users delete their own assets" on public.assets;
create policy "Users read their own assets" on public.assets for select using (auth.uid() = user_id);
create policy "Users create their own assets" on public.assets for insert with check (auth.uid() = user_id);
create policy "Users update their own assets" on public.assets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own assets" on public.assets for delete using (auth.uid() = user_id);

drop policy if exists "Users manage their own reminders" on public.reminders;
drop policy if exists "Users read their own reminders" on public.reminders;
drop policy if exists "Users create their own reminders" on public.reminders;
drop policy if exists "Users update their own reminders" on public.reminders;
drop policy if exists "Users delete their own reminders" on public.reminders;
create policy "Users read their own reminders" on public.reminders for select using (auth.uid() = user_id);
create policy "Users create their own reminders" on public.reminders for insert with check (auth.uid() = user_id);
create policy "Users update their own reminders" on public.reminders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own reminders" on public.reminders for delete using (auth.uid() = user_id);

drop policy if exists "Users manage their own repairs" on public.repairs;
drop policy if exists "Users read their own repairs" on public.repairs;
drop policy if exists "Users create their own repairs" on public.repairs;
drop policy if exists "Users update their own repairs" on public.repairs;
drop policy if exists "Users delete their own repairs" on public.repairs;
create policy "Users read their own repairs" on public.repairs for select using (auth.uid() = user_id);
create policy "Users create their own repairs" on public.repairs for insert with check (auth.uid() = user_id);
create policy "Users update their own repairs" on public.repairs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own repairs" on public.repairs for delete using (auth.uid() = user_id);

drop policy if exists "Users manage their own subscriptions" on public.subscriptions;
drop policy if exists "Users read their own subscriptions" on public.subscriptions;
drop policy if exists "Users create their own subscriptions" on public.subscriptions;
drop policy if exists "Users update their own subscriptions" on public.subscriptions;
drop policy if exists "Users delete their own subscriptions" on public.subscriptions;
create policy "Users read their own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users create their own subscriptions" on public.subscriptions for insert with check (auth.uid() = user_id);
create policy "Users update their own subscriptions" on public.subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own subscriptions" on public.subscriptions for delete using (auth.uid() = user_id);

drop policy if exists "Users manage their own documents" on public.documents;
drop policy if exists "Users read their own documents" on public.documents;
drop policy if exists "Users create their own documents" on public.documents;
drop policy if exists "Users update their own documents" on public.documents;
drop policy if exists "Users delete their own documents" on public.documents;
create policy "Users read their own documents" on public.documents for select using (auth.uid() = user_id);
create policy "Users create their own documents" on public.documents for insert with check (auth.uid() = user_id);
create policy "Users update their own documents" on public.documents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete their own documents" on public.documents for delete using (auth.uid() = user_id);

create index if not exists assets_user_created_at_idx on public.assets (user_id, created_at desc);
create index if not exists assets_user_kind_idx on public.assets (user_id, kind);
create index if not exists reminders_user_due_date_idx on public.reminders (user_id, due_date) where completed_at is null;
create index if not exists repairs_user_scheduled_date_idx on public.repairs (user_id, scheduled_date);
create index if not exists repairs_user_status_idx on public.repairs (user_id, status);
create index if not exists subscriptions_user_next_billing_idx on public.subscriptions (user_id, next_billing_date);
create index if not exists documents_user_created_at_idx on public.documents (user_id, created_at desc);

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

drop trigger if exists repairs_set_updated_at on public.repairs;
create trigger repairs_set_updated_at
before update on public.repairs
for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

notify pgrst, 'reload schema';

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Users read their own document files" on storage.objects;
drop policy if exists "Users upload their own document files" on storage.objects;
drop policy if exists "Users delete their own document files" on storage.objects;
create policy "Users read their own document files" on storage.objects for select using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users upload their own document files" on storage.objects for insert with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete their own document files" on storage.objects for delete using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
