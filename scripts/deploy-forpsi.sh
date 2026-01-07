#!/bin/bash

# ==============================================================================
# 🚀 DEPLOY SCRIPT: PAPI HAIR DESIGN → FORPSI.SK VPS
# ==============================================================================
# Optimalizovaný pre Forpsi VPS hosting
# ==============================================================================

# --- KONFIGURÁCIA FORPSI ---
# TODO: Upravte podľa vašich Forpsi VPS údajov
VPS_HOST="194.182.87.6"  # Updated from diagnostics
VPS_USER="root"          # Updated from diagnostics
DOMAIN="papihairdesign.sk" # Defaulting to existing domain, easy to change if needed
REMOTE_ROOT="/var/www"
REMOTE_DIR="${REMOTE_ROOT}/${DOMAIN}"
BACKUP_DIR="${REMOTE_ROOT}/${DOMAIN}_backup_$(date +%Y%m%d_%H%M%S)"
LOCAL_DIST="dist/app/browser"


# --- FARBY ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# OpenAI API Key (z environment variable - NIKDY neukladajte do Git!)
if [ -z "$OPENAI_API_KEY" ]; then
    log_warn "OPENAI_API_KEY nie je nastavený! AI funkcie nebudú fungovať. Dodajte ho neskôr do /etc/environment."
fi

# --- 1. KONTROLA PROSTREDIA ---
log_info "1/7) Kontrola prostredia..."

if ! command -v npm &> /dev/null; then
    log_error "npm nie je nainštalované. Prosím nainštalujte Node.js."
fi

log_info "Testujem SSH pripojenie k ${VPS_USER}@${VPS_HOST}..."
if ! ssh -o BatchMode=yes -o ConnectTimeout=5 "${VPS_USER}@${VPS_HOST}" echo "SSH OK" &> /dev/null; then
    log_error "Nepodarilo sa pripojiť k Forpsi VPS. Skontrolujte SSH kľúče a prístup."
fi
log_success "SSH pripojenie funkčné."

# --- 2. BUILD APLIKÁCIE ---
log_info "2/7) Build Angular aplikácie (Production)..."

rm -rf dist/

if npx ng build --configuration=production; then
    log_success "Build úspešný."
else
    log_error "Build zlyhal. Opravte chyby a skúste znova."
fi

if [ ! -f "${LOCAL_DIST}/index.html" ]; then
    log_error "Súbor index.html nebol nájdený v ${LOCAL_DIST}."
fi

# Príprava Proxy (kopírovanie do dist)
log_info "Kopírujem PHP proxy súbory do dist..."
mkdir -p "${LOCAL_DIST}/proxy"
cp src/proxy/chat.php "${LOCAL_DIST}/proxy/"
cp src/proxy/chat_stream.php "${LOCAL_DIST}/proxy/"
cp src/proxy/image-job.php "${LOCAL_DIST}/proxy/"

# --- 3. ZÁLOHA NA SERVERI ---
log_info "3/7) Vytváram zálohu na Forpsi VPS..."

ssh "${VPS_USER}@${VPS_HOST}" << EOF
    if [ -d "${REMOTE_DIR}" ]; then
        echo "Zálohujem existujúcu verziu do ${BACKUP_DIR}..."
        cp -r "${REMOTE_DIR}" "${BACKUP_DIR}"
        ls -dt ${REMOTE_ROOT}/${DOMAIN}_backup_* | tail -n +6 | xargs rm -rf 2>/dev/null || true
    else
        echo "Prvé nasadenie, vytváram adresár..."
        sudo mkdir -p "${REMOTE_DIR}"
        sudo chown -R ${VPS_USER}:${VPS_USER} "${REMOTE_DIR}"
    fi
EOF

# --- 4. NAHRATIE SÚBOROV (RSYNC) ---
log_info "4/7) Nahrávam súbory na Forpsi VPS..."

if rsync -avz --delete --exclude='.*' "${LOCAL_DIST}/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"; then
    log_success "Súbory úspešne nahraté."
else
    log_error "Rsync zlyhal. Skontrolujte pripojenie."
fi

# --- 5. KONFIGURÁCIA SERVERA (NGINX & PHP) ---
log_info "5/7) Konfigurujem Nginx a PHP na Forpsi VPS..."

ssh "${VPS_USER}@${VPS_HOST}" << 'FORPSI_CONFIG'
    set -e
    
    # Nastavenie oprávnení
    sudo chmod -R 755 "${REMOTE_DIR}"
    sudo find "${REMOTE_DIR}" -type f -exec chmod 644 {} +

    # Kontrola a inštalácia Nginx a PHP
    if ! command -v nginx &> /dev/null; then
        echo "Inštalujem Nginx..."
        sudo apt update && sudo apt install -y nginx
    fi
    
    if ! command -v php &> /dev/null; then
        echo "Inštalujem PHP a rozšírenia..."
        sudo apt update && sudo apt install -y php-fpm php-curl php-json php-mbstring
    fi

    # Vytvorenie config.php pre Proxy
    echo "Vytváram secure config pre Proxy..."
    cat > "${REMOTE_DIR}/proxy/config.php" << 'PHP_CONFIG'
<?php
return [
    'openai_key' => getenv('OPENAI_API_KEY') ?: 'YOUR_OPENAI_API_KEY_HERE'
];
PHP_CONFIG
    
    # Detekcia PHP verzie
    PHP_VERSION=$(ls /var/run/php/php*-fpm.sock 2>/dev/null | head -n 1 | sed 's/.*php\(.*\)-fpm.sock/\1/')
    if [ -z "$PHP_VERSION" ]; then
        PHP_VERSION="8.1"  # Fallback
    fi
    echo "Používam PHP verziu: $PHP_VERSION"

    # Generovanie Nginx konfigurácie
    echo "Aktualizujem Nginx config pre ${DOMAIN}..."
    sudo tee /etc/nginx/sites-available/${DOMAIN} > /dev/null << NGINX_CONF
# HTTP server - presmerovanie na HTTPS
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Presmerovanie na HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    root ${REMOTE_DIR};
    index index.html;

    # SSL konfigurácia (Certbot alebo vlastný certifikát)
    # ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Gzip kompresia
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/json;

    # Bezpečnostné hlavičky
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # PHP Proxy - Chat JSON
    location ~ ^/proxy/chat\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_read_timeout 20s;
    }

    # PHP Proxy - Chat Stream (disable buffering)
    location ~ ^/proxy/chat_stream\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
        proxy_buffering off;
        gzip off;
        fastcgi_read_timeout 20s;
        add_header X-Accel-Buffering no;
    }

    # PHP Proxy - Image Job
    location ~ ^/proxy/image-job\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
        fastcgi_read_timeout 60s;
    }

    # Zakázať prístup k config.php
    location ~ /proxy/config\.php {
        deny all;
        return 404;
    }

    # Cache pre statické súbory
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Service Worker - nikdy necacheovať
    location = /ngsw-worker.js {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
NGINX_CONF

    # Aktivácia stránky
    if [ ! -L /etc/nginx/sites-enabled/${DOMAIN} ]; then
        echo "Aktivujem stránku ${DOMAIN}..."
        sudo ln -s /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
    fi

    # Test a reštart Nginx
    if sudo nginx -t; then
        sudo systemctl reload nginx
        echo "Nginx reštartovaný."
    else
        echo "Chyba v Nginx konfigurácii!"
        exit 1
    fi
FORPSI_CONFIG

# --- 6. NASTAVENIE ENVIRONMENT VARIABLES ---
log_info "6/7) Nastavujem environment variables na Forpsi VPS..."

ssh "${VPS_USER}@${VPS_HOST}" << EOF
    # Pridanie OPENAI_API_KEY do PHP-FPM environment
    # (pre Forpsi možno potrebuješ upraviť php-fpm.conf)
    echo "OPENAI_API_KEY=${OPENAI_API_KEY}" | sudo tee -a /etc/environment > /dev/null
EOF

# --- 7. DOKONČENIE ---
log_success "========================================================"
log_success "✅ DEPLOY NA FORPSI VPS DOKONČENÝ"
log_success "========================================================"
log_info "URL: https://${DOMAIN}"
log_info "Záloha vytvorená v: ${BACKUP_DIR}"
log_info ""
log_info "📝 Ďalšie kroky:"
log_info "1. Skontroluj SSL certifikát (ak ešte nie je nastavený)"
log_info "2. Testuj endpointy: ./test-main-features.sh https://${DOMAIN}"
log_info "3. Skontroluj PHP-FPM logs ak sú problémy"

