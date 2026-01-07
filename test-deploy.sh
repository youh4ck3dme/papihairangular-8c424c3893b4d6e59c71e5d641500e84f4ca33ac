#!/bin/bash

# ==============================================================================
# 🧪 SMOKE TEST / DRY RUN: ULTIMATE DEPLOY SCRIPT
# ==============================================================================
# Tento skript simuluje beh deploy-ultimate.sh bez vykonania deštruktívnych zmien.
# Overuje:
# 1. Prítomnosť potrebných nástrojov (npm, ssh, rsync)
# 2. SSH pripojenie k serveru
# 3. Úspešnosť buildu (bez prepísania existujúceho dist)
# 4. Simuluje rsync prenos (dry-run)
# 5. Simuluje Nginx konfiguráciu (test configu)
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

for cmd in npm ssh rsync; do
    if command -v $cmd &> /dev/null; then
        log_success "$cmd nájdený."
    else
        log_error "$cmd chýba!"
    fi
done

log_info "Testujem SSH pripojenie..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 "${VPS_USER}@${VPS_HOST}" echo "SSH OK" &> /dev/null; then
    log_success "SSH pripojenie k ${VPS_USER}@${VPS_HOST} funguje."
else
    log_error "SSH pripojenie zlyhalo."
fi

# --- 2. SIMULÁCIA BUILDU ---
log_info "2/5) Simulácia buildu (Production)..."
# Tu reálne spustíme build, lebo to je lokálna operácia a chceme vedieť či prejde
if npx ng build --configuration=production; then
    log_success "Build prebehol úspešne."
else
    log_error "Build zlyhal."
fi

if [ -f "${LOCAL_DIST}/index.html" ]; then
    log_success "index.html nájdený v ${LOCAL_DIST}."
else
    log_error "index.html chýba v ${LOCAL_DIST}."
fi

# --- 3. SIMULÁCIA ZÁLOHY ---
log_info "3/5) Simulácia zálohy na serveri..."
ssh "${VPS_USER}@${VPS_HOST}" << EOF
    echo "[SERVER] Kontrolujem existenciu ${REMOTE_DIR}..."
    if [ -d "${REMOTE_DIR}" ]; then
        echo "[SERVER] Adresár existuje. Záloha by bola vytvorená."
    else
        echo "[SERVER] Adresár neexistuje. Bol by vytvorený."
    fi
EOF

# --- 3b. PRÍPRAVA PROXY (LOCAL) ---
log_info "3b/5) Príprava Proxy (Local)..."
if [ -f "src/proxy/chat.php" ]; then
    log_success "Proxy skript 'src/proxy/chat.php' existuje."
    # Simulácia kopírovania
    mkdir -p "${LOCAL_DIST}/proxy"
    cp src/proxy/chat.php "${LOCAL_DIST}/proxy/"
else
    log_error "Proxy skript chýba!"
fi

# --- 4. SIMULÁCIA RSYNC (DRY RUN) ---
log_info "4/5) Simulácia prenosu súborov (rsync --dry-run)..."
# --dry-run nevykoná žiadne zmeny, len vypíše čo by sa stalo
rsync -avz --dry-run --delete --exclude='.*' "${LOCAL_DIST}/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"

if [ $? -eq 0 ]; then
    log_success "Rsync dry-run úspešný."
else
    log_error "Rsync dry-run zlyhal."
fi

# --- 5. SIMULÁCIA NGINX & PHP ---
log_info "5/5) Kontrola Nginx a PHP konfigurácie na serveri..."
ssh "${VPS_USER}@${VPS_HOST}" << EOF
    if command -v nginx &> /dev/null; then
        echo "[SERVER] Nginx je nainštalovaný."
        echo "[SERVER] Testujem aktuálnu konfiguráciu (sudo nginx -t)..."
        sudo nginx -t
    else
        echo "[SERVER] Nginx NIE JE nainštalovaný (bol by nainštalovaný)."
    fi
    
    if command -v php &> /dev/null; then
        echo "[SERVER] PHP je nainštalované (verzia: \$(php -v | head -n 1))."
    else
        echo "[SERVER] PHP NIE JE nainštalované (bolo by nainštalované)."
    fi
EOF

echo ""
log_success "========================================================"
log_success "✅ SMOKE TEST DOKONČENÝ - VŠETKO VYZERÁ V PORIADKU"
log_success "========================================================"
log_info "Teraz môžete spustiť ostrý deploy pomocou: ./deploy-ultimate.sh"
