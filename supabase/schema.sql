-- ================================================================
-- Sanaq – Supabase Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ================================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  username         text unique not null,
  is_pro           boolean not null default false,
  city             text,
  avatar_url       text,
  current_streak   int not null default 0,
  longest_streak   int not null default 0,
  last_played_date date,
  total_solved     int not null default 0,
  created_at       timestamptz not null default now()
);

-- Auto-create a minimal profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. GAMES
create table if not exists public.games (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  puzzle_id    text not null,
  mode         text not null check (mode in ('classic','wrong_notes','training')),
  difficulty   text not null check (difficulty in ('easy','medium','hard','expert')),
  time_seconds int not null,
  mistakes     int not null default 0,
  completed    boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);


-- 3. DAILY_PUZZLES (for seeding)
create table if not exists public.daily_puzzles (
  date     date primary key,
  board    jsonb not null,
  solution jsonb not null,
  seed     int
);


-- 4. LEADERBOARD  (populated by backend or DB function)
create table if not exists public.leaderboard (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  date         date not null,
  time_seconds int not null,
  mistakes     int not null default 0,
  rank         int,
  unique (user_id, date)
);


-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table public.profiles      enable row level security;
alter table public.games         enable row level security;
alter table public.daily_puzzles enable row level security;
alter table public.leaderboard   enable row level security;

-- Profiles: users can read/update their own row
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Games: users manage their own games; everyone can read completed games for leaderboard
create policy "games_insert_own"    on public.games for insert with check (auth.uid() = user_id);
create policy "games_select_own"    on public.games for select using (auth.uid() = user_id);
create policy "games_update_own"    on public.games for update using (auth.uid() = user_id);

-- Daily puzzles: public read
create policy "daily_public_read"   on public.daily_puzzles for select using (true);

-- Leaderboard: public read
create policy "lb_public_read"      on public.leaderboard for select using (true);
create policy "lb_insert_own"       on public.leaderboard for insert with check (auth.uid() = user_id);
create policy "lb_update_own"       on public.leaderboard for update using (auth.uid() = user_id);


-- ================================================================
-- HELPER FUNCTION: update streak after puzzle completion
-- Call from frontend via rpc('update_streak', { uid: userId })
-- ================================================================
create or replace function public.update_streak(uid uuid)
returns void language plpgsql security definer as $$
declare
  p        public.profiles;
  today    date := current_date;
  yesterday date := current_date - interval '1 day';
  new_streak int;
begin
  select * into p from public.profiles where id = uid;
  if not found then return; end if;

  -- Already counted today
  if p.last_played_date = today then return; end if;

  if p.last_played_date = yesterday then
    new_streak := p.current_streak + 1;
  else
    new_streak := 1;
  end if;

  update public.profiles set
    current_streak   = new_streak,
    longest_streak   = greatest(new_streak, p.longest_streak),
    last_played_date = today,
    total_solved     = p.total_solved + 1
  where id = uid;
end;
$$;
