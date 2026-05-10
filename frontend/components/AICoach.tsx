"use client";
import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  text: string;
}

interface AICoachProps {
  board: number[][];
  solution: number[][];
  selected: [number, number] | null;
  isPro: boolean;
  hintsUsedToday: number;
}

const FREE_DAILY_LIMIT = 3;

export function AICoach({ board, solution, selected, isPro, hintsUsedToday }: AICoachProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I'm your Sanaq AI Coach. Select a cell and ask me anything about it, or ask about Sudoku strategies! 🧠",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [localHints, setLocalHints] = useState(hintsUsedToday);
  const bottomRef = useRef<HTMLDivElement>(null);

  const canUseHint = isPro || localHints < FREE_DAILY_LIMIT;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading || !canUseHint) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    setLocalHints((h) => h + 1);

    try {
      let reply: string;
      if (selected) {
        const resp = await api.ai.hint({
          board,
          solution,
          row: selected[0],
          col: selected[1],
          question: text,
        });
        reply = resp.explanation;
      } else {
        const resp = await api.ai.chat({ board, solution, message: text });
        reply = resp.response;
      }
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Sorry, I couldn't connect. Try checking which numbers are missing from the row, column, and box!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-app-border">
        <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-navy">AI Coach</p>
          <p className="text-[10px] text-gray-400">
            {isPro ? "Pro · Unlimited hints" : `${Math.max(0, FREE_DAILY_LIMIT - localHints)} hints left today`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              "flex gap-2 text-sm",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={clsx(
                "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5",
                msg.role === "assistant" ? "bg-navy text-white" : "bg-accent-light text-navy"
              )}
            >
              {msg.role === "assistant" ? <Bot size={12} /> : <User size={12} />}
            </div>
            <div
              className={clsx(
                "rounded-2xl px-3 py-2 max-w-[85%] leading-relaxed",
                msg.role === "assistant"
                  ? "bg-accent-light text-navy rounded-tl-none"
                  : "bg-navy text-white rounded-tr-none"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-navy flex-shrink-0 flex items-center justify-center">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-accent-light rounded-2xl rounded-tl-none px-3 py-2">
              <ThinkingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!canUseHint ? (
        <div className="pt-3 border-t border-app-border">
          <div className="bg-cell-error text-error-text text-xs p-2 rounded-lg text-center">
            Daily limit reached.{" "}
            <a href="/pricing" className="underline font-semibold">
              Upgrade to Pro
            </a>{" "}
            for unlimited hints.
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-app-border flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={selected ? `Ask about row ${selected[0]+1}, col ${selected[1]+1}…` : "Ask a Sudoku question…"}
            className="flex-1 text-sm border border-app-border rounded-xl px-3 py-2 outline-none focus:border-navy bg-white"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-navy text-white flex items-center justify-center disabled:opacity-40 hover:bg-navy-light transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 bg-navy/40 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
