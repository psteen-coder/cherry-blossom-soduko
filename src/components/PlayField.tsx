import type { SudokuGame } from "../sudoku/kernel";

type Props = {
  game: SudokuGame;
  onMenu: () => void;
};

export default function PlayField({ game, onMenu }: Props) {
  const cells = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = game.cell(row, col);
      const thickRight = col === 2 || col === 5;
      const thickBottom = row === 2 || row === 5;
      cells.push(
        <div
          key={`${row}-${col}`}
          className={`cell${cell.given ? " cell-given" : ""}${thickRight ? " cell-box-right" : ""}${thickBottom ? " cell-box-bottom" : ""}`}
          data-testid={`cell-${row}-${col}`}
          data-given={cell.given ? "true" : "false"}
        >
          {cell.value ?? ""}
        </div>,
      );
    }
  }

  return (
    <section className="play-screen" data-testid="play-field">
      <header className="play-bar">
        <button type="button" data-testid="play-menu" onClick={onMenu}>
          Menu
        </button>
        <p className="play-diff">{label(game.difficulty)}</p>
      </header>
      <div className="board" data-testid="board" role="grid" aria-label="Sudoku">
        {cells}
      </div>
    </section>
  );
}

function label(difficulty: SudokuGame["difficulty"]): string {
  if (difficulty === "easy") return "Easy";
  if (difficulty === "medium") return "Medium";
  return "Hard";
}
