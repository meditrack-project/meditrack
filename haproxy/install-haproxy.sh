#!/bin/bash
# ─────────────────────────────────────────────────────────────
# MediTrack — HAProxy installation script for nfs-haproxy node
# Run on: 172.31.26.112
# Phase: 2 — Kubernetes + Helm Implementation
# ─────────────────────────────────────────────────────────────
set -euo pipefail

echo "═══════════════════════════════════════════════════"
echo "  MediTrack — Installing HAProxy on NFS/LB node"
echo "═══════════════════════════════════════════════════"

# Install HAProxy
sudo apt-get update
sudo apt-get install -y haproxy

# Generate self-signed TLS certificate
echo ""
echo "→ Generating self-signed TLS certificate..."
sudo mkdir -p /etc/ssl/certs
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /tmp/meditrack.key \
  -out /tmp/meditrack.crt \
  -subj "/CN=meditrack.prod.local/O=MediTrack/C=IN"

# Combine cert + key into single PEM (HAProxy requirement)
sudo bash -c 'cat /tmp/meditrack.crt /tmp/meditrack.key > /etc/ssl/certs/meditrack.pem'
sudo chmod 600 /etc/ssl/certs/meditrack.pem
rm -f /tmp/meditrack.key /tmp/meditrack.crt

# Copy HAProxy config
echo "→ Copying HAProxy configuration..."
sudo cp haproxy.cfg /etc/haproxy/haproxy.cfg

# Validate config
echo "→ Validating configuration..."
sudo haproxy -c -f /etc/haproxy/haproxy.cfg

# Enable and start HAProxy
echo "→ Starting HAProxy..."
sudo systemctl enable haproxy
sudo systemctl restart haproxy
sudo systemctl status haproxy --no-pager

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ HAProxy installed and running!"
echo ""
echo "  Stats dashboard: http://172.31.26.112:8404/stats"
echo "  Health check:    http://172.31.26.112:8405/health"
echo "  HTTPS endpoint:  https://meditrack.prod.local"
echo "═══════════════════════════════════════════════════"
