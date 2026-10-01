import type { Difficulty } from "../sudoku/kernel";

type Props = {
  canContinue: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  onSettings: () => void;
  onLeaderboard: () => void;
};

export default function MainMenu({
  canContinue,
  onNewGame,
  onContinue,
  onSettings,
  onLeaderboard,
}: Props) {
  return (
    <section className="menu-screen" data-testid="menu-screen">
      <h1>Cherry Blossom Soduko</h1>
      <p className="tagline">Sudoku with cherry-blossom chrome.</p>
      <nav className="menu" aria-label="Main">
        <button type="button" data-testid="new-game" onClick={onNewGame}>
          New Game
        </button>
        <button
          type="button"
          data-testid="continue"
          disabled={!canContinue}
          aria-disabled={!canContinue}
          aria-label={
            canContinue ? "Continue" : "Continue, no game in progress"
          }
          onClick={onContinue}
        >
          Continue
        </button>
        <button type="button" data-testid="settings" onClick={onSettings}>
          Settings
        </button>
        <button
          type="button"
          data-testid="leaderboard"
          onClick={onLeaderboard}
        >
          Leaderboard
        </button>
      </nav>
    </section>
  );
}

const DIFFICULTIES: Array<{ id: Difficulty; label: string; clues: number }> = [
  { id: "easy", label: "Easy", clues: 40 },
  { id: "medium", label: "Medium", clues: 30 },
  { id: "hard", label: "Hard", clues: 22 },
];

export function DifficultyPicker({
  onPick,
  onBack,
}: {
  onPick: (difficulty: Difficulty) => void;
  onBack: () => void;
}) {
  return (
    <section className="menu-screen" data-testid="difficulty-picker">
      <h1>New Game</h1>
      <p className="tagline">Choose a difficulty.</p>
      <nav className="menu" aria-label="Difficulty">
        {DIFFICULTIES.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`diff-${item.id}`}
            onClick={() => onPick(item.id)}
          >
            {item.label} · {item.clues} clues
          </button>
        ))}
        <button type="button" data-testid="diff-back" onClick={onBack}>
          Back
        </button>
      </nav>
    </section>
  );
}
