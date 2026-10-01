import { useState } from "react";
import BlossomBorder from "./components/BlossomBorder";
import MainMenu, { DifficultyPicker } from "./components/MainMenu";
import Leaderboard from "./components/Leaderboard";
import PlayField from "./components/PlayField";
import Settings from "./components/Settings";
import {
  SudokuGame,
  type Difficulty,
} from "./sudoku/kernel";
import {
  clearInProgressSave,
  defaultSaveStore,
  hasInProgressSave,
  persistGame,
  restoreGame,
  type SaveStore,
} from "./sudoku/save";
import {
  defaultScoreStore,
  type ScoreStore,
} from "./sudoku/scores";
import {
  applyTheme,
  defaultThemeStore,
  readTheme,
  writeTheme,
  type ThemeId,
  type ThemeStore,
} from "./sudoku/theme";

export type Screen =
  | "menu"
  | "difficulty"
  | "play"
  | "settings"
  | "leaderboard";

export type AppProps = {
  saveStore?: SaveStore | null;
  themeStore?: ThemeStore | null;
  scoreStore?: ScoreStore | null;
  screen?: Screen;
  seed?: number;
  difficulty?: Difficulty;
};

export default function App({
  saveStore,
  themeStore,
  scoreStore,
  screen: initialScreen = "menu",
  seed,
  difficulty: initialDifficulty = "easy",
}: AppProps) {
  const store = saveStore === undefined ? defaultSaveStore() : saveStore;
  const tStore = themeStore === undefined ? defaultThemeStore() : themeStore;
  const sStore = scoreStore === undefined ? defaultScoreStore() : scoreStore;
  const [theme, setTheme] = useState<ThemeId>(() => {
    const id = readTheme(tStore);
    applyTheme(id);
    return id;
  });
  const [canContinue, setCanContinue] = useState(() => hasInProgressSave(store));
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [game, setGame] = useState<SudokuGame | null>(() => {
    if (initialScreen !== "play") return null;
    return SudokuGame.generate(initialDifficulty, seed ?? 11);
  });

  function refreshContinue(): void {
    setCanContinue(hasInProgressSave(store));
  }

  function startGame(difficulty: Difficulty) {
    const nextSeed = seed ?? (Date.now() >>> 0);
    let lastError: unknown;
    for (let offset = 0; offset < 16; offset++) {
      try {
        const next = SudokuGame.generate(difficulty, (nextSeed + offset) >>> 0);
        clearInProgressSave(store);
        refreshContinue();
        setGame(next);
        setScreen("play");
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error("Could not generate a puzzle");
  }

  return (
    <div className="shell">
      <BlossomBorder />
      <main className="app">
        {screen === "menu" ? (
          <MainMenu
            canContinue={canContinue}
            onNewGame={() => {
              clearInProgressSave(store);
              refreshContinue();
              setScreen("difficulty");
            }}
            onContinue={() => {
              const restored = restoreGame(store);
              if (!restored) return;
              setGame(restored);
              setScreen("play");
            }}
            onSettings={() => setScreen("settings")}
            onLeaderboard={() => setScreen("leaderboard")}
          />
        ) : null}
        {screen === "difficulty" ? (
          <DifficultyPicker
            onPick={startGame}
            onBack={() => setScreen("menu")}
          />
        ) : null}
        {screen === "play" && game ? (
          <PlayField
            game={game}
            scoreStore={sStore}
            onChange={(next) => {
              persistGame(store, next);
              refreshContinue();
            }}
            onMenu={() => {
              if (game.hasStarted()) persistGame(store, game);
              refreshContinue();
              setScreen("menu");
            }}
            onLeaderboard={() => {
              refreshContinue();
              setScreen("leaderboard");
            }}
          />
        ) : null}
        {screen === "settings" ? (
          <Settings
            theme={theme}
            onChoose={(id) => {
              writeTheme(tStore, id);
              applyTheme(id);
              setTheme(id);
            }}
            onBack={() => setScreen("menu")}
          />
        ) : null}
        {screen === "leaderboard" ? (
          <Leaderboard store={sStore} onBack={() => setScreen("menu")} />
        ) : null}
      </main>
    </div>
  );
}
