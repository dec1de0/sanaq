<img width="1680" height="926" alt="Снимок экрана 2026-05-11 в 03 08 24" src="https://github.com/user-attachments/assets/b2109d49-8136-4713-b9db-687d50a4d3aa" />




------


<img width="1680" height="927" alt="Снимок экрана 2026-05-11 в 03 08 45" src="https://github.com/user-attachments/assets/c9191a8d-853f-437f-88ef-ba16fa42cf6f" />



-----

<img width="1680" height="921" alt="Снимок экрана 2026-05-11 в 03 09 11" src="https://github.com/user-attachments/assets/3d0d1c0a-36d3-46ac-b8db-7229a20da84b" />



# Sanaq — The Smarter Sudoku

> *Train your brain, one grid at a time.*

Sanaq is a full-stack Sudoku web app built to feel like a real product — not another homework assignment. It has unique game modes, an AI coach, animated UI, a Pro tier, and a leaderboard. Built in 3 days for the nFactorial Incubator technical challenge.



---

## Why Sanaq is different

Most Sudoku apps are identical. Sanaq has two things you won't find anywhere else:

**Wrong Notes Mode** — the board starts pre-filled with candidate notes, but they're intentionally wrong. You have to identify the incorrect ones, fix them, then solve the puzzle. It trains logical elimination in a way classic Sudoku doesn't.

**AI Coach** — powered by Groq (LLaMA 3.3 70B). Not just a hint button — a chat interface that explains *why* a number fits, teaches strategies like naked singles and hidden singles, and after the game analyzes every mistake you made.

---

## Features

**Game**
- Classic Sudoku with 4 difficulty levels (Easy → Expert)
- Wrong Notes Mode — fix incorrect candidates then solve
- Training Mode — unlimited hints, no pressure, AI explains every mistake
- Daily Challenge — same puzzle for all players, global leaderboard
- Notes mode, undo, erase, keyboard navigation (arrow keys + 1–9)
- Drawing canvas — draw and annotate directly on the board
- 3 mistakes = game over in Classic mode
- Confetti on completion

**AI Coach (Groq / LLaMA 3.3 70B)**
- Cell-by-cell hints with logical explanation
- Free-form chat ("why can't I put 7 here?")
- Post-game analysis: color-coded mistake board + AI breakdown (Pro)
- Temperature 0.3 for consistent, reliable output

**Accounts & Progress**
- Email/password auth via Supabase
- Daily streak tracking (DB-side RPC)
- Stats: win rate, avg time per difficulty, best time, total solved
- Game history saved to Supabase

**Pro Tier**
- Unlocks: Wrong Notes mode, Training mode, unlimited AI hints, all skins, post-game analysis
- No real payment — enter password on `/pricing` to unlock (this is a prototype)

**Skins**
- 3 free skins: Default (navy/white), Warm Paper, Dark
- 4 Pro skins: Neon, Minimalist, Kazakh Pattern, Sunset
- Implemented via CSS custom properties — full board recolor on switch

**Design**
- Dark mode toggle (independent from Dark skin)
- Pure CSS animations: number-drop, shake on error, board entrance, confetti
- Floating background numbers (SSR-safe seeded random)
- Responsive layout

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + custom CSS variables |
| Font | Rubik (Google Fonts) |
| Auth & DB | Supabase (email/password, RLS policies) |
| Backend | FastAPI (Python 3.11+), port 8002 |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Animations | Pure CSS keyframes |
| Confetti | `canvas-confetti` (dynamic import) |
| Icons | `lucide-react` |

---

## Project Structure

```
Sanaq/
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Home: hero, mode selector, difficulty
│   │   ├── play/page.tsx      # Main game
│   │   ├── daily/page.tsx     # Daily challenge
│   │   ├── profile/page.tsx   # Auth + user dashboard
│   │   ├── pricing/page.tsx   # Pro unlock
│   │   ├── leaderboard/page.tsx
│   │   └── privacy/page.tsx
│   ├── components/
│   │   ├── Board.tsx          # 9×9 grid with animations
│   │   ├── Cell.tsx           # Single cell (drop/shake animations)
│   │   ├── Numpad.tsx         # Number input + controls
│   │   ├── AICoach.tsx        # Right sidebar chat
│   │   ├── Sidebar.tsx        # Left sidebar: stats, timer
│   │   ├── SkinSelector.tsx   # Skin picker
│   │   ├── DrawingCanvas.tsx  # SVG overlay for freehand drawing
│   │   ├── Logo.tsx           # SVG logo
│   │   └── BackgroundNumbers.tsx
│   ├── hooks/
│   │   ├── useGame.ts         # All game state
│   │   ├── useAuth.ts         # Supabase auth
│   │   ├── usePro.ts          # Pro tier logic
│   │   └── useDarkMode.ts
│   └── lib/
│       ├── api.ts             # Typed fetch wrapper
│       ├── supabase.ts        # DB helpers
│       └── sudoku.ts          # Client-side utilities
│
├── backend/
│   ├── main.py                # FastAPI app
│   ├── sudoku_engine.py       # Puzzle generation + wrong-notes injector
│   └── routes/
│       ├── sudoku.py          # /sudoku/generate, /daily, /validate
│       ├── ai.py              # /ai/hint, /ai/chat, /ai/analyze
│       └── leaderboard.py     # /leaderboard/global, /daily, /city
│
└── supabase/
    └── schema.sql             # Tables + RLS + update_streak() RPC
```

---

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

Create `backend/.env`:
```
GROQ_API_KEY=gsk_...
FRONTEND_URL=http://localhost:3000
```

Get a free Groq key at [console.groq.com](https://console.groq.com)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8002
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

### Supabase

Run `supabase/schema.sql` once in the Supabase SQL Editor. It creates all tables, RLS policies, and the `update_streak()` RPC function.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/sudoku/generate?difficulty=easy&mode=classic` | Generate puzzle |
| GET | `/sudoku/daily` | Today's daily puzzle |
| POST | `/sudoku/validate` | Validate board state |
| POST | `/ai/hint` | Cell hint with explanation |
| POST | `/ai/chat` | Free-form AI chat |
| POST | `/ai/analyze` | Post-game analysis (Pro) |
| GET | `/leaderboard/global` | Global top 100 |
| GET | `/leaderboard/daily` | Daily challenge board |
| GET | `/leaderboard/city?city=Almaty` | City leaderboard |

---

## To unlock Pro

Go to `/pricing` and enter password `1234`. This sets `is_pro = true` in Supabase for your account. No real payment — this is a prototype.

---

## Leaderboard data

Since Sanaq has no real users yet, the leaderboard is seeded with 100 real players scraped from [sudokus.io](https://sudokus.io). Times and city assignments are deterministically generated from each username via MD5 hash. This will be replaced with real game data as users play.

---

## Built with

Built by Yerzat Alishir with his best friend Claude Code =)
