#!/bin/bash

# Enable safe mode: exit on error, undefined variables, and pipe failures
set -euo pipefail

echo "Starting SSH unblock script..."

# Step 1: Check SSH service status
echo "Checking SSH service status..."
SSH_STATUS=$(sudo systemctl status ssh 2>&1 || echo "SSH service not found or failed")
echo "$SSH_STATUS"

# If SSH is not running, start and enable it
if ! sudo systemctl is-active --quiet ssh; then
    echo "SSH service is not running. Starting and enabling SSH..."
    sudo systemctl start ssh
    sudo systemctl enable ssh
    echo "SSH service started and enabled."
else
    echo "SSH service is already running."
fi

# Step 2: Check UFW firewall status
echo "Checking UFW firewall status..."
UFW_STATUS=$(sudo ufw status 2>&1 || echo "UFW not active or not installed")
echo "$UFW_STATUS"

# If UFW is active, allow port 22 and reload
if sudo ufw status | grep -q "Status: active"; then
    echo "UFW is active. Allowing port 22..."
    sudo ufw allow 22
    sudo ufw reload
    echo "Port 22 allowed and UFW reloaded."
else
    echo "UFW is not active or not installed."
fi

# Step 3: Fallback - Check for firewalld
echo "Checking for firewalld..."
if command -v firewall-cmd &> /dev/null; then
    echo "Firewalld detected. Adding SSH service..."
    sudo firewall-cmd --add-service=ssh --permanent
    sudo firewall-cmd --reload
    echo "SSH service added to firewalld and reloaded."
else
    echo "Firewalld not found."
fi

# Step 4: Verify port 22 is open
echo "Verifying port 22 is open..."
NETSTAT_OUTPUT=$(sudo netstat -tlnp | grep :22 || echo "Port 22 not found in netstat output")
echo "$NETSTAT_OUTPUT"

echo "SSH unblock script completed."