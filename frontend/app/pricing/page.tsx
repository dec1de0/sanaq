"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Crown, Sparkles, Zap, X, KeyRound, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { usePro } from "@/hooks/usePro";
import { isConfigured } from "@/lib/supabase";

const FREE_FEATURES = [
  "3 AI hints per day",
  "3 board skins",
  "Classic Sudoku mode",
  "Daily challenge",
  "Basic stats",
];

const PRO_FEATURES = [
  "Unlimited AI hints",
  "All 7 board skins",
  "Wrong Notes mode",
  "Training mode (unlimited)",
  "Advanced stats & streaks",
  "Priority leaderboard ranking",
];

export default function PricingPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const { isPro, tryUnlock } = usePro(profile, refreshProfile);

  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [busy,     setBusy]     = useState(false);
  const [success,  setSuccess]  = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError("Sign in first to unlock Pro."); return; }
    setBusy(true);
    setError("");
    const ok = await tryUnlock(password, user.id);
    setBusy(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => router.push("/play"), 1800);
    } else {
      setError("Incorrect password.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <nav className="border-b border-app-border bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={32} textSize="text-xl" /></Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/profile" className="text-sm text-navy/70 hover:text-navy">
                {profile?.username ?? user.email}
              </Link>
            ) : (
              <Link href="/profile" className="text-sm text-navy/70 hover:text-navy">Sign In</Link>
            )}
            <Link href="/play" className="px-4 py-2 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy-light">
              Play Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-sm font-bold px-4 py-2 rounded-full mb-6 anim-fade-in-up anim-glow-gold" style={{ animationDelay: "0.05s" }}>
          <Crown size={14} /> Sanaq Pro
        </div>
        <h1 className="text-4xl font-black text-navy mb-4 anim-fade-in-up" style={{ animationDelay: "0.12s" }}>Unlock your full potential</h1>
        <p className="text-navy/60 text-lg mb-12 max-w-xl mx-auto anim-fade-in-up" style={{ animationDelay: "0.22s" }}>
          Pro members get unlimited AI coaching, exclusive skins, and advanced training tools.
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          {/* Free */}
          <div className="bg-white rounded-2xl border border-app-border p-8 text-left shadow-sm anim-fade-in-up hover-lift" style={{ animationDelay: "0.1s" }}>
            <h2 className="font-bold text-navy text-xl mb-1">Free</h2>
            <p className="text-3xl font-black text-navy mb-6">
              $0 <span className="text-base font-normal text-gray-400">/ forever</span>
            </p>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-navy/70">
                  <Check size={14} className="text-green-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/play" className="block text-center py-3 border-2 border-navy text-navy font-semibold rounded-xl hover:bg-accent-light">
              Start Free
            </Link>
          </div>

          {/* Pro */}
          <div className="relative bg-navy rounded-2xl p-8 text-left shadow-xl text-white overflow-hidden anim-fade-in-up hover-lift anim-glow-gold" style={{ animationDelay: "0.22s" }}>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 shimmer-gold pointer-events-none rounded-2xl" />
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={10} /> Most Popular
            </div>
            <h2 className="font-bold text-xl mb-1">Pro</h2>
            <p className="text-3xl font-black mb-6">
              $4.99 <span className="text-base font-normal text-white/60">/ month</span>
            </p>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                  <Zap size={14} className="text-yellow-400 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>

            {/* Unlock form */}
            {isPro || success ? (
              <div className="w-full py-3 bg-green-400 text-green-900 font-bold rounded-xl flex items-center justify-center gap-2">
                ✓ Pro Active
              </div>
            ) : (
              <form onSubmit={handleUnlock} className="space-y-3">
                {!user && (
                  <p className="text-yellow-300 text-xs flex items-center gap-1">
                    <AlertCircle size={12} />
                    <Link href="/profile" className="underline">Sign in</Link> first to unlock Pro.
                  </p>
                )}
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter Pro password"
                    disabled={!user || busy}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:border-yellow-400 disabled:opacity-40"
                    autoComplete="off"
                  />
                </div>
                {error && <p className="text-red-300 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={!user || busy}
                  className="w-full py-3 bg-yellow-400 text-yellow-900 font-bold rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Crown size={16} /> {busy ? "Unlocking…" : "Unlock Pro"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div className="max-w-sm mx-auto bg-green-50 border border-green-200 text-green-800 rounded-2xl p-6 text-center mb-8">
            <div className="text-4xl mb-2">👑</div>
            <p className="font-bold">Pro unlocked! Saved to your account. Redirecting…</p>
          </div>
        )}

        {/* Comparison table */}
        <div className="bg-white rounded-2xl border border-app-border shadow-sm overflow-hidden max-w-2xl mx-auto">
          <div className="grid grid-cols-3 text-xs font-bold text-gray-400 uppercase tracking-wider p-4 border-b border-app-border">
            <span className="text-left">Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center">Pro</span>
          </div>
          {[
            ["AI Hints",          "3/day",          "Unlimited"],
            ["Board Skins",       "3",               "7+"],
            ["Wrong Notes Mode",  false,             true],
            ["Training Mode",     "3 sessions/day",  "Unlimited"],
            ["Daily Challenge",   true,              true],
            ["Streak Tracking",   true,              true],
            ["Heatmap Stats",     false,             true],
          ].map(([label, free, pro]) => (
            <div key={String(label)} className="grid grid-cols-3 px-4 py-3 border-b border-app-border last:border-0 items-center">
              <span className="text-sm text-navy text-left">{label}</span>
              <span className="text-center text-sm">
                {free === true  ? <Check size={14} className="text-green-500 mx-auto" /> :
                 free === false ? <X size={14} className="text-gray-300 mx-auto" /> :
                 <span className="text-gray-500">{free}</span>}
              </span>
              <span className="text-center text-sm">
                {pro === true ? <Check size={14} className="text-yellow-500 mx-auto" /> :
                 <span className="text-yellow-600 font-semibold">{pro}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
