#!/bin/bash
# TutoPool deployment script
#
# Usage:
#   bash scripts/deploy.sh --frontend        # build + push to Vercel
#   bash scripts/deploy.sh --server          # pull latest + restart on Hetzner
#   bash scripts/deploy.sh --all             # both

set -e

DEPLOY_FRONTEND=false
DEPLOY_SERVER=false

for arg in "$@"; do
  case $arg in
    --frontend) DEPLOY_FRONTEND=true ;;
    --server)   DEPLOY_SERVER=true ;;
    --all)      DEPLOY_FRONTEND=true; DEPLOY_SERVER=true ;;
    *) echo "Unknown option: $arg"; exit 1 ;;
  esac
done

# ── Frontend → Vercel ─────────────────────────────────────────────────────────
if [ "$DEPLOY_FRONTEND" = true ]; then
  echo "Building frontend..."

  # Verify Vercel env vars are set
  if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo ""
    echo "Set these env vars before deploying (or configure them in the Vercel dashboard):"
    echo "  VITE_SUPABASE_URL        — http://<SERVER_IP>:8000"
    echo "  VITE_SUPABASE_ANON_KEY   — ANON_KEY from .env.production"
    echo "  VITE_N8N_WEBHOOK_URL     — http://<SERVER_IP>:5678/webhook/tutor-confirmation"
    echo ""
    echo "Easiest: add them in Vercel dashboard → Settings → Environment Variables"
    echo "then redeploy with:  npx vercel --prod  (inside frontend/)"
    echo ""
  fi

  cd frontend

  if command -v vercel &> /dev/null; then
    echo "Deploying to Vercel..."
    npx vercel --prod
  else
    echo "Vercel CLI not found — building locally instead."
    npm run build
    echo ""
    echo "Build ready at frontend/dist/"
    echo "To deploy, run one of:"
    echo "   cd frontend && npx vercel --prod"
    echo "   OR push to your connected GitHub repo (auto-deploy)"
  fi

  cd ..
  echo "Frontend done."
fi

# ── Server → Hetzner ──────────────────────────────────────────────────────────
if [ "$DEPLOY_SERVER" = true ]; then
  SERVER_IP="${SERVER_IP:-89.167.116.47}"
  SERVER_USER="${SERVER_USER:-root}"
  REMOTE_DIR="${REMOTE_DIR:-/opt/tutopool}"

  echo "Deploying to Hetzner ($SERVER_USER@$SERVER_IP)..."

  ssh "$SERVER_USER@$SERVER_IP" "
    cd $REMOTE_DIR &&
    git pull &&
    bash scripts/resolve-kong.sh .env &&
    docker compose pull &&
    docker compose up -d &&
    docker compose logs migrations --tail=30
  "

  echo "Server deploy done."
fi

echo ""
echo "Deploy complete."
