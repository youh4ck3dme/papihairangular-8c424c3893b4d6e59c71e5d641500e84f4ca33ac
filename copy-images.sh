#!/bin/bash

# Safe mode: exit on error, undefined variables, pipe failures
set -euo pipefail

echo "Starting image copy process..."

# Process salon-interior.jpg: resize to 800x600 and copy
echo "Processing salon-interior.jpg..."
SOURCE_SALON="/Users/nezadal/Downloads/PAPI HAIR DESIGN/angular-papihairdesign/workspace/src/assets/images/salon-interior.jpg"
DEST_SALON="src/assets/images/salon-interior.jpg"

if [ ! -f "$SOURCE_SALON" ]; then
  echo "Error: Source file $SOURCE_SALON does not exist"
  exit 1
fi

sips -z 600 800 "$SOURCE_SALON" --out "$DEST_SALON"
echo "Resized and copied salon-interior.jpg to $DEST_SALON"

# Copy papi.webp
echo "Processing papi.webp..."
SOURCE_PAPI="/Users/nezadal/Downloads/PAPI HAIR DESIGN/angular-papihairdesign/workspace/src/assets/images/papi.webp"
DEST_PAPI="src/assets/images/papi.webp"

if [ ! -f "$SOURCE_PAPI" ]; then
  echo "Error: Source file $SOURCE_PAPI does not exist"
  exit 1
fi

cp "$SOURCE_PAPI" "$DEST_PAPI"
echo "Copied papi.webp to $DEST_PAPI"

# Copy mato.webp
echo "Processing mato.webp..."
SOURCE_MATO="/Users/nezadal/Downloads/PAPI HAIR DESIGN/angular-papihairdesign/workspace/src/assets/images/mato.webp"
DEST_MATO="src/assets/images/mato.webp"

if [ ! -f "$SOURCE_MATO" ]; then
  echo "Error: Source file $SOURCE_MATO does not exist"
  exit 1
fi

cp "$SOURCE_MATO" "$DEST_MATO"
echo "Copied mato.webp to $DEST_MATO"

# Copy miska.webp
echo "Processing miska.webp..."
SOURCE_MISKA="/Users/nezadal/Downloads/PAPI HAIR DESIGN/angular-papihairdesign/workspace/src/assets/images/miska.webp"
DEST_MISKA="src/assets/images/miska.webp"

if [ ! -f "$SOURCE_MISKA" ]; then
  echo "Error: Source file $SOURCE_MISKA does not exist"
  exit 1
fi

cp "$SOURCE_MISKA" "$DEST_MISKA"
echo "Copied miska.webp to $DEST_MISKA"

echo "All images processed successfully."