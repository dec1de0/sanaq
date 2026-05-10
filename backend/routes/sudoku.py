from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
import datetime
import os

from sudoku_engine import generate_puzzle, generate_wrong_notes, validate_board

router = APIRouter()

_puzzle_cache: dict = {}


class ValidateRequest(BaseModel):
    board: list[list[int]]
    solution: list[list[int]]


@router.get("/generate")
def generate(
    difficulty: str = Query("medium", enum=["easy", "medium", "hard", "expert"]),
    mode: str = Query("classic", enum=["classic", "wrong_notes", "training"]),
):
    puzzle, solution = generate_puzzle(difficulty)
    puzzle_id = str(uuid.uuid4())

    response: dict = {
        "id": puzzle_id,
        "board": puzzle,
        "solution": solution,
        "difficulty": difficulty,
        "mode": mode,
    }

    if mode == "wrong_notes":
        response["wrong_notes"] = generate_wrong_notes(puzzle, solution)

    _puzzle_cache[puzzle_id] = {"puzzle": puzzle, "solution": solution}
    return response


@router.get("/daily")
def daily_puzzle():
    today = datetime.date.today()
    seed = int(today.strftime("%Y%m%d"))
    puzzle, solution = generate_puzzle("medium", seed=seed)

    date_str = today.isoformat()
    return {
        "board": puzzle,
        "solution": solution,
        "date": date_str,
        "players_today": _get_players_today(date_str),
        "id": f"daily-{date_str}",
    }


def _get_players_today(date_str: str) -> int:
    # In production this would query Supabase
    import hashlib
    h = int(hashlib.md5(date_str.encode()).hexdigest(), 16)
    return 100 + (h % 900)


@router.post("/validate")
def validate(req: ValidateRequest):
    errors = validate_board(req.board, req.solution)
    return {"valid": len(errors) == 0, "errors": errors}
