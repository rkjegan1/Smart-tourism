#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"
OUTPUT_DIR="${PROJECT_ROOT}/build"
OUTPUT_FILE="${OUTPUT_DIR}/smart-tourism-backend.zip"

echo "📦 [Backend Packager] Packaging Node.js backend for Elastic Beanstalk..."

mkdir -p "${OUTPUT_DIR}"
rm -f "${OUTPUT_FILE}"

TEMP_STAGING="${OUTPUT_DIR}/temp-backend-staging"
rm -rf "${TEMP_STAGING}"
mkdir -p "${TEMP_STAGING}"

for dir in config controllers middleware models routes seed utils .ebextensions; do
  if [ -d "${BACKEND_DIR}/${dir}" ]; then
    cp -r "${BACKEND_DIR}/${dir}" "${TEMP_STAGING}/"
  fi
done

for file in server.js package.json package-lock.json Procfile .env.example; do
  if [ -f "${BACKEND_DIR}/${file}" ]; then
    cp "${BACKEND_DIR}/${file}" "${TEMP_STAGING}/"
  fi
done

# Ensure sensitive files are not packaged
rm -f "${TEMP_STAGING}/.env"

(cd "${TEMP_STAGING}" && zip -r "${OUTPUT_FILE}" .)
rm -rf "${TEMP_STAGING}"

echo "✅ [Backend Packager] Package created at: ${OUTPUT_FILE}"
ls -lh "${OUTPUT_FILE}"
