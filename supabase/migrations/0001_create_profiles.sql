-- Profiles table: one row per auth.users, holding the public username and name.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null check (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Lets the login form resolve a typed-in username to an email address so
-- users can sign in with either. security definer is required because
-- auth.users isn't otherwise readable by the anon/authenticated roles.
create or replace function public.email_for_username(uname text)
returns text
language sql
security definer
set search_path = ''
as $$
  select au.email
  from public.profiles p
  join auth.users au on au.id = p.id
  where p.username = uname
  limit 1;
$$;

grant execute on function public.email_for_username(text) to anon, authenticated;
