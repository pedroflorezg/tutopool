#!/bin/bash
# ─── TutoPool — Hetzner server initial setup ─────────────────────────────────
# Run this ONCE on the Hetzner server (as root or with sudo).
# Usage:
#   bash scripts/setup-hetzner.sh          # full setup
#   bash scripts/setup-hetzner.sh --gen-keys   # only generate JWT keys

set -e

# ── Key generation mode ───────────────────────────────────────────────────────
if [ "$1" = "--gen-keys" ]; then
  echo ""
  echo "Generating Supabase JWT keys..."
  python3 - <<'PYEOF'
import json, base64, hmac, hashlib, time, os, sys

def b64url(data):
    if isinstance(data, str):
        data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def sign_jwt(payload, secret):
    header  = b64url(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(',',':')))
    body    = b64url(json.dumps(payload, separators=(',',':')))
    msg     = f"{header}.{body}"
    sig     = hmac.new(secret.encode(), msg.encode(), hashlib.sha256).digest()
    return   f"{msg}.{b64url(sig)}"

secret = os.urandom(32).hex()
now    = int(time.time())
exp    = now + 315360000   # 10 years

anon    = sign_jwt({"role": "anon",         "iss": "supabase", "iat": now, "exp": exp}, secret)
service = sign_jwt({"role": "service_role", "iss": "supabase", "iat": now, "exp": exp}, secret)
rb      = os.urandom(64).hex()

print("")
print("# ── Copy these into .env.production on the server ──────────────────")
print(f"JWT_SECRET={secret}")
print(f"ANON_KEY={anon}")
print(f"SERVICE_ROLE_KEY={service}")
print(f"REALTIME_SECRET_KEY_BASE={rb}")
print("# ────────────────────────────────────────────────────────────────────")
print("")
PYEOF
  exit 0
fi

# ── Full server setup ─────────────────────────────────────────────────────────
echo "==> Updating system packages..."
apt-get update -y && apt-get upgrade -y

echo "==> Installing Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
else
  echo "    Docker already installed — skipping."
fi

echo "==> Installing Docker Compose plugin..."
if ! docker compose version &> /dev/null; then
  apt-get install -y docker-compose-plugin
else
  echo "    Docker Compose already installed — skipping."
fi

echo "==> Installing git..."
apt-get install -y git python3

echo ""
echo "==> Server setup complete."
echo ""
echo "Next steps:"
echo ""
echo "  1. Copy the project to the server:"
echo "       git clone <your-repo-url> /opt/tutopool"
echo "       cd /opt/tutopool"
echo ""
echo "  2. Generate JWT keys:"
echo "       bash scripts/setup-hetzner.sh --gen-keys"
echo ""
echo "  3. Create .env from template and fill in ALL 'CHANGE_ME' values:"
echo "       cp .env.production .env"
echo "       nano .env"
echo ""
echo "  4. Open required firewall ports:"
echo "       ufw allow 22    # SSH"
echo "       ufw allow 8000  # Supabase Kong (API)"
echo "       ufw allow 5678  # n8n"
echo "       ufw allow 8080  # Evolution API"
echo "       ufw allow 54323 # Supabase Studio (restrict to your IP in production)"
echo "       ufw enable"
echo ""
echo "  5. Start all services:"
echo "       docker compose up -d"
echo ""
echo "  6. Watch migrations run:"
echo "       docker compose logs migrations -f"
echo ""
echo "  7. Deploy the frontend to Vercel:"
echo "       bash scripts/deploy.sh --frontend"
echo ""
echo "  ─── Optional: add a domain + HTTPS ──────────────────────────────────"
echo "  Point a DNS A-record to 89.167.116.47, then install Caddy:"
echo "       apt-get install -y caddy"
echo "  Configure /etc/caddy/Caddyfile to reverse-proxy port 8000."
echo "  Then update SITE_URL, API_EXTERNAL_URL, and VITE_SUPABASE_URL to"
echo "  use https:// and redeploy the frontend."
