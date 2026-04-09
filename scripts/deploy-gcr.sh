#!/usr/bin/env bash
set -euo pipefail

# Deploy to Google Cloud Run
# Usage: ./scripts/deploy-gcr.sh [PROJECT_ID] [REGION] [SERVICE_NAME]

PROJECT_ID="${1:?Usage: deploy-gcr.sh PROJECT_ID [REGION] [SERVICE_NAME]}"
REGION="${2:-us-central1}"
SERVICE_NAME="${3:-edra-app}"

GIT_SHA=$(git rev-parse --short HEAD)
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:${GIT_SHA}"

echo "Building Docker image: ${IMAGE}"
docker build -t "${IMAGE}" .

echo "Pushing image to GCR..."
docker push "${IMAGE}"

echo "Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "NODE_ENV=production"

echo "Deployed ${SERVICE_NAME} (${GIT_SHA}) to ${REGION}"
