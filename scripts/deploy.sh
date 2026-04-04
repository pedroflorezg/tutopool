#!/bin/bash
# Deploy de TutoPool a servicios cloud
# Prerequisitos: supabase CLI, acceso a n8n cloud, build del frontend listo
#
# Uso: bash scripts/deploy.sh [--db] [--n8n] [--frontend] [--all]

set -e

DEPLOY_DB=false
DEPLOY_N8N=false
DEPLOY_FRONTEND=false

for arg in "$@"; do
  case $arg in
    --db)         DEPLOY_DB=true ;;
    --n8n)        DEPLOY_N8N=true ;;
    --frontend)   DEPLOY_FRONTEND=true ;;
    --all)        DEPLOY_DB=true; DEPLOY_N8N=true; DEPLOY_FRONTEND=true ;;
    *) echo "Opción desconocida: $arg"; exit 1 ;;
  esac
done

if [ "$DEPLOY_DB" = true ]; then
  echo "🗄️  Desplegando migraciones a Supabase cloud..."
  # Requiere: supabase link --project-ref <ref>
  supabase db push
  echo "✅  Base de datos actualizada."
fi

if [ "$DEPLOY_N8N" = true ]; then
  echo "⚙️  Subiendo flujos a n8n cloud..."
  # Requiere: N8N_CLOUD_URL y N8N_CLOUD_API_KEY en .env
  source .env 2>/dev/null || true

  if [ -z "$N8N_CLOUD_URL" ] || [ -z "$N8N_CLOUD_API_KEY" ]; then
    echo "❌  Falta N8N_CLOUD_URL o N8N_CLOUD_API_KEY en .env"
    exit 1
  fi

  for file in backend/flows/*.json; do
    echo "   → Importando: $file"
    curl -s -X POST "$N8N_CLOUD_URL/api/v1/workflows" \
      -H "X-N8N-API-KEY: $N8N_CLOUD_API_KEY" \
      -H "Content-Type: application/json" \
      -d @"$file" > /dev/null
  done
  echo "✅  Flujos subidos a n8n cloud."
fi

if [ "$DEPLOY_FRONTEND" = true ]; then
  echo "🌐  Construyendo frontend..."
  cd frontend && npm run build && cd ..

  # TODO: ajustar al proveedor de hosting elegido
  # Opciones: Vercel, Netlify, un servidor propio vía rsync/scp
  # Ejemplo Vercel:
  #   cd frontend && npx vercel --prod
  # Ejemplo rsync a servidor propio:
  #   rsync -avz frontend/dist/ user@tuservidor.com:/var/www/tutopool/
  echo "⚠️  Agrega el comando de deploy del frontend en scripts/deploy.sh (línea ~50)"
  echo "✅  Build listo en frontend/dist/"
fi

echo ""
echo "🚀  Deploy completado."
