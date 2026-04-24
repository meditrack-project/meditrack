#!/bin/bash
# ─────────────────────────────────────────────────────────────
# MediTrack — Deploy to DEV namespace
# Run on: master node
# Phase: 2 — Kubernetes + Helm Implementation
# ─────────────────────────────────────────────────────────────
set -euo pipefail

echo "═══════════════════════════════════════════════════"
echo "  MediTrack — Deploying to DEV"
echo "═══════════════════════════════════════════════════"

cd helm/meditrack

# Update Helm dependencies
echo "→ Updating Helm dependencies..."
helm dependency update .

# Apply sealed secrets first
echo "→ Applying sealed secrets for dev..."
kubectl apply -f ../../k8s/sealed-secrets/meditrack-secrets-dev-sealed.yaml 2>/dev/null || true
kubectl apply -f ../../k8s/sealed-secrets/meditrack-db-secrets-dev-sealed.yaml 2>/dev/null || true
kubectl apply -f ../../k8s/sealed-secrets/meditrack-jwt-keys-dev-sealed.yaml 2>/dev/null || true

# Helm install/upgrade
echo "→ Installing MediTrack DEV..."
helm upgrade --install meditrack-dev . \
  --namespace meditrack-dev \
  --create-namespace \
  -f values.yaml \
  -f values-dev.yaml \
  --wait \
  --timeout 10m

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ MediTrack DEV deployed!"
echo ""
echo "  Verify:"
echo "    kubectl get all -n meditrack-dev"
echo "    kubectl get pvc -n meditrack-dev"
echo "═══════════════════════════════════════════════════"
