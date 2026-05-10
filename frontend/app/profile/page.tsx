"use client";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BackgroundNumbers } from "@/components/BackgroundNumbers";
import { Footer } from "@/components/Footer";
import clsx from "clsx";
import { Trophy, Flame, Target, LogOut, Crown, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SkinSelector } from "@/components/SkinSelector";
import { useAuth } from "@/hooks/useAuth";
import { usePro } from "@/hooks/usePro";
import { getStats, isConfigured } from "@/lib/supabase";
import { formatTime } from "@/lib/api";
import type { Skin } from "@/hooks/useGame";

const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;

// ─── Stats shape ──────────────────────────────────────────────────────────────
interface Stats {
  total_solved: number;
  total_played: number;
  win_rate: number;
  avg_time_by_difficulty: Record<string, number>;
  best_time_by_difficulty: Record<string, number>;
}

function ProfileInner() {
  const { user, profile, loading, signIn, signUp, signOut, refreshProfile } = useAuth();
  const { isPro, tryUnlock } = usePro(profile, refreshProfile);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stats, setStats]       = useState<Stats | null>(null);
  const [skin,  setSkin]        = useState<Skin>("default");
  const [mode,  setMode]        = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login"
  );
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [authErr,  setAuthErr]  = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (user) {
      getStats(user.id).then(setStats).catch(() => {});
    }
  }, [user]);

  // ── Auth submit ─────────────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErr("");
    setAuthBusy(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (!username.trim()) { setAuthErr("Username is required"); return; }
        await signUp(email, password, username.trim());
      }
    } catch (err: unknown) {
      setAuthErr(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAuthBusy(false);
    }
  };

  // ── Loading spinner ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="w-10 h-10 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not configured ──────────────────────────────────────────────────────────
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-app-border p-8 text-center">
          <AlertCircle size={40} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="font-bold text-navy text-xl mb-2">Supabase not configured</h2>
          <p className="text-sm text-navy/60 mb-4">
            Add <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
            <code className="bg-gray-100 px-1 rounded">.env.local</code>, then run the schema in your Supabase SQL editor.
          </p>
          <Link href="/play" className="inline-block px-6 py-2 bg-navy text-white rounded-xl text-sm font-semibold">
            Play as guest
          </Link>
        </div>
      </div>
    );
  }

  // ── Not signed in → auth form ───────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-app-bg relative flex flex-col items-center justify-center p-4">
        <BackgroundNumbers count={22} />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 anim-fade-in-up">
            <Link href="/"><Logo size={44} textSize="text-3xl" /></Link>
            <p className="text-navy/50 text-sm mt-2">Sign in to save your progress and streak</p>
          </div>

          <div className="bg-white rounded-2xl border border-app-border shadow-xl p-10 anim-slide-up" style={{ animationDelay: "0.1s" }}>
            {/* Tab toggle */}
            <div className="flex mb-6 rounded-xl overflow-hidden border border-app-border">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setAuthErr(""); }}
                  className={clsx(
                    "flex-1 py-2.5 text-sm font-semibold capitalize transition-colors",
                    mode === m ? "bg-navy text-white" : "text-navy hover:bg-accent-light"
                  )}
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "register" && (
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                  className="w-full border border-app-border rounded-xl px-4 py-3 text-sm outline-none focus:border-navy"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full border border-app-border rounded-xl px-4 py-3 text-sm outline-none focus:border-navy"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full border border-app-border rounded-xl px-4 py-3 text-sm outline-none focus:border-navy"
              />
              {authErr && (
                <p className="text-error-text text-xs flex items-center gap-1">
                  <AlertCircle size={12} /> {authErr}
                </p>
              )}
              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-colors disabled:opacity-60"
              >
                {authBusy ? "…" : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Signed in → profile dashboard ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <nav className="border-b border-app-border bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={32} textSize="text-xl" /></Link>
          <button
            onClick={() => { signOut(); router.push("/"); }}
            className="flex items-center gap-2 text-sm text-navy/70 hover:text-navy"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Avatar + info */}
        <div className="bg-white rounded-2xl border border-app-border shadow-sm p-6 flex items-center gap-6 anim-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-white text-2xl font-black">
            {(profile?.username ?? user.email ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-navy">
                {profile?.username ?? user.email}
              </h1>
              {isPro && (
                <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  <Crown size={10} /> Pro
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">{user.email}</p>
            {profile?.city && <p className="text-sm text-gray-400">📍 {profile.city}</p>}
          </div>
          {!isPro && (
            <Link
              href="/pricing"
              className="px-4 py-2 bg-yellow-400 text-yellow-900 font-bold text-sm rounded-xl hover:bg-yellow-300 flex items-center gap-2 hover-lift anim-glow-gold"
            >
              <Crown size={14} /> Upgrade to Pro
            </Link>
          )}
        </div>

        {/* Streak + quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Trophy size={20} />, label: "Puzzles Solved", value: String(profile?.total_solved ?? 0) },
            { icon: <Target size={20} />, label: "Win Rate",        value: stats ? `${stats.win_rate}%` : "—" },
            { icon: <Flame size={20} />, label: "Current Streak",  value: `${profile?.current_streak ?? 0} days` },
            { icon: <Flame size={20} className="text-orange-400" />, label: "Longest Streak", value: `${profile?.longest_streak ?? 0} days` },
          ].map((card, i) => (
            <div key={card.label} className="anim-fade-in-up" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
              <StatCard icon={card.icon} label={card.label} value={card.value} />
            </div>
          ))}
        </div>

        {/* Per-difficulty times */}
        {stats && Object.keys(stats.best_time_by_difficulty).length > 0 && (
          <div className="bg-white rounded-2xl border border-app-border shadow-sm p-6">
            <h2 className="font-black text-navy mb-4">Best Times by Difficulty</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DIFFICULTIES.map((d) => (
                <div key={d} className="text-center p-3 bg-app-bg rounded-xl">
                  <p className="text-xs text-gray-400 capitalize mb-1">{d}</p>
                  <p className="font-bold text-navy">
                    {stats.best_time_by_difficulty[d]
                      ? formatTime(stats.best_time_by_difficulty[d])
                      : "—"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    avg {stats.avg_time_by_difficulty[d]
                      ? formatTime(stats.avg_time_by_difficulty[d])
                      : "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skin selector */}
        <div className="bg-white rounded-2xl border border-app-border shadow-sm p-6">
          <SkinSelector currentSkin={skin} onSelect={setSkin} isPro={isPro} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfileInner />
    </Suspense>
  );
}

function StatCard({
  icon, label, value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 text-center">
      <div className="text-navy/40 flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-black text-navy mb-1">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
