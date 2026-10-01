# Cherry Blossom Soduko

Android Sudoku with cherry-blossom chrome, three difficulties, six themes, and a timed leaderboard.

## Run on Windows (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-local.ps1
```

1. Open **PowerShell** (not Git Bash, not cmd).
2. `cd` to the **repo root** (the folder that contains `package.json` and `scripts`). GitHub zip extracts to:

   ```powershell
   cd "$env:USERPROFILE\Downloads\cherry-blossom-soduko-main\cherry-blossom-soduko"
   ```

3. Start the app with the Bypass command above.
4. Leave that window open. Open http://127.0.0.1:5173 in a browser. Ctrl+C in PowerShell stops the server.

The script `Set-Location`s to the repo root via `$PSScriptRoot`, runs `npm install` if `node_modules` is missing, then `npm run dev -- --host 127.0.0.1 --port 5173`.

## Linux / macOS

```bash
cd /path/to/cherry-blossom-soduko
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Then open http://127.0.0.1:5173.

## Stack

Vite + React + TypeScript. Capacitor Android later (`org.cherryblossomsoduko.game`).

## Tests (PowerShell)

1. Open **PowerShell** (not Git Bash, not cmd).
2. `cd` to the **repo root** (the folder that contains `package.json` and `scripts`). GitHub zip extracts to:

   ```powershell
   cd "$env:USERPROFILE\Downloads\cherry-blossom-soduko-main\cherry-blossom-soduko"
   ```

3. Run kernel tests then the production build:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\run-tests.ps1
   ```

   Or by hand:

   ```powershell
   npm install
   npm test
   npm run build
   ```

`npm test` is Vitest (Sudoku kernel). The built `dist/index.html` title must be **Cherry Blossom Soduko**, not Vite.

## Linux / macOS tests

```bash
cd /path/to/cherry-blossom-soduko
npm install
npm test
npm run build
```

## Product

- Title: **Cherry Blossom Soduko** (not a Vite starter page)
- Opens on the **main menu** with cherry-blossom SVG borders (not the board)
- Menu: New Game → Easy / Medium / Hard, Continue (disabled if none), Settings, Leaderboard
- Play: select a digit 1–9 at the bottom, then tap a cell to place it
- Difficulties: Easy 40 clues / Medium 30 / Hard 22 (unique solutions)
- Themes: Dark, Light, Sakura, Sage, Lavender, Peach
- Win: elapsed time over falling petals; petals glitter on a new high score

## Android APK (Windows)

Later in this bolt. Debug APK only. No Play Store / AAB in this wave.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1
```
