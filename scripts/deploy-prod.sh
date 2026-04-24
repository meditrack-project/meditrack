#!/bin/bash
# ─────────────────────────────────────────────────────────────
# MediTrack — Deploy to PROD namespace
# Run on: master node
# Phase: 2 — Kubernetes + Helm Implementation
# ─────────────────────────────────────────────────────────────
set -euo pipefail

echo "═══════════════════════════════════════════════════"
echo "  MediTrack — Deploying to PROD"
echo "═══════════════════════════════════════════════════"

cd helm/meditrack

# Update Helm dependencies
echo "→ Updating Helm dependencies..."
helm dependency update .

# Apply sealed secrets first
echo "→ Applying sealed secrets for prod..."
kubectl apply -f ../../k8s/sealed-secrets/meditrack-secrets-prod-sealed.yaml 2>/dev/null || true
kubectl apply -f ../../k8s/sealed-secrets/meditrack-db-secrets-prod-sealed.yaml 2>/dev/null || true
kubectl apply -f ../../k8s/sealed-secrets/meditrack-jwt-keys-prod-sealed.yaml 2>/dev/null || true

# Helm install/upgrade
echo "→ Installing MediTrack PROD..."
helm upgrade --install meditrack-prod . \
  --namespace meditrack-prod \
  --create-namespace \
  -f values.yaml \
  -f values-prod.yaml \
  --wait \
  --timeout 10m

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ MediTrack PROD deployed!"
echo ""
echo "  Verify:"
echo "    kubectl get all -n meditrack-prod"
echo "    kubectl get hpa -n meditrack-prod"
echo "    kubectl get pdb -n meditrack-prod"
echo "    kubectl get pvc -n meditrack-prod"
echo "═══════════════════════════════════════════════════"
