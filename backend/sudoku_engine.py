import random
import copy
from typing import Optional

Board = list[list[int]]


def is_valid(board: Board, row: int, col: int, num: int) -> bool:
    if num in board[row]:
        return False
    if num in [board[r][col] for r in range(9)]:
        return False
    box_r, box_c = 3 * (row // 3), 3 * (col // 3)
    for r in range(box_r, box_r + 3):
        for c in range(box_c, box_c + 3):
            if board[r][c] == num:
                return False
    return True


def _solve(board: Board, shuffle: bool = False) -> bool:
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                nums = list(range(1, 10))
                if shuffle:
                    random.shuffle(nums)
                for num in nums:
                    if is_valid(board, row, col, num):
                        board[row][col] = num
                        if _solve(board, shuffle):
                            return True
                        board[row][col] = 0
                return False
    return True


def _count_solutions(board: Board, limit: int = 2) -> int:
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                count = 0
                for num in range(1, 10):
                    if is_valid(board, row, col, num):
                        board[row][col] = num
                        count += _count_solutions(board, limit)
                        board[row][col] = 0
                        if count >= limit:
                            return count
                return count
    return 1


def generate_solution(seed: Optional[int] = None) -> Board:
    if seed is not None:
        random.seed(seed)
    board = [[0] * 9 for _ in range(9)]
    _solve(board, shuffle=True)
    return board


GIVENS_RANGE = {
    "easy": (35, 40),
    "medium": (28, 34),
    "hard": (22, 27),
    "expert": (17, 21),
}


def generate_puzzle(difficulty: str = "medium", seed: Optional[int] = None) -> tuple[Board, Board]:
    if seed is not None:
        random.seed(seed)

    solution = generate_solution(seed=None)  # already seeded above if needed
    puzzle = copy.deepcopy(solution)

    min_g, max_g = GIVENS_RANGE.get(difficulty, (28, 34))
    target_givens = random.randint(min_g, max_g)
    target_removed = 81 - target_givens

    cells = [(r, c) for r in range(9) for c in range(9)]
    random.shuffle(cells)

    removed = 0
    for row, col in cells:
        if removed >= target_removed:
            break
        backup = puzzle[row][col]
        puzzle[row][col] = 0

        test = copy.deepcopy(puzzle)
        if _count_solutions(test) == 1:
            removed += 1
        else:
            puzzle[row][col] = backup

    return puzzle, solution


def get_candidates(board: Board) -> dict[str, list[int]]:
    result: dict[str, list[int]] = {}
    for r in range(9):
        for c in range(9):
            if board[r][c] == 0:
                cands = [n for n in range(1, 10) if is_valid(board, r, c, n)]
                result[f"{r},{c}"] = cands
    return result


def generate_wrong_notes(board: Board, solution: Board) -> dict[str, list[int]]:
    correct_cands = get_candidates(board)
    wrong_notes: dict[str, list[int]] = {}

    for key, correct in correct_cands.items():
        row, col = map(int, key.split(","))
        answer = solution[row][col]

        working = list(correct)
        wrong_pool = [n for n in range(1, 10) if n not in correct]

        # Inject 1–3 wrong candidates
        num_inject = random.randint(1, min(3, len(wrong_pool))) if wrong_pool else 0
        working.extend(random.sample(wrong_pool, num_inject))

        # Sometimes remove a correct candidate (but never the answer itself)
        removable = [n for n in correct if n != answer]
        if removable and random.random() > 0.6:
            to_remove = random.sample(removable, random.randint(1, min(1, len(removable))))
            working = [n for n in working if n not in to_remove]

        # Ensure the correct answer is always present
        if answer not in working:
            working.append(answer)

        random.shuffle(working)
        wrong_notes[key] = working

    return wrong_notes


def validate_board(board: Board, solution: Board) -> list[dict]:
    errors = []
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v != 0 and v != solution[r][c]:
                errors.append({"row": r, "col": c})
    return errors
