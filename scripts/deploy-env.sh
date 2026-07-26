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

if [ -z "$SERVICE_NAME" ] || [ -z "$REGION" ] || [ -z "$PROJECT_ID" ]; then
  echo "Error: CLOUD_RUN_SERVICE, GCP_REGION, and GCP_PROJECT_ID must be set."
  echo "Example:"
  echo "  CLOUD_RUN_SERVICE=race-timer GCP_REGION=us-central1 GCP_PROJECT_ID=my-project bash scripts/deploy-env.sh"
  exit 1
fi

ENV_VARS="NODE_ENV=production"

if [ -n "$DISABLE_HMR" ]; then
  ENV_VARS="$ENV_VARS,DISABLE_HMR=$DISABLE_HMR"
fi

echo "Updating Cloud Run environment variables for ${SERVICE_NAME} in ${REGION}..."
gcloud run services update "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --update-env-vars "$ENV_VARS"

echo "Environment variables successfully updated on Cloud Run!"
