"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Users, Clock, Share2, ChevronRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { api, LeaderboardEntry, formatTime } from "@/lib/api";

interface DailyInfo {
  date: string;
  players_today: number;
  board: number[][];
}

export default function DailyPage() {
  const router = useRouter();
  const [info, setInfo] = useState<DailyInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    api.sudoku.daily().then((d) =>
      setInfo({ date: d.date, players_today: d.players_today, board: d.board })
    );
    api.leaderboard.daily().then((d) => setLeaderboard(d.leaderboard));
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const share = () => {
    const text = `I played today's Sanaq Daily Challenge! 🧩\nPlay at sanaq.app/daily`;
    navigator.share?.({ text }) ?? navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <nav className="border-b border-app-border bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={32} textSize="text-xl" /></Link>
          <Link href="/leaderboard" className="text-sm text-navy/70 hover:text-navy">Full Leaderboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-navy text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
            <Trophy size={14} /> Daily Challenge
          </div>
          <h1 className="text-4xl font-serif font-bold text-navy mb-2">
            {info?.date ? new Date(info.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Today's Puzzle"}
          </h1>
          <p className="text-navy/60 flex items-center justify-center gap-2">
            <Users size={14} /> {info?.players_today ?? "..."} players today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: play + countdown */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-app-border shadow-sm">
              <h2 className="font-bold text-navy mb-4">Join Today's Challenge</h2>
              <p className="text-sm text-navy/60 mb-6 leading-relaxed">
                Everyone solves the same puzzle today. Your score is compared to players worldwide. Next puzzle resets in:
              </p>
              <div className="text-3xl font-bold text-navy text-center mb-6 tabular-nums">
                ⏳ {countdown}
              </div>
              <button
                onClick={() => router.push("/play?mode=classic&difficulty=medium&daily=1")}
                className="w-full py-3 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-colors flex items-center justify-center gap-2"
              >
                Play Daily Challenge <ChevronRight size={16} />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-app-border shadow-sm">
              <h2 className="font-bold text-navy mb-3">Share Result</h2>
              <p className="text-sm text-navy/60 mb-4">Solved today's puzzle? Brag about it!</p>
              <button
                onClick={share}
                className="flex items-center gap-2 px-4 py-2 border-2 border-navy text-navy font-semibold rounded-xl hover:bg-accent-light"
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>

          {/* Right: leaderboard */}
          <div className="bg-white rounded-2xl border border-app-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-app-border flex items-center gap-2">
              <Trophy size={16} className="text-navy" />
              <span className="font-bold text-navy">Today's Top 10</span>
            </div>
            <div className="divide-y divide-app-border">
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <span className={`w-6 text-center text-sm font-bold ${i < 3 ? "text-yellow-500" : "text-gray-400"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-navy">{entry.username}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> {formatTime(entry.best_time)}
                  </span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
