#!/bin/bash
set -e

# Load local environment variables if available
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local..."
  export $(grep -v '^#' .env.local | xargs)
elif [ -f .env ]; then
  echo "Loading environment variables from .env..."
  export $(grep -v '^#' .env | xargs)
fi

SERVICE_NAME="${CLOUD_RUN_SERVICE:-race-timer}"
REGION="${GCP_REGION:-us-central1}"
PROJECT_ID="${GCP_PROJECT_ID:-}"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "Error: gcloud CLI is not installed or not in PATH."
  exit 1
fi

if [ -z "$SERVICE_NAME" ] || [ -z "$REGION" ] || [ -z "$PROJECT_ID" ]; then
  echo "Error: CLOUD_RUN_SERVICE, GCP_REGION, and GCP_PROJECT_ID must be set."
  echo "Example:"
  echo "  CLOUD_RUN_SERVICE=race-timer GCP_REGION=us-central1 GCP_PROJECT_ID=my-project bash scripts/deploy-code.sh"
  exit 1
fi

echo "Deploying Race Timer PRO source to Cloud Run..."
echo "Service Name: ${SERVICE_NAME}"
echo "GCP Region:   ${REGION}"
echo "Project ID:   ${PROJECT_ID}"

gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --quiet

echo "Cloud Run code deployment for '${SERVICE_NAME}' in region '${REGION}' completed successfully!"
