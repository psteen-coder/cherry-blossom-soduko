# Launch Cherry Blossom Soduko from repo root (folder that contains package.json).
# Usage from repo root:
#   powershell -ExecutionPolicy Bypass -File .\scripts\run-local.ps1

$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))

if (-not (Test-Path "package.json")) {
  Write-Error "package.json not found. Run this script from the repo (scripts\ is next to package.json)."
}

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing npm dependencies..."
  npm install
}

Write-Host "Starting Cherry Blossom Soduko at http://127.0.0.1:5173"
Write-Host "Leave this window open. Ctrl+C stops the server."
npm run dev -- --host 127.0.0.1 --port 5173
