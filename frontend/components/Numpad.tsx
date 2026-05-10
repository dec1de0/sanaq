"use client";
import React from "react";
import clsx from "clsx";
import { Pencil, Eraser, RotateCcw, Lightbulb } from "lucide-react";

interface NumpadProps {
  onInput: (n: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onToggleNotes: () => void;
  onHint: () => void;
  notesMode: boolean;
  hintsUsed: number;
  maxHints?: number;
  disabled?: boolean;
}

export function Numpad({
  onInput,
  onErase,
  onUndo,
  onToggleNotes,
  onHint,
  notesMode,
  hintsUsed,
  maxHints = 3,
  disabled = false,
}: NumpadProps) {
  const hintsLeft = Math.max(0, maxHints - hintsUsed);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Action row */}
      <div className="flex gap-3">
        <ActionBtn
          onClick={onToggleNotes}
          active={notesMode}
          label="Notes"
          icon={<Pencil size={18} />}
        />
        <ActionBtn onClick={onErase} label="Erase" icon={<Eraser size={18} />} />
        <ActionBtn onClick={onUndo} label="Undo" icon={<RotateCcw size={18} />} />
        <button
          onClick={onHint}
          disabled={disabled || hintsLeft === 0}
          className={clsx(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-colors min-w-[56px]",
            "bg-navy text-white border-navy hover:bg-navy-light",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          title={`Hint (${hintsLeft} left)`}
        >
          <Lightbulb size={18} />
          <span className="text-[10px] font-semibold">
            {hintsLeft}/{maxHints}
          </span>
        </button>
      </div>

      {/* Number buttons */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => onInput(n)}
            disabled={disabled}
            className={clsx(
              "w-11 h-11 text-[18px] font-bold rounded-xl border-2 border-navy",
              "text-navy bg-white hover:bg-accent-light transition-colors",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "active:scale-95"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  label,
  icon,
  active,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-colors min-w-[52px]",
        active
          ? "bg-navy text-white border-navy"
          : "border-app-border text-navy bg-white hover:bg-accent-light"
      )}
    >
      {icon}
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
