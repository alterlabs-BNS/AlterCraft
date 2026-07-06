$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath ".git" -PathType Container)) {
  throw "Run this script from the AlterCraft git repository root."
}

$hookDir = Join-Path (Resolve-Path ".git").Path "hooks"
New-Item -ItemType Directory -Force -Path $hookDir | Out-Null

$hookPath = Join-Path $hookDir "pre-commit"
$hook = @(
  "#!/bin/sh",
  "node scripts/altereco-pre-commit-guard.mjs"
)

$hook | Set-Content -LiteralPath $hookPath -Encoding ASCII
Write-Host "Installed AlterECO pre-commit guard at $hookPath"
