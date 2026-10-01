import type { Difficulty } from "./kernel";

export const SCORES_KEY = "cherry-blossom-soduko:scores";

export type ScoreEntry = {
  name: string;
  difficulty: Difficulty;
  timeSeconds: number;
  at: number;
};

export type ScoreStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function defaultScoreStore(): ScoreStore | null {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    return storage;
  } catch {
    return null;
  }
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

function parseEntry(value: unknown): ScoreEntry | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as {
    name?: unknown;
    difficulty?: unknown;
    timeSeconds?: unknown;
    at?: unknown;
  };
  if (typeof rec.name !== "string") return null;
  if (!isDifficulty(rec.difficulty)) return null;
  const timeSeconds = Number(rec.timeSeconds);
  const at = Number(rec.at);
  if (!Number.isFinite(timeSeconds) || timeSeconds < 0) return null;
  if (!Number.isFinite(at)) return null;
  return {
    name: rec.name,
    difficulty: rec.difficulty,
    timeSeconds: Math.floor(timeSeconds),
    at,
  };
}

export function readScores(
  store: ScoreStore | null = defaultScoreStore(),
): ScoreEntry[] {
  if (!store) return [];
  const raw = store.getItem(SCORES_KEY);
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map(parseEntry).filter((row): row is ScoreEntry => row !== null);
  } catch {
    return [];
  }
}

export function lastUsedName(
  store: ScoreStore | null = defaultScoreStore(),
): string {
  const scores = readScores(store);
  if (scores.length === 0) return "";
  return scores[scores.length - 1].name;
}

export function scoresForDifficulty(
  store: ScoreStore | null,
  difficulty: Difficulty,
): ScoreEntry[] {
  return readScores(store)
    .filter((row) => row.difficulty === difficulty)
    .slice()
    .sort((a, b) => {
      if (a.timeSeconds !== b.timeSeconds) return a.timeSeconds - b.timeSeconds;
      return a.at - b.at;
    });
}

export function isHighScore(
  store: ScoreStore | null,
  difficulty: Difficulty,
  timeSeconds: number,
): boolean {
  const rows = scoresForDifficulty(store, difficulty);
  if (rows.length === 0) return true;
  return timeSeconds < rows[0].timeSeconds;
}

export function recordScore(
  store: ScoreStore | null,
  entry: ScoreEntry,
): ScoreEntry {
  const next: ScoreEntry = {
    name: entry.name,
    difficulty: entry.difficulty,
    timeSeconds: Math.max(0, Math.floor(entry.timeSeconds)),
    at: entry.at,
  };
  if (!store) return next;
  const scores = readScores(store);
  scores.push(next);
  store.setItem(SCORES_KEY, JSON.stringify(scores));
  return next;
}
