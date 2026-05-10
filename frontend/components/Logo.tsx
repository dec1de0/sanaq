import React from "react";
import clsx from "clsx";

interface LogoProps {
  size?: number;
  className?: string;
  textSize?: string;
}

// Grid layout matching the reference image:
//  1 _ 4
//  _ 7 2
//  6 8 3
const CELLS: (number | null)[][] = [
  [1, null, 4],
  [null, 7, 2],
  [6, 8, 3],
];

export function Logo({ size = 40, className, textSize = "text-3xl" }: LogoProps) {
  const border = 2.5;
  const inner = size - border * 2;
  const cellSize = inner / 3;
  const fontSize = cellSize * 0.62;

  return (
    <div className={clsx("flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Sanaq logo grid"
        className="flex-shrink-0"
      >
        {/* Outer border — uses currentColor so it adapts */}
        <rect
          x={border / 2}
          y={border / 2}
          width={size - border}
          height={size - border}
          rx={size * 0.05}
          stroke="currentColor"
          strokeWidth={border}
          fill="transparent"
        />
        {/* Inner grid lines */}
        <line x1={border + cellSize}     y1={border} x2={border + cellSize}     y2={size - border} stroke="currentColor" strokeWidth={1} />
        <line x1={border + cellSize * 2} y1={border} x2={border + cellSize * 2} y2={size - border} stroke="currentColor" strokeWidth={1} />
        <line x1={border} y1={border + cellSize}     x2={size - border} y2={border + cellSize}     stroke="currentColor" strokeWidth={1} />
        <line x1={border} y1={border + cellSize * 2} x2={size - border} y2={border + cellSize * 2} stroke="currentColor" strokeWidth={1} />

        {/* Numbers */}
        {CELLS.map((row, r) =>
          row.map((num, c) => {
            if (num === null) return null;
            const cx = border + cellSize * c + cellSize / 2;
            const cy = border + cellSize * r + cellSize / 2;
            return (
              <text
                key={`${r}-${c}`}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fontSize}
                fontWeight="700"
                fontFamily="Rubik, Georgia, serif"
                fill="currentColor"
              >
                {num}
              </text>
            );
          })
        )}
      </svg>

      {/* Text: black in light mode, white in dark mode */}
      <span className={clsx("font-black tracking-tight leading-none text-black dark:text-white", textSize)}>
        Sanaq
      </span>
    </div>
  );
}
