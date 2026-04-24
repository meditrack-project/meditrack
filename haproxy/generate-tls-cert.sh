#!/bin/bash
# ─────────────────────────────────────────────────────────────
# MediTrack — Self-signed TLS certificate generator
# Run on: 172.31.26.112 (HAProxy node)
# Phase: 2 — Kubernetes + Helm Implementation
# ─────────────────────────────────────────────────────────────
set -euo pipefail

echo "Generating self-signed TLS certificate for MediTrack..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /tmp/meditrack.key \
  -out /tmp/meditrack.crt \
  -subj "/CN=meditrack.prod.local/O=MediTrack/C=IN" \
  -addext "subjectAltName=DNS:meditrack.prod.local,DNS:meditrack.dev.local"

sudo bash -c 'cat /tmp/meditrack.crt /tmp/meditrack.key > /etc/ssl/certs/meditrack.pem'
sudo chmod 600 /etc/ssl/certs/meditrack.pem
rm -f /tmp/meditrack.key /tmp/meditrack.crt

echo "✅ Certificate saved to /etc/ssl/certs/meditrack.pem"
echo "   Restart HAProxy: sudo systemctl restart haproxy"
