-- CAPSÉRA customer profiles: one row per auth.users account. Passwords are never stored here (Supabase Auth
-- keeps them, hashed, in auth.users). Safe to run more than once.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Adapt an existing profiles table (e.g. from the Supabase starter template) instead of duplicating it.
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Same limits as lib/account-profile.ts.
alter table public.profiles drop constraint if exists profiles_full_name_length;
alter table public.profiles add constraint profiles_full_name_length
  check (full_name is null or char_length(full_name) between 1 and 100);
alter table public.profiles drop constraint if exists profiles_phone_format;
alter table public.profiles add constraint profiles_phone_format
  check (phone is null or phone ~ '^\+?[0-9(][0-9 ()-]{5,18}[0-9]$');

-- Row Level Security: customers can see and change only their own profile.
alter table public.profiles enable row level security;

-- The Supabase starter template makes every profile public; that conflicts with "own profile only".
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;

drop policy if exists "Customers can read their own profile" on public.profiles;
create policy "Customers can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Customers can create their own profile" on public.profiles;
create policy "Customers can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Customers can update their own profile" on public.profiles;
create policy "Customers can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Deliberate table privileges (RLS still applies on top): signed-out visitors get nothing; customers can read,
-- create and update (no delete: the profile goes when the account is deleted, via ON DELETE CASCADE).
revoke all on table public.profiles from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;

-- Keep updated_at current.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create the profile when someone signs up, with the name given on the sign-up form (user metadata full_name).
-- SECURITY DEFINER so it can write past RLS; it only ever inserts the new user's own row and never fails sign-up
-- over a bad name (the name is trimmed, cut to 100 characters, and left empty if blank).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(left(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 100), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts created before this trigger existed get their profile now.
insert into public.profiles (id, full_name)
select u.id, nullif(left(btrim(coalesce(u.raw_user_meta_data ->> 'full_name', '')), 100), '')
from auth.users u
on conflict (id) do nothing;
