export const CLUE_COUNTS = {
  easy: 40,
  medium: 30,
  hard: 22,
} as const;

export type Difficulty = keyof typeof CLUE_COUNTS;

export type Cell = {
  value: number | null;
  given: boolean;
  conflict: boolean;
};

export type PlaceResult =
  | { ok: true }
  | { ok: false; reason: "given" | "invalid" };

export type Clock = () => number;

const SIZE = 9;
const FULL_MASK = 0x1ff;
const BOX_OF = (row: number, col: number): number =>
  Math.floor(row / 3) * 3 + Math.floor(col / 3);

function isDigit(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

function inBounds(row: number, col: number): boolean {
  return (
    Number.isInteger(row) &&
    Number.isInteger(col) &&
    row >= 0 &&
    row < SIZE &&
    col >= 0 &&
    col < SIZE
  );
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function emptyGrid(): number[][] {
  return Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));
}

function copyGrid(grid: number[][]): number[][] {
  return grid.map((row) => row.slice());
}

function popcount(mask: number): number {
  let n = mask;
  let count = 0;
  while (n) {
    n &= n - 1;
    count++;
  }
  return count;
}

function bitToDigit(bit: number): number {
  let digit = 1;
  let cursor = 1;
  while (cursor !== bit) {
    cursor <<= 1;
    digit++;
  }
  return digit;
}

function canPlace(grid: number[][], row: number, col: number, digit: number): boolean {
  for (let i = 0; i < SIZE; i++) {
    if (grid[row][i] === digit || grid[i][col] === digit) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (grid[r][c] === digit) return false;
    }
  }
  return true;
}

function fillSolution(rng: () => number): number[][] {
  const grid = emptyGrid();
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const dfs = (index: number): boolean => {
    if (index === SIZE * SIZE) return true;
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    for (const digit of shuffle(digits, rng)) {
      if (!canPlace(grid, row, col, digit)) continue;
      grid[row][col] = digit;
      if (dfs(index + 1)) return true;
      grid[row][col] = 0;
    }
    return false;
  };
  if (!dfs(0)) {
    throw new Error("Sudoku fill failed");
  }
  return grid;
}

/**
 * Count solutions of a 9×9 grid (0 = empty). Stops at `limit` (default 2).
 */
export function countSolutions(grid: number[][], limit = 2): number {
  const board = copyGrid(grid);
  const rowMask = Array<number>(SIZE).fill(0);
  const colMask = Array<number>(SIZE).fill(0);
  const boxMask = Array<number>(SIZE).fill(0);
  const empties: Array<[number, number]> = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = board[r][c];
      if (value === 0) {
        empties.push([r, c]);
        continue;
      }
      const bit = 1 << (value - 1);
      if (
        rowMask[r] & bit ||
        colMask[c] & bit ||
        boxMask[BOX_OF(r, c)] & bit
      ) {
        return 0;
      }
      rowMask[r] |= bit;
      colMask[c] |= bit;
      boxMask[BOX_OF(r, c)] |= bit;
    }
  }

  let found = 0;
  const dfs = (): boolean => {
    if (found >= limit) return true;
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < empties.length; i++) {
      const [r, c] = empties[i];
      if (board[r][c] !== 0) continue;
      const used = rowMask[r] | colMask[c] | boxMask[BOX_OF(r, c)];
      const mask = ~used & FULL_MASK;
      const n = popcount(mask);
      if (n === 0) return false;
      if (n < bestCount) {
        bestCount = n;
        best = i;
        bestMask = mask;
        if (n === 1) break;
      }
    }
    if (best === -1) {
      found++;
      return found >= limit;
    }
    const [row, col] = empties[best];
    let mask = bestMask;
    while (mask) {
      const bit = mask & -mask;
      mask ^= bit;
      const digit = bitToDigit(bit);
      board[row][col] = digit;
      rowMask[row] |= bit;
      colMask[col] |= bit;
      boxMask[BOX_OF(row, col)] |= bit;
      const done = dfs();
      board[row][col] = 0;
      rowMask[row] ^= bit;
      colMask[col] ^= bit;
      boxMask[BOX_OF(row, col)] ^= bit;
      if (done) return true;
    }
    return false;
  };

  dfs();
  return found;
}

function tryRemoveCell(puzzle: number[][], row: number, col: number): boolean {
  const saved = puzzle[row][col];
  if (saved === 0) return false;
  puzzle[row][col] = 0;
  if (countSolutions(puzzle, 2) === 1) return true;
  puzzle[row][col] = saved;
  return false;
}

function filledCells(puzzle: number[][]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (puzzle[r][c] !== 0) out.push([r, c]);
    }
  }
  return out;
}

function emptyCells(puzzle: number[][]): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (puzzle[r][c] === 0) out.push([r, c]);
    }
  }
  return out;
}

function clueCount(puzzle: number[][]): number {
  let n = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (puzzle[r][c] !== 0) n++;
    }
  }
  return n;
}

function stripToTarget(
  puzzle: number[][],
  solution: number[][],
  targetClues: number,
  rng: () => number,
): boolean {
  let clues = clueCount(puzzle);
  for (const [row, col] of shuffle(filledCells(puzzle), rng)) {
    if (clues <= targetClues) break;
    if (tryRemoveCell(puzzle, row, col)) clues--;
  }

  for (let step = 0; step < 800 && clues > targetClues; step++) {
    const holes = emptyCells(puzzle);
    const filled = filledCells(puzzle);
    if (holes.length === 0 || filled.length === 0) break;
    const [hr, hc] = holes[Math.floor(rng() * holes.length)];
    puzzle[hr][hc] = solution[hr][hc];
    clues++;
    let removed = 0;
    for (const [row, col] of shuffle(filledCells(puzzle), rng)) {
      if (removed >= 2 || clues <= targetClues) break;
      if (row === hr && col === hc) continue;
      if (tryRemoveCell(puzzle, row, col)) {
        clues--;
        removed++;
      }
    }
  }
  return clueCount(puzzle) === targetClues && countSolutions(puzzle, 2) === 1;
}

function makeUniquePuzzle(
  solution: number[][],
  targetClues: number,
  rng: () => number,
): number[][] | null {
  const puzzle = emptyGrid();
  const order = shuffle(
    Array.from({ length: SIZE * SIZE }, (_, i) => i),
    rng,
  );
  let clues = 0;
  let unique = false;
  for (const pos of order) {
    const row = Math.floor(pos / SIZE);
    const col = pos % SIZE;
    puzzle[row][col] = solution[row][col];
    clues++;
    if (clues >= 17 && countSolutions(puzzle, 2) === 1) {
      unique = true;
      break;
    }
  }
  if (!unique) return null;

  if (clues < targetClues) {
    for (const pos of order) {
      if (clues >= targetClues) break;
      const row = Math.floor(pos / SIZE);
      const col = pos % SIZE;
      if (puzzle[row][col] !== 0) continue;
      puzzle[row][col] = solution[row][col];
      clues++;
    }
    return clues === targetClues && countSolutions(puzzle, 2) === 1
      ? puzzle
      : null;
  }

  if (clues === targetClues) return puzzle;
  return stripToTarget(puzzle, solution, targetClues, rng) ? puzzle : null;
}

function generatePuzzle(
  difficulty: Difficulty,
  seed: number,
): { puzzle: number[][]; solution: number[][] } {
  const target = CLUE_COUNTS[difficulty];
  const rng = mulberry32(seed);
  const maxAttempts = difficulty === "hard" ? 80 : 20;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const solution = fillSolution(rng);
    const puzzle = makeUniquePuzzle(solution, target, rng);
    if (puzzle) return { puzzle, solution };
  }
  throw new Error(
    `Could not generate a unique ${difficulty} puzzle (${target} clues) for seed ${seed}`,
  );
}

export class SudokuGame {
  readonly size = SIZE;
  readonly difficulty: Difficulty;
  readonly seed: number;

  private readonly cells: Cell[][];
  private readonly solution: number[][];
  private readonly now: Clock;
  private startedAtMs: number | null = null;

  private constructor(
    difficulty: Difficulty,
    seed: number,
    puzzle: number[][],
    solution: number[][],
    now: Clock,
  ) {
    this.difficulty = difficulty;
    this.seed = seed;
    this.solution = solution;
    this.now = now;
    this.cells = Array.from({ length: SIZE }, (_, row) =>
      Array.from({ length: SIZE }, (_, col) => {
        const value = puzzle[row][col];
        const given = value !== 0;
        return {
          value: given ? value : null,
          given,
          conflict: false,
        };
      }),
    );
  }

  static generate(
    difficulty: Difficulty,
    seed: number,
    opts?: { now?: Clock },
  ): SudokuGame {
    if (!(difficulty in CLUE_COUNTS)) {
      throw new Error(`Unknown difficulty: ${String(difficulty)}`);
    }
    const { puzzle, solution } = generatePuzzle(difficulty, seed >>> 0);
    return new SudokuGame(
      difficulty,
      seed,
      puzzle,
      solution,
      opts?.now ?? Date.now,
    );
  }

  cell(row: number, col: number): Cell {
    if (!inBounds(row, col)) {
      throw new Error(`Cell out of bounds: ${row},${col}`);
    }
    const current = this.cells[row][col];
    return {
      value: current.value,
      given: current.given,
      conflict: current.conflict,
    };
  }

  solutionAt(row: number, col: number): number {
    if (!inBounds(row, col)) {
      throw new Error(`Cell out of bounds: ${row},${col}`);
    }
    return this.solution[row][col];
  }

  place(row: number, col: number, digit: number): PlaceResult {
    if (!inBounds(row, col) || !isDigit(digit)) {
      return { ok: false, reason: "invalid" };
    }
    const cell = this.cells[row][col];
    if (cell.given) return { ok: false, reason: "given" };
    cell.value = digit;
    if (this.startedAtMs === null) this.startedAtMs = this.now();
    this.recomputeConflicts();
    return { ok: true };
  }

  clear(row: number, col: number): PlaceResult {
    if (!inBounds(row, col)) {
      return { ok: false, reason: "invalid" };
    }
    const cell = this.cells[row][col];
    if (cell.given) return { ok: false, reason: "given" };
    cell.value = null;
    this.recomputeConflicts();
    return { ok: true };
  }

  isComplete(): boolean {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = this.cells[r][c];
        if (cell.value === null || cell.conflict) return false;
      }
    }
    return true;
  }

  elapsedSeconds(): number {
    if (this.startedAtMs === null) return 0;
    return Math.max(0, Math.floor((this.now() - this.startedAtMs) / 1000));
  }

  private recomputeConflicts(): void {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        this.cells[r][c].conflict = false;
      }
    }

    const markDupes = (coords: Array<[number, number]>): void => {
      const buckets = new Map<number, Array<[number, number]>>();
      for (const [r, c] of coords) {
        const value = this.cells[r][c].value;
        if (value === null) continue;
        const list = buckets.get(value);
        if (list) list.push([r, c]);
        else buckets.set(value, [[r, c]]);
      }
      for (const list of buckets.values()) {
        if (list.length < 2) continue;
        for (const [r, c] of list) this.cells[r][c].conflict = true;
      }
    };

    for (let r = 0; r < SIZE; r++) {
      markDupes(Array.from({ length: SIZE }, (_, c) => [r, c]));
    }
    for (let c = 0; c < SIZE; c++) {
      markDupes(Array.from({ length: SIZE }, (_, r) => [r, c]));
    }
    for (let br = 0; br < SIZE; br += 3) {
      for (let bc = 0; bc < SIZE; bc += 3) {
        const coords: Array<[number, number]> = [];
        for (let r = br; r < br + 3; r++) {
          for (let c = bc; c < bc + 3; c++) coords.push([r, c]);
        }
        markDupes(coords);
      }
    }
  }
}
