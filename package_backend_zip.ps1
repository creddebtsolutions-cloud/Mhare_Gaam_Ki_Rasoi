Add-Type -AssemblyName System.IO.Compression.FileSystem

$sourceDir = 'L:\Mhare Gaam Ki Rasoi\web'
$zipPath = 'L:\Mhare Gaam Ki Rasoi\MhareGaamKiRasoi-Backend.zip'

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Create a clean temporary staging directory
$tempDir = Join-Path $env:TEMP ('backend_pack_' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "Staging backend files from $sourceDir..."

# Copy individual files
$filesToCopy = @(
    'server.js',
    'package.json',
    'Procfile',
    'README.md',
    '.gitignore',
    'admin.html',
    'admin.css',
    'admin.js',
    'index.html',
    'style.css',
    'app.js',
    'privacy-policy.html',
    'account-deletion.html'
)

foreach ($f in $filesToCopy) {
    $src = Join-Path $sourceDir $f
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $tempDir -Force
    }
}

# Copy data folder
$dataSrc = Join-Path $sourceDir 'data'
if (Test-Path $dataSrc) {
    Copy-Item -Path $dataSrc -Destination (Join-Path $tempDir 'data') -Recurse -Force
}

# Copy images folder
$imagesSrc = Join-Path $sourceDir 'images'
if (Test-Path $imagesSrc) {
    Copy-Item -Path $imagesSrc -Destination (Join-Path $tempDir 'images') -Recurse -Force
}

Write-Host "Compressing into $zipPath..."
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

# Clean up temp
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

$zipItem = Get-Item $zipPath
Write-Host "============================================="
Write-Host "BACKEND ZIP CREATED SUCCESSFULLY!"
Write-Host "File: $($zipItem.FullName)"
Write-Host "Size: $([math]::Round($zipItem.Length / 1MB, 2)) MB ($($zipItem.Length) bytes)"
Write-Host "============================================="

# Copy to convenient user locations (Desktop and Downloads)
$destinations = @(
    "$env:USERPROFILE\Downloads\MhareGaamKiRasoi-Backend.zip",
    "$env:USERPROFILE\OneDrive\Desktop\Mhare Gaam Ki Rasoi\MhareGaamKiRasoi-Backend.zip",
    "$env:USERPROFILE\Desktop\MhareGaamKiRasoi-Backend.zip"
)

foreach ($dest in $destinations) {
    try {
        $parent = Split-Path $dest
        if (Test-Path $parent) {
            Copy-Item -Path $zipPath -Destination $dest -Force
            Write-Host "Copied backup to: $dest"
        }
    } catch {}
}
