#!/bin/bash

# ==============================================================================
# 🚀 DEPLOY SCRIPT: CLOUDFLARE WORKER PROXY
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== Nasadenie Cloudflare Worker Proxy ===${NC}"

# 1. Kontrola Wrangler
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Chyba: npx (Node.js) nie je nainštalované.${NC}"
    exit 1
fi

# Načítanie .env zo súboru v roote projektu (ak existuje)
if [ -f "../.env" ]; then
    echo -e "${BLUE}Načítavam .env súbor...${NC}"
    export $(grep -v '^#' ../.env | xargs)
fi

cd cloudflare-worker || exit

echo -e "${BLUE}1. Inštalácia závislostí...${NC}"
npm install -g wrangler &> /dev/null || true

echo -e "${BLUE}2. Autentifikácia...${NC}"

if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${GREEN}Používam CLOUDFLARE_API_TOKEN z prostredia/súboru .env.${NC}"
    # Pri použití tokenu netreba 'wrangler login'
else
    echo -e "${YELLOW}CLOUDFLARE_API_TOKEN nenašiel sa.${NC}"
    echo -e "${BLUE}Pokúšam sa o interaktívne prihlásenie (browser)...${NC}"
    echo -e "${YELLOW}Ak toto zlyhá, pridajte CLOUDFLARE_API_TOKEN do súboru .env v koreňovom adresári.${NC}"
    npx wrangler login
fi

echo -e "${BLUE}3. Nasadenie Workera...${NC}"
npx wrangler deploy

echo -e "${BLUE}4. Nastavenie API kľúča...${NC}"
# Check if GEMINI_API_KEY is allowed
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${YELLOW}Zadajte váš Gemini API Key:${NC}"
    read -r -s GEMINI_KEY_INPUT
else
    GEMINI_KEY_INPUT="$GEMINI_API_KEY"
fi

echo "$GEMINI_KEY_INPUT" | npx wrangler secret put GEMINI_KEY

echo -e "${GREEN}=== Hotovo! Worker je nasadený. ===${NC}"
echo -e "URL: https://ai.papihairdesign.sk/generate"
