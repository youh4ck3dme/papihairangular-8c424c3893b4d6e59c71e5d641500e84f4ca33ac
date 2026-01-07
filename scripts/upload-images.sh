#!/bin/bash

# Safe mode: exit on error, undefined variables, pipe failures
set -euo pipefail

# Configuration
REMOTE_HOST="ubuntu@57.129.4.22"
REMOTE_PATH="/var/www/papihairdesign.sk/assets/images/"
LOCAL_DIR="src/assets/images"

# Check if local images directory exists
echo "Checking for local images directory..."
if [ ! -d "$LOCAL_DIR" ]; then
    echo "Error: $LOCAL_DIR directory does not exist. Please create it and add images to upload."
    exit 1
fi

# Check if there are files in the directory
if [ -z "$(ls -A $LOCAL_DIR)" ]; then
    echo "Warning: $LOCAL_DIR directory is empty. Nothing to upload."
    exit 0
fi

echo "Starting upload of images from $LOCAL_DIR to $REMOTE_HOST:$REMOTE_PATH"

# Upload all files from ./images to remote server
scp -r $LOCAL_DIR/* $REMOTE_HOST:$REMOTE_PATH

echo "Upload completed successfully."