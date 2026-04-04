#!/bin/bash
# Exporta todos los flujos del n8n local a backend/flows/
# Uso: npm run n8n:export  (correr después de editar flujos en la UI de n8n)

set -e

if ! docker compose ps n8n | grep -q "running"; then
  echo "❌  n8n no está corriendo. Ejecuta primero: npm run up"
  exit 1
fi

echo "⬇️  Exportando flujos desde n8n local..."
docker compose exec n8n n8n export:workflow --all --separate --output=/home/node/flows/
echo "✅  Flujos exportados a backend/flows/"
echo "👉  Recuerda hacer git add + commit para guardar los cambios."
