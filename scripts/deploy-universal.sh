#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# 🌐 Universal Deploy Script for PAPI HAIR DESIGN → FORPSI VPS
#
# Features:
#  - Runs from local dev (Linux/macOS/Git Bash/WSL)
#  - Validates environment (npm, npx, ssh)
#  - Fallback: Uses scp if rsync is missing (Windows Git Bash friendly)
#  - Builds Angular (production)
#  - Prepares PHP proxy files into dist/app/browser/proxy
#  - Safe deploy to /var/www/papihairdesign.sk on VPS
#  - Automatic backups on server
#  - Nginx vhost automation
#
# Usage:
#   ./scripts/deploy-universal.sh
###############################################################################

#===========================#
# 0. Default configuration  #
#===========================#

VPS_HOST_DEFAULT="194.182.87.6"
VPS_USER_DEFAULT="root"
SSH_KEY_DEFAULT="${HOME}/.ssh/id_rsa_vps"
# Fallback to standard id_rsa if specific key missing
if [[ ! -f "$SSH_KEY_DEFAULT" ]] && [[ -f "${HOME}/.ssh/id_rsa" ]]; then
  SSH_KEY_DEFAULT="${HOME}/.ssh/id_rsa"
fi
DOMAIN_DEFAULT="papihairdesign.sk"
REMOTE_ROOT_DEFAULT="/var/www"
LOCAL_DIST_DEFAULT="dist/app/browser"

# ENV overrides (if set)
VPS_HOST="${VPS_HOST:-$VPS_HOST_DEFAULT}"
VPS_USER="${VPS_USER:-$VPS_USER_DEFAULT}"
SSH_KEY="${SSH_KEY:-$SSH_KEY_DEFAULT}"
DOMAIN="${DOMAIN:-$DOMAIN_DEFAULT}"
REMOTE_ROOT="${REMOTE_ROOT:-$REMOTE_ROOT_DEFAULT}"
LOCAL_DIST="${LOCAL_DIST:-$LOCAL_DIST_DEFAULT}"

DRY_RUN=false

#===========================#
# 1. Helpers & logging      #
#===========================#

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; }

usage() {
  cat <<EOF
Usage: $0 [options]

Options:
  --host <host>        VPS host (default: ${VPS_HOST_DEFAULT})
  --user <user>        VPS user (default: ${VPS_USER_DEFAULT})
  --ssh-key <path>     SSH key file (default: ${SSH_KEY_DEFAULT})
  --domain <domain>    Domain to deploy (default: ${DOMAIN_DEFAULT})
  --dry-run            Simulate operations
  -h, --help           Show this help
EOF
}

#===========================#
# 2. Arg parsing            #
#===========================#

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host) VPS_HOST="$2"; shift 2;;
    --user) VPS_USER="$2"; shift 2;;
    --ssh-key) SSH_KEY="$2"; shift 2;;
    --domain) DOMAIN="$2"; shift 2;;
    --dry-run) DRY_RUN=true; shift 1;;
    -h|--help) usage; exit 0;;
    *) log_error "Unknown argument: $1"; usage; exit 1;;
  esac
done

REMOTE_DIR="${REMOTE_ROOT}/${DOMAIN}"
BACKUP_DIR="${REMOTE_ROOT}/${DOMAIN}_backup_$(date +%Y%m%d_%H%M%S)"

if $DRY_RUN; then log_warn "Running in DRY-RUN mode."; fi

log_info "Config: ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR} (Key: ${SSH_KEY})"

#===========================#
# 3. Environment check      #
#===========================#

log_info "1/6) Validating environment..."
for cmd in npm npx ssh; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log_error "Missing command: $cmd"; exit 1
  fi
done

HAS_RSYNC=false
if command -v rsync >/dev/null 2>&1; then
  HAS_RSYNC=true
  log_success "Found rsync."
elif command -v scp >/dev/null 2>&1; then
  log_warn "rsync not found. Will use 'scp' as fallback (Windows/Git Bash detected)."
else
  log_error "Neither rsync nor scp found."; exit 1
fi

if [[ ! -f "${SSH_KEY}" ]]; then
  log_error "SSH key not found: ${SSH_KEY}"
  exit 1
fi

log_info "Testing SSH..."
if ! ssh -i "${SSH_KEY}" -o BatchMode=yes -o ConnectTimeout=10 "${VPS_USER}@${VPS_HOST}" "echo SSH_OK" >/dev/null 2>&1; then
  log_error "SSH connection failed."
  exit 1
fi

#===========================#
# 4. Build                  #
#===========================#

log_info "2/6) Building Angular app..."
rm -rf dist/
if npx ng build --configuration=production; then
  log_success "Build completed."
else
  log_error "Build failed."
  exit 1
fi

if [[ ! -f "${LOCAL_DIST}/index.html" ]]; then
  log_error "Build artifact missing: ${LOCAL_DIST}/index.html"
  exit 1
fi

#===========================#
# 5. Prepare Proxy          #
#===========================#

log_info "3/6) Preparing PHP proxy..."
mkdir -p "${LOCAL_DIST}/proxy"
PROXY_SRC="src/proxy"
PROXY_FILES=("chat.php" "chat_stream.php" "image-job.php" "ai-proxy.php" "image-edit.php")

for f in "${PROXY_FILES[@]}"; do
  if [[ -f "${PROXY_SRC}/${f}" ]]; then
    cp "${PROXY_SRC}/${f}" "${LOCAL_DIST}/proxy/"
    log_success "Copied: ${f}"
  else
    log_warn "Missing: ${PROXY_SRC}/${f}"
  fi
done

#===========================#
# 6. Remote Backup          #
#===========================#

log_info "4/6) Creating remote backup..."
if ! $DRY_RUN; then
  ssh -i "${SSH_KEY}" "${VPS_USER}@${VPS_HOST}" "REMOTE_DIR=${REMOTE_DIR} BACKUP_DIR=${BACKUP_DIR} REMOTE_ROOT=${REMOTE_ROOT} DOMAIN=${DOMAIN} VPS_USER=${VPS_USER}" bash <<'EOF'
set -e
if [ -d "${REMOTE_DIR}" ]; then
  cp -r "${REMOTE_DIR}" "${BACKUP_DIR}"
  ls -dt ${REMOTE_ROOT}/${DOMAIN}_backup_* 2>/dev/null | tail -n +6 | xargs -r rm -rf || true
else
  mkdir -p "${REMOTE_DIR}"
  chown -R ${VPS_USER}:${VPS_USER} "${REMOTE_DIR}"
fi
EOF
fi

#===========================#
# 7. Upload                 #
#===========================#

log_info "5/6) Uploading..."
if ! $DRY_RUN; then
  if $HAS_RSYNC; then
     rsync -avz --delete --exclude='.*' -e "ssh -i ${SSH_KEY}" "${LOCAL_DIST}/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"
  else
     log_info "Using SCP upload (this might take a moment)..."
     # Upload contents of local dist to remote dir
     scp -r -i "${SSH_KEY}" "${LOCAL_DIST}/"* "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/"
  fi
fi

#===========================#
# 8. Nginx Config           #
#===========================#

log_info "6/6) Configuring Nginx..."
NGINX_TEMPLATE=$(cat <<'EOF'
server {
    listen 80;
    server_name __DOMAIN__ www.__DOMAIN__;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name __DOMAIN__ www.__DOMAIN__;
    root __REMOTE_DIR__;
    index index.html index.php;

    # SSL (Certbot paths)
    ssl_certificate     /etc/letsencrypt/live/__DOMAIN__/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/__DOMAIN__/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /proxy/ {
        try_files $uri =404;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/var/run/php/php__PHP_VERSION__-fpm.sock;
    }
}
EOF
)

if ! $DRY_RUN; then
  # Write template to local temp file
  echo "$NGINX_TEMPLATE" > .nginx_temp_conf
  
  # Upload it
  scp -i "${SSH_KEY}" .nginx_temp_conf "${VPS_USER}@${VPS_HOST}:/tmp/nginx_papi.template"
  rm .nginx_temp_conf

  ssh -i "${SSH_KEY}" "${VPS_USER}@${VPS_HOST}" "DOMAIN=${DOMAIN} REMOTE_DIR=${REMOTE_DIR}" bash <<'EOF'
set -e
PHP_SOCK=$(ls /var/run/php/php*-fpm.sock 2>/dev/null | head -n 1)
PHP_VER=$(echo "$PHP_SOCK" | sed 's/.*php\(.*\)-fpm.sock/\1/')
[ -z "$PHP_VER" ] && PHP_VER="8.1"

CONF=$(cat /tmp/nginx_papi.template)
CONF=${CONF//__DOMAIN__/${DOMAIN}}
CONF=${CONF//__REMOTE_DIR__/${REMOTE_DIR}}
CONF=${CONF//__PHP_VERSION__/$PHP_VER}

printf "%s\n" "$CONF" > /etc/nginx/sites-available/${DOMAIN}
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}

chown -R www-data:www-data "${REMOTE_DIR}"
chmod -R 755 "${REMOTE_DIR}"
systemctl restart nginx
rm /tmp/nginx_papi.template
EOF
fi

log_success "Deployment Complete!"
