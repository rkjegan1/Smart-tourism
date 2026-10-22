#!/usr/bin/env bash
set -euo pipefail

BUCKET_NAME="${1:-}"
DISTRIBUTION_ID="${2:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
DIST_DIR="${FRONTEND_DIR}/dist"

echo "🚀 [Frontend Deployer] Building React / Vite frontend..."
(cd "${FRONTEND_DIR}" && npm run build)

if [ ! -f "${DIST_DIR}/index.html" ]; then
  echo "❌ [Frontend Deployer] Build failed: ${DIST_DIR}/index.html not found." >&2
  exit 1
fi

echo "✅ [Frontend Deployer] Build succeeded!"

if [ -z "${BUCKET_NAME}" ]; then
  echo ""
  echo "ℹ️  Usage: ./scripts/deploy-frontend.sh <S3_BUCKET_NAME> [CLOUDFRONT_DISTRIBUTION_ID]"
  echo "Example:"
  echo "  aws s3 sync \"${DIST_DIR}\" s3://YOUR-BUCKET/ --delete --cache-control \"public, max-age=31536000, immutable\" --exclude \"index.html\""
  echo "  aws s3 cp \"${DIST_DIR}/index.html\" s3://YOUR-BUCKET/index.html --cache-control \"no-cache, no-store, must-revalidate\""
  exit 0
fi

echo "📤 [Frontend Deployer] Syncing assets to s3://${BUCKET_NAME}..."
aws s3 sync "${DIST_DIR}" "s3://${BUCKET_NAME}/" --delete --cache-control "public, max-age=31536000, immutable" --exclude "index.html"
aws s3 cp "${DIST_DIR}/index.html" "s3://${BUCKET_NAME}/index.html" --cache-control "no-cache, no-store, must-revalidate"

if [ -n "${DISTRIBUTION_ID}" ]; then
  echo "🔄 [Frontend Deployer] Invalidating CloudFront cache (${DISTRIBUTION_ID})..."
  aws cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" --paths "/*"
fi

echo "🎉 [Frontend Deployer] Frontend deployed successfully!"
