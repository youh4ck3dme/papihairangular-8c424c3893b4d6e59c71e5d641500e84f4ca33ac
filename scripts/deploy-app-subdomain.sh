#!/bin/bash

# PAPI HAIR DESIGN - Deployment Script for app.papihairdesign.sk
# Target: Forpsi VPS (194.182.87.6)

# --- KONFIGURÁCIA ---
VPS_HOST="194.182.87.6"
VPS_USER="root"
DOMAIN="app.papihairdesign.sk"
REMOTE_ROOT="/var/www"
REMOTE_DIR="${REMOTE_ROOT}/${DOMAIN}"
LOCAL_DIST="dist/app/browser"
BACKUP_DIR="${REMOTE_ROOT}/${DOMAIN}_backup_$(date +%Y%m%d_%H%M%S)"

# Farby pre výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
function log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
function log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
function log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# --- 1. KONTROLA PROSTREDIA ---
log_info "1/7) Kontrola prostredia..."

if [ ! -f "package.json" ]; then
    log_error "Tento skript musí byť spustený z koreňového adresára projektu."
fi

log_info "Testujem SSH pripojenie k ${VPS_USER}@${VPS_HOST}..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 "${VPS_USER}@${VPS_HOST}" exit; then
    log_success "SSH pripojenie funkčné."
else
    log_error "SSH pripojenie zlyhalo. Skontrolujte kľúče alebo ~/.ssh/config."
fi

# --- 2. BUILD APLIKÁCIE ---
log_info "2/7) Build Angular aplikácie (Production)..."

rm -rf dist/
if npx ng build --configuration=production; then
    log_success "Build úspešný."
else
    log_error "Build zlyhal."
fi

if [ ! -f "${LOCAL_DIST}/index.html" ]; then
    log_error "Súbor index.html nebol nájdený v ${LOCAL_DIST}."
fi

# Príprava Proxy
log_info "Kopírujem PHP proxy súbory..."
mkdir -p "${LOCAL_DIST}/proxy"
cp src/proxy/*.php "${LOCAL_DIST}/proxy/" 2>/dev/null || log_warn "Žiadne PHP súbory na kopírovanie."

# --- 3. PRÍPRAVA ADRESÁROV NA VPS ---
log_info "3/7) Príprava adresárov na Forpsi VPS..."

ssh "${VPS_USER}@${VPS_HOST}" << EOF
    if [ -d "${REMOTE_DIR}" ]; then
        echo "Zálohujem existujúcu verziu do ${BACKUP_DIR}..."
        cp -r "${REMOTE_DIR}" "${BACKUP_DIR}"
        ls -dt ${REMOTE_ROOT}/${DOMAIN}_backup_* | tail -n +3 | xargs rm -rf 2>/dev/null || true
    else
        echo "Vytváram nový adresár ${REMOTE_DIR}..."
        mkdir -p "${REMOTE_DIR}"
    fi
EOF

# --- 4. NAHRATIE SÚBOROV ---
log_info "4/7) Nahrávam súbory na Forpsi VPS..."

if rsync -avz --delete --exclude='.*' "${LOCAL_DIST}/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"; then
    log_success "Súbory úspešne nahraté."
else
    log_error "Rsync zlyhal."
fi

# --- 5. NGINX KONFIGURÁCIA ---
log_info "5/7) Nastavujem Nginx konfiguráciu pre ${DOMAIN}..."

NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"

ssh "${VPS_USER}@${VPS_HOST}" << EOF
    cat > ${NGINX_CONF} << 'CONF'
server {
    listen 80;
    server_name ${DOMAIN};
    root ${REMOTE_DIR};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
}
CONF
    ln -sf ${NGINX_CONF} /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
EOF

log_success "Nginx pre subdoménu nastavený."

# --- 6. SSL (VOLITEĽNÉ) ---
log_info "6/7) Pokus o SSL certifikát (certbot)..."
ssh "${VPS_USER}@${VPS_HOST}" "certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos -m papihairdesign@gmail.com || echo 'Certbot zlyhal, pravdepodobne chýba DNS záznam.'"

log_success "Finalizácia..."

log_success "✅ HOTOVO! Aplikácia by mala byť dostupná na: http://${DOMAIN}"
log_info "Ak ste už nastavili DNS a Certbot prešiel, skúste: https://${DOMAIN}"
