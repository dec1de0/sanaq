from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routes import sudoku, leaderboard, ai

app = FastAPI(title="Sanaq API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000"), "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth + game saves now handled directly via Supabase from the frontend.
# Backend handles: puzzle generation, AI hints, leaderboard (until Supabase view is ready).
app.include_router(sudoku.router,      prefix="/sudoku",      tags=["sudoku"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
app.include_router(ai.router,          prefix="/ai",          tags=["ai"])


@app.get("/")
def root():
    return {"status": "ok", "app": "Sanaq API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
