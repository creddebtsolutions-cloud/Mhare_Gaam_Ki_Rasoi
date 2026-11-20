Add-Type -AssemblyName System.Drawing

$baseDir = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $baseDir 'play_store_assets\screenshots'
if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

function Get-RoundedRectanglePath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = [float]($r * 2.0)
    $path.AddArc($x, $y, $d, $d, [float]180.0, [float]90.0)
    $path.AddArc($x + $w - $d, $y, $d, $d, [float]270.0, [float]90.0)
    $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, [float]0.0, [float]90.0)
    $path.AddArc($x, $y + $h - $d, $d, $d, [float]90.0, [float]90.0)
    $path.CloseFigure()
    return $path
}

function Create-PlayScreenshot {
    param(
        [string]$fileName,
        [string]$headline,
        [string]$subtitle,
        [string]$tagline,
        [string]$imageRelPath,
        [System.Drawing.Color]$headerColor,
        [string]$cardTitle,
        [string]$cardDesc,
        [string]$priceText,
        [string]$buttonText,
        [string]$activeTab
    )

    $imgSrcPath = Join-Path $baseDir $imageRelPath
    if (!(Test-Path $imgSrcPath)) {
        Write-Warning "Source image not found: $imgSrcPath"
        return
    }

    $imgSrc = [System.Drawing.Image]::FromFile($imgSrcPath)

    # Canvas: 1080 x 1920 (Standard 9:16 Google Play Store Phone resolution)
    $bmp = New-Object System.Drawing.Bitmap(1080, 1920, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # 1. Warm cream rustic background
    $canvasBg = [System.Drawing.Color]::FromArgb(255, 252, 248, 242)
    $brushCanvas = New-Object System.Drawing.SolidBrush($canvasBg)
    $g.FillRectangle($brushCanvas, 0, 0, 1080, 1920)

    # 2. Header banner with curved bottom
    $brushHeader = New-Object System.Drawing.SolidBrush($headerColor)
    $g.FillRectangle($brushHeader, 0, 0, 1080, 390)

    # Decorative header arc
    $headerPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $headerPath.AddLine(0, 370, 1080, 370)
    $headerPath.AddBezier(1080, 370, 720, 410, 360, 410, 0, 370)
    $headerPath.CloseFigure()
    $g.FillPath($brushHeader, $headerPath)

    # Top brand badge
    $badgeRect = Get-RoundedRectanglePath 290 35 500 42 20
    $brushBadgeBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 255, 255, 255))
    $g.FillPath($brushBadgeBg, $badgeRect)
    $fontBadge = New-Object System.Drawing.Font('Arial', 14, [System.Drawing.FontStyle]::Bold)
    $brushBadgeText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 245, 220))
    $sfCenter = New-Object System.Drawing.StringFormat
    $sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
    $sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("MHARE GAAM KI RASOI  -  MEERUT", $fontBadge, $brushBadgeText, 540, 56, $sfCenter)

    # Main Headline
    $fontHead = New-Object System.Drawing.Font('Georgia', 44, [System.Drawing.FontStyle]::Bold)
    $brushGold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 222, 105))
    $g.DrawString($headline, $fontHead, $brushGold, 540, 135, $sfCenter)

    # Subtitle
    $fontSub = New-Object System.Drawing.Font('Arial', 24, [System.Drawing.FontStyle]::Bold)
    $brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString($subtitle, $fontSub, $brushWhite, 540, 215, $sfCenter)

    # Tagline
    $fontTag = New-Object System.Drawing.Font('Arial', 18, [System.Drawing.FontStyle]::Regular)
    $brushTag = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 255, 240, 215))
    $g.DrawString($tagline, $fontTag, $brushTag, 540, 275, $sfCenter)

    # 3. SMARTPHONE DEVICE MOCKUP
    # Outer Device Frame: Width 880, Height 1320, X: 100, Y: 430
    $phoneX = 100
    $phoneY = 430
    $phoneW = 880
    $phoneH = 1320
    $cornerRadius = 44

    # Phone Shadow
    for ($i = 1; $i -le 4; $i++) {
        $shadowAlpha = 15 - ($i * 3)
        $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($shadowAlpha, 0, 0, 0))
        $shadowPath = Get-RoundedRectanglePath ($phoneX - $i * 3) ($phoneY + $i * 3) ($phoneW + $i * 6) ($phoneH + $i * 3) ($cornerRadius + $i)
        $g.FillPath($shadowBrush, $shadowPath)
        $shadowBrush.Dispose()
    }

    # Phone Bezel (Titanium Dark Slate)
    $bezelColor = [System.Drawing.Color]::FromArgb(255, 25, 28, 32)
    $brushBezel = New-Object System.Drawing.SolidBrush($bezelColor)
    $phoneOuterPath = Get-RoundedRectanglePath $phoneX $phoneY $phoneW $phoneH $cornerRadius
    $g.FillPath($brushBezel, $phoneOuterPath)

    # Phone Bezel Outline highlight
    $penBezel = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 60, 65, 75), 2)
    $g.DrawPath($penBezel, $phoneOuterPath)

    # Screen viewport: Bezel inset 14px
    $screenX = $phoneX + 14
    $screenY = $phoneY + 14
    $screenW = $phoneW - 28
    $screenH = $phoneH - 28
    $screenRadius = 34
    $screenPath = Get-RoundedRectanglePath $screenX $screenY $screenW $screenH $screenRadius

    # Clip all drawing strictly inside phone screen
    $g.SetClip($screenPath)

    # Screen Background (Crisp White)
    $brushScreenBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 250, 249, 246))
    $g.FillRectangle($brushScreenBg, $screenX, $screenY, $screenW, $screenH)

    # --- INSIDE PHONE SCREEN ---

    # A. Android Status Bar (Height: 46px)
    $brushStatusBar = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 20, 22, 26))
    $g.FillRectangle($brushStatusBar, $screenX, $screenY, $screenW, 46)

    $fontStatus = New-Object System.Drawing.Font('Arial', 13, [System.Drawing.FontStyle]::Bold)
    $sfLeft = New-Object System.Drawing.StringFormat
    $sfLeft.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("12:00", $fontStatus, $brushWhite, ($screenX + 30), ($screenY + 23), $sfLeft)

    $sfRight = New-Object System.Drawing.StringFormat
    $sfRight.Alignment = [System.Drawing.StringAlignment]::Far
    $sfRight.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("5G   100%", $fontStatus, $brushWhite, ($screenX + $screenW - 30), ($screenY + 23), $sfRight)

    # Punch-hole camera
    $brushCam = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 12))
    $g.FillEllipse($brushCam, [float]($screenX + ($screenW / 2) - 8), [float]($screenY + 14), [float]16, [float]16)

    # B. App Top Navigation Bar (Height: 76px)
    $appBarY = $screenY + 46
    $brushAppBar = New-Object System.Drawing.SolidBrush($headerColor)
    $g.FillRectangle($brushAppBar, $screenX, $appBarY, $screenW, 76)

    $fontAppTitle = New-Object System.Drawing.Font('Georgia', 20, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("Mhare Gaam Ki Rasoi", $fontAppTitle, $brushWhite, ($screenX + 28), ($appBarY + 38), $sfLeft)

    # Pure Veg Green Badge
    $vegBadgeRect = Get-RoundedRectanglePath ($screenX + $screenW - 200) ($appBarY + 20) 175 36 8
    $brushVegBadge = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 40, 167, 69))
    $g.FillPath($brushVegBadge, $vegBadgeRect)
    $fontVeg = New-Object System.Drawing.Font('Arial', 11, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("[O] 100% PURE VEG", $fontVeg, $brushWhite, ($screenX + $screenW - 112), ($appBarY + 38), $sfCenter)

    # C. Feature Image Area (Height: 780px)
    $imgAreaY = $appBarY + 76
    $imgAreaH = 780

    # Draw image with aspect fit/fill
    $g.DrawImage($imgSrc, $screenX, $imgAreaY, $screenW, $imgAreaH)

    # Subtle gradient overlay at bottom of photo
    $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, ($imgAreaY + $imgAreaH - 120))),
        (New-Object System.Drawing.PointF(0, ($imgAreaY + $imgAreaH))),
        [System.Drawing.Color]::FromArgb(0, 0, 0, 0),
        [System.Drawing.Color]::FromArgb(180, 0, 0, 0)
    )
    $g.FillRectangle($gradBrush, $screenX, ($imgAreaY + $imgAreaH - 120), $screenW, 120)

    # Rating badge on image
    $ratingBadge = Get-RoundedRectanglePath ($screenX + 30) ($imgAreaY + $imgAreaH - 65) 240 45 12
    $brushRating = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 20, 20, 20))
    $g.FillPath($brushRating, $ratingBadge)
    $fontRating = New-Object System.Drawing.Font('Arial', 13, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("* 4.9 (1.5k+ Reviews)", $fontRating, $brushGold, ($screenX + 150), ($imgAreaY + $imgAreaH - 42), $sfCenter)

    # D. In-App Interactive Card (Bottom Sheet style)
    $cardY = $imgAreaY + $imgAreaH
    $cardH = $screenH - ($cardY - $screenY) - 86 # leave 86px for bottom nav bar
    $brushCard = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($brushCard, $screenX, $cardY, $screenW, $cardH)

    # Top border line of card
    $penCardTop = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 230, 225, 215), 2)
    $g.DrawLine($penCardTop, $screenX, $cardY, ($screenX + $screenW), $cardY)

    # Card Title
    $fontCardTitle = New-Object System.Drawing.Font('Georgia', 24, [System.Drawing.FontStyle]::Bold)
    $brushDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 30, 30))
    $g.DrawString($cardTitle, $fontCardTitle, $brushDark, ($screenX + 32), ($cardY + 45), $sfLeft)

    # Card Description
    $fontCardDesc = New-Object System.Drawing.Font('Arial', 14, [System.Drawing.FontStyle]::Regular)
    $brushMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 95, 100, 105))
    $g.DrawString($cardDesc, $fontCardDesc, $brushMuted, ($screenX + 32), ($cardY + 95), $sfLeft)

    # Price and Button Container
    $fontPrice = New-Object System.Drawing.Font('Georgia', 28, [System.Drawing.FontStyle]::Bold)
    $brushPrice = New-Object System.Drawing.SolidBrush($headerColor)
    $g.DrawString($priceText, $fontPrice, $brushPrice, ($screenX + 32), ($cardY + 170), $sfLeft)

    # Action CTA Button
    $btnW = 340
    $btnH = 64
    $btnX = $screenX + $screenW - $btnW - 32
    $btnY = $cardY + 140
    $btnPath = Get-RoundedRectanglePath $btnX $btnY $btnW $btnH 16
    $brushBtn = New-Object System.Drawing.SolidBrush($headerColor)
    $g.FillPath($brushBtn, $btnPath)
    $fontBtn = New-Object System.Drawing.Font('Arial', 16, [System.Drawing.FontStyle]::Bold)
    $g.DrawString($buttonText, $fontBtn, $brushWhite, ($btnX + ($btnW / 2)), ($btnY + ($btnH / 2)), $sfCenter)

    # E. In-App Bottom Navigation Bar (Height: 86px)
    $navY = $screenY + $screenH - 86
    $brushNav = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 248, 246, 242))
    $g.FillRectangle($brushNav, $screenX, $navY, $screenW, 86)
    $penNavTop = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 220, 215, 205), 2)
    $g.DrawLine($penNavTop, $screenX, $navY, ($screenX + $screenW), $navY)

    $tabs = @("Home", "Menu", "Baithak", "Orders", "Cart")
    $tabWidth = $screenW / $tabs.Count
    $fontNav = New-Object System.Drawing.Font('Arial', 13, [System.Drawing.FontStyle]::Bold)

    for ($t = 0; $t -lt $tabs.Count; $t++) {
        $tabName = $tabs[$t]
        $tabCenterX = $screenX + ($t * $tabWidth) + ($tabWidth / 2)
        if ($tabName -eq $activeTab) {
            $brushTab = New-Object System.Drawing.SolidBrush($headerColor)
            # Active tab indicator pill
            $activePill = Get-RoundedRectanglePath ($tabCenterX - 35) ($navY + 8) 70 6 3
            $g.FillPath($brushTab, $activePill)
            $g.DrawString($tabName, $fontNav, $brushTab, $tabCenterX, ($navY + 46), $sfCenter)
        } else {
            $brushTab = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 120, 125, 130))
            $g.DrawString($tabName, $fontNav, $brushTab, $tabCenterX, ($navY + 46), $sfCenter)
        }
    }

    # Reset clip back to full canvas
    $g.ResetClip()

    # 4. Canvas Bottom Trust Badge (Below phone)
    $fontTrust = New-Object System.Drawing.Font('Georgia', 20, [System.Drawing.FontStyle]::Bold)
    $brushTrust = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 110, 45, 10))
    $g.DrawString("100% Pure Vegetarian  -  Traditional Village Hospitality", $fontTrust, $brushTrust, 540, 1810, $sfCenter)

    $fontTrustSub = New-Object System.Drawing.Font('Arial', 15, [System.Drawing.FontStyle]::Regular)
    $brushTrustSub = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 110, 110, 110))
    $g.DrawString("Mitti Ka Chulha  |  Desi Ghee Delicacies  |  Sai Plaza, Meerut", $fontTrustSub, $brushTrustSub, 540, 1855, $sfCenter)

    # Save PNG
    $destPath = Join-Path $outDir $fileName
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)

    # Cleanup resources
    $g.Dispose()
    $bmp.Dispose()
    $imgSrc.Dispose()

    Write-Host "Generated screenshot: $destPath"
}

# Color Palettes
$colorTerracotta = [System.Drawing.Color]::FromArgb(255, 175, 65, 15)
$colorEarthBrown  = [System.Drawing.Color]::FromArgb(255, 135, 45, 10)
$colorTandoorRed  = [System.Drawing.Color]::FromArgb(255, 190, 45, 25)
$colorMochaBrown  = [System.Drawing.Color]::FromArgb(255, 85, 45, 20)
$colorMustardGold = [System.Drawing.Color]::FromArgb(255, 175, 90, 10)
$colorVillageGreen= [System.Drawing.Color]::FromArgb(255, 28, 100, 55)
$colorPhonePe     = [System.Drawing.Color]::FromArgb(255, 80, 35, 135)

Write-Host "Creating 7 High-Converting Google Play Phone Screenshots..."

# 1. Ambience & Village Dining
Create-PlayScreenshot `
    -fileName "screenshot_1_village_dining.png" `
    -headline "GHAR JAISA SWAAD" `
    -subtitle "Traditional Village Dining & Chulha Roti" `
    -tagline "Authentic Rural Rasoi Experience in Meerut" `
    -imageRelPath "web\images\hero_village_rasoi.jpg" `
    -headerColor $colorTerracotta `
    -cardTitle "Mhare Gaam Ki Rasoi" `
    -cardDesc "Mitti ke chulhe ki rotiyan, handi daal, and desi ghee specialties" `
    -priceText "Sai Plaza" `
    -buttonText "EXPLORE MENU >" `
    -activeTab "Home"

# 2. Authentic Desi Thali
Create-PlayScreenshot `
    -fileName "screenshot_2_authentic_thali.png" `
    -headline "SHAHI DESI THALI" `
    -subtitle "Royal Feasts Served in Kansi Plates" `
    -tagline "Handi Dal, Paneer Sabzi, Missi Roti & Kheer" `
    -imageRelPath "web\images\dish_thali.jpg" `
    -headerColor $colorEarthBrown `
    -cardTitle "Special Shahi Gaam Thali" `
    -cardDesc "Unlimited handi dal, shahi paneer, churma, raita & 4 breads" `
    -priceText "Rs 249" `
    -buttonText "ORDER THALI +" `
    -activeTab "Menu"

# 3. Smokey Wood-Fired Pizzas
Create-PlayScreenshot `
    -fileName "screenshot_3_smokey_pizzas.png" `
    -headline "SMOKEY DESI PIZZAS" `
    -subtitle "Wood-Fired Crust with Paneer Tikka" `
    -tagline "5 Irresistible Flavors with 100% Real Cheese" `
    -imageRelPath "web\images\dish_smokey_pizza.jpg" `
    -headerColor $colorTandoorRed `
    -cardTitle "Smokey Paneer Tikka Pizza" `
    -cardDesc "Clay-smoked paneer chunks, crunchy bell peppers & peri-peri glaze" `
    -priceText "Rs 269" `
    -buttonText "ADD TO CART +" `
    -activeTab "Menu"

# 4. Refreshing Cold Coffee & Shakes
Create-PlayScreenshot `
    -fileName "screenshot_4_cold_coffee.png" `
    -headline "KULHAD COLD COFFEE" `
    -subtitle "Chilled Delights in Earthen Glasses" `
    -tagline "Thick Choco Mocha, Caramel Crunch & Hazelnut" `
    -imageRelPath "web\images\dish_cold_coffee.jpg" `
    -headerColor $colorMochaBrown `
    -cardTitle "Smokey Choco Cold Coffee" `
    -cardDesc "Rich espresso brewed thick, creamy milk & cocoa dust in kulhad" `
    -priceText "Rs 109" `
    -buttonText "ADD TO CART +" `
    -activeTab "Menu"

# 5. Handi Dal & Chulha Breads
Create-PlayScreenshot `
    -fileName "screenshot_5_handi_dal.png" `
    -headline "SLOW-COOKED HANDI DAL" `
    -subtitle "Simmered Overnight with Pure Desi Ghee" `
    -tagline "Served with Hot Bajra & Missi Chulha Rotis" `
    -imageRelPath "web\images\dish_handi_dal.jpg" `
    -headerColor $colorMustardGold `
    -cardTitle "Special Dal Makhani Handi" `
    -cardDesc "Traditional clay pot slow cooking with white village butter" `
    -priceText "Rs 189" `
    -buttonText "ADD TO CART +" `
    -activeTab "Menu"

# 6. Village Baithak Table Reservation
Create-PlayScreenshot `
    -fileName "screenshot_6_table_booking.png" `
    -headline "BOOK VILLAGE BAITHAK" `
    -subtitle "Reserve Rustic Khatiya & Charpai Tables" `
    -tagline "Perfect for Family Get-Togethers & Group Feasts" `
    -imageRelPath "web\images\dish_kulhad_lassi.jpg" `
    -headerColor $colorVillageGreen `
    -cardTitle "Khatiya Baithak Seating" `
    -cardDesc "Select date, time slot & guest count for instant table confirmation" `
    -priceText "Free Booking" `
    -buttonText "RESERVE TABLE >" `
    -activeTab "Baithak"

# 7. Contactless UPI & Tracking
Create-PlayScreenshot `
    -fileName "screenshot_7_phonepe_scanner.png" `
    -headline "EASY PHONEPE & UPI" `
    -subtitle "Instant QR Payments & Live Order Tracking" `
    -tagline "Paytm, Google Pay, PhonePe & Cash on Delivery" `
    -imageRelPath "web\images\phonepe_upi_qr.png" `
    -headerColor $colorPhonePe `
    -cardTitle "Instant UPI QR Checkout" `
    -cardDesc "Zero fee contactless payments with live cooking status alerts" `
    -priceText "Secure Pay" `
    -buttonText "PAY WITH UPI >" `
    -activeTab "Cart"

Write-Host "All 7 Google Play Phone Screenshots generated successfully!"
