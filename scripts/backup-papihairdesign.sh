#!/bin/bash

# Bezpečnostné opatrenia: zastaviť skript pri chybe, neexistujúcich premenných alebo pipe chybách
set -euo pipefail

# Premenné pre zálohu
DOMAIN="papihairdesign.sk"
WEB_DIR="/var/www/papihairdesign.sk"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
LETSENCRYPT_DIR="/etc/letsencrypt/live/${DOMAIN}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_papihairdesign_${TIMESTAMP}.zip"
BACKUP_PATH="/tmp/${BACKUP_NAME}"

# Funkcia pre logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Začínam zálohu domény ${DOMAIN}"

# Vytvoriť dočasný adresár pre zálohu
TMP_DIR=$(mktemp -d)
log "Vytvorený dočasný adresár: ${TMP_DIR}"

# Zálohovať súbory webovej stránky
if [ -d "${WEB_DIR}" ]; then
    log "Kopírujem súbory webovej stránky z ${WEB_DIR}"
    cp -r "${WEB_DIR}" "${TMP_DIR}/web_files"
else
    log "Varovanie: Adresár ${WEB_DIR} neexistuje"
fi

# Zálohovať nginx konfiguráciu
if [ -f "${NGINX_CONF}" ]; then
    log "Kopírujem nginx konfiguráciu z ${NGINX_CONF}"
    mkdir -p "${TMP_DIR}/nginx_config"
    cp "${NGINX_CONF}" "${TMP_DIR}/nginx_config/"
else
    log "Varovanie: Nginx konfigurácia ${NGINX_CONF} neexistuje"
fi

# Zálohovať SSL certifikáty ak existujú
if [ -d "${LETSENCRYPT_DIR}" ]; then
    log "Kopírujem SSL certifikáty z ${LETSENCRYPT_DIR}"
    mkdir -p "${TMP_DIR}/ssl_certs"
    cp -r "${LETSENCRYPT_DIR}" "${TMP_DIR}/ssl_certs/"
else
    log "Varovanie: SSL certifikáty v ${LETSENCRYPT_DIR} neexistujú (možno používate Cloudflare)"
fi

# Vytvoriť ZIP archív
log "Vytváram ZIP archív ${BACKUP_PATH}"
cd "${TMP_DIR}"
zip -r "${BACKUP_PATH}" .

# Overiť, či sa archív vytvoril úspešne
if [ -f "${BACKUP_PATH}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
    log "Záloha dokončená úspešne. Veľkosť archívu: ${BACKUP_SIZE}"
    log "Archív uložený v: ${BACKUP_PATH}"
else
    log "Chyba: Archív sa nevytvoril"
    exit 1
fi

# Vyčistiť dočasný adresár
log "Čistím dočasný adresár ${TMP_DIR}"
rm -rf "${TMP_DIR}"

log "Záloha domény ${DOMAIN} dokončená"