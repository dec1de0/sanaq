from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
import datetime

from routes.auth import get_current_user

router = APIRouter()

_games: list[dict] = []


class SaveGameRequest(BaseModel):
    puzzle_id: str
    board_state: list[list[int]]
    time_elapsed: int
    mistakes: int
    mode: str
    difficulty: str
    completed: bool


class PartialSaveRequest(BaseModel):
    puzzle_id: str
    board_state: list[list[int]]
    notes_state: Optional[dict] = None
    time_elapsed: int


@router.post("/save")
def save_game(req: SaveGameRequest, user: dict = Depends(get_current_user)):
    game = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "puzzle_id": req.puzzle_id,
        "mode": req.mode,
        "difficulty": req.difficulty,
        "time_seconds": req.time_elapsed,
        "mistakes": req.mistakes,
        "completed": req.completed,
        "completed_at": datetime.datetime.utcnow().isoformat() if req.completed else None,
    }
    _games.append(game)
    return {"success": True, "game_id": game["id"]}


@router.post("/autosave")
def autosave(req: PartialSaveRequest, user: dict = Depends(get_current_user)):
    # In production: upsert to Supabase
    return {"success": True}


@router.get("/history")
def history(user: dict = Depends(get_current_user)):
    user_games = [g for g in _games if g["user_id"] == user["id"]]
    user_games.sort(key=lambda g: g.get("completed_at") or "", reverse=True)
    return {"games": user_games}


@router.get("/stats")
def stats(user: dict = Depends(get_current_user)):
    user_games = [g for g in _games if g["user_id"] == user["id"]]
    completed = [g for g in user_games if g["completed"]]

    times_by_diff: dict[str, list[int]] = {}
    for g in completed:
        d = g["difficulty"]
        times_by_diff.setdefault(d, []).append(g["time_seconds"])

    avg_time = {d: int(sum(ts) / len(ts)) for d, ts in times_by_diff.items()}
    best_time = {d: min(ts) for d, ts in times_by_diff.items()}

    streak = _calculate_streak(completed)

    return {
        "total_solved": len(completed),
        "total_played": len(user_games),
        "win_rate": round(len(completed) / max(len(user_games), 1) * 100, 1),
        "avg_time_by_difficulty": avg_time,
        "best_time_by_difficulty": best_time,
        "current_streak": streak,
    }


def _calculate_streak(completed: list[dict]) -> int:
    if not completed:
        return 0
    dates = sorted(
        set(g["completed_at"][:10] for g in completed if g.get("completed_at")),
        reverse=True,
    )
    streak = 0
    today = datetime.date.today()
    for i, d in enumerate(dates):
        expected = (today - datetime.timedelta(days=i)).isoformat()
        if d == expected:
            streak += 1
        else:
            break
    return streak
