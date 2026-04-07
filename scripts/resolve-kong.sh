#!/bin/bash
# Substitutes .env values into the kong.yml template.
# Run this once after changing keys in .env, then restart the kong container.
#
# Usage: bash scripts/resolve-kong.sh [path/to/.env]
set -e

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: env file not found at $ENV_FILE"
  exit 1
fi

TEMPLATE="supabase/docker/volumes/api/kong.yml"

python3 - "$ENV_FILE" "$TEMPLATE" << 'PYEOF'
import sys, re

env_file   = sys.argv[1]
tpl_file   = sys.argv[2]

# Parse .env
env = {}
with open(env_file) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

# Map kong.yml placeholders → .env keys
mapping = {
    'SUPABASE_ANON_KEY':   env.get('ANON_KEY',         ''),
    'SUPABASE_SERVICE_KEY': env.get('SERVICE_ROLE_KEY', ''),
    'DASHBOARD_USERNAME':  env.get('DASHBOARD_USERNAME', 'supabase'),
    'DASHBOARD_PASSWORD':  env.get('DASHBOARD_PASSWORD', ''),
}

with open(tpl_file) as f:
    content = f.read()

for placeholder, value in mapping.items():
    content = content.replace('${' + placeholder + '}', value)

# Warn if any placeholders remain
remaining = re.findall(r'\$\{[^}]+\}', content)
if remaining:
    print(f'Warning: unresolved placeholders: {remaining}', file=sys.stderr)

with open(tpl_file, 'w') as f:
    f.write(content)

print(f'kong.yml resolved successfully.')
PYEOF
