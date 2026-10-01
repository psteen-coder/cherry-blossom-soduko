import { useEffect, useMemo, useState } from "react";
import type { SudokuGame } from "../sudoku/kernel";
import { formatElapsed, PlaySession } from "../sudoku/play";

type Props = {
  game: SudokuGame;
  onMenu: () => void;
};

export default function PlayField({ game, onMenu }: Props) {
  const session = useMemo(() => new PlaySession(game), [game]);
  const [, setRev] = useState(0);
  const bump = () => setRev((n) => n + 1);

  useEffect(() => {
    const id = window.setInterval(bump, 1000);
    return () => window.clearInterval(id);
  }, []);

  const cells = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = game.cell(row, col);
      const thickRight = col === 2 || col === 5;
      const thickBottom = row === 2 || row === 5;
      const classes = [
        "cell",
        cell.given ? "cell-given" : "cell-playable",
        cell.conflict ? "cell-conflict" : "",
        thickRight ? "cell-box-right" : "",
        thickBottom ? "cell-box-bottom" : "",
      ]
        .filter(Boolean)
        .join(" ");
      cells.push(
        <button
          key={`${row}-${col}`}
          type="button"
          className={classes}
          data-testid={`cell-${row}-${col}`}
          data-given={cell.given ? "true" : "false"}
          data-conflict={cell.conflict ? "true" : "false"}
          aria-label={`Row ${row + 1} column ${col + 1}${cell.value ? `, ${cell.value}` : ", empty"}`}
          onClick={() => {
            session.tapCell(row, col);
            bump();
          }}
        >
          {cell.value ?? ""}
        </button>,
      );
    }
  }

  return (
    <section className="play-screen" data-testid="play-field">
      <header className="play-bar">
        <button type="button" data-testid="play-menu" onClick={onMenu}>
          Menu
        </button>
        <p className="play-diff" data-testid="play-difficulty">
          {label(game.difficulty)}
        </p>
        <p className="play-time" data-testid="play-time">
          {formatElapsed(game.elapsedSeconds())}
        </p>
      </header>
      <div className="board" data-testid="board" role="grid" aria-label="Sudoku">
        {cells}
      </div>
      <div className="digit-pad" data-testid="digit-pad" role="group" aria-label="Number pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            type="button"
            data-testid={`pad-${digit}`}
            className={session.selectedDigit === digit ? "pad-selected" : ""}
            aria-pressed={session.selectedDigit === digit}
            onClick={() => {
              session.selectDigit(digit);
              bump();
            }}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          data-testid="pad-erase"
          className={session.eraseSelected ? "pad-selected" : ""}
          aria-pressed={session.eraseSelected}
          onClick={() => {
            session.selectErase();
            bump();
          }}
        >
          Erase
        </button>
      </div>
    </section>
  );
}

function label(difficulty: SudokuGame["difficulty"]): string {
  if (difficulty === "easy") return "Easy";
  if (difficulty === "medium") return "Medium";
  return "Hard";
}
