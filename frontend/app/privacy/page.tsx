import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <nav className="border-b border-app-border bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={32} textSize="text-xl" /></Link>
          <Link href="/" className="text-sm text-navy/70 hover:text-navy">← Back to Home</Link>
        </div>
      </nav>

      <div className="flex-1 max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-6xl mb-6">🔒</p>
        <h1 className="text-3xl font-black text-navy mb-4">Privacy Policy</h1>
        <p className="text-xl text-navy/60 italic">
          There is nothing interesting to read here.
        </p>
        <p className="mt-6 text-sm text-navy/40">
          We store only what&apos;s needed to run the game. No tracking, no selling data. Just Sudoku.
        </p>
        <Link
          href="/"
          className="inline-block mt-10 px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-colors text-sm"
        >
          Back to Playing
        </Link>
      </div>

      <Footer />
    </div>
  );
}
