"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Trophy, Clock, Flame, Target } from "lucide-react";
import { Logo } from "@/components/Logo";
import { api, LeaderboardEntry, formatTime } from "@/lib/api";

type Tab = "global" | "daily" | "city";
const CITIES = ["Almaty", "Astana", "Shymkent", "Karaganda"];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("global");
  const [city, setCity] = useState("Almaty");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetch =
      tab === "global"
        ? api.leaderboard.global()
        : tab === "daily"
        ? api.leaderboard.daily().then((d) => ({ leaderboard: d.leaderboard, total: d.leaderboard.length }))
        : api.leaderboard.city(city);

    fetch
      .then((d) => setEntries(d.leaderboard))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [tab, city]);

  return (
    <div className="min-h-screen bg-app-bg">
      <nav className="border-b border-app-border bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={32} textSize="text-xl" /></Link>
          <Link href="/play" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy-light">
            Play
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Trophy size={28} className="text-navy" />
          <h1 className="text-3xl font-serif font-bold text-navy">Leaderboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["global", "daily", "city"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors",
                tab === t ? "bg-navy text-white" : "bg-white border border-app-border text-navy hover:bg-accent-light"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* City selector */}
        {tab === "city" && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  city === c ? "bg-navy text-white border-navy" : "border-app-border text-navy bg-white"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-app-border shadow-sm overflow-hidden">
          <div className="grid grid-cols-[48px_1fr_80px_80px_80px_80px] text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-3 border-b border-app-border">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">Games</span>
            <span className="text-right">Avg</span>
            <span className="text-right">Best</span>
            <span className="text-right">Streak</span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">No data yet.</div>
          ) : (
            entries.map((entry, i) => (
              <div
                key={i}
                className={clsx(
                  "grid grid-cols-[48px_1fr_80px_80px_80px_80px] px-4 py-3 border-b border-app-border last:border-0 items-center hover:bg-app-bg transition-colors"
                )}
              >
                <span className={clsx("font-bold text-sm", i < 3 ? "text-yellow-500" : "text-gray-400")}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : entry.rank}
                </span>
                <div>
                  <p className="font-semibold text-navy text-sm">{entry.username}</p>
                  {entry.city && <p className="text-[10px] text-gray-400">{entry.city}</p>}
                </div>
                <span className="text-right text-sm text-navy/70">{entry.games}</span>
                <span className="text-right text-sm text-navy/70 flex items-center justify-end gap-1">
                  <Clock size={10} />{formatTime(entry.avg_time)}
                </span>
                <span className="text-right text-sm font-bold text-navy flex items-center justify-end gap-1">
                  <Target size={10} />{formatTime(entry.best_time)}
                </span>
                <span className="text-right text-sm text-navy/70 flex items-center justify-end gap-1">
                  <Flame size={10} />{entry.streak}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
