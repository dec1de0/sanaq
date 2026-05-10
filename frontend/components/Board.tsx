"use client";
import React, { useEffect, useCallback } from "react";
import { Cell } from "./Cell";
import { wrongCells } from "@/lib/sudoku";
import { GameState } from "@/hooks/useGame";

interface BoardProps {
  state: GameState;
  onSelect: (row: number, col: number) => void;
  onInput: (num: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onMove: (dr: number, dc: number) => void;
  hintCells: Set<string>;
}

export function Board({ state, onSelect, onInput, onErase, onUndo, onMove, hintCells }: BoardProps) {
  const { board, puzzle, solution, notes, selected, isComplete, gameOver } = state;
  const errors = wrongCells(board, solution);

  // Split highlights into row/col vs box for stronger axis contrast
  const rowColSet = new Set<string>();
  const boxSet = new Set<string>();
  if (selected) {
    const [r, c] = selected;
    for (let i = 0; i < 9; i++) {
      if (i !== c) rowColSet.add(`${r},${i}`);
      if (i !== r) rowColSet.add(`${i},${c}`);
    }
    const br = 3 * Math.floor(r / 3), bc = 3 * Math.floor(c / 3);
    for (let rr = br; rr < br + 3; rr++)
      for (let cc = bc; cc < bc + 3; cc++)
        if (rr !== r || cc !== c) {
          // If already in rowCol, skip (row/col takes priority)
          if (!rowColSet.has(`${rr},${cc}`)) boxSet.add(`${rr},${cc}`);
        }
  }

  const selectedValue = selected ? board[selected[0]][selected[1]] : 0;
  const sameNumbers = new Set<string>();
  if (selectedValue !== 0) {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (board[r][c] === selectedValue) sameNumbers.add(`${r},${c}`);
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isComplete || gameOver) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key >= "1" && e.key <= "9") { onInput(parseInt(e.key)); }
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") { onErase(); }
      else if (e.key === "ArrowUp")    { e.preventDefault(); onMove(-1, 0); }
      else if (e.key === "ArrowDown")  { e.preventDefault(); onMove(1, 0); }
      else if (e.key === "ArrowLeft")  { e.preventDefault(); onMove(0, -1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); onMove(0, 1); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "z") { onUndo(); }
    },
    [isComplete, gameOver, onInput, onErase, onMove, onUndo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="inline-block rounded-xl overflow-hidden shadow-lg"
      style={{ border: "2.5px solid var(--skin-border)" }}
      role="grid"
      aria-label="Sudoku board"
      data-skin={state.skin}
    >
      {board.map((row, r) => (
        <div
          key={r}
          className="flex anim-fade-in-up"
          style={{ animationDelay: `${r * 0.035}s` }}
        >
          {row.map((value, c) => {
            const key = `${r},${c}`;
            const isGivenCell  = puzzle[r][c] !== 0;
            const isSelected   = selected !== null && selected[0] === r && selected[1] === c;
            const isRowCol     = !isSelected && rowColSet.has(key);
            const isBox        = !isSelected && boxSet.has(key);
            const isSameNumber = sameNumbers.has(key) && !isSelected;
            const isError      = errors.has(key);
            const isHint       = hintCells.has(key);

            return (
              <Cell
                key={key}
                value={value}
                notes={notes[r][c]}
                isGiven={isGivenCell}
                isSelected={isSelected}
                isRowCol={isRowCol}
                isBox={isBox}
                isSameNumber={isSameNumber}
                isError={isError}
                isHint={isHint}
                row={r}
                col={c}
                onClick={() => onSelect(r, c)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
