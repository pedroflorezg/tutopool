#!/bin/bash
export PATH="/opt/homebrew/Cellar/node/25.9.0_1/bin:$PATH"
cd "$(dirname "$0")"
echo "🚀 Iniciando TutoPool WhatsApp Bridge..."
node server.js
