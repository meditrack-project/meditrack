#!/bin/bash
# ─────────────────────────────────────────────────────────────
# MediTrack — Label worker nodes for workload scheduling
# Run on: master node
# Phase: 2 — Kubernetes + Helm Implementation
# ─────────────────────────────────────────────────────────────
set -euo pipefail

echo "═══════════════════════════════════════════════════"
echo "  MediTrack — Labeling Worker Nodes"
echo "═══════════════════════════════════════════════════"

# Label worker-1 for Redis hostPath scheduling (prod)
echo "→ Labeling worker-1 for Redis..."
kubectl label node worker-1 meditrack-redis-node=true --overwrite
echo "   ✅ worker-1 labeled: meditrack-redis-node=true"

# Create Redis data directory on worker-1
echo ""
echo "→ Creating Redis data directory on worker-1..."
echo "   NOTE: SSH to worker-1 and run:"
echo "   sudo mkdir -p /data/meditrack/redis"
echo "   sudo chmod 777 /data/meditrack/redis"

echo ""
echo "→ Current node labels:"
kubectl get nodes --show-labels | grep -E "NAME|worker"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ Node labeling complete!"
echo "═══════════════════════════════════════════════════"
