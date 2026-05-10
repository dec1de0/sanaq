from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import json

router = APIRouter()

HINT_PROMPT = """You are an expert Sudoku coach named Sanaq AI. The user is stuck on row {row}, column {col} (0-indexed).

Current board state (0 = empty):
{board}

Correct solution:
{solution}

User question: {question}

The correct number for row {row}, col {col} is {answer}.

Explain step by step WHY that number goes there using Sudoku logic (elimination, naked singles, hidden singles, pointing pairs, etc.).
Do NOT just say the answer directly at first — teach the strategy and reasoning.
Be encouraging and concise. Keep your response under 120 words."""


def _format_board(board: list[list[int]]) -> str:
    lines = []
    for i, row in enumerate(board):
        if i % 3 == 0 and i > 0:
            lines.append("------+-------+------")
        row_str = " ".join(
            (str(n) if n != 0 else ".") if j % 3 != 2 else (str(n) if n != 0 else ".") + " |"
            for j, n in enumerate(row)
        )
        lines.append(row_str.rstrip(" |"))
    return "\n".join(lines)


class HintRequest(BaseModel):
    board: list[list[int]]
    solution: list[list[int]]
    row: int
    col: int
    question: str = "Why does this number go here?"


class ChatRequest(BaseModel):
    board: list[list[int]]
    solution: list[list[int]]
    message: str


class AnalyzeRequest(BaseModel):
    puzzle: list[list[int]]
    board: list[list[int]]
    solution: list[list[int]]
    mistakes: int
    time_seconds: int
    mode: str
    difficulty: str
    game_over: bool


@router.post("/hint")
async def hint(req: HintRequest):
    answer = req.solution[req.row][req.col]
    prompt = HINT_PROMPT.format(
        row=req.row,
        col=req.col,
        board=_format_board(req.board),
        solution=_format_board(req.solution),
        question=req.question,
        answer=answer,
    )
    explanation = await _call_groq(prompt)
    return {
        "explanation": explanation,
        "strategy": _detect_strategy(req.board, req.row, req.col, req.solution),
    }


ANALYZE_PROMPT = """You are Sanaq AI, an expert Sudoku coach analyzing a completed game session.

Game stats:
- Mode: {mode}
- Difficulty: {difficulty}
- Time taken: {time_str}
- Mistakes made: {mistakes}
- Result: {result}

Original puzzle (0 = empty cell the player must fill):
{puzzle}

Correct solution:
{solution}

Player's final board:
{board}

Cells filled INCORRECTLY by the player:
{wrong_list}

Provide a concise, specific analysis with exactly these 3 labeled sections:

**Why the mistakes happened:** Analyze the specific wrong cells — what row/col/box elimination error likely caused them. If no mistakes, note what the player did well.

**Where time was likely spent:** Based on the puzzle structure, identify which regions were probably hardest and why (overlapping constraints, hidden singles, etc.).

**Tips for future games:** Give 2–3 concrete, actionable Sudoku strategies tailored to what you saw. Be encouraging and specific.

Keep each section to 2–3 sentences."""


@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    m = req.time_seconds // 60
    s = req.time_seconds % 60
    time_str = f"{m}m {s}s"
    result = "Game Over (too many mistakes)" if req.game_over else "Solved successfully!"

    wrong_list = []
    for r in range(9):
        for c in range(9):
            if req.puzzle[r][c] == 0 and req.board[r][c] != 0 and req.board[r][c] != req.solution[r][c]:
                wrong_list.append(
                    f"Row {r+1}, Col {c+1}: player entered {req.board[r][c]}, correct is {req.solution[r][c]}"
                )
    wrong_text = "\n".join(wrong_list) if wrong_list else "None — player filled all attempted cells correctly."

    prompt = ANALYZE_PROMPT.format(
        mode=req.mode.replace("_", " ").title(),
        difficulty=req.difficulty.title(),
        time_str=time_str,
        mistakes=req.mistakes,
        result=result,
        puzzle=_format_board(req.puzzle),
        solution=_format_board(req.solution),
        board=_format_board(req.board),
        wrong_list=wrong_text,
    )

    system = "You are Sanaq AI, a friendly and insightful Sudoku coach. Give structured, specific, and encouraging feedback."
    analysis = await _call_groq(prompt, system=system, max_tokens=400)
    return {"analysis": analysis, "wrong_cells": wrong_list}


@router.post("/chat")
async def chat(req: ChatRequest):
    system = (
        "You are Sanaq AI, a friendly Sudoku coach. "
        "Answer questions about Sudoku strategies, rules, and techniques. "
        "Be concise (under 80 words) and encouraging."
    )
    user_msg = f"Board state:\n{_format_board(req.board)}\n\nUser: {req.message}"
    explanation = await _call_groq(user_msg, system=system)
    return {"response": explanation}


async def _call_groq(prompt: str, system: str = "You are an expert Sudoku coach.", max_tokens: int = 200) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return _fallback_hint(prompt)

    try:
        import httpx
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "temperature": 0.3,
                    "max_tokens": max_tokens,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                },
            )
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        return _fallback_hint(prompt)


def _fallback_hint(prompt: str) -> str:
    return (
        "Look at this cell and check which numbers are already present in its row, column, "
        "and 3×3 box. The number that doesn't appear in any of those three regions is your answer. "
        "Try eliminating candidates one by one — you've got this!"
    )


def _detect_strategy(board: list[list[int]], row: int, col: int, solution: list[list[int]]) -> str:
    candidates = []
    for num in range(1, 10):
        valid = True
        if num in board[row]:
            valid = False
        if valid and num in [board[r][col] for r in range(9)]:
            valid = False
        if valid:
            br, bc = 3 * (row // 3), 3 * (col // 3)
            for r in range(br, br + 3):
                for c in range(bc, bc + 3):
                    if board[r][c] == num:
                        valid = False
                        break
        if valid:
            candidates.append(num)

    if len(candidates) == 1:
        return "Naked Single"
    return "Elimination"
