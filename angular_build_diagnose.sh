#!/bin/bash
# Diagnostický skript pre Angular build na lokálnom PC
set -euo pipefail

echo "===== Systémové info ====="
uname -a
cat /etc/os-release || echo "No /etc/os-release"

for cmd in node npm npx ng; do
  echo -e "\n-- Kontrola $cmd --"
  if command -v $cmd >/dev/null 2>&1; then
    $cmd --version || $cmd -v || echo "$cmd verzia neznáma"
  else
    echo "$cmd NIE JE nainštalovaný!"
  fi
done

if [ -f package.json ]; then
  echo -e "\n===== package.json existuje ====="
  cat package.json | head -20
else
  echo "package.json NEEXISTUJE v $(pwd)"
fi

if [ -d node_modules ]; then
  echo -e "\nnode_modules existuje. Počet balíkov:"
  ls node_modules | wc -l
else
  echo "node_modules NEEXISTUJE"
fi

if [ -f package.json ]; then
  echo -e "\n===== npm install --dry-run ====="
  npm install --dry-run || echo "npm install zlyhal"
fi

if [ -f package.json ]; then
  echo -e "\n===== Pokus o build Angular ====="
  npx ng build --configuration=production || echo "Angular build zlyhal"
fi

echo -e "\n===== Diagnostika dokončená ====="
