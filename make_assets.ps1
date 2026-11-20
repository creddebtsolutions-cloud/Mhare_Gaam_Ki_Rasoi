Add-Type -AssemblyName System.Drawing

$baseDir = Split-Path -Parent $PSScriptRoot
$logoPath = Join-Path $baseDir 'web\images\restaurant_logo.jpg'
$heroPath = Join-Path $baseDir 'web\images\hero_village_rasoi.jpg'
$outDir = Join-Path $baseDir 'play_store_assets'

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

# 1. 512x512 App Icon (32-bit ARGB PNG)
$iconSrc = [System.Drawing.Image]::FromFile($logoPath)
$iconBmp = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gIcon = [System.Drawing.Graphics]::FromImage($iconBmp)
$gIcon.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gIcon.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gIcon.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$brushBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 122, 48, 0))
$gIcon.FillRectangle($brushBg, 0, 0, 512, 512)
$gIcon.DrawImage($iconSrc, 16, 16, 480, 480)

$penGold = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 212, 172, 13), 6)
$gIcon.DrawRectangle($penGold, 3, 3, 506, 506)

$outIconPath = Join-Path $outDir 'icon_512x512.png'
$iconBmp.Save($outIconPath, [System.Drawing.Imaging.ImageFormat]::Png)

$gIcon.Dispose()
$iconBmp.Dispose()
$iconSrc.Dispose()
Write-Host "Generated: $outIconPath"

# 2. 1024x500 Feature Graphic Banner (32-bit ARGB PNG)
$heroSrc = [System.Drawing.Image]::FromFile($heroPath)
$logoSrc = [System.Drawing.Image]::FromFile($logoPath)
$featureBmp = New-Object System.Drawing.Bitmap(1024, 500, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gFeat = [System.Drawing.Graphics]::FromImage($featureBmp)
$gFeat.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFeat.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gFeat.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$gFeat.DrawImage($heroSrc, 0, 0, 1024, 500)

$pt1 = New-Object System.Drawing.Point(0, 0)
$pt2 = New-Object System.Drawing.Point(1024, 0)
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, [System.Drawing.Color]::FromArgb(235, 20, 10, 5), [System.Drawing.Color]::FromArgb(140, 50, 25, 10))
$gFeat.FillRectangle($gradBrush, 0, 0, 1024, 500)

# Draw Logo
$gFeat.DrawImage($logoSrc, 48, 110, 280, 280)
$penGoldBanner = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 212, 172, 13), 4)
$gFeat.DrawRectangle($penGoldBanner, 46, 108, 284, 284)

# Text Overlay
$titleFont = New-Object System.Drawing.Font('Georgia', 32, [System.Drawing.FontStyle]::Bold)
$subFont = New-Object System.Drawing.Font('Arial', 18, [System.Drawing.FontStyle]::Bold)
$tagFont = New-Object System.Drawing.Font('Arial', 14, [System.Drawing.FontStyle]::Regular)

$brushGold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 200, 40))
$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$brushLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 235, 225, 210))

$gFeat.DrawString('Mhare Gaam Ki Rasoi', $titleFont, $brushGold, 360, 130)
$gFeat.DrawString('Authentic Village Dining • Ghar Jaisa Swaad', $subFont, $brushWhite, 364, 200)
$gFeat.DrawString('100% Pure Vegetarian | Sai Plaza, Meerut, UP', $tagFont, $brushLight, 364, 250)
$gFeat.DrawString('Traditional Thali • Handi Dal • Chulha Roti • Desi Ghee', $tagFont, $brushGold, 364, 295)

$outBannerPath = Join-Path $outDir 'feature_graphic_1024x500.png'
$featureBmp.Save($outBannerPath, [System.Drawing.Imaging.ImageFormat]::Png)

$gFeat.Dispose()
$featureBmp.Dispose()
$heroSrc.Dispose()
$logoSrc.Dispose()
Write-Host "Generated: $outBannerPath"
