#!/usr/bin/env bash
# One-time GCP infrastructure setup for mi7rab.
# Run this once from your local machine with gcloud authenticated.
# Usage: bash deploy/setup.sh

set -euo pipefail

PROJECT=mi7rab
REGION=us-central1
SQL_INSTANCE=mi7rab-db
RUN_SERVICE=mi7rab
RUN_SA=mi7rab-run
AR_REPO=mi7rab

echo "==> Enabling required GCP APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com \
  --project="$PROJECT"

# ── Artifact Registry ─────────────────────────────────────────────────────────
echo "==> Creating Artifact Registry repository..."
gcloud artifacts repositories create "$AR_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="mi7rab container images" \
  --project="$PROJECT" || echo "  (already exists, skipping)"

# ── Cloud SQL ─────────────────────────────────────────────────────────────────
echo "==> Creating Cloud SQL instance (this takes ~5 minutes)..."
gcloud sql instances create "$SQL_INSTANCE" \
  --database-version=POSTGRES_17 \
  --tier=db-f1-micro \
  --region="$REGION" \
  --storage-auto-increase \
  --storage-type=SSD \
  --storage-size=10GB \
  --project="$PROJECT" || echo "  (already exists, skipping)"

echo "==> Creating database and user..."
gcloud sql databases create mi7rab \
  --instance="$SQL_INSTANCE" \
  --project="$PROJECT" || echo "  (already exists, skipping)"

DB_PASS=$(openssl rand -base64 24)
gcloud sql users create mi7rab \
  --instance="$SQL_INSTANCE" \
  --password="$DB_PASS" \
  --project="$PROJECT" || echo "  (user may already exist)"

echo ""
echo "  DB_PASS generated: $DB_PASS"
echo "  DATABASE_URL will be:"
echo "  postgresql://mi7rab:${DB_PASS}@/mi7rab?host=/cloudsql/${PROJECT}:${REGION}:${SQL_INSTANCE}"
echo ""

# ── Secret Manager ────────────────────────────────────────────────────────────
echo "==> Creating secrets in Secret Manager..."

DATABASE_URL="postgresql://mi7rab:${DB_PASS}@/mi7rab?host=/cloudsql/${PROJECT}:${REGION}:${SQL_INSTANCE}"
echo -n "$DATABASE_URL" | gcloud secrets create database-url \
  --data-file=- --project="$PROJECT" 2>/dev/null || \
  echo -n "$DATABASE_URL" | gcloud secrets versions add database-url --data-file=- --project="$PROJECT"

# REDIS_URL — paste your Upstash URL when prompted
echo ""
echo "  Go to https://upstash.com, create a free Redis database, and copy the Redis URL."
echo -n "  Paste your Upstash REDIS_URL: "
read -r REDIS_URL
echo -n "$REDIS_URL" | gcloud secrets create redis-url \
  --data-file=- --project="$PROJECT" 2>/dev/null || \
  echo -n "$REDIS_URL" | gcloud secrets versions add redis-url --data-file=- --project="$PROJECT"

# BETTER_AUTH_SECRET — generate a strong random secret
AUTH_SECRET=$(openssl rand -base64 48)
echo -n "$AUTH_SECRET" | gcloud secrets create better-auth-secret \
  --data-file=- --project="$PROJECT" 2>/dev/null || \
  echo -n "$AUTH_SECRET" | gcloud secrets versions add better-auth-secret --data-file=- --project="$PROJECT"
echo "  BETTER_AUTH_SECRET generated and stored."

# GCP_KEY_JSON — the service account key for Cloud Storage signed URLs
echo ""
echo "  Path to your GCP service account key JSON (apps/api/gcp-key.json):"
echo -n "  Key file path [apps/api/gcp-key.json]: "
read -r KEY_PATH
KEY_PATH="${KEY_PATH:-apps/api/gcp-key.json}"
gcloud secrets create gcp-key-json \
  --data-file="$KEY_PATH" --project="$PROJECT" 2>/dev/null || \
  gcloud secrets versions add gcp-key-json --data-file="$KEY_PATH" --project="$PROJECT"
echo "  GCP key JSON stored in Secret Manager."

# ── Service account for Cloud Run ─────────────────────────────────────────────
echo "==> Creating Cloud Run service account..."
gcloud iam service-accounts create "$RUN_SA" \
  --display-name="mi7rab Cloud Run" \
  --project="$PROJECT" 2>/dev/null || echo "  (already exists, skipping)"

RUN_SA_EMAIL="${RUN_SA}@${PROJECT}.iam.gserviceaccount.com"

# Grant the SA access to Secret Manager, Cloud SQL, and Cloud Storage
for ROLE in \
  roles/secretmanager.secretAccessor \
  roles/cloudsql.client \
  roles/storage.objectAdmin; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:${RUN_SA_EMAIL}" \
    --role="$ROLE" \
    --condition=None \
    --quiet
done

# ── Grant Cloud Build SA the roles it needs ───────────────────────────────────
echo "==> Granting Cloud Build service account deployment roles..."
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT" --format="value(projectNumber)")
CB_SA="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

for ROLE in \
  roles/run.admin \
  roles/artifactregistry.writer \
  roles/secretmanager.secretAccessor \
  roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="$CB_SA" \
    --role="$ROLE" \
    --condition=None \
    --quiet
done

# ── Initial Cloud Run deploy ──────────────────────────────────────────────────
echo ""
echo "==> Build and deploy the initial image via Cloud Build..."
echo "    (Subsequent deploys happen automatically on push to main via trigger)"
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project="$PROJECT" \
  .

# ── Custom domain ─────────────────────────────────────────────────────────────
echo ""
echo "==> Mapping ribhielzaru.com to Cloud Run..."
echo "    You may need to verify domain ownership first:"
echo "    https://console.cloud.google.com/apis/credentials/domainverification"
echo ""
gcloud run domain-mappings create \
  --service="$RUN_SERVICE" \
  --domain=ribhielzaru.com \
  --region="$REGION" \
  --project="$PROJECT" || true

echo ""
echo "==> DNS records to add in Namecheap:"
gcloud run domain-mappings describe \
  --domain=ribhielzaru.com \
  --region="$REGION" \
  --project="$PROJECT" \
  --format="table(status.resourceRecords[].name, status.resourceRecords[].rrdata, status.resourceRecords[].type)"

echo ""
echo "==> Run database migrations:"
echo "    Use Cloud SQL Auth Proxy locally to run migrations:"
echo "    cloud-sql-proxy ${PROJECT}:${REGION}:${SQL_INSTANCE} &"
echo "    DATABASE_URL=\"postgresql://mi7rab:${DB_PASS}@localhost:5432/mi7rab\" pnpm --filter @mihrab/api db:migrate"
echo ""
echo "Done! TLS cert provisioning takes ~15 minutes after DNS propagates."
