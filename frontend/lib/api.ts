const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sanaq_token");
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  sudoku: {
    generate: (difficulty: string, mode: string) =>
      request<GenerateResponse>(`/sudoku/generate?difficulty=${difficulty}&mode=${mode}`),
    daily: () => request<DailyResponse>("/sudoku/daily"),
    validate: (board: number[][], solution: number[][]) =>
      request<ValidateResponse>("/sudoku/validate", {
        method: "POST",
        body: JSON.stringify({ board, solution }),
      }),
  },
  ai: {
    hint: (payload: HintPayload) =>
      request<HintResponse>("/ai/hint", { method: "POST", body: JSON.stringify(payload) }),
    chat: (payload: ChatPayload) =>
      request<ChatResponse>("/ai/chat", { method: "POST", body: JSON.stringify(payload) }),
    analyze: (payload: AnalyzePayload) =>
      request<AnalyzeResponse>("/ai/analyze", { method: "POST", body: JSON.stringify(payload) }),
  },
  auth: {
    register: (email: string, password: string, username: string) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, username }),
      }),
    login: (email: string, password: string) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<User>("/auth/me"),
  },
  game: {
    save: (payload: SaveGamePayload) =>
      request("/game/save", { method: "POST", body: JSON.stringify(payload) }),
    history: () => request<{ games: Game[] }>("/game/history"),
    stats: () => request<Stats>("/game/stats"),
  },
  leaderboard: {
    global: (limit = 50) => request<LeaderboardResponse>(`/leaderboard/global?limit=${limit}`),
    daily: () => request<DailyLeaderboardResponse>("/leaderboard/daily"),
    city: (city: string) => request<LeaderboardResponse>(`/leaderboard/city?city=${encodeURIComponent(city)}`),
  },
};

// Types
export interface GenerateResponse {
  id: string;
  board: number[][];
  solution: number[][];
  difficulty: string;
  mode: string;
  wrong_notes?: Record<string, number[]>;
}

export interface DailyResponse {
  id: string;
  board: number[][];
  solution: number[][];
  date: string;
  players_today: number;
}

export interface ValidateResponse {
  valid: boolean;
  errors: { row: number; col: number }[];
}

export interface HintPayload {
  board: number[][];
  solution: number[][];
  row: number;
  col: number;
  question: string;
}

export interface HintResponse {
  explanation: string;
  strategy: string;
}

export interface ChatPayload {
  board: number[][];
  solution: number[][];
  message: string;
}

export interface ChatResponse {
  response: string;
}

export interface AnalyzePayload {
  puzzle: number[][];
  board: number[][];
  solution: number[][];
  mistakes: number;
  time_seconds: number;
  mode: string;
  difficulty: string;
  game_over: boolean;
}

export interface AnalyzeResponse {
  analysis: string;
  wrong_cells: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  username: string;
  is_pro: boolean;
  city?: string;
  avatar_url?: string;
  created_at: string;
}

export interface SaveGamePayload {
  puzzle_id: string;
  board_state: number[][];
  time_elapsed: number;
  mistakes: number;
  mode: string;
  difficulty: string;
  completed: boolean;
}

export interface Game {
  id: string;
  puzzle_id: string;
  mode: string;
  difficulty: string;
  time_seconds: number;
  mistakes: number;
  completed: boolean;
  completed_at?: string;
}

export interface Stats {
  total_solved: number;
  total_played: number;
  win_rate: number;
  avg_time_by_difficulty: Record<string, number>;
  best_time_by_difficulty: Record<string, number>;
  current_streak: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  city: string;
  games: number;
  avg_time: number;
  best_time: number;
  streak: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
}

export interface DailyLeaderboardResponse {
  date: string;
  leaderboard: LeaderboardEntry[];
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
