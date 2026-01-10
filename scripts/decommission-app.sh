#!/bin/bash

# Configuration
VPS_USER="root"
VPS_HOST="194.182.87.6"
SUBDOMAIN="app.papihairdesign.sk"

echo "Decommissioning ${SUBDOMAIN}..."

ssh "${VPS_USER}@${VPS_HOST}" << EOF
    set -e
    
    echo "1. Disabling site in Nginx..."
    if [ -L "/etc/nginx/sites-enabled/${SUBDOMAIN}" ]; then
        sudo rm "/etc/nginx/sites-enabled/${SUBDOMAIN}"
        echo "Symlink removed."
    else
        echo "Site already disabled."
    fi

    echo "2. Removing configuration file..."
    if [ -f "/etc/nginx/sites-available/${SUBDOMAIN}" ]; then
        sudo rm "/etc/nginx/sites-available/${SUBDOMAIN}"
        echo "Config file removed."
    else
        echo "Config file not found."
    fi

    echo "3. Reloading Nginx..."
    if sudo nginx -t; then
        sudo systemctl reload nginx
        echo "Nginx reloaded successfully."
    else
        echo "Nginx configuration error! Not reloading."
        exit 1
    fi
    
    echo "${SUBDOMAIN} has been decommissioned."
EOF
