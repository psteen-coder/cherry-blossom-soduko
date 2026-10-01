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

Vite + React + TypeScript. Capacitor Android `org.cherryblossomsoduko.game`.

## Tests (PowerShell)

1. Open **PowerShell** (not Git Bash, not cmd).
2. `cd` to the **repo root** (the folder that contains `package.json` and `scripts`). GitHub zip extracts to:

   ```powershell
   cd "$env:USERPROFILE\Downloads\cherry-blossom-soduko-main\cherry-blossom-soduko"
   ```

3. Run Vitest, the production build, then Playwright:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\run-tests.ps1
   ```

   Or by hand:

   ```powershell
   npm install
   npx playwright install chromium
   npm test
   npm run build
   npm run test:e2e
   ```

`npm test` is Vitest (kernel generate/place/complete/difficulties, save, scores, high-score). `npm run test:e2e` is Playwright (menu + blossom borders, New Game Easy, digit-then-cell, Continue restore, six themes, win overlay + time, glitter on high score, leaderboard name). The built `dist/index.html` title must be **Cherry Blossom Soduko**, not Vite.

## Linux / macOS tests

```bash
cd /path/to/cherry-blossom-soduko
npm install
npx playwright install chromium
npm test
npm run build
npm run test:e2e
```

## Product

- Title: **Cherry Blossom Soduko** (not a Vite starter page)
- Opens on the **main menu** with cherry-blossom SVG borders (not the board)
- Menu: New Game → Easy / Medium / Hard, Continue (disabled if none; restores board, givens, entries, difficulty, and timer), Settings, Leaderboard (Easy / Medium / Hard, fastest first; `cherry-blossom-soduko:scores`)
- Autosave key `cherry-blossom-soduko:save` on every place/clear; New Game or a win disables Continue until the next place
- Play: select a digit 1–9 at the bottom, then tap a cell to place it
- Difficulties: Easy 40 clues / Medium 30 / Hard 22 (unique solutions)
- Themes: Dark, Light, Sakura, Sage, Lavender, Peach — Settings applies immediately via `data-theme` on `:root` and persists as `cherry-blossom-soduko:theme`
- Win: elapsed time over falling petals; petals glitter on a new high score

## Android APK (Windows)

Debug APK only. Sideload. No Play Store / AAB in this wave. Package `org.cherryblossomsoduko.game` 0.1.0, arm64-v8a, portrait.

1. Open **PowerShell** (not Git Bash, not cmd).
2. `cd` to the **repo root** (the folder that contains `package.json` and `scripts`). GitHub zip extracts to:

   ```powershell
   cd "$env:USERPROFILE\Downloads\cherry-blossom-soduko-main\cherry-blossom-soduko"
   ```

3. Needs Node 22+, JDK 21, and Android SDK (`ANDROID_HOME`). Then:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1
   ```

4. APK path (after a successful local build):

   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```

The script builds the Vite bundle, runs `npx cap sync android`, then `gradlew.bat assembleDebug`.

GitHub Actions: **Actions → Android debug APK → Run workflow** (`workflow_dispatch`). Artifact name `CherryBlossomSoduko.apk`. Also runs on push to `main` and `bolt/**`.

Capacitor WebView loads `https://localhost`, so `android.permission.INTERNET` stays in the manifest. The game itself makes no network calls. Device/redroid smoke is a later ticket.

Hardware back on play/settings/leaderboard/difficulty returns to the main menu and leaves Continue intact when a game is in progress. Digit pad then cell is tap-only (no hover).
