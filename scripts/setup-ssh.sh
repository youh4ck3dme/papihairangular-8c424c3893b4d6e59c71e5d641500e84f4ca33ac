#!/bin/bash

# Safe mode: exit on error, undefined variables, pipe failures
set -euo pipefail

# Configuration
SERVER_IP="57.129.4.22"
USER="ubuntu"
KEY_PATH="$HOME/.ssh/id_rsa"

# Function to check if SSH key exists
check_ssh_key() {
    if [ -f "$KEY_PATH" ]; then
        echo "SSH kľúč už existuje na $KEY_PATH."
        return 0
    else
        echo "SSH kľúč neexistuje. Generovanie nového kľúča..."
        return 1
    fi
}

# Function to generate SSH key
generate_ssh_key() {
    ssh-keygen -t rsa -b 4096 -f "$KEY_PATH" -N "" -C "auto-generated-key"
    echo "SSH kľúč bol vygenerovaný."
}

# Function to copy public key to server
copy_public_key() {
    echo "Kopírovanie verejného kľúča na server $USER@$SERVER_IP..."
    # Using ssh-copy-id for automatic setup; assumes password access for first time
    ssh-copy-id -i "$KEY_PATH.pub" -o StrictHostKeyChecking=no "$USER@$SERVER_IP"
    echo "Verejný kľúč bol skopírovaný."
}

# Function to test SSH connection
test_connection() {
    echo "Testovanie SSH spojenia na $USER@$SERVER_IP..."
    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$USER@$SERVER_IP" "echo 'SSH spojenie úspešné: $(date)'"
    echo "Spojenie bolo úspešne otestované."
}

# Main script execution
main() {
    echo "Začiatok nastavenia SSH pre bezheslový prístup na VPS..."

    if ! check_ssh_key; then
        generate_ssh_key
    fi

    copy_public_key
    test_connection

    echo "Nastavenie SSH dokončené. Môžete sa pripojiť pomocou: ssh $USER@$SERVER_IP"
}

# Run main function
main "$@"