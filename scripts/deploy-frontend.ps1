# Builds and deploys the Smart Tourism React frontend to AWS S3 & CloudFront.
param (
    [string]$BucketName = "",
    [string]$DistributionId = "",
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
$FrontendDir = Join-Path $ProjectRoot "frontend"
$DistDir = Join-Path $FrontendDir "dist"

Write-Host "[Frontend Deployer] Building React / Vite frontend..." -ForegroundColor Cyan

Push-Location $FrontendDir
try {
    npm run build
} finally {
    Pop-Location
}

if (-not (Test-Path (Join-Path $DistDir "index.html"))) {
    Write-Error "[Frontend Deployer] Build failed! dist/index.html not found."
    exit 1
}

Write-Host "[Frontend Deployer] Build succeeded! Artifacts ready in $DistDir" -ForegroundColor Green

if ($DryRun -or [string]::IsNullOrWhiteSpace($BucketName)) {
    Write-Host "`n[Deployment Instructions - S3 & CloudFront]" -ForegroundColor Yellow
    Write-Host "1. Deploy via AWS CLI (when configured):"
    Write-Host "   # Sync hashed assets with long cache TTL" -ForegroundColor DarkGray
    Write-Host "   aws s3 sync `"$DistDir`" s3://YOUR-BUCKET-NAME/ --delete --cache-control `"public, max-age=31536000, immutable`" --exclude `"index.html`""
    Write-Host "   # Sync index.html with no-cache so updates propagate immediately" -ForegroundColor DarkGray
    Write-Host "   aws s3 cp `"$DistDir\index.html`" s3://YOUR-BUCKET-NAME/index.html --cache-control `"no-cache, no-store, must-revalidate`""
    Write-Host "   # Invalidate CloudFront cache" -ForegroundColor DarkGray
    Write-Host "   aws cloudfront create-invalidation --distribution-id YOUR-DISTRIBUTION-ID --paths `"/*`"`n"
    Write-Host "2. Or upload manually in AWS Academy Console:"
    Write-Host "   - Open S3 -> Your Bucket -> Upload -> Select all files and folders inside '$DistDir'"
    Write-Host "   - Open CloudFront -> Distributions -> Select Distribution -> Invalidations -> Create Invalidation -> '/*'"
    exit 0
}

# If BucketName provided, check for AWS CLI
$awsCmd = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsCmd) {
    Write-Warning "AWS CLI is not installed or not in PATH. Please use AWS CloudShell or Console Upload."
    exit 1
}

if (-not $Force) {
    Write-Host "`n[Safety Confirmation]" -ForegroundColor Yellow
    Write-Host "Target S3 Bucket: s3://$BucketName/"
    Write-Host "Warning: The sync operation will replace bucket contents and remove files not present in '$DistDir'." -ForegroundColor DarkYellow
    $confirm = Read-Host "Proceed with deployment to s3://$BucketName/? (y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "Deployment aborted by user." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "[Frontend Deployer] Syncing assets to s3://$BucketName..." -ForegroundColor Cyan
aws s3 sync "$DistDir" "s3://$BucketName/" --delete --cache-control "public, max-age=31536000, immutable" --exclude "index.html"
aws s3 cp "$DistDir\index.html" "s3://$BucketName/index.html" --cache-control "no-cache, no-store, must-revalidate"

if (-not [string]::IsNullOrWhiteSpace($DistributionId)) {
    Write-Host "[Frontend Deployer] Creating CloudFront invalidation for distribution $DistributionId..." -ForegroundColor Cyan
    aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*"
}

Write-Host "[Frontend Deployer] Deployment completed successfully!" -ForegroundColor Green
