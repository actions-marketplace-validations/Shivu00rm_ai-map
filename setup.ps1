# .ai-map Framework Setup (Windows PowerShell)
#
# Usage:
#   .\setup.ps1
#   .\setup.ps1 -Target "C:\path\to\your\project"
#

param(
    [string]$Target = "."
)

if (-not (Test-Path $Target)) {
    Write-Error "Directory '$Target' does not exist."
    exit 1
}

Write-Host "Setting up .ai-map in: $Target"

# Create directories
New-Item -ItemType Directory -Force -Path "$Target\.ai-map" | Out-Null
New-Item -ItemType Directory -Force -Path "$Target\.github" | Out-Null

# Copy template files
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplateDir = Join-Path $ScriptDir "template"

if (Test-Path $TemplateDir) {
    Get-ChildItem "$TemplateDir\.ai-map\*" | ForEach-Object {
        $dest = Join-Path "$Target\.ai-map" $_.Name
        if (-not (Test-Path $dest)) {
            Copy-Item $_.FullName $dest
        }
    }

    $filesToCopy = @("AGENTS.md", "CLAUDE.md", ".cursorrules", ".windsurfrules")
    foreach ($file in $filesToCopy) {
        $src = Join-Path $TemplateDir $file
        $dest = Join-Path $Target $file
        if ((Test-Path $src) -and -not (Test-Path $dest)) {
            Copy-Item $src $dest
        }
    }

    $copilotSrc = Join-Path $TemplateDir ".github\copilot-instructions.md"
    $copilotDest = Join-Path $Target ".github\copilot-instructions.md"
    if ((Test-Path $copilotSrc) -and -not (Test-Path $copilotDest)) {
        Copy-Item $copilotSrc $copilotDest
    }

    Write-Host "Done! Template files copied to $Target\.ai-map\"
} else {
    $files = @("README.md", "ARCHITECTURE.md", "SOP.md", "FLOW_MAP.md", "GOAL_TRACKER.md", "DECISIONS.md", "KNOWN_ISSUES.md", "SESSION_LOG.md")
    foreach ($file in $files) {
        $dest = Join-Path "$Target\.ai-map" $file
        if (-not (Test-Path $dest)) {
            "# $($file -replace '\.md$', '')`n`n<!-- Fill this in with your project details -->" | Out-File -FilePath $dest -Encoding utf8
        }
    }
    Write-Host "Done! Empty template files created in $Target\.ai-map\"
}

Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Start a conversation with your AI agent in this project."
Write-Host "  2. The agent will detect AUTO-FILL markers and populate .ai-map\ from your repo automatically."
Write-Host "  3. Review the filled files (.ai-map\README.md first) and correct anything wrong."
Write-Host "  4. See .ai-map\INIT.md for the auto-fill SOP and ongoing update triggers."
