"use client";
import React from "react";
import clsx from "clsx";

interface CellProps {
  value: number;
  notes: Set<number>;
  isGiven: boolean;
  isSelected: boolean;
  isRowCol: boolean;
  isBox: boolean;
  isSameNumber: boolean;
  isError: boolean;
  isHint: boolean;
  row: number;
  col: number;
  onClick: () => void;
}

export function Cell({
  value, notes, isGiven, isSelected, isRowCol, isBox,
  isSameNumber, isError, isHint, row, col, onClick,
}: CellProps) {
  const borderRight  = (col + 1) % 3 === 0 && col < 8;
  const borderBottom = (row + 1) % 3 === 0 && row < 8;

  // Background via CSS skin variables
  let bg: string;
  if (isSelected)                  bg = "var(--skin-selected)";
  else if (isError)                bg = "#FCEBEB";
  else if (isSameNumber && value)  bg = "var(--skin-same)";
  else if (isRowCol)               bg = "var(--skin-row-col)";
  else if (isBox)                  bg = "var(--skin-box)";
  else if (isGiven)                bg = "var(--skin-given)";
  else                             bg = "var(--skin-cell)";

  // Number color: given = dark navy, user-guessed = green, error = red
  let numColor: string;
  if (isError)       numColor = "#A32D2D";
  else if (isHint)   numColor = "var(--skin-user-ok)";
  else if (isGiven)  numColor = "var(--skin-number)";
  else               numColor = "var(--skin-user-ok)";

  const cellStyle: React.CSSProperties = {
    backgroundColor: bg,
    borderRightColor:  borderRight  ? "var(--skin-border)" : "rgba(0,0,0,0.10)",
    borderBottomColor: borderBottom ? "var(--skin-border)" : "rgba(0,0,0,0.10)",
    // Strong inset ring on selected, subtle on row/col axis
    boxShadow: isSelected
      ? "inset 0 0 0 2.5px var(--skin-border)"
      : isRowCol
      ? "inset 0 0 0 0.5px rgba(0,0,0,0.06)"
      : undefined,
  };

  return (
    <div
      onClick={onClick}
      style={cellStyle}
      className={clsx(
        "relative flex items-center justify-center cursor-pointer select-none transition-colors",
        "w-[52px] h-[52px]",
        borderRight  ? "border-r-[2.5px]" : col < 8 && "border-r",
        borderBottom ? "border-b-[2.5px]" : row < 8 && "border-b",
        "hover:brightness-95"
      )}
      role="gridcell"
      aria-selected={isSelected}
    >
      {value !== 0 ? (
        <span
          key={value}
          style={{ color: numColor }}
          className={clsx(
            "text-[24px] leading-none",
            isGiven ? "font-bold" : "font-semibold",
            !isGiven && (isError ? "anim-shake" : "anim-num-drop")
          )}
        >
          {value}
        </span>
      ) : notes.size > 0 ? (
        <NoteGrid notes={notes} />
      ) : null}
    </div>
  );
}

function NoteGrid({ notes }: { notes: Set<number> }) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-[2px]">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <div key={n} className="flex items-center justify-center">
          {notes.has(n) && (
            <span style={{ color: "var(--skin-note)" }} className="text-[8px] leading-none font-medium">
              {n}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
