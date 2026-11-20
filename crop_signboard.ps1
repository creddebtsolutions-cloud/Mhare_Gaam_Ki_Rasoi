Add-Type -AssemblyName System.Drawing

$baseDir = Split-Path -Parent $PSScriptRoot
$heroPath = Join-Path $baseDir 'web\images\hero_village_rasoi.jpg'
$scratchDir = Join-Path $baseDir 'scratch'

if (!(Test-Path $scratchDir)) {
    New-Item -ItemType Directory -Path $scratchDir -Force | Out-Null
}

$img = [System.Drawing.Image]::FromFile($heroPath)
$crop = New-Object System.Drawing.Bitmap(900, 350)
$g = [System.Drawing.Graphics]::FromImage($crop)

$destRect = New-Object System.Drawing.Rectangle(0, 0, 900, 350)
$srcRect = New-Object System.Drawing.Rectangle(0, 0, 900, 350)

$g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$cropPath = Join-Path $scratchDir 'signboard_crop.png'
$crop.Save($cropPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$crop.Dispose()
$img.Dispose()

Write-Host "Crop saved to $cropPath"
