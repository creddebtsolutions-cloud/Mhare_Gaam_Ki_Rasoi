Add-Type -AssemblyName System.Drawing

$baseDir = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $baseDir 'play_store_assets\screenshots'
if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

function CreatePhoneScreenshot($fileName, $title, $subtitle, $imageRelPath, $accentColor) {
    $imgSrcPath = Join-Path $baseDir $imageRelPath
    $imgSrc = [System.Drawing.Image]::FromFile($imgSrcPath)
    $bmp = New-Object System.Drawing.Bitmap(1080, 1920, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    # Background rustic warm cream
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 248, 240))
    $g.FillRectangle($bgBrush, 0, 0, 1080, 1920)

    # Top Header banner
    $bannerBrush = New-Object System.Drawing.SolidBrush($accentColor)
    $g.FillRectangle($bannerBrush, 0, 0, 1080, 360)

    # Top text
    $fontTitle = New-Object System.Drawing.Font('Georgia', 48, [System.Drawing.FontStyle]::Bold)
    $fontSub = New-Object System.Drawing.Font('Arial', 24, [System.Drawing.FontStyle]::Bold)
    $fontTag = New-Object System.Drawing.Font('Arial', 20, [System.Drawing.FontStyle]::Regular)

    $brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $brushGold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 215, 110))

    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center

    $g.DrawString($title, $fontTitle, $brushGold, 540, 70, $sf)
    $g.DrawString($subtitle, $fontSub, $brushWhite, 540, 150, $sf)
    $g.DrawString("🌾 Mhare Gaam Ki Rasoi • Sai Plaza, Meerut", $fontTag, $brushWhite, 540, 220, $sf)

    # Device Mockup Container
    $cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($cardBrush, 60, 400, 960, 1420)
    $cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 220, 205, 185), 6)
    $g.DrawRectangle($cardPen, 60, 400, 960, 1420)

    # Feature image inside phone frame
    $g.DrawImage($imgSrc, 90, 440, 900, 1100)

    # Bottom caption badge
    $badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 249, 242, 230))
    $g.FillRectangle($badgeBrush, 90, 1580, 900, 200)
    $badgePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 160, 64, 0), 2)
    $g.DrawRectangle($badgePen, 90, 1580, 900, 200)

    $fontFooter = New-Object System.Drawing.Font('Georgia', 26, [System.Drawing.FontStyle]::Bold)
    $fontFooterSub = New-Object System.Drawing.Font('Arial', 18, [System.Drawing.FontStyle]::Regular)
    $brushDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 120, 40, 0))
    $brushMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 80, 80, 80))

    $g.DrawString("100% Pure Vegetarian Traditional Food", $fontFooter, $brushDark, 540, 1620, $sf)
    $g.DrawString("Desi Ghee • Mitti Ka Chulha • Clay Pot Handi Dal", $fontFooterSub, $brushMuted, 540, 1680, $sf)

    $destPath = Join-Path $outDir $fileName
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    $imgSrc.Dispose()
    Write-Host "Created screenshot: $destPath"
}

$colorRust = [System.Drawing.Color]::FromArgb(255, 160, 64, 0)
$colorEarth = [System.Drawing.Color]::FromArgb(255, 110, 40, 5)

CreatePhoneScreenshot "screenshot_1_village_dining.png" "Ghar Jaisa Swaad" "Traditional Village Cuisine & Chulha Roti" "web\images\hero_village_rasoi.jpg" $colorRust
CreatePhoneScreenshot "screenshot_2_authentic_thali.png" "Authentic Desi Thali" "Served in Traditional Kansi & Clay Pots" "web\images\dish_thali.jpg" $colorEarth
CreatePhoneScreenshot "screenshot_3_phonepe_scanner.png" "Easy UPI & PhonePe" "Direct Contactless Scanner & Quick Tracking" "web\images\phonepe_upi_qr.png" $colorRust
