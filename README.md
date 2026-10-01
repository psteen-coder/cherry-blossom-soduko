# Cherry Blossom Soduko

Android Sudoku with cherry-blossom chrome, three difficulties, six themes, and a timed leaderboard.

## Run (Windows)

From the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-local.ps1
```

Then open http://127.0.0.1:5173

## Tests (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-tests.ps1
```

## Android APK (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1
```

Debug APK only. No Play Store / AAB in this wave.

## Product

- Title: **Cherry Blossom Soduko** (not a Vite starter page)
- Menu: New Game, Continue (if a game is in progress), Settings, Leaderboard
- Play: select a digit 1–9 at the bottom, then tap a cell to place it
- Difficulties: Easy / Medium / Hard
- Themes: Dark, Light, Sakura, Sage, Lavender, Peach
- Win: elapsed time over falling petals; petals glitter on a new high score
