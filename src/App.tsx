export default function App() {
  return (
    <main className="app">
      <h1>Cherry Blossom Soduko</h1>
      <p className="tagline">Sudoku with cherry-blossom chrome.</p>
      <nav className="menu" aria-label="Main">
        <button type="button" data-testid="new-game">
          New Game
        </button>
        <button type="button" data-testid="continue" disabled>
          Continue
        </button>
        <button type="button" data-testid="settings">
          Settings
        </button>
        <button type="button" data-testid="leaderboard">
          Leaderboard
        </button>
      </nav>
    </main>
  );
}
