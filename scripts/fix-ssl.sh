#!/bin/bash

# Configuration
VPS_USER="root"
VPS_HOST="194.182.87.6"
DOMAIN="papihairdesign.sk"
EMAIL="info@papihairdesign.sk" # Assumed email

echo "Starting SSL Fix for ${DOMAIN}..."

ssh "${VPS_USER}@${VPS_HOST}" << EOF
    set -e
    
    echo "1. Checking for Certbot..."
    if ! command -v certbot &> /dev/null; then
        echo "Installing Certbot..."
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
    fi

    echo "2. Requesting Certificate for ${DOMAIN} & www.${DOMAIN}..."
    # Using --nginx plugin to automatically configure, but we also manually configured paths in deploy script.
    # We use --cert-name to ensure consistent naming.
    sudo certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "${EMAIL}" --redirect --cert-name "${DOMAIN}"

    echo "3. Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo "SSL Certificate updated successfully!"
EOF
