# Build a household debug APK (Capacitor WebView wrapping the Vite app).
# Usage from repo root:
#   powershell -ExecutionPolicy Bypass -File .\scripts\build-apk.ps1
#
# Needs: Node 22+, JDK 21, Android SDK (ANDROID_HOME). No Play Store / no AAB.

$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))

if (-not (Test-Path "package.json")) {
  Write-Error "package.json not found. Run this script from the repo (scripts\ is next to package.json)."
}

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing npm dependencies..."
  npm install
}

Write-Host "Building web bundle..."
npm run build

Write-Host "Syncing Capacitor Android..."
npx cap sync android

$gradlew = Join-Path "android" "gradlew.bat"
if (-not (Test-Path $gradlew)) {
  Write-Error "android\gradlew.bat missing. Run: npx cap add android"
}

Write-Host "Assembling debug APK..."
Push-Location android
try {
  & .\gradlew.bat assembleDebug --no-daemon
  if ($LASTEXITCODE -ne 0) { throw "gradlew assembleDebug failed" }
} finally {
  Pop-Location
}

$apk = Join-Path "android" "app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) {
  Write-Error "APK not found at $apk"
}

Write-Host "Debug APK: $((Resolve-Path $apk).Path)"
Write-Host "Sideload only (org.cherryblossomsoduko.game). No Play Store. No AAB."
