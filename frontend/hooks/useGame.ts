"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Board,
  Notes,
  emptyNotes,
  cloneBoard,
  cloneNotes,
  isGiven,
  wrongCells,
  isBoardComplete,
  notesFromWrongNotes,
} from "@/lib/sudoku";
import { api } from "@/lib/api";

export type GameMode = "classic" | "wrong_notes" | "training";
export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type Skin = "default" | "warm_paper" | "dark" | "neon" | "minimalist" | "kazakh" | "sunset";

export interface GameState {
  puzzle: Board;
  board: Board;
  solution: Board;
  notes: Notes;
  selected: [number, number] | null;
  notesMode: boolean;
  mistakes: number;
  maxMistakes: number;
  history: { board: Board; notes: Notes }[];
  mode: GameMode;
  difficulty: Difficulty;
  puzzleId: string;
  isComplete: boolean;
  gameOver: boolean;
  hintsUsed: number;
  wrongNotesMap: Record<string, number[]>;
  elapsedSeconds: number;
  paused: boolean;
  skin: Skin;
}

const MAX_MISTAKES = 3;

function createInitialState(): GameState {
  const empty: Board = Array.from({ length: 9 }, () => Array(9).fill(0));
  return {
    puzzle: empty,
    board: empty,
    solution: empty,
    notes: emptyNotes(),
    selected: null,
    notesMode: false,
    mistakes: 0,
    maxMistakes: MAX_MISTAKES,
    history: [],
    mode: "classic",
    difficulty: "medium",
    puzzleId: "",
    isComplete: false,
    gameOver: false,
    hintsUsed: 0,
    wrongNotesMap: {},
    elapsedSeconds: 0,
    paused: false,
    skin: "default",
  };
}

export function useGame() {
  const [state, setState] = useState<GameState>(createInitialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    if (state.isComplete || state.gameOver || state.paused || !state.puzzleId) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setState((s) => ({ ...s, elapsedSeconds: s.elapsedSeconds + 1 }));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isComplete, state.gameOver, state.paused, state.puzzleId]);

  // Auto-save every 30s
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (state.puzzleId && !state.isComplete) {
        api.game
          .save({
            puzzle_id: state.puzzleId,
            board_state: state.board,
            time_elapsed: state.elapsedSeconds,
            mistakes: state.mistakes,
            mode: state.mode,
            difficulty: state.difficulty,
            completed: false,
          })
          .catch(() => {});
      }
    }, 30000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [state]);

  const loadPuzzle = useCallback(
    async (mode: GameMode, difficulty: Difficulty) => {
      const data = await api.sudoku.generate(difficulty, mode);
      const notes =
        mode === "wrong_notes" && data.wrong_notes
          ? notesFromWrongNotes(data.wrong_notes)
          : emptyNotes();

      setState({
        ...createInitialState(),
        puzzle: data.board,
        board: cloneBoard(data.board),
        solution: data.solution,
        notes,
        wrongNotesMap: data.wrong_notes || {},
        mode,
        difficulty,
        puzzleId: data.id,
        maxMistakes: mode === "training" ? Infinity : MAX_MISTAKES,
      });
    },
    []
  );

  const loadDaily = useCallback(async () => {
    const data = await api.sudoku.daily();
    setState({
      ...createInitialState(),
      puzzle: data.board,
      board: cloneBoard(data.board),
      solution: data.solution,
      notes: emptyNotes(),
      mode: "classic",
      difficulty: "medium",
      puzzleId: data.id,
    });
  }, []);

  const selectCell = useCallback((row: number, col: number) => {
    setState((s) => ({ ...s, selected: [row, col] }));
  }, []);

  const inputNumber = useCallback((num: number) => {
    setState((s) => {
      if (!s.selected || s.isComplete || s.gameOver) return s;
      const [row, col] = s.selected;
      if (isGiven(s.puzzle, row, col)) return s;

      if (s.notesMode) {
        const notes = cloneNotes(s.notes);
        if (notes[row][col].has(num)) {
          notes[row][col].delete(num);
        } else {
          notes[row][col].add(num);
        }
        return { ...s, notes };
      }

      const history = [...s.history, { board: cloneBoard(s.board), notes: cloneNotes(s.notes) }];
      const board = cloneBoard(s.board);
      board[row][col] = num;

      const notes = cloneNotes(s.notes);
      notes[row][col] = new Set();

      let mistakes = s.mistakes;
      if (s.mode !== "training" && num !== s.solution[row][col]) {
        mistakes += 1;
      }

      const gameOver = s.mode === "classic" && mistakes >= s.maxMistakes;
      const complete = !gameOver && isBoardComplete(board) && wrongCells(board, s.solution).size === 0;

      return { ...s, board, notes, mistakes, history, gameOver, isComplete: complete };
    });
  }, []);

  const erase = useCallback(() => {
    setState((s) => {
      if (!s.selected || s.isComplete || s.gameOver) return s;
      const [row, col] = s.selected;
      if (isGiven(s.puzzle, row, col)) return s;

      const history = [...s.history, { board: cloneBoard(s.board), notes: cloneNotes(s.notes) }];
      const board = cloneBoard(s.board);
      board[row][col] = 0;
      const notes = cloneNotes(s.notes);
      notes[row][col] = new Set();
      return { ...s, board, notes, history };
    });
  }, []);

  const undo = useCallback(() => {
    setState((s) => {
      if (s.history.length === 0) return s;
      const prev = s.history[s.history.length - 1];
      return {
        ...s,
        board: prev.board,
        notes: prev.notes,
        history: s.history.slice(0, -1),
      };
    });
  }, []);

  const toggleNotes = useCallback(() => {
    setState((s) => ({ ...s, notesMode: !s.notesMode }));
  }, []);

  const togglePause = useCallback(() => {
    setState((s) => ({ ...s, paused: !s.paused }));
  }, []);

  const restart = useCallback(() => {
    setState((s) => ({
      ...s,
      board: cloneBoard(s.puzzle),
      notes: emptyNotes(),
      mistakes: 0,
      history: [],
      isComplete: false,
      gameOver: false,
      hintsUsed: 0,
      elapsedSeconds: 0,
      paused: false,
    }));
  }, []);

  const setSkin = useCallback((skin: Skin) => {
    setState((s) => ({ ...s, skin }));
  }, []);

  const useHint = useCallback(async (): Promise<string | null> => {
    if (!state.selected) return null;
    const [row, col] = state.selected;
    if (isGiven(state.puzzle, row, col)) return null;

    setState((s) => ({ ...s, hintsUsed: s.hintsUsed + 1 }));

    try {
      const resp = await api.ai.hint({
        board: state.board,
        solution: state.solution,
        row,
        col,
        question: "Give me a hint for this cell",
      });
      return resp.explanation;
    } catch {
      return "Check which numbers are missing from this row, column, and box.";
    }
  }, [state.selected, state.board, state.solution, state.puzzle]);

  const moveSelection = useCallback((dr: number, dc: number) => {
    setState((s) => {
      if (!s.selected) return { ...s, selected: [0, 0] };
      const [r, c] = s.selected;
      const nr = Math.max(0, Math.min(8, r + dr));
      const nc = Math.max(0, Math.min(8, c + dc));
      return { ...s, selected: [nr, nc] };
    });
  }, []);

  return {
    state,
    loadPuzzle,
    loadDaily,
    selectCell,
    inputNumber,
    erase,
    undo,
    toggleNotes,
    togglePause,
    restart,
    setSkin,
    useHint,
    moveSelection,
  };
}
