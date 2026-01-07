#!/bin/bash
set -euo pipefail

# Define the files
files=(
"/Users/nezadal/Downloads/PAPI HAIR DESIGN/angular-papihairdesign/workspace/src/assets/images/salon-interior.jpg"
"/Users/nezadal/Downloads/PAPI HAIR DESIGN/angular-papihairdesign/workspace/src/assets/images/papi.webp"
"/Users/nezadal/Downloads/PAPI HAIR DESIGN/angular-papihairdesign/workspace/src/assets/images/mato.webp"
"/Users/nezadal/Downloads/PAPI HAIR DESIGN/angular-papihairdesign/workspace/src/assets/images/miska.webp"
)

count=0

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "$file: existuje"
        ((count++))
    else
        echo "$file: neexistuje"
    fi
done

echo "Celkový počet nájdených súborov: $count"