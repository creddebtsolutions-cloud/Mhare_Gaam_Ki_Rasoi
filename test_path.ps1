Add-Type -AssemblyName System.Drawing
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc(0, 0, 20, 20, 180, 90)
Write-Host "Path points: $($path.PointCount)"
