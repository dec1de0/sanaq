"use client";
import React, { useMemo } from "react";

interface Particle {
  num: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotate: number;
  dur: number;
  delay: number;
}

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function BackgroundNumbers({ count = 28 }: { count?: number }) {
  const particles = useMemo<Particle[]>(() => {
    const rand = seededRand(42);
    return Array.from({ length: count }, (_, i) => ({
      num:     (i % 9) + 1,
      x:       rand() * 100,
      y:       rand() * 100,
      size:    40 + rand() * 110,
      opacity: 0.04 + rand() * 0.07,
      rotate:  rand() * 40 - 20,
      dur:     20 + rand() * 16,       // 20–36 s per float cycle
      delay:   -(rand() * 20),         // negative = start mid-cycle (no pop-in delay)
    }));
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden select-none" aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute font-black text-navy anim-float"
          style={{
            left:            `${p.x}%`,
            top:             `${p.y}%`,
            fontSize:        `${p.size}px`,
            opacity:         p.opacity,
            "--r":           `${p.rotate}deg`,
            "--dur":         `${p.dur}s`,
            animationDelay:  `${p.delay}s`,
            lineHeight:      1,
          } as React.CSSProperties}
        >
          {p.num}
        </span>
      ))}
    </div>
  );
}
