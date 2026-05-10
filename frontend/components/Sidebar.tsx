"use client";
import React, { useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Trophy, Flame, Clock, Star } from "lucide-react";
import { formatTime } from "@/lib/api";

interface SidebarProps {
  difficulty: string;
  elapsedSeconds: number;
  mistakes: number;
  maxMistakes: number;
  hintsUsed: number;
  maxHints?: number;
  bestTime?: number;
  totalSolved?: number;
  streak?: number;
}

export function Sidebar({
  difficulty,
  elapsedSeconds,
  mistakes,
  maxMistakes,
  hintsUsed,
  maxHints = 3,
  bestTime,
  totalSolved = 0,
  streak = 0,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-orange-100 text-orange-800",
    expert: "bg-red-100 text-red-800",
  };

  return (
    <div
      className={clsx(
        "relative flex flex-col bg-white border-r border-app-border transition-all duration-300",
        collapsed ? "w-10" : "w-56"
      )}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-navy text-white flex items-center justify-center shadow"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {!collapsed && (
        <div className="p-4 flex flex-col gap-5 overflow-hidden">
          {/* Difficulty badge */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Difficulty</p>
            <span
              className={clsx(
                "px-2 py-0.5 rounded-full text-xs font-bold capitalize",
                difficultyColors[difficulty] || "bg-gray-100 text-gray-700"
              )}
            >
              {difficulty}
            </span>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <StatRow icon={<Clock size={14} />} label="Time" value={formatTime(elapsedSeconds)} />
            {bestTime !== undefined && (
              <StatRow icon={<Star size={14} />} label="Best" value={formatTime(bestTime)} />
            )}
            <StatRow icon={<Trophy size={14} />} label="Solved" value={String(totalSolved)} />
            <StatRow icon={<Flame size={14} />} label="Streak" value={`${streak} days`} />
          </div>

          {/* Mistakes */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Mistakes</p>
            <div className="flex gap-1">
              {Array.from({ length: maxMistakes === Infinity ? 0 : maxMistakes }).map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "w-5 h-5 rounded-full border-2",
                    i < mistakes ? "bg-error-text border-error-text" : "border-app-border"
                  )}
                />
              ))}
              {maxMistakes === Infinity && (
                <span className="text-xs text-gray-400">Training mode</span>
              )}
            </div>
          </div>

          {/* Hints remaining */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Hints</p>
            <div className="flex gap-1">
              {maxHints === Infinity ? (
                <span className="text-xs text-gray-400">Unlimited (Pro)</span>
              ) : (
                Array.from({ length: maxHints }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      "w-3 h-3 rounded-full",
                      i < maxHints - hintsUsed ? "bg-navy" : "bg-app-border"
                    )}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm font-bold text-navy">{value}</span>
    </div>
  );
}
