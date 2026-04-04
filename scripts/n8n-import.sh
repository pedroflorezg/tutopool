#!/bin/bash
# Importa todos los flujos de backend/flows/ al n8n local
# Uso: npm run n8n:import

set -e

if ! docker compose ps n8n | grep -q "running"; then
  echo "❌  n8n no está corriendo. Ejecuta primero: npm run up"
  exit 1
fi

echo "⬆️  Importando flujos a n8n local..."
docker compose exec n8n n8n import:workflow --separate --input=/home/node/flows/
echo "✅  Flujos importados. Abre http://localhost:5678 para verlos."
