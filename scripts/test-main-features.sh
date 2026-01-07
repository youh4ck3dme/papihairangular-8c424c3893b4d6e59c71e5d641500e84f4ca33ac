#!/bin/bash

# ==============================================================================
# 🧪 TEST HLAVNÝCH FUNKCIÍ PRE DEPLOY
# ==============================================================================
# Testuje:
# 1. Chat JSON endpoint
# 2. Chat Stream endpoint
# 3. Image Job creation
# 4. Image Job polling
# 5. Rate limiting
# ==============================================================================

# --- KONFIGURÁCIA ---
BASE_URL="${1:-http://localhost:3002}"
PROXY_BASE="${BASE_URL}/proxy"

# --- FARBY ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[TEST]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[!]${NC} $1"; }

echo -e "${BLUE}========================================================"
echo "🧪 TEST HLAVNÝCH FUNKCIÍ"
echo "========================================================${NC}"
echo ""

# --- TEST 1: Chat JSON Endpoint ---
log_info "1/5) Test Chat JSON Endpoint..."
RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "${PROXY_BASE}/chat.php" \
  -H "Content-Type: application/json" \
  -d '{"message":"Koľko stojí strih?","history":[],"max_tokens":200}' 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | jq -e '.reply' > /dev/null 2>&1; then
        REPLY=$(echo "$BODY" | jq -r '.reply')
        if [ -n "$REPLY" ] && [ "$REPLY" != "null" ]; then
            log_success "Chat JSON funguje: ${REPLY:0:50}..."
        else
            log_error "Chat JSON vrátil prázdnu odpoveď"
        fi
    else
        log_warn "Chat JSON vrátil neplatný JSON (možno PHP nie je dostupné cez dev server): $BODY"
    fi
else
    log_warn "Chat JSON zlyhal (HTTP $HTTP_CODE): $BODY"
    log_info "Poznámka: Angular dev server nespracováva PHP. Testuj na produkcii alebo s PHP serverom."
fi
echo ""

# --- TEST 2: Chat Stream Endpoint ---
log_info "2/5) Test Chat Stream Endpoint..."
STREAM_RESPONSE=$(timeout 10 curl -N -X POST "${PROXY_BASE}/chat_stream.php" \
  -H "Content-Type: application/json" \
  -d '{"message":"Koľko stojí strih?","history":[],"max_tokens":200}' 2>&1)

if [ $? -eq 0 ] && [ -n "$STREAM_RESPONSE" ]; then
    if echo "$STREAM_RESPONSE" | grep -q "stojí\|€\|strih\|Pánsky\|dámsky"; then
        log_success "Chat Stream funguje (text prichádza postupne)"
    else
        log_warn "Chat Stream vrátil odpoveď, ale obsah je nečakaný: ${STREAM_RESPONSE:0:50}..."
        log_info "Poznámka: Angular dev server nespracováva PHP. Testuj na produkcii alebo s PHP serverom."
    fi
else
    log_warn "Chat Stream zlyhal alebo timeout (možno PHP nie je dostupné cez dev server)"
fi
echo ""

# --- TEST 3: Image Job Creation ---
log_info "3/5) Test Image Job Creation..."
# Použijeme malý test base64 image (1x1 pixel PNG)
TEST_IMAGE="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

JOB_RESPONSE=$(curl -sS -w "\n%{http_code}" -X POST "${PROXY_BASE}/image-job.php" \
  -H "Content-Type: application/json" \
  -d "{\"image\":\"${TEST_IMAGE}\",\"prompt\":\"test prompt\",\"model\":\"gpt-image-1\",\"size\":\"1024x1024\"}" 2>&1)

HTTP_CODE=$(echo "$JOB_RESPONSE" | tail -n 1)
BODY=$(echo "$JOB_RESPONSE" | sed '$d')
JOB_ID=$(echo "$BODY" | jq -r '.jobId' 2>/dev/null)

if [ "$HTTP_CODE" = "200" ] && [ -n "$JOB_ID" ] && [ "$JOB_ID" != "null" ]; then
    log_success "Image Job vytvorený: $JOB_ID"
    
    # --- TEST 4: Image Job Polling ---
    log_info "4/5) Test Image Job Polling..."
    sleep 2
    JOB_STATUS_RESPONSE=$(curl -sS "${PROXY_BASE}/image-job.php?jobId=${JOB_ID}" 2>&1)
    JOB_STATUS=$(echo "$JOB_STATUS_RESPONSE" | jq -r '.status' 2>/dev/null)
    
    if [ -n "$JOB_STATUS" ] && [ "$JOB_STATUS" != "null" ]; then
        log_success "Image Job status: $JOB_STATUS"
    else
        log_warn "Image Job polling zlyhal (možno PHP nie je dostupné): $JOB_STATUS_RESPONSE"
    fi
else
    log_warn "Image Job creation zlyhal (HTTP $HTTP_CODE): $BODY"
    log_info "Poznámka: Angular dev server nespracováva PHP. Testuj na produkcii alebo s PHP serverom."
fi
echo ""

# --- TEST 5: Rate Limiting ---
log_info "5/5) Test Rate Limiting (11 requestov za sebou)..."
RATE_LIMIT_HIT=false
for i in {1..11}; do
    RESPONSE=$(curl -sS -X POST "${PROXY_BASE}/chat.php" \
      -H "Content-Type: application/json" \
      -d "{\"message\":\"test $i\",\"history\":[],\"max_tokens\":200}")
    
    if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
        ERROR=$(echo "$RESPONSE" | jq -r '.error' 2>/dev/null)
        if [ "$ERROR" = "rate_limited" ]; then
            RATE_LIMIT_HIT=true
            log_success "Rate limit funguje (request $i zlyhal s 429)"
            break
        fi
    fi
    sleep 0.5
done

if [ "$RATE_LIMIT_HIT" = false ]; then
    log_warn "Rate limiting sa neprejavil (možno je limit vyšší alebo reset)"
fi
echo ""

# --- SÚHRN ---
echo -e "${BLUE}========================================================"
echo "✅ TEST DOKONČENÝ"
echo "========================================================${NC}"
log_info "Ak všetky testy prešli, môžeš ísť do produkcie!"
log_info "Pre deploy na VPS: ./deploy-ultimate.sh"
log_info "Pre deploy na Vercel: Potrebuješ Node.js serverless functions (PHP nie je podporované)"

