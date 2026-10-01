# Build Cherry Blossom Soduko from repo root (folder that contains package.json).
# Usage from repo root:
#   powershell -ExecutionPolicy Bypass -File .\scripts\run-tests.ps1

$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))

if (-not (Test-Path "package.json")) {
  Write-Error "package.json not found. Run this script from the repo (scripts\ is next to package.json)."
}

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing npm dependencies..."
  npm install
}

Write-Host "npm test"
npm test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "npm run build"
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$index = Get-Content -Raw (Join-Path "dist" "index.html")
if ($index -notmatch "<title>Cherry Blossom Soduko</title>") {
  Write-Error "Built index title is not Cherry Blossom Soduko."
}
if ($index -match "<title>[^<]*Vite") {
  Write-Error "Built index still has a Vite starter title."
}

Write-Host "Build green. Title is Cherry Blossom Soduko."
