-- Recipes previously only had a single "personal_rating" column meant for
-- the owner's own opinion of their own dish. Replaced with a proper
-- multi-user rating table so anyone can rate any recipe.
alter table public.recipes drop column if exists personal_rating;

-- profiles.id and auth.users.id are always equal (profiles rows are created
-- 1:1 with auth users at signup), so this additional FK lets PostgREST
-- embed the author's profile alongside a recipe/rating/comment without a
-- second round trip.
alter table public.recipes
  add constraint recipes_owner_profile_fkey
  foreign key (owner_id) references public.profiles (id) on delete cascade;

create table if not exists public.recipe_ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, user_id)
);

alter table public.recipe_ratings enable row level security;

create policy "Ratings are viewable by everyone"
  on public.recipe_ratings for select
  using (true);

create policy "Users can rate as themselves"
  on public.recipe_ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own rating"
  on public.recipe_ratings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own rating"
  on public.recipe_ratings for delete
  using (auth.uid() = user_id);

create table if not exists public.recipe_comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.recipe_comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.recipe_comments for select
  using (true);

create policy "Users can comment as themselves"
  on public.recipe_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
  on public.recipe_comments for delete
  using (auth.uid() = user_id);
