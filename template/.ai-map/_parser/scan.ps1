# .ai-map scanner dispatcher (Windows PowerShell)
# Usage: powershell -File .ai-map/_parser/scan.ps1 [-Root path]

param([string]$Root = (Get-Location).Path)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (Test-Path (Join-Path $Root "package.json")) {
  if (Get-Command node -ErrorAction SilentlyContinue) {
    & node (Join-Path $ScriptDir "scan.mjs") $Root
    exit 0
  } else {
    Write-Warning "[.ai-map] node not found, skipping JS/TS scan"
  }
}

if ((Test-Path (Join-Path $Root "pyproject.toml")) -or (Test-Path (Join-Path $Root "requirements.txt")) -or (Test-Path (Join-Path $Root "setup.py"))) {
  $py = Get-Command python -ErrorAction SilentlyContinue
  if (-not $py) { $py = Get-Command python3 -ErrorAction SilentlyContinue }
  if ($py) {
    & $py.Source (Join-Path $ScriptDir "scan.py") $Root
    exit 0
  } else {
    Write-Warning "[.ai-map] python not found, skipping Python scan"
  }
}

Write-Host "[.ai-map] no supported stack detected — agent should fall back to lite-mode scan (see INIT.md)"
exit 1
