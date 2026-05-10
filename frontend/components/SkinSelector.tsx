"use client";
import React from "react";
import clsx from "clsx";
import { Lock } from "lucide-react";
import { Skin } from "@/hooks/useGame";

interface SkinOption {
  id: Skin;
  name: string;
  preview: string; // bg color
  border: string;
  isPro: boolean;
}

const SKINS: SkinOption[] = [
  { id: "default", name: "Classic Navy", preview: "#f0f4ff", border: "#1a2a6c", isPro: false },
  { id: "warm_paper", name: "Warm Paper", preview: "#fdf6e3", border: "#8b6914", isPro: false },
  { id: "dark", name: "Dark Mode", preview: "#111d4a", border: "#2a3d8f", isPro: false },
  { id: "neon", name: "Neon", preview: "#0d0d1a", border: "#00ffcc", isPro: true },
  { id: "minimalist", name: "Minimalist", preview: "#ffffff", border: "#e0e0e0", isPro: true },
  { id: "kazakh", name: "Kazakh Pattern", preview: "#1a2a6c", border: "#e8b84b", isPro: true },
  { id: "sunset", name: "Sunset", preview: "#ff7e5f", border: "#feb47b", isPro: true },
];

interface SkinSelectorProps {
  currentSkin: Skin;
  onSelect: (skin: Skin) => void;
  isPro: boolean;
}

export function SkinSelector({ currentSkin, onSelect, isPro }: SkinSelectorProps) {
  return (
    <div>
      <p className="text-sm font-bold text-navy mb-3">Board Skin</p>
      <div className="grid grid-cols-4 gap-2">
        {SKINS.map((skin) => {
          const locked = skin.isPro && !isPro;
          return (
            <button
              key={skin.id}
              onClick={() => !locked && onSelect(skin.id)}
              disabled={locked}
              className={clsx(
                "relative rounded-lg overflow-hidden border-2 transition-all",
                currentSkin === skin.id ? "border-navy scale-105 shadow-md" : "border-app-border",
                locked && "opacity-60 cursor-not-allowed"
              )}
              title={skin.name}
            >
              <div
                className="w-full h-10"
                style={{ backgroundColor: skin.preview, borderBottom: `3px solid ${skin.border}` }}
              />
              <div className="px-1 py-0.5 text-[9px] font-medium text-center text-gray-600 truncate bg-white">
                {skin.name}
              </div>
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Lock size={12} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
