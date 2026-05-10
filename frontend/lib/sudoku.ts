export type Board = number[][];
export type Notes = Set<number>[][];

export function emptyNotes(): Notes {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function cloneNotes(notes: Notes): Notes {
  return notes.map((row) => row.map((cell) => new Set(cell)));
}

export function isGiven(puzzle: Board, row: number, col: number): boolean {
  return puzzle[row][col] !== 0;
}

export function getCandidates(board: Board, row: number, col: number): Set<number> {
  const used = new Set<number>();
  for (let c = 0; c < 9; c++) if (board[row][c]) used.add(board[row][c]);
  for (let r = 0; r < 9; r++) if (board[r][col]) used.add(board[r][col]);
  const br = 3 * Math.floor(row / 3);
  const bc = 3 * Math.floor(col / 3);
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (board[r][c]) used.add(board[r][c]);
  const cands = new Set<number>();
  for (let n = 1; n <= 9; n++) if (!used.has(n)) cands.add(n);
  return cands;
}

export function getHighlightedCells(
  selectedRow: number,
  selectedCol: number
): Set<string> {
  const cells = new Set<string>();
  for (let c = 0; c < 9; c++) cells.add(`${selectedRow},${c}`);
  for (let r = 0; r < 9; r++) cells.add(`${r},${selectedCol}`);
  const br = 3 * Math.floor(selectedRow / 3);
  const bc = 3 * Math.floor(selectedCol / 3);
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      cells.add(`${r},${c}`);
  return cells;
}

export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === 0) return false;
  return true;
}

export function wrongCells(board: Board, solution: Board): Set<string> {
  const wrong = new Set<string>();
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] !== 0 && board[r][c] !== solution[r][c])
        wrong.add(`${r},${c}`);
  return wrong;
}

export function notesFromWrongNotes(
  wrongNotesMap: Record<string, number[]>
): Notes {
  const notes = emptyNotes();
  for (const [key, nums] of Object.entries(wrongNotesMap)) {
    const [r, c] = key.split(",").map(Number);
    notes[r][c] = new Set(nums);
  }
  return notes;
}
