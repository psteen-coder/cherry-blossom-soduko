import { formatElapsed } from "../sudoku/play";
import {
  scoresForDifficulty,
  type ScoreEntry,
  type ScoreStore,
} from "../sudoku/scores";

const SECTIONS: Array<{ id: "easy" | "medium" | "hard"; label: string }> = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

type Props = {
  store: ScoreStore | null;
  onBack: () => void;
};

export default function Leaderboard({ store, onBack }: Props) {
  return (
    <section className="menu-screen" data-testid="leaderboard-screen">
      <h1>Leaderboard</h1>
      <p className="tagline">Fastest times per difficulty.</p>
      {SECTIONS.map((section) => (
        <Section
          key={section.id}
          id={section.id}
          label={section.label}
          rows={scoresForDifficulty(store, section.id)}
        />
      ))}
      <nav className="menu" aria-label="Leaderboard">
        <button type="button" data-testid="leaderboard-back" onClick={onBack}>
          Back
        </button>
      </nav>
    </section>
  );
}

function Section({
  id,
  label,
  rows,
}: {
  id: "easy" | "medium" | "hard";
  label: string;
  rows: ScoreEntry[];
}) {
  return (
    <div className="lb-section" data-testid={`lb-${id}`}>
      <h2>{label}</h2>
      {rows.length === 0 ? (
        <p className="lb-empty">No times yet.</p>
      ) : (
        <ol className="lb-list">
          {rows.map((row, index) => (
            <li
              key={`${row.at}-${row.name}-${index}`}
              data-testid={`score-${id}-${index}`}
            >
              <span className="lb-name">{row.name}</span>
              <span className="lb-time">{formatElapsed(row.timeSeconds)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
