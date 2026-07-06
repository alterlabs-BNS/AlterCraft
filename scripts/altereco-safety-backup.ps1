param(
  [string]$DestinationRoot = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath ".git" -PathType Container)) {
  throw "Run this script from the AlterCraft git repository root."
}

$repo = (Resolve-Path ".").Path
$parent = Split-Path -Parent $repo

if ([string]::IsNullOrWhiteSpace($DestinationRoot)) {
  $DestinationRoot = Join-Path $parent "_safety_backups"
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $DestinationRoot "alter-craft-untracked-$stamp"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$cleanManifest = Join-Path $backupDir "git-clean-dry-run.txt"
$cleanIgnoredManifest = Join-Path $backupDir "git-clean-dry-run-include-ignored.txt"
$statusPath = Join-Path $backupDir "git-status-porcelain.txt"
$csvPath = Join-Path $backupDir "untracked-manifest.csv"
$skippedPath = Join-Path $backupDir "untracked-skipped.csv"
$trackedDiff = Join-Path $backupDir "tracked-working-tree.diff"
$stagedDiff = Join-Path $backupDir "staged-index.diff"
$diffStat = Join-Path $backupDir "tracked-diff-stat.txt"
$summaryPath = Join-Path $backupDir "backup-summary.txt"
$zipPath = Join-Path $backupDir "untracked-files.zip"

git status --porcelain=v1 | Set-Content -LiteralPath $statusPath -Encoding UTF8
git clean -n -d | Set-Content -LiteralPath $cleanManifest -Encoding UTF8
git clean -n -d -x | Set-Content -LiteralPath $cleanIgnoredManifest -Encoding UTF8
git diff --binary --output=$trackedDiff
git diff --cached --binary --output=$stagedDiff
git diff --stat | Set-Content -LiteralPath $diffStat -Encoding UTF8

$raw = git ls-files --others --exclude-standard -z
$files = @($raw -split "`0" | Where-Object { $_ -ne "" })

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
$manifest = New-Object System.Collections.Generic.List[object]
$skipped = New-Object System.Collections.Generic.List[object]
$totalBytes = [int64]0

try {
  foreach ($rel in $files) {
    $abs = Join-Path $repo $rel
    if (-not (Test-Path -LiteralPath $abs -PathType Leaf)) {
      continue
    }

    try {
      $item = Get-Item -LiteralPath $abs
      $entryName = $rel -replace "\\", "/"
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $zip,
        $item.FullName,
        $entryName,
        [System.IO.Compression.CompressionLevel]::Optimal
      ) | Out-Null

      $hash = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256).Hash
      $totalBytes += $item.Length
      $manifest.Add([PSCustomObject]@{
        path = $rel
        bytes = $item.Length
        sha256 = $hash
        last_write_time = $item.LastWriteTime.ToString("o")
      }) | Out-Null
    } catch {
      $skipped.Add([PSCustomObject]@{
        path = $rel
        error = $_.Exception.Message
      }) | Out-Null
    }
  }
} finally {
  $zip.Dispose()
}

$manifest | Export-Csv -NoTypeInformation -LiteralPath $csvPath -Encoding UTF8
$skipped | Export-Csv -NoTypeInformation -LiteralPath $skippedPath -Encoding UTF8

$zipHash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
$summary = @(
  "repo=$repo",
  "created_at=$((Get-Date).ToString("o"))",
  "untracked_files_seen=$($files.Count)",
  "untracked_files_archived=$($manifest.Count)",
  "untracked_files_skipped=$($skipped.Count)",
  "archived_bytes=$totalBytes",
  "zip_path=$zipPath",
  "zip_sha256=$zipHash",
  "clean_manifest=$cleanManifest",
  "clean_manifest_include_ignored=$cleanIgnoredManifest",
  "status_manifest=$statusPath",
  "tracked_diff=$trackedDiff",
  "staged_diff=$stagedDiff"
)

$summary | Set-Content -LiteralPath $summaryPath -Encoding UTF8
Get-Content -LiteralPath $summaryPath
