param(
  [string] $SourceDirectory = 'C:\Users\Altercraft\Desktop\Beds\resized',
  [string] $OutputDirectory = (Join-Path $PSScriptRoot '..\public\images\beds'),
  [string] $HeroSource = ''
)

Add-Type -AssemblyName System.Drawing

function Save-Jpeg {
  param(
    [System.Drawing.Bitmap] $Bitmap,
    [string] $Path,
    [long] $Quality = 82
  )

  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
  $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
  $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality,
    $Quality
  )
  $Bitmap.Save($Path, $encoder, $parameters)
  $parameters.Dispose()
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$files = Get-ChildItem -LiteralPath $SourceDirectory -File -Filter '*.png' |
  Sort-Object LastWriteTime, Name

for ($index = 0; $index -lt $files.Count; $index++) {
  $source = [System.Drawing.Image]::FromFile($files[$index].FullName)
  $cropWidth = [math]::Min(1000, $source.Width)
  $cropHeight = [math]::Min(390, $source.Height)
  $cropX = [math]::Floor(($source.Width - $cropWidth) / 2)
  $cropY = [math]::Min(435, $source.Height - $cropHeight)
  $output = New-Object System.Drawing.Bitmap 900, 351
  $graphics = [System.Drawing.Graphics]::FromImage($output)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $destination = New-Object System.Drawing.Rectangle 0, 0, 900, 351
  $crop = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropWidth, $cropHeight
  $graphics.DrawImage($source, $destination, $crop, [System.Drawing.GraphicsUnit]::Pixel)
  $name = 'bed-{0}.jpg' -f ($index + 1).ToString('00')
  Save-Jpeg -Bitmap $output -Path (Join-Path $OutputDirectory $name)
  $graphics.Dispose()
  $output.Dispose()
  $source.Dispose()
}

if ($HeroSource -and (Test-Path -LiteralPath $HeroSource)) {
  $source = [System.Drawing.Image]::FromFile($HeroSource)
  $output = New-Object System.Drawing.Bitmap 1920, 1080
  $graphics = [System.Drawing.Graphics]::FromImage($output)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.DrawImage($source, 0, 0, 1920, 1080)
  Save-Jpeg -Bitmap $output -Path (Join-Path $OutputDirectory 'beds-hero.jpg') -Quality 86
  $graphics.Dispose()
  $output.Dispose()
  $source.Dispose()
}

Write-Output "Prepared $($files.Count) bed images in $OutputDirectory"
