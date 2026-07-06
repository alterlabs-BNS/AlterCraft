param(
  [Parameter(Mandatory = $true)] [string] $SourceDirectory,
  [Parameter(Mandatory = $true)] [string] $OutputPath,
  [Parameter(Mandatory = $true)] [string] $NamePattern
)

Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -LiteralPath $SourceDirectory -File |
  Where-Object { $_.Name -like $NamePattern } |
  Sort-Object Name

$columns = 4
$cellWidth = 260
$cellHeight = 500
$rows = [math]::Ceiling($files.Count / $columns)
$bitmap = New-Object System.Drawing.Bitmap ($columns * $cellWidth), ($rows * $cellHeight)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear([System.Drawing.Color]::FromArgb(244, 239, 230))
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$font = New-Object System.Drawing.Font('Arial', 11, [System.Drawing.FontStyle]::Bold)
$brush = [System.Drawing.Brushes]::Black

for ($index = 0; $index -lt $files.Count; $index++) {
  $column = $index % $columns
  $row = [math]::Floor($index / $columns)
  $x = $column * $cellWidth
  $y = $row * $cellHeight
  $image = [System.Drawing.Image]::FromFile($files[$index].FullName)
  $targetHeight = 440
  $targetWidth = [math]::Floor($targetHeight * $image.Width / $image.Height)
  $targetX = $x + [math]::Floor(($cellWidth - $targetWidth) / 2)
  $graphics.DrawImage($image, $targetX, $y + 28, $targetWidth, $targetHeight)
  $graphics.DrawString(($index + 1).ToString('00'), $font, $brush, $x + 10, $y + 5)
  $image.Dispose()
}

$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$font.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
