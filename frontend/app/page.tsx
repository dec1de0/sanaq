"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Logo } from "@/components/Logo";
import { BackgroundNumbers } from "@/components/BackgroundNumbers";
import { Footer } from "@/components/Footer";
import { ArrowRight, Shuffle, GraduationCap, BookOpen, Trophy, Star, Zap, UserCircle, Crown, Lock } from "lucide-react";
import { GameMode, Difficulty } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";
import { usePro } from "@/hooks/usePro";

const MODES: { id: GameMode; label: string; icon: React.ReactNode; desc: string; badge?: string }[] = [
  {
    id: "classic",
    label: "Classic Sudoku",
    icon: <BookOpen size={24} />,
    desc: "Standard rules. Fill the grid with unique numbers.",
  },
  {
    id: "wrong_notes",
    label: "Wrong Notes",
    icon: <Shuffle size={24} />,
    desc: "Notes are pre-filled but intentionally wrong. Find and fix them!",
    badge: "🔀 Unique",
  },
  {
    id: "training",
    label: "Training Mode",
    icon: <GraduationCap size={24} />,
    desc: "Unlimited hints and AI explanations. No pressure.",
  },
];

const DIFFICULTIES: { id: Difficulty; label: string; color: string }[] = [
  { id: "easy", label: "Easy", color: "bg-green-100 text-green-800 border-green-300" },
  { id: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  { id: "hard", label: "Hard", color: "bg-orange-100 text-orange-800 border-orange-300" },
  { id: "expert", label: "Expert", color: "bg-red-100 text-red-800 border-red-300" },
];

// Mini preview board (static)
const PREVIEW = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

export default function HomePage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { isPro } = usePro(profile, refreshProfile);
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>("medium");

  const handlePlay = () => {
    router.push(`/play?mode=${selectedMode}&difficulty=${selectedDiff}`);
  };

  return (
    <div className="min-h-screen bg-app-bg relative">
      <BackgroundNumbers count={30} />

      {/* Nav */}
      <nav className="border-b border-app-border bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size={36} textSize="text-2xl" />
          <div className="flex items-center gap-3">
            <Link href="/leaderboard" className="text-sm text-navy/70 hover:text-navy">
              Leaderboard
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-yellow-700 border-2 border-yellow-400 rounded-xl hover:bg-yellow-50 transition-colors"
            >
              <Crown size={13} /> Pro
            </Link>
            {user ? (
              <Link
                href="/profile"
                className="ml-2 flex items-center gap-2 px-4 py-2 bg-accent-light border border-app-border text-navy text-sm font-semibold rounded-xl hover:bg-navy hover:text-white transition-colors"
              >
                <UserCircle size={16} />
                {profile?.username ?? user.email?.split("@")[0]}
              </Link>
            ) : (
              <Link
                href="/profile"
                className="ml-2 px-4 py-2 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy-light transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent-light text-navy text-xs font-semibold px-3 py-1 rounded-full mb-6 anim-fade-in-up" style={{ animationDelay: "0.05s" }}>
              <Zap size={12} /> AI-Powered Sudoku
            </div>
            <h1 className="text-5xl font-serif font-bold text-navy leading-tight mb-4 anim-fade-in-up" style={{ animationDelay: "0.15s" }}>
              Train your brain,
              <br />
              <span className="text-navy/60">one grid at a time.</span>
            </h1>
            <p className="text-lg text-navy/70 mb-8 leading-relaxed anim-fade-in-up" style={{ animationDelay: "0.28s" }}>
              The smartest Sudoku experience — with an AI coach that teaches you
              <em> why</em>, not just what. Play daily challenges, compete on the
              leaderboard, and sharpen your logic.
            </p>
            <div className="flex gap-4 anim-fade-in-up" style={{ animationDelay: "0.40s" }}>
              <button
                onClick={handlePlay}
                className="flex items-center gap-2 px-6 py-3 bg-navy text-white font-semibold rounded-xl hover-lift hover:bg-navy-light transition-colors shadow-md"
              >
                Play Now <ArrowRight size={16} />
              </button>
              <Link
                href="/daily"
                className="flex items-center gap-2 px-6 py-3 border-2 border-navy text-navy font-semibold rounded-xl hover-lift hover:bg-accent-light transition-colors"
              >
                <Trophy size={16} /> Daily Challenge
              </Link>
            </div>
          </div>

          {/* Preview board */}
          <div className="flex justify-center anim-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative hover-lift">
              <div className="absolute inset-0 bg-navy/10 rounded-2xl blur-3xl scale-110" />
              <div className="relative border-[2.5px] border-navy rounded-xl overflow-hidden shadow-2xl bg-white">
                {PREVIEW.map((row, r) => (
                  <div key={r} className="flex">
                    {row.map((val, c) => {
                      const thickR = (c + 1) % 3 === 0 && c < 8;
                      const thickB = (r + 1) % 3 === 0 && r < 8;
                      return (
                        <div
                          key={c}
                          className={clsx(
                            "w-9 h-9 flex items-center justify-center text-sm font-bold transition-colors duration-200",
                            thickR ? "border-r-[2px] border-r-navy" : c < 8 && "border-r border-r-app-border",
                            thickB ? "border-b-[2px] border-b-navy" : r < 8 && "border-b border-b-app-border",
                            val === 0 ? "text-transparent" : val % 3 === 0 ? "text-navy bg-accent-light" : "text-navy"
                          )}
                        >
                          {val || "·"}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-4 -right-4 bg-navy text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 shadow anim-glow-gold">
                <Star size={10} className="fill-white" /> AI Coach active
              </div>
            </div>
          </div>
        </div>

        {/* Mode + Difficulty selector */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-serif font-bold text-navy text-center mb-8 anim-fade-in-up" style={{ animationDelay: "0.5s" }}>
            Choose your game
          </h2>

          {/* Mode cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {MODES.map((mode, i) => {
              const locked = mode.id !== "classic" && !isPro;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    if (locked) { router.push("/pricing"); return; }
                    setSelectedMode(mode.id);
                  }}
                  style={{ animationDelay: `${0.55 + i * 0.1}s` }}
                  className={clsx(
                    "relative text-left p-5 rounded-2xl border-2 transition-all anim-fade-in-up hover-lift",
                    locked
                      ? "border-app-border bg-white/60 opacity-75 cursor-pointer hover:border-yellow-400"
                      : selectedMode === mode.id
                      ? "border-navy bg-accent-light shadow-md scale-[1.02]"
                      : "border-app-border bg-white hover:border-navy/40"
                  )}
                >
                  {locked ? (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-300 px-2 py-0.5 rounded-full">
                      <Lock size={8} /> Pro
                    </span>
                  ) : mode.badge ? (
                    <span className="absolute top-3 right-3 text-[10px] font-bold bg-navy text-white px-2 py-0.5 rounded-full">
                      {mode.badge}
                    </span>
                  ) : null}
                  <div className={clsx("mb-2", locked ? "text-navy/40" : "text-navy")}>{mode.icon}</div>
                  <p className={clsx("font-bold text-sm mb-1", locked ? "text-navy/50" : "text-navy")}>{mode.label}</p>
                  <p className="text-xs text-navy/50 leading-relaxed">{mode.desc}</p>
                  {locked && (
                    <p className="text-[10px] text-yellow-600 font-semibold mt-2">Upgrade to Pro to unlock →</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Difficulty */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 anim-fade-in-up" style={{ animationDelay: "0.85s" }}>
            {DIFFICULTIES.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setSelectedDiff(d.id)}
                style={{ animationDelay: `${0.85 + i * 0.07}s` }}
                className={clsx(
                  "px-5 py-2 rounded-xl border-2 text-sm font-semibold transition-all anim-fade-in-up",
                  d.color,
                  selectedDiff === d.id ? "scale-105 shadow-md border-current" : "opacity-60 hover:opacity-90"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="text-center anim-fade-in-up" style={{ animationDelay: "1.05s" }}>
            <button
              onClick={handlePlay}
              className="px-10 py-4 bg-navy text-white text-lg font-bold rounded-2xl hover:bg-navy-light transition-colors shadow-lg hover-lift active:scale-95"
            >
              Start Playing →
            </button>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}
