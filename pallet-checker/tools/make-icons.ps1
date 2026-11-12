# Script phụ: sinh icon PNG cho PWA bằng System.Drawing (Windows).
# Chạy: powershell -ExecutionPolicy Bypass -File tools/make-icons.ps1
Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot '..\assets\icons'
New-Item -ItemType Directory -Force -Path $out | Out-Null

function Draw-Icon([int]$size, [string]$file, [double]$scale, [bool]$rounded) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::Transparent)
  $blue = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(13, 71, 161))
  $white = [System.Drawing.Brushes]::White
  $k = $size / 512.0

  if ($rounded) {
    $r = 96 * $k; $d = 2 * $r
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $d, $d, 180, 90); $path.AddArc($size - $d, 0, $d, $d, 270, 90)
    $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90); $path.AddArc(0, $size - $d, $d, $d, 90, 90)
    $path.CloseFigure(); $g.FillPath($blue, $path)
  } else {
    $g.FillRectangle($blue, 0, 0, $size, $size)
  }

  # Thu nhỏ nội dung quanh tâm (maskable cần nằm trong vùng an toàn 80%)
  $g.TranslateTransform($size / 2, $size / 2)
  $g.ScaleTransform($k * $scale, $k * $scale)
  $g.TranslateTransform(-256, -256)
  $g.FillRectangle($white, 96, 250, 320, 36)
  foreach ($x in 108, 228, 348) { $g.FillRectangle($white, $x, 292, 56, 60) }
  $g.FillRectangle($white, 96, 358, 320, 30)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 193, 7)), 40
  $pen.StartCap = 'Round'; $pen.EndCap = 'Round'; $pen.LineJoin = 'Round'
  $pts = [System.Drawing.PointF[]]@((New-Object System.Drawing.PointF 176, 160), (New-Object System.Drawing.PointF 228, 212), (New-Object System.Drawing.PointF 336, 104))
  $g.DrawLines($pen, $pts)

  $g.Dispose()
  $bmp.Save((Join-Path $out $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "Đã tạo $file"
}

Draw-Icon 192 'icon-192.png' 1.0 $true
Draw-Icon 512 'icon-512.png' 1.0 $true
Draw-Icon 512 'icon-maskable-512.png' 0.8 $false
Draw-Icon 192 'icon-maskable-192.png' 0.8 $false
Draw-Icon 180 'apple-touch-icon.png' 0.9 $false
