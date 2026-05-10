"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import clsx from "clsx";
import { Trash2 } from "lucide-react";

interface DrawingCanvasProps {
  width: number;
  height: number;
  active: boolean;
}

export function DrawingCanvas({ width, height, active }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const src = "touches" in e ? e.touches[0] : e;
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d")!;

    const onStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      drawing.current = true;
      lastPos.current = getPos(e, canvas);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!drawing.current || !lastPos.current) return;
      const pos = getPos(e, canvas);
      ctx.strokeStyle = "rgba(26,42,108,0.8)";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    };

    const onEnd = () => {
      drawing.current = false;
      lastPos.current = null;
    };

    canvas.addEventListener("mousedown", onStart);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onEnd);
    canvas.addEventListener("mouseleave", onEnd);
    canvas.addEventListener("touchstart", onStart, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("touchend", onEnd);

    return () => {
      canvas.removeEventListener("mousedown", onStart);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onEnd);
      canvas.removeEventListener("mouseleave", onEnd);
      canvas.removeEventListener("touchstart", onStart);
      canvas.removeEventListener("touchmove", onMove);
      canvas.removeEventListener("touchend", onEnd);
    };
  }, [active]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={clsx(
          "absolute inset-0 rounded-lg",
          active ? "cursor-crosshair z-10" : "pointer-events-none z-0"
        )}
        style={{ touchAction: active ? "none" : "auto" }}
      />
      {active && (
        <button
          onClick={clear}
          className="absolute bottom-2 right-2 z-20 bg-white border border-app-border rounded-lg px-2 py-1 text-xs flex items-center gap-1 text-navy shadow hover:bg-accent-light"
        >
          <Trash2 size={12} /> Clear
        </button>
      )}
    </>
  );
}
