#!/usr/bin/env bash
set -euo pipefail

VPS_USER="ubuntu"
VPS_HOST="57.129.4.22"
KEY_FILE="$HOME/.ssh/id_ed25519"

if [ ! -f "$KEY_FILE" ]; then
  echo "🔐 Generujem nový SSH kľúč: $KEY_FILE"
  ssh-keygen -t ed25519 -f "$KEY_FILE" -C "$USER@$(hostname)" -N ""
fi

echo "📤 Kopírujem SSH public key na ${VPS_USER}@${VPS_HOST}..."
ssh-copy-id -i "${KEY_FILE}.pub" "${VPS_USER}@${VPS_HOST}"

echo "✅ Testujem prihlásenie cez SSH..."
ssh "${VPS_USER}@${VPS_HOST}" 'echo "✅ SSH OK z $(hostname)"'
