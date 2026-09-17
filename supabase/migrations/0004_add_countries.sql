-- Optional country fields: where a user is from, and where a dish is from.
alter table public.profiles add column if not exists country text;
alter table public.recipes add column if not exists country text;
