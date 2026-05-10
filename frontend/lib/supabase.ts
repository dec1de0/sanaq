import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Real Supabase project URLs look like https://abcdefghijklmnop.supabase.co
// Reject obvious placeholders: "xxxx", "your-project", short slugs, etc.
const PLACEHOLDER = /xxxx|your-project|^$/i;
export const isConfigured =
  Boolean(url && key && !PLACEHOLDER.test(url) && url.startsWith("https://") && key.length > 20);

// Only create a real client when configured; otherwise use a dummy that never fires
export const supabase = isConfigured
  ? createClient(url, key)
  : createClient("https://placeholder.supabase.co", "placeholder");

// ── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  is_pro: boolean;
  city: string | null;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  last_played_date: string | null;
  total_solved: number;
  created_at: string;
}

export interface GameRow {
  id?: string;
  user_id: string;
  puzzle_id: string;
  mode: string;
  difficulty: string;
  time_seconds: number;
  mistakes: number;
  completed: boolean;
  completed_at?: string | null;
}

// ── Profile helpers ──────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data ?? null;
}

export async function upsertProfile(
  userId: string,
  fields: Partial<Omit<Profile, "id" | "created_at">>
): Promise<void> {
  await supabase.from("profiles").upsert({ id: userId, ...fields });
}

export async function unlockPro(userId: string): Promise<void> {
  await supabase.from("profiles").update({ is_pro: true }).eq("id", userId);
}

// ── Game helpers ─────────────────────────────────────────────────────────────

export async function saveGame(row: GameRow): Promise<void> {
  await supabase.from("games").insert(row);
}

export async function getUserGames(userId: string): Promise<GameRow[]> {
  const { data } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getStats(userId: string) {
  const games = await getUserGames(userId);
  const completed = games.filter((g) => g.completed);
  const byDiff: Record<string, number[]> = {};
  for (const g of completed) {
    (byDiff[g.difficulty] ??= []).push(g.time_seconds);
  }
  return {
    total_solved: completed.length,
    total_played: games.length,
    win_rate: games.length ? Math.round((completed.length / games.length) * 100) : 0,
    avg_time_by_difficulty: Object.fromEntries(
      Object.entries(byDiff).map(([d, ts]) => [d, Math.round(ts.reduce((a, b) => a + b, 0) / ts.length)])
    ),
    best_time_by_difficulty: Object.fromEntries(
      Object.entries(byDiff).map(([d, ts]) => [d, Math.min(...ts)])
    ),
  };
}

// ── Streak ───────────────────────────────────────────────────────────────────

export async function updateStreak(userId: string): Promise<void> {
  // Uses the DB function defined in schema.sql
  await supabase.rpc("update_streak", { uid: userId });
}
