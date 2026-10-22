# Packages the Smart Tourism Node.js backend into an Elastic Beanstalk deployment zip.
$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
$BackendDir = Join-Path $ProjectRoot "backend"
$OutputDir = Join-Path $ProjectRoot "build"
$OutputFile = Join-Path $OutputDir "smart-tourism-backend.zip"

Write-Host "[Backend Packager] Starting packaging process..." -ForegroundColor Cyan

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

if (Test-Path $OutputFile) {
    Remove-Item $OutputFile -Force
}

$TempStaging = Join-Path $OutputDir "temp-backend-staging"
if (Test-Path $TempStaging) {
    Remove-Item $TempStaging -Recurse -Force
}
New-Item -ItemType Directory -Path $TempStaging | Out-Null

Write-Host "[Backend Packager] Staging application files from $BackendDir..." -ForegroundColor DarkGray

$FoldersToCopy = @("config", "controllers", "middleware", "models", "routes", "seed", "utils", ".ebextensions")
foreach ($folder in $FoldersToCopy) {
    $src = Join-Path $BackendDir $folder
    if (Test-Path $src) {
        $dest = Join-Path $TempStaging $folder
        Copy-Item -Path $src -Destination $dest -Recurse
    }
}

$FilesToCopy = @("server.js", "package.json", "package-lock.json", "Procfile", ".env.example")
foreach ($file in $FilesToCopy) {
    $src = Join-Path $BackendDir $file
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination (Join-Path $TempStaging $file)
    }
}

# Verify no sensitive files leaked into staging
$envFile = Join-Path $TempStaging ".env"
if (Test-Path $envFile) {
    Remove-Item $envFile -Force
    Write-Warning "[Security] Sensitive .env file was detected and removed from deployment package."
}

Write-Host "[Backend Packager] Compressing staging directory into $OutputFile..." -ForegroundColor DarkGray
Compress-Archive -Path "$TempStaging\*" -DestinationPath $OutputFile -CompressionLevel Optimal

Remove-Item $TempStaging -Recurse -Force

$ZipItem = Get-Item $OutputFile
$SizeMB = [math]::Round($ZipItem.Length / 1MB, 2)
$Hash = (Get-FileHash -Path $OutputFile -Algorithm SHA256).Hash

Write-Host "[Backend Packager] Successfully created deployment package!" -ForegroundColor Green
Write-Host "   Path:   $OutputFile"
Write-Host "   Size:   $SizeMB MB"
Write-Host "   SHA256: $Hash"
Write-Host "Upload this zip file to AWS Elastic Beanstalk (Application Versions)." -ForegroundColor Yellow
