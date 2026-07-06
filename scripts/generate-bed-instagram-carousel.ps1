param(
  [string] $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
  [string] $OutputDirectory = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')).Path 'output\instagram-bed-carousel')
)

Add-Type -AssemblyName System.Drawing

$bedsDataPath = Join-Path $RepoRoot 'src\data\beds.ts'
$bedsImageDirectory = Join-Path $RepoRoot 'public\images\beds'

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$text = Get-Content -LiteralPath $bedsDataPath -Raw
$products = [regex]::Matches($text, "makeBed\((\d+), '([^']+)', '([^']+)'") | ForEach-Object {
  $index = [int] $_.Groups[1].Value
  $style = $_.Groups[3].Value
  $price = if ($style -eq 'Straight') { 15000 } elseif ($style -eq 'Curved') { 17500 } else { 21000 }
  [PSCustomObject]@{
    Index = $index
    Name = $_.Groups[2].Value
    Style = $style
    Price = $price
    Image = Join-Path $bedsImageDirectory ('bed-{0}.jpg' -f $index.ToString('00'))
  }
}

function New-Canvas {
  $bitmap = New-Object System.Drawing.Bitmap 1080, 1350
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $graphics.Clear([System.Drawing.Color]::FromArgb(250, 245, 235))

  $backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle 0, 0, 1080, 1350),
    [System.Drawing.Color]::FromArgb(255, 252, 247, 238),
    [System.Drawing.Color]::FromArgb(255, 235, 217, 185),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
  )
  $graphics.FillRectangle($backgroundBrush, 0, 0, 1080, 1350)
  $backgroundBrush.Dispose()

  $dotPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(26, 151, 102, 45), 1)
  for ($x = 26; $x -lt 1080; $x += 24) {
    for ($y = 24; $y -lt 1350; $y += 24) {
      $graphics.DrawEllipse($dotPen, $x, $y, 1, 1)
    }
  }
  $dotPen.Dispose()

  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-Font($size, $style = [System.Drawing.FontStyle]::Regular, $family = 'Georgia') {
  return New-Object System.Drawing.Font($family, $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

function New-Brush($r, $g, $b, $a = 255) {
  return New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($a, $r, $g, $b))
}

function New-Pen($r, $g, $b, $width = 1, $a = 255) {
  return New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($a, $r, $g, $b), $width)
}

function New-RoundedPath($x, $y, $w, $h, $r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $r * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $w - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $w - $diameter, $y + $h - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $h - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-RoundedRect($graphics, $x, $y, $w, $h, $r, $fill, $stroke = $null) {
  $path = New-RoundedPath $x $y $w $h $r
  if ($fill) { $graphics.FillPath($fill, $path) }
  if ($stroke) { $graphics.DrawPath($stroke, $path) }
  $path.Dispose()
}

function Draw-Text($graphics, $text, $font, $brush, $x, $y, $w, $h, $align = 'Near') {
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = if ($align -eq 'Center') { [System.Drawing.StringAlignment]::Center } else { [System.Drawing.StringAlignment]::Near }
  $format.LineAlignment = [System.Drawing.StringAlignment]::Near
  $format.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $graphics.DrawString($text, $font, $brush, (New-Object System.Drawing.RectangleF $x, $y, $w, $h), $format)
  $format.Dispose()
}

function Draw-BrandHeader($graphics, $slideNumber) {
  $brandFont = New-Font 38 ([System.Drawing.FontStyle]::Bold) 'Arial'
  $smallFont = New-Font 18 ([System.Drawing.FontStyle]::Regular) 'Arial'
  $brown = New-Brush 68 37 24
  $gold = New-Brush 184 124 49
  Draw-Text $graphics 'ALTERCRAFT' $brandFont $brown 70 60 520 52
  Draw-Text $graphics 'FURNITURE | INTERIORS | MODULAR KITCHEN' $smallFont $gold 73 110 600 35
  Draw-Text $graphics ('{0}/10' -f $slideNumber.ToString('00')) $smallFont $brown 900 73 120 35 'Center'
  $brandFont.Dispose(); $smallFont.Dispose(); $brown.Dispose(); $gold.Dispose()
}

function Draw-Footer($graphics) {
  $font = New-Font 24 ([System.Drawing.FontStyle]::Bold) 'Arial'
  $small = New-Font 20 ([System.Drawing.FontStyle]::Regular) 'Arial'
  $brown = New-Brush 68 37 24
  $gold = New-Brush 184 124 49
  Draw-Text $graphics '+91 88175 03658 | Pan-India delivery' $font $brown 70 1260 560 45
  Draw-Text $graphics 'Non-hydraulic box bed pricing. Hydraulic storage extra as per hardware.' $small $gold 70 1300 910 34
  $font.Dispose(); $small.Dispose(); $brown.Dispose(); $gold.Dispose()
}

function Draw-ImageCard($graphics, $product, $x, $y, $w, $h) {
  $cream = New-Brush 255 252 245 210
  $stroke = New-Pen 196 143 71 1 150
  $brown = New-Brush 60 32 23
  $muted = New-Brush 116 91 73
  $gold = New-Brush 190 129 50
  Draw-RoundedRect $graphics $x $y $w $h 28 $cream $stroke
  $image = [System.Drawing.Image]::FromFile($product.Image)
  $imgX = $x + 18
  $imgY = $y + 18
  $imgW = $w - 36
  $imgH = [math]::Floor($h * 0.52)
  $path = New-RoundedPath $imgX $imgY $imgW $imgH 20
  $graphics.SetClip($path)
  $graphics.DrawImage($image, $imgX, $imgY, $imgW, $imgH)
  $graphics.ResetClip()
  $path.Dispose()
  $image.Dispose()

  $nameFont = New-Font 28 ([System.Drawing.FontStyle]::Bold)
  $metaFont = New-Font 20 ([System.Drawing.FontStyle]::Regular) 'Arial'
  $priceFont = New-Font 24 ([System.Drawing.FontStyle]::Bold) 'Arial'
  Draw-Text $graphics $product.Name $nameFont $brown ($x + 22) ($imgY + $imgH + 18) ($w - 44) 56
  Draw-Text $graphics $product.Style $metaFont $muted ($x + 22) ($y + $h - 84) 180 30
  Draw-Text $graphics ('INR {0:N0} + tax' -f $product.Price) $priceFont $gold ($x + 22) ($y + $h - 48) ($w - 44) 34
  $nameFont.Dispose(); $metaFont.Dispose(); $priceFont.Dispose()
  $cream.Dispose(); $stroke.Dispose(); $brown.Dispose(); $muted.Dispose(); $gold.Dispose()
}

function Save-Png($canvas, $path) {
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

$dark = New-Brush 48 25 18
$brownBrush = New-Brush 72 42 29
$mutedBrush = New-Brush 121 96 77
$goldBrush = New-Brush 185 124 49
$creamBrush = New-Brush 255 252 246 225
$linePen = New-Pen 194 143 75 2 150

$canvas = New-Canvas
$g = $canvas.Graphics
Draw-BrandHeader $g 1
$hero = [System.Drawing.Image]::FromFile((Join-Path $bedsImageDirectory 'beds-hero.jpg'))
$g.DrawImage($hero, 0, 0, 1080, 1350)
$overlay = New-Brush 255 248 235 175
$g.FillRectangle($overlay, 0, 0, 1080, 1350)
$overlay.Dispose(); $hero.Dispose()
Draw-BrandHeader $g 1
$title = New-Font 82 ([System.Drawing.FontStyle]::Bold)
$italic = New-Font 62 ([System.Drawing.FontStyle]::Italic)
$body = New-Font 30 ([System.Drawing.FontStyle]::Regular) 'Arial'
Draw-Text $g 'Designer beds' $title $dark 70 260 760 110
Draw-Text $g 'made for Indian homes' $italic $goldBrush 70 350 850 90
Draw-Text $g 'Straight, curved and signature upholstered beds with clear starting prices.' $body $brownBrush 76 470 760 120
Draw-RoundedRect $g 70 650 650 130 32 $creamBrush $linePen
$priceFont = New-Font 42 ([System.Drawing.FontStyle]::Bold) 'Arial'
Draw-Text $g 'Starting at INR 15,000 + tax' $priceFont $dark 105 690 590 58
Draw-Text $g 'Pan-India delivery available' $body $goldBrush 106 742 590 45
Draw-Footer $g
$title.Dispose(); $italic.Dispose(); $body.Dispose(); $priceFont.Dispose()
Save-Png $canvas (Join-Path $OutputDirectory '01-cover.png')

$canvas = New-Canvas
$g = $canvas.Graphics
Draw-BrandHeader $g 2
$title = New-Font 62 ([System.Drawing.FontStyle]::Bold)
$body = New-Font 27 ([System.Drawing.FontStyle]::Regular) 'Arial'
Draw-Text $g 'Price guide by headboard shape' $title $dark 70 210 850 150
$styles = @(
  @{ Name='Straight & simple'; Price='INR 15,000 + tax'; Note='Clean rectangular or panel headboard.' },
  @{ Name='Curved'; Price='INR 17,500 + tax'; Note='Soft curves, arches and shaped upholstery.' },
  @{ Name='Signature'; Price='INR 21,000 + tax'; Note='Round, complex, Luna-style or detailed upholstery.' }
)
for ($i = 0; $i -lt $styles.Count; $i++) {
  $y = 430 + ($i * 210)
  Draw-RoundedRect $g 80 $y 920 160 34 $creamBrush $linePen
  Draw-Text $g ('0{0}' -f ($i + 1)) (New-Font 30 ([System.Drawing.FontStyle]::Bold) 'Arial') $goldBrush 115 ($y + 45) 70 60
  Draw-Text $g $styles[$i].Name (New-Font 38 ([System.Drawing.FontStyle]::Bold)) $dark 210 ($y + 32) 430 58
  Draw-Text $g $styles[$i].Price (New-Font 34 ([System.Drawing.FontStyle]::Bold) 'Arial') $goldBrush 650 ($y + 37) 300 50
  Draw-Text $g $styles[$i].Note $body $mutedBrush 212 ($y + 92) 700 45
}
Draw-Text $g 'Prices are for non-hydraulic box beds. Hydraulic storage is charged extra according to selected hardware quality.' $body $brownBrush 80 1095 900 95
Draw-Footer $g
$title.Dispose(); $body.Dispose()
Save-Png $canvas (Join-Path $OutputDirectory '02-price-guide.png')

$chunks = @(
  $products[0..5],
  $products[6..11],
  $products[12..17],
  $products[18..23],
  $products[24..29],
  $products[30..35],
  $products[36..39]
)

for ($slide = 0; $slide -lt $chunks.Count; $slide++) {
  $canvas = New-Canvas
  $g = $canvas.Graphics
  Draw-BrandHeader $g ($slide + 3)
  $heading = New-Font 52 ([System.Drawing.FontStyle]::Bold)
  $small = New-Font 24 ([System.Drawing.FontStyle]::Regular) 'Arial'
  Draw-Text $g 'Bed catalogue' $heading $dark 70 170 620 70
  Draw-Text $g 'Choose a design. Confirm size, fabric, storage and delivery with AlterCraft.' $small $mutedBrush 72 235 790 45
  $cardW = 450
  $cardH = 300
  for ($i = 0; $i -lt $chunks[$slide].Count; $i++) {
    $col = $i % 2
    $row = [math]::Floor($i / 2)
    Draw-ImageCard $g $chunks[$slide][$i] (70 + ($col * 500)) (315 + ($row * 320)) $cardW $cardH
  }
  Draw-Footer $g
  $heading.Dispose(); $small.Dispose()
  Save-Png $canvas (Join-Path $OutputDirectory ('{0}-catalogue.png' -f ($slide + 3).ToString('00')))
}

$canvas = New-Canvas
$g = $canvas.Graphics
Draw-BrandHeader $g 10
$title = New-Font 70 ([System.Drawing.FontStyle]::Bold)
$body = New-Font 30 ([System.Drawing.FontStyle]::Regular) 'Arial'
Draw-Text $g 'Ready to order a bed?' $title $dark 70 250 850 100
Draw-Text $g 'Share your room size, preferred headboard, storage choice and delivery city. We will confirm the final quotation before production.' $body $brownBrush 75 365 820 150
Draw-RoundedRect $g 90 580 900 330 42 $creamBrush $linePen
Draw-Text $g 'WhatsApp / Call' (New-Font 32 ([System.Drawing.FontStyle]::Bold) 'Arial') $goldBrush 135 630 360 45
Draw-Text $g '+91 88175 03658' (New-Font 62 ([System.Drawing.FontStyle]::Bold) 'Arial') $dark 135 690 620 80
Draw-Text $g 'AlterCraft | Ghaziabad | Pan-India delivery' $body $brownBrush 138 785 760 45
Draw-Text $g 'Designer beds | Wardrobes | Modular kitchens | Custom furniture' (New-Font 25 ([System.Drawing.FontStyle]::Regular) 'Arial') $mutedBrush 138 835 790 42
Draw-Text $g 'Hydraulic storage, freight and installation are quoted separately based on city and hardware choice.' $body $brownBrush 90 1010 900 90
Draw-Footer $g
$title.Dispose(); $body.Dispose()
Save-Png $canvas (Join-Path $OutputDirectory '10-contact.png')

$dark.Dispose(); $brownBrush.Dispose(); $mutedBrush.Dispose(); $goldBrush.Dispose(); $creamBrush.Dispose(); $linePen.Dispose()
Write-Output "Generated 10 Instagram carousel slides in $OutputDirectory"
