"use client";
import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";
import { Pause, Play, RotateCcw, Pen, Trophy, Moon, Sun, Palette, Crown, Sparkles, Loader2 } from "lucide-react";

import { useGame, GameMode, Difficulty } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";
import { usePro } from "@/hooks/usePro";
import { useDarkMode } from "@/hooks/useDarkMode";
import { saveGame, updateStreak } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Board } from "@/components/Board";
import { Numpad } from "@/components/Numpad";
import { AICoach } from "@/components/AICoach";
import { Sidebar } from "@/components/Sidebar";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { SkinSelector } from "@/components/SkinSelector";
import { Logo } from "@/components/Logo";
import { formatTime } from "@/lib/api";

const FREE_HINTS = 3;

function PlayInner() {
  const params     = useSearchParams();
  const router     = useRouter();
  const mode       = (params.get("mode")       || "classic") as GameMode;
  const difficulty = (params.get("difficulty") || "medium")  as Difficulty;

  const {
    state, loadPuzzle, selectCell, inputNumber, erase, undo,
    toggleNotes, togglePause, restart, useHint, moveSelection, setSkin,
  } = useGame();

  const { user, profile, refreshProfile } = useAuth();
  const { isPro }                          = usePro(profile, refreshProfile);
  const { dark, toggle: toggleDark }       = useDarkMode();

  const [drawingMode,     setDrawingMode]     = useState(false);
  const [showSkins,       setShowSkins]       = useState(false);
  const [hintCells]                           = useState<Set<string>>(new Set());
  const [completionShown, setCompletionShown] = useState(false);
  const [hintMessage,     setHintMessage]     = useState<string | null>(null);
  const [analyzing,       setAnalyzing]       = useState(false);
  const [analysisResult,  setAnalysisResult]  = useState<string | null>(null);
  const boardRef  = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState({ width: 468, height: 468 });

  // Load puzzle on mount
  useEffect(() => { loadPuzzle(mode, difficulty); }, [mode, difficulty]);

  // Measure board for drawing canvas
  useEffect(() => {
    if (boardRef.current) {
      setBoardSize({
        width:  boardRef.current.offsetWidth,
        height: boardRef.current.offsetHeight,
      });
    }
  }, [state.puzzleId]);

  // On completion: save game + update streak
  useEffect(() => {
    if (!state.isComplete || completionShown) return;
    setCompletionShown(true);
    launchConfetti();
    if (user) {
      saveGame({
        user_id:      user.id,
        puzzle_id:    state.puzzleId,
        mode:         state.mode,
        difficulty:   state.difficulty,
        time_seconds: state.elapsedSeconds,
        mistakes:     state.mistakes,
        completed:    true,
        completed_at: new Date().toISOString(),
      }).catch(() => {});
      updateStreak(user.id).catch(() => {});
    }
  }, [state.isComplete, completionShown, user, state]);

  const handleHint = useCallback(async () => {
    const msg = await useHint();
    if (msg) {
      setHintMessage(msg);
      setTimeout(() => setHintMessage(null), 8000);
    }
  }, [useHint]);

  const handleAnalyze = useCallback(async () => {
    if (!isPro) { router.push("/pricing"); return; }
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await api.ai.analyze({
        puzzle: state.puzzle,
        board: state.board,
        solution: state.solution,
        mistakes: state.mistakes,
        time_seconds: state.elapsedSeconds,
        mode: state.mode,
        difficulty: state.difficulty,
        game_over: state.gameOver,
      });
      setAnalysisResult(res.analysis);
    } catch {
      setAnalysisResult("Could not connect to AI Coach. Please check the backend is running and try again.");
    } finally {
      setAnalyzing(false);
    }
  }, [isPro, state, router]);

  // Loading
  if (!state.puzzleId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-navy font-semibold">Generating puzzle…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app-bg" data-skin={state.skin}>
      {/* ── Top bar ── */}
      <header className="border-b border-app-border bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/"><Logo size={30} textSize="text-xl" /></Link>

          <Link
            href="/daily"
            className="hidden md:flex items-center gap-2 bg-accent-light border border-app-border text-navy text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-navy hover:text-white transition-colors"
          >
            <Trophy size={12} /> Daily Challenge
          </Link>

          <div className="flex items-center gap-2 ml-auto">
            {/* Skin picker */}
            <button
              onClick={() => setShowSkins(!showSkins)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                showSkins
                  ? "bg-navy text-white border-navy"
                  : "border-app-border text-navy bg-white hover:bg-accent-light"
              )}
            >
              <Palette size={12} /> Skin
            </button>

            {/* Drawing */}
            <button
              onClick={() => setDrawingMode(!drawingMode)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                drawingMode
                  ? "bg-navy text-white border-navy"
                  : "border-app-border text-navy bg-white hover:bg-accent-light"
              )}
            >
              <Pen size={12} /> {drawingMode ? "Drawing ON" : "Draw"}
            </button>

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-app-border bg-white hover:bg-accent-light text-navy transition-colors"
            >
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Profile link */}
            <Link
              href="/profile"
              className="text-xs text-navy/60 hover:text-navy font-medium hidden sm:block"
            >
              {profile?.username ?? (user ? "Profile" : "Sign In")}
            </Link>
          </div>
        </div>

        {/* Skin dropdown */}
        {showSkins && (
          <div className="border-t border-app-border bg-white px-6 py-4">
            <div className="max-w-lg mx-auto">
              <SkinSelector currentSkin={state.skin} onSelect={setSkin} isPro={isPro} />
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          difficulty={state.difficulty}
          elapsedSeconds={state.elapsedSeconds}
          mistakes={state.mistakes}
          maxMistakes={state.maxMistakes === Infinity ? 999 : state.maxMistakes}
          hintsUsed={state.hintsUsed}
          totalSolved={profile?.total_solved ?? 0}
          streak={profile?.current_streak ?? 0}
        />

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col items-center justify-start py-6 px-4 gap-4 overflow-auto">
          {/* Timer */}
          <div className="flex items-center gap-4">
            <span className="text-[32px] font-black text-navy tabular-nums min-w-[100px] text-center">
              {state.paused ? "⏸" : formatTime(state.elapsedSeconds)}
            </span>
            <button onClick={togglePause} className="p-2 rounded-full hover:bg-accent-light text-navy">
              {state.paused ? <Play size={18} /> : <Pause size={18} />}
            </button>
            <button onClick={restart} className="p-2 rounded-full hover:bg-accent-light text-navy">
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Mode badges */}
          {mode === "wrong_notes" && (
            <div className="bg-navy text-white text-xs font-bold px-3 py-1 rounded-full">
              🔀 Wrong Notes Mode — fix the incorrect candidates
            </div>
          )}
          {mode === "training" && (
            <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
              🎓 Training Mode — unlimited hints, no pressure
            </div>
          )}

          {/* Hint explanation */}
          {hintMessage && (
            <div className="max-w-lg bg-green-50 border border-green-300 text-green-800 text-sm px-4 py-3 rounded-xl anim-hint shadow-sm">
              💡 {hintMessage}
            </div>
          )}

          {/* Game over */}
          {state.gameOver && (
            <div className="bg-cell-error border border-error-text/30 text-error-text px-6 py-5 rounded-2xl text-center max-w-sm w-full">
              <p className="font-bold text-lg mb-1">Game Over!</p>
              <p className="text-sm mb-4">Too many mistakes.</p>
              <div className="flex flex-col gap-2">
                <button onClick={restart} className="px-4 py-2 bg-error-text text-white rounded-xl text-sm font-semibold">
                  Try Again
                </button>
                <button
                  onClick={handleAnalyze}
                  className={clsx(
                    "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors",
                    isPro
                      ? "border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                      : "border-yellow-300 text-yellow-600 opacity-80"
                  )}
                >
                  <Crown size={13} className="text-yellow-500" />
                  Analyze with Coach
                  {!isPro && <span className="text-[10px] font-normal">(Pro)</span>}
                </button>
              </div>
            </div>
          )}

          {/* Board */}
          {!state.paused && (
            <div key={state.puzzleId} className="relative anim-scale-in" ref={boardRef}>
              <Board
                state={state}
                onSelect={selectCell}
                onInput={inputNumber}
                onErase={erase}
                onUndo={undo}
                onMove={moveSelection}
                hintCells={hintCells}
              />
              <DrawingCanvas width={boardSize.width} height={boardSize.height} active={drawingMode} />
            </div>
          )}

          {state.paused && (
            <div
              className="flex items-center justify-center w-[468px] h-[468px] bg-white rounded-xl"
              style={{ border: "2.5px solid var(--skin-border)" }}
            >
              <div className="text-center text-navy">
                <p className="text-6xl mb-4">⏸</p>
                <p className="font-bold text-xl">Paused</p>
                <button onClick={togglePause} className="mt-4 px-6 py-2 bg-navy text-white rounded-xl font-semibold">
                  Resume
                </button>
              </div>
            </div>
          )}

          {/* Numpad */}
          <Numpad
            onInput={inputNumber}
            onErase={erase}
            onUndo={undo}
            onToggleNotes={toggleNotes}
            onHint={handleHint}
            notesMode={state.notesMode}
            hintsUsed={state.hintsUsed}
            maxHints={isPro || mode === "training" ? Infinity : FREE_HINTS}
            disabled={state.isComplete || state.gameOver || state.paused}
          />

          {/* Completion overlay */}
          {state.isComplete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 anim-fade-in">
              {user ? (
                /* Signed-in completion card */
                <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full shadow-2xl anim-bounce-in">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-2xl font-black text-navy mb-2">Puzzle Solved!</h2>
                  <p className="text-navy/70 mb-1">
                    Time: <strong>{formatTime(state.elapsedSeconds)}</strong>
                  </p>
                  <p className="text-navy/70 mb-1">
                    Mistakes: <strong>{state.mistakes}</strong>
                  </p>
                  <p className="text-green-600 text-sm mb-6 anim-streak-pop" style={{ animationDelay: "0.3s" }}>
                    🔥 Streak: {(profile?.current_streak ?? 0) + 1} days
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleAnalyze}
                      className={clsx(
                        "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold border-2 transition-colors text-sm",
                        isPro
                          ? "border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                          : "border-yellow-300 text-yellow-600 opacity-80"
                      )}
                    >
                      <Crown size={14} className="text-yellow-500" />
                      Analyze with AI Coach
                      {!isPro && <span className="text-[10px] font-normal">(Pro)</span>}
                    </button>
                    <button
                      onClick={() => { setCompletionShown(false); loadPuzzle(mode, difficulty); }}
                      className="px-6 py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light"
                    >
                      New Puzzle
                    </button>
                    <Link href="/" className="text-sm text-navy/60 hover:text-navy">
                      Back to Home
                    </Link>
                  </div>
                </div>
              ) : (
                /* Guest completion card — prompt to register */
                <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl anim-bounce-in">
                  <div className="text-5xl mb-3">🎉</div>
                  <h2 className="text-2xl font-black text-navy mb-1">Puzzle Solved!</h2>
                  <p className="text-navy/60 text-sm mb-1">
                    Time: <strong className="text-navy">{formatTime(state.elapsedSeconds)}</strong>
                    &nbsp;·&nbsp;Mistakes: <strong className="text-navy">{state.mistakes}</strong>
                  </p>

                  <div className="my-6 border-t border-app-border pt-6">
                    <p className="text-sm font-semibold text-navy mb-1">
                      Your progress wasn&apos;t saved
                    </p>
                    <p className="text-xs text-navy/60 mb-5">
                      Create a free account to track your streak, stats, and climb the leaderboard.
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/profile?tab=register"
                        className="px-6 py-3 bg-navy text-white rounded-xl font-bold text-sm hover:bg-navy-light transition-colors"
                      >
                        Create Free Account
                      </Link>
                      <Link
                        href="/profile"
                        className="px-6 py-2 border border-app-border text-navy text-sm font-semibold rounded-xl hover:bg-accent-light transition-colors"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={() => { setCompletionShown(false); loadPuzzle(mode, difficulty); }}
                    className="text-xs text-navy/40 hover:text-navy/70"
                  >
                    Continue as guest →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Analysis modal */}
          {(analyzing || analysisResult) && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 anim-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto anim-slide-up">
                <div className="p-6 border-b border-app-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                      <Crown size={14} className="text-yellow-900" />
                    </div>
                    <div>
                      <p className="font-black text-navy text-sm">AI Coach Analysis</p>
                      <p className="text-xs text-navy/50">{state.difficulty} · {state.mode.replace("_", " ")} · {formatTime(state.elapsedSeconds)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAnalysisResult(null)}
                    className="text-navy/40 hover:text-navy text-xl font-bold leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Mini board */}
                <div className="p-6 flex justify-center border-b border-app-border bg-gray-50">
                  <div className="inline-block border-2 border-navy rounded-xl overflow-hidden shadow">
                    {state.board.map((row, r) => (
                      <div key={r} className="flex">
                        {row.map((val, c) => {
                          const isGiven = state.puzzle[r][c] !== 0;
                          const isWrong = !isGiven && val !== 0 && val !== state.solution[r][c];
                          const isRight = !isGiven && val !== 0 && val === state.solution[r][c];
                          const thickR = (c + 1) % 3 === 0 && c < 8;
                          const thickB = (r + 1) % 3 === 0 && r < 8;
                          return (
                            <div
                              key={c}
                              className={clsx(
                                "w-7 h-7 flex items-center justify-center text-[10px] font-bold",
                                thickR ? "border-r-2 border-r-navy" : c < 8 && "border-r border-r-gray-200",
                                thickB ? "border-b-2 border-b-navy" : r < 8 && "border-b border-b-gray-200",
                                isGiven ? "bg-gray-100 text-navy"
                                  : isWrong ? "bg-red-100 text-red-600"
                                  : isRight ? "bg-green-50 text-green-700"
                                  : "bg-white text-gray-300"
                              )}
                            >
                              {val || "·"}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="ml-4 flex flex-col justify-center gap-2 text-xs">
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-gray-100 border border-gray-200 inline-block" /> Given</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-50 border border-green-200 inline-block" /> Correct</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-100 border border-red-200 inline-block" /> Wrong</div>
                  </div>
                </div>

                {/* Analysis text */}
                <div className="p-6">
                  {analyzing ? (
                    <div className="flex items-center justify-center gap-3 py-8 text-navy/60">
                      <Loader2 size={20} className="animate-spin" />
                      <span className="text-sm font-medium">AI Coach is analyzing your game…</span>
                    </div>
                  ) : (
                    <div className="text-sm text-navy/80 leading-relaxed whitespace-pre-wrap">
                      {analysisResult}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* AI Coach */}
        <aside className="hidden lg:flex flex-col w-72 border-l border-app-border bg-white p-4">
          <AICoach
            board={state.board}
            solution={state.solution}
            selected={state.selected}
            isPro={isPro || mode === "training"}
            hintsUsedToday={state.hintsUsed}
          />
        </aside>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-app-bg">
          <div className="w-16 h-16 border-4 border-navy border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PlayInner />
    </Suspense>
  );
}

function launchConfetti() {
  import("canvas-confetti").then(({ default: confetti }) => {
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } }), 400);
  });
}
