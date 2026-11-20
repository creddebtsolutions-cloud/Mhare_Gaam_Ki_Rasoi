$zipPath = 'L:\Mhare Gaam Ki Rasoi\MhareGaamKiRasoi-Backend.zip'
$webDir = 'L:\Mhare Gaam Ki Rasoi\web'
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem

$staging = Join-Path $env:TEMP ('mgkr_backend_' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $staging | Out-Null

Copy-Item -Path (Join-Path $webDir 'server.js') -Destination $staging
Copy-Item -Path (Join-Path $webDir 'package.json') -Destination $staging
Copy-Item -Path (Join-Path $webDir 'data') -Destination $staging -Recurse
Copy-Item -Path (Join-Path $webDir 'admin.html') -Destination $staging -ErrorAction SilentlyContinue
Copy-Item -Path (Join-Path $webDir 'admin.css') -Destination $staging -ErrorAction SilentlyContinue
Copy-Item -Path (Join-Path $webDir 'admin.js') -Destination $staging -ErrorAction SilentlyContinue
Copy-Item -Path (Join-Path $webDir 'index.html') -Destination $staging -ErrorAction SilentlyContinue
Copy-Item -Path (Join-Path $webDir 'style.css') -Destination $staging -ErrorAction SilentlyContinue
Copy-Item -Path (Join-Path $webDir 'app.js') -Destination $staging -ErrorAction SilentlyContinue

[System.IO.Compression.ZipFile]::CreateFromDirectory($staging, $zipPath)
Remove-Item -Recurse -Force $staging

$webDownloads = Join-Path $webDir 'downloads'
if (!(Test-Path $webDownloads)) { New-Item -ItemType Directory -Path $webDownloads | Out-Null }
Copy-Item -Path $zipPath -Destination (Join-Path $webDownloads 'MhareGaamKiRasoi-Backend.zip') -Force
Copy-Item -Path $zipPath -Destination (Join-Path $webDir 'MhareGaamKiRasoi-Backend.zip') -Force

$item = Get-Item $zipPath
Write-Host "Created: $($item.FullName) ($([math]::Round($item.Length/1KB, 2)) KB)"
