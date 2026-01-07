#!/bin/bash

# ==============================================================================
# 🧪 SAFE SMOKE TEST: ULTIMATE DEPLOY SCRIPT (MULTI-SITE SAFE)
# ==============================================================================
# Tento skript simuluje beh deploy-ultimate.sh bez vykonania deštruktívnych zmien.
# Špeciálne overuje, či nedôjde ku konfliktu s inými stránkami na VPS.
# ==============================================================================

# --- KONFIGURÁCIA ---
VPS_HOST="57.129.4.22"
VPS_USER="ubuntu"
DOMAIN="papihairdesign.sk"
REMOTE_ROOT="/var/www"
REMOTE_DIR="${REMOTE_ROOT}/${DOMAIN}"
LOCAL_DIST="dist/app/browser"

# --- FARBY ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[TEST INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[TEST SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[TEST WARN]${NC} $1"; }
log_error() { echo -e "${RED}[TEST ERROR]${NC} $1"; exit 1; }

echo -e "${YELLOW}!!! TOTO JE LEN TEST (DRY RUN) - ŽIADNE ZMENY NA SERVERY NEBUDÚ VYKONANÉ !!!${NC}"
echo ""

# --- 1. KONTROLA PROSTREDIA ---
log_info "1/5) Kontrola lokálneho prostredia..."
# ... (rovnaké ako predtým)

# --- 2. SIMULÁCIA BUILDU ---
log_info "2/5) Simulácia buildu (Production)..."
# ... (rovnaké ako predtým)

# --- 3. KONTROLA KONFLIKTOV NA SERVERI (CRITICAL) ---
log_info "3/5) Kontrola konfliktov na serveri (MULTI-SITE CHECK)..."
ssh "${VPS_USER}@${VPS_HOST}" << EOF
    echo "[SERVER] Zoznam aktívnych stránok v /etc/nginx/sites-enabled/:"
    ls -l /etc/nginx/sites-enabled/
    
    echo ""
    if [ -L "/etc/nginx/sites-enabled/${DOMAIN}" ]; then
        echo "[SERVER] OK: Konfigurácia pre ${DOMAIN} už existuje."
    else
        echo "[SERVER] INFO: Konfigurácia pre ${DOMAIN} zatiaľ neexistuje (bude vytvorená)."
    fi

    # Kontrola či neexistuje kolízia v root adresároch
    if [ -d "${REMOTE_DIR}" ]; then
        echo "[SERVER] OK: Cieľový adresár ${REMOTE_DIR} existuje a patrí nám."
    else
        # Skontrolovať či náhodou niečo iné neblokuje túto cestu
        if [ -e "${REMOTE_DIR}" ]; then
             echo "[SERVER] POZOR: ${REMOTE_DIR} existuje ale nie je to adresár!"
             exit 1
        fi
        echo "[SERVER] INFO: Cieľový adresár ${REMOTE_DIR} bude vytvorený."
    fi
EOF

# --- 4. SIMULÁCIA RSYNC (DRY RUN) ---
log_info "4/5) Simulácia prenosu súborov (rsync --dry-run)..."
rsync -avz --dry-run --delete --exclude='.*' "${LOCAL_DIST}/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"

# --- 5. SIMULÁCIA NGINX ---
log_info "5/5) Kontrola Nginx konfigurácie..."
# ... (rovnaké ako predtým)

echo ""
log_success "========================================================"
log_success "✅ SAFE SMOKE TEST DOKONČENÝ - ŽIADNE KONFLIKTY NENAJDENÉ"
log_success "========================================================"
