-- Recipes table: one row per recipe, owned by the user who created it.
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  meal_type text,
  prep_time_minutes integer,
  categories text[] not null default '{}',
  is_vegetarian boolean not null default false,
  is_fish boolean not null default false,
  portions integer not null default 1,
  price_kr numeric,
  difficulty smallint check (difficulty between 1 and 5),
  personal_rating smallint check (personal_rating between 1 and 5),
  image_url text,
  ingredients jsonb not null default '[]',
  instructions text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

create policy "Recipes are viewable by everyone"
  on public.recipes for select
  using (true);

create policy "Users can insert their own recipes"
  on public.recipes for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own recipes"
  on public.recipes for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own recipes"
  on public.recipes for delete
  using (auth.uid() = owner_id);

-- Recipe images, stored under "<user id>/<filename>" so ownership can be
-- checked from the path alone.
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

create policy "Recipe images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "Users can upload their own recipe images"
  on storage.objects for insert
  with check (
    bucket_id = 'recipe-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own recipe images"
  on storage.objects for update
  using (
    bucket_id = 'recipe-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own recipe images"
  on storage.objects for delete
  using (
    bucket_id = 'recipe-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
