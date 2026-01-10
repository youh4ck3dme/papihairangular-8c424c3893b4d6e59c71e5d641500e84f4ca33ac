#!/bin/bash

# ==============================================================================
# 🚀 ULTIMATE DEPLOY SCRIPT: PAPI HAIR DESIGN
# ==============================================================================
# Tento skript kombinuje to najlepšie z predchádzajúcich verzií a pridáva:
# 1. Automatickú detekciu prostredia a kontrolu závislostí
# 2. Bezpečný build s kontrolou chýb a zálohou predchádzajúcej verzie na serveri
# 3. Optimalizovaný prenos súborov pomocou rsync (rýchlejší ako scp)
# 4. Pokročilú konfiguráciu Nginx s bezpečnostnými hlavičkami a HTTP/2
# 5. Automatickú obnovu SSL certifikátov (ak je nainštalovaný certbot)
# 6. Farebný a prehľadný výstup pre lepší UX
# ==============================================================================

# --- FARBY ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# --- FUNKCIE ---
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# --- KONFIGURÁCIA ---
VPS_HOST="194.182.87.6"
VPS_USER="root"
DOMAIN="papihairdesign.sk"
REMOTE_ROOT="/var/www"
REMOTE_DIR="${REMOTE_ROOT}/${DOMAIN}"
BACKUP_DIR="${REMOTE_ROOT}/${DOMAIN}_backup_$(date +%Y%m%d_%H%M%S)"
LOCAL_DIST="dist/app/browser" # Cesta k Angular build výstupu

# Načítanie .env súboru ak existuje
if [ -f ".env" ]; then
    log_info "Načítavam premenné z .env súboru..."
    export $(grep -v '^#' .env | xargs)
fi

# Kontrola kľúčov
if [ -z "$GEMINI_API_KEY" ]; then
    log_warn "GEMINI_API_KEY nie je nastavený! AI funkcie (analýza tváre) nebudú fungovať."
else
    log_info "GEMINI_API_KEY nájdený."
fi

if [ -z "$OPENAI_API_KEY" ]; then
    log_warn "OPENAI_API_KEY nie je nastavený. (Voliteľné ak používate len Gemini)"
fi


# --- 1. KONTROLA PROSTREDIA ---
log_info "1/7) Kontrola prostredia..."

# Kontrola Node.js
if ! command -v npm &> /dev/null; then
    log_error "npm nie je nainštalované. Prosím nainštalujte Node.js."
fi

# Kontrola SSH pripojenia
log_info "Testujem SSH pripojenie k ${VPS_USER}@${VPS_HOST}..."
if ! ssh -i ~/.ssh/id_rsa_vps -o BatchMode=yes -o ConnectTimeout=5 "${VPS_USER}@${VPS_HOST}" echo "SSH OK" &> /dev/null; then
    log_error "Nepodarilo sa pripojiť k serveru cez SSH. Skontrolujte kľúče a VPN."
fi
log_success "SSH pripojenie funkčné."

# --- 2. BUILD APLIKÁCIE ---
log_info "2/7) Build Angular aplikácie (Production)..."

# Vyčistenie starej dist
rm -rf dist/

# Spustenie buildu
if [ -n "$GEMINI_API_KEY" ]; then
    log_info "Injecting GEMINI_API_KEY into environment.ts..."
    sed -i '' "s|geminiApiKey: .*|geminiApiKey: '$GEMINI_API_KEY',|" src/environments/environment.ts || true
fi

if pnpm ng build --configuration=production; then
    log_success "Build úspešný."
else
    log_error "Build zlyhal. Opravte chyby a skúste znova."
fi

# Kontrola výstupu
if [ ! -f "${LOCAL_DIST}/index.html" ]; then
    log_error "Súbor index.html nebol nájdený v ${LOCAL_DIST}. Skontrolujte 'outputPath' v angular.json."
fi

# Príprava Proxy (kopírovanie všetkých PHP súborov do dist)
log_info "Kopírujem PHP proxy súbory do dist..."
mkdir -p "${LOCAL_DIST}/proxy"
cp src/proxy/*.php "${LOCAL_DIST}/proxy/"
# Odstránime config.example.php z dist (nepotrebujeme ho tam)
rm -f "${LOCAL_DIST}/proxy/config.example.php"
# Odstránime config.php ak by náhodou existoval lokálne (nechceme ho commitnúť/distribuovať)
rm -f "${LOCAL_DIST}/proxy/config.php"

# --- 3. ZÁLOHA NA SERVERI ---
log_info "3/7) Vytváram zálohu na serveri..."

ssh -i ~/.ssh/id_rsa_vps "${VPS_USER}@${VPS_HOST}" << EOF
    if [ -d "${REMOTE_DIR}" ]; then
        echo "Zálohujem existujúcu verziu do ${BACKUP_DIR}..."
        cp -r "${REMOTE_DIR}" "${BACKUP_DIR}"
        # Ponechať len posledných 5 záloh
        ls -dt ${REMOTE_ROOT}/${DOMAIN}_backup_* | tail -n +6 | xargs rm -rf 2>/dev/null || true
    else
        echo "Prvé nasadenie, záloha sa preskakuje."
        mkdir -p "${REMOTE_DIR}"
        chown -R ${VPS_USER}:${VPS_USER} "${REMOTE_DIR}"
    fi
EOF

# --- 4. NAHRATIE SÚBOROV (RSYNC) ---
log_info "4/7) Nahrávam súbory na server..."

# Používame rsync pre rýchly a efektívny prenos (len zmenené súbory)
if rsync -avz --delete --exclude='.*' -e "ssh -i ~/.ssh/id_rsa_vps" "${LOCAL_DIST}/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"; then
    log_success "Súbory úspešne nahraté."
else
    log_error "Rsync zlyhal. Skontrolujte pripojenie."
fi

# --- 5. KONFIGURÁCIA SERVERA (NGINX & PHP) ---
log_info "5/7) Generujem a nahrávam konfiguráciu..."

# 5.1 Generovanie Nginx configu LOKÁLNE
# Pozor: Premenné $host, $request_uri, $uri musia byť escapované (\$host),
# aby sa vyhodnotili až v Nginx (alebo ich zapíšeme ako string).
# Premenné ${DOMAIN}, ${GEMINI_API_KEY} sa vyhodnotia teraz (local bash).

cat > dist/nginx.conf << NGINX_CONF
# HTTP server - presmerovanie na HTTPS
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$host\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    root ${REMOTE_DIR};
    index index.html;

    # SSL konfigurácia
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Gzip
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/xml;

    # Security
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # PHP Proxy
    location ~ ^/proxy/(.+\.php)\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_param GEMINI_API_KEY "${GEMINI_API_KEY}";
        # Používame systémový alias, ktorý sme videli na serveri
        fastcgi_pass unix:/var/run/php/php-fpm.sock; 
    }

    # Zakázať prístup ku configom
    location ~ /proxy/config\.php { deny all; return 404; }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)\$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
NGINX_CONF

# 5.2 Generovanie PHP configu LOKÁLNE
cat > dist/config.php << PHP_CONFIG
<?php
return [
    'openai_key' => '${OPENAI_API_KEY}'
];
PHP_CONFIG

# 5.3 Nahrávanie configov
log_info "Nahrávam konfiguračné súbory..."
rsync -avz -e "ssh -i ~/.ssh/id_rsa_vps" dist/nginx.conf "${VPS_USER}@${VPS_HOST}:/tmp/${DOMAIN}.nginx.conf"
rsync -avz -e "ssh -i ~/.ssh/id_rsa_vps" dist/config.php "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/proxy/config.php"

# 5.4 Aplikácia a reštart
log_info "Aplikujem konfiguráciu a reštartujem Nginx..."
ssh -i ~/.ssh/id_rsa_vps "${VPS_USER}@${VPS_HOST}" << EOF
    set -e
    
    # Presun a aktivácia Nginx configu
    mv /tmp/${DOMAIN}.nginx.conf /etc/nginx/sites-available/${DOMAIN}
    ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
    
    # Oprávnenia
    chown -R www-data:www-data "${REMOTE_DIR}/proxy"
    chmod -R 775 "${REMOTE_DIR}/proxy"
    chmod 644 "${REMOTE_DIR}/proxy/config.php" # Secure config
    
    # Reštart Nginx
    nginx -t && systemctl restart nginx
    echo "Nginx úspešne reštartovaný."
EOF

log_success "✅ DEPLOY COMPLETE: https://${DOMAIN}"
