import { useState } from "react";
import BlossomBorder from "./components/BlossomBorder";
import MainMenu, { DifficultyPicker } from "./components/MainMenu";
import PlayField from "./components/PlayField";
import {
  SudokuGame,
  type Difficulty,
} from "./sudoku/kernel";
import {
  defaultSaveStore,
  hasInProgressSave,
  writeInProgressSave,
  type SaveStore,
} from "./sudoku/save";

export type Screen =
  | "menu"
  | "difficulty"
  | "play"
  | "settings"
  | "leaderboard";

export type AppProps = {
  saveStore?: SaveStore | null;
  screen?: Screen;
  seed?: number;
  difficulty?: Difficulty;
};

export default function App({
  saveStore,
  screen: initialScreen = "menu",
  seed,
  difficulty: initialDifficulty = "easy",
}: AppProps) {
  const store = saveStore === undefined ? defaultSaveStore() : saveStore;
  const [canContinue, setCanContinue] = useState(() => hasInProgressSave(store));
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [game, setGame] = useState<SudokuGame | null>(() => {
    if (initialScreen !== "play") return null;
    return SudokuGame.generate(initialDifficulty, seed ?? 11);
  });

  function startGame(difficulty: Difficulty) {
    const nextSeed = seed ?? (Date.now() >>> 0);
    let lastError: unknown;
    for (let offset = 0; offset < 16; offset++) {
      try {
        const next = SudokuGame.generate(difficulty, (nextSeed + offset) >>> 0);
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
            onNewGame={() => setScreen("difficulty")}
            onContinue={() => {
              if (canContinue && game) setScreen("play");
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
            onMenu={() => {
              writeInProgressSave(store, game);
              setCanContinue(hasInProgressSave(store));
              setScreen("menu");
            }}
          />
        ) : null}
        {screen === "settings" ? (
          <StubScreen
            title="Settings"
            testId="settings-screen"
            body="Six themes land in a later ticket."
            onBack={() => setScreen("menu")}
          />
        ) : null}
        {screen === "leaderboard" ? (
          <StubScreen
            title="Leaderboard"
            testId="leaderboard-screen"
            body="Times land in a later ticket."
            onBack={() => setScreen("menu")}
          />
        ) : null}
      </main>
    </div>
  );
}

function StubScreen({
  title,
  testId,
  body,
  onBack,
}: {
  title: string;
  testId: string;
  body: string;
  onBack: () => void;
}) {
  return (
    <section className="menu-screen" data-testid={testId}>
      <h1>{title}</h1>
      <p className="tagline">{body}</p>
      <nav className="menu" aria-label={title}>
        <button type="button" data-testid={`${testId}-back`} onClick={onBack}>
          Back
        </button>
      </nav>
    </section>
  );
}
