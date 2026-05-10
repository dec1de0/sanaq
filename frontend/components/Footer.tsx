import React from "react";
import Link from "next/link";
import { Instagram, Mail, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-app-border bg-white/80 backdrop-blur dark:bg-gray-900/80 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-navy/40 dark:text-white/30">© 2026 Sanaq</p>
        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="flex items-center gap-1.5 text-xs text-navy/60 hover:text-navy dark:text-white/50 dark:hover:text-white transition-colors"
          >
            <ShieldCheck size={12} />
            Privacy Policy
          </Link>
          <a
            href="mailto:erzatalisher888@mail.ru"
            className="flex items-center gap-1.5 text-xs text-navy/60 hover:text-navy dark:text-white/50 dark:hover:text-white transition-colors"
          >
            <Mail size={12} />
            Contact Us
          </a>
          <a
            href="https://instagram.com/dec1de_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-navy/60 hover:text-pink-600 dark:text-white/50 dark:hover:text-pink-400 transition-colors"
          >
            <Instagram size={12} />
            @dec1de_
          </a>
        </div>
      </div>
    </footer>
  );
}
