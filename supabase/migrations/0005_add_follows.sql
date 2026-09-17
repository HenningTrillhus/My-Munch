create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

create policy "Users can follow as themselves"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow their own follows"
  on public.follows for delete
  using (auth.uid() = follower_id);
