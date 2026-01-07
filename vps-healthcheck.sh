#!/bin/bash

# Safe mode: exit on error, undefined variables, pipe failures
set -euo pipefail

# Configuration
SERVER_IP="57.129.4.22"
USER="ubuntu"
LOG_FILE="./vps-healthcheck.log"
THRESHOLD_DISK=90  # Disk usage threshold in %
THRESHOLD_LOAD=4   # Load average threshold

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to check disk usage
check_disk_usage() {
    log "Checking disk usage..."
    DISK_USAGE=$(ssh "$USER@$SERVER_IP" "df / | tail -1 | awk '{print \$5}' | sed 's/%//'")
    if [ "$DISK_USAGE" -gt "$THRESHOLD_DISK" ]; then
        log "WARNING: Disk usage is ${DISK_USAGE}%, which exceeds threshold of ${THRESHOLD_DISK}%"
        return 1
    else
        log "Disk usage is ${DISK_USAGE}%, OK"
        return 0
    fi
}

# Function to check load average
check_load_average() {
    log "Checking load average..."
    LOAD_AVG=$(ssh "$USER@$SERVER_IP" "uptime | awk -F'load average:' '{print \$2}' | awk '{print \$1}' | sed 's/,//'")
    if (( $(echo "$LOAD_AVG > $THRESHOLD_LOAD" | bc -l) )); then
        log "WARNING: Load average is ${LOAD_AVG}, which exceeds threshold of ${THRESHOLD_LOAD}"
        return 1
    else
        log "Load average is ${LOAD_AVG}, OK"
        return 0
    fi
}

# Function to check nginx status
check_nginx() {
    log "Checking nginx status..."
    if ssh "$USER@$SERVER_IP" "systemctl is-active --quiet nginx"; then
        log "Nginx is running, OK"
        return 0
    else
        log "ERROR: Nginx is not running"
        return 1
    fi
}

# Function to check SSH connectivity
check_ssh() {
    log "Checking SSH connectivity..."
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$USER@$SERVER_IP" "echo 'SSH OK'" > /dev/null; then
        log "SSH connectivity OK"
        return 0
    else
        log "ERROR: SSH connectivity failed"
        return 1
    fi
}

# Function to check memory usage
check_memory() {
    log "Checking memory usage..."
    MEM_USAGE=$(ssh "$USER@$SERVER_IP" "free | grep Mem | awk '{printf \"%.0f\", \$3/\$2 * 100.0}'")
    if [ "$MEM_USAGE" -gt 90 ]; then
        log "WARNING: Memory usage is ${MEM_USAGE}%, high"
        return 1
    else
        log "Memory usage is ${MEM_USAGE}%, OK"
        return 0
    fi
}

# Main health check function
main() {
    log "Starting VPS health check for $SERVER_IP"

    local errors=0

    if ! check_ssh; then ((errors++)); fi
    if ! check_disk_usage; then ((errors++)); fi
    if ! check_load_average; then ((errors++)); fi
    if ! check_nginx; then ((errors++)); fi
    if ! check_memory; then ((errors++)); fi

    if [ "$errors" -eq 0 ]; then
        log "All checks passed. VPS is healthy."
        exit 0
    else
        log "Health check failed with $errors error(s)."
        exit 1
    fi
}

# Run main function
main "$@"