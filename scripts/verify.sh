#!/bin/bash
# ─────────────────────────────────────────────────────────────
# MediTrack — Post-deployment verification script
# Run on: master node
# Phase: 2 — Kubernetes + Helm Implementation
# ─────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "${GREEN}✅ PASS${NC}: $1"; }
fail() { echo -e "${RED}❌ FAIL${NC}: $1"; }
warn() { echo -e "${YELLOW}⚠️  WARN${NC}: $1"; }

NS=${1:-meditrack-prod}

echo "═══════════════════════════════════════════════════"
echo "  MediTrack — Verification ($NS)"
echo "═══════════════════════════════════════════════════"

# 1. Check namespaces
echo ""
echo "━━━ Namespaces ━━━"
for ns in meditrack-dev meditrack-prod meditrack-infra meditrack-monitoring; do
  kubectl get ns "$ns" &>/dev/null && pass "Namespace $ns exists" || fail "Namespace $ns missing"
done

# 2. Check pods
echo ""
echo "━━━ Pods in $NS ━━━"
kubectl get pods -n "$NS" -o wide

# 3. Check services
echo ""
echo "━━━ Services in $NS ━━━"
kubectl get svc -n "$NS"

# 4. Check PVCs
echo ""
echo "━━━ PVCs in $NS ━━━"
kubectl get pvc -n "$NS"

# 5. Check StatefulSets
echo ""
echo "━━━ StatefulSets in $NS ━━━"
kubectl get sts -n "$NS"

# 6. Check HPAs (prod only)
echo ""
echo "━━━ HPAs in $NS ━━━"
kubectl get hpa -n "$NS" 2>/dev/null || warn "No HPAs found"

# 7. Check PDBs (prod only)
echo ""
echo "━━━ PDBs in $NS ━━━"
kubectl get pdb -n "$NS" 2>/dev/null || warn "No PDBs found"

# 8. Check Gateway
echo ""
echo "━━━ Gateway (meditrack-infra) ━━━"
kubectl get gateway -n meditrack-infra 2>/dev/null || warn "No Gateways found"
kubectl get httproute -n "$NS" 2>/dev/null || warn "No HTTPRoutes found"

# 9. Health checks
echo ""
echo "━━━ Service Health Checks ━━━"
for svc in user-service medical-service health-service ai-service; do
  PORT=$(kubectl get svc "$svc" -n "$NS" -o jsonpath='{.spec.ports[0].port}' 2>/dev/null)
  if [ -n "$PORT" ]; then
    RESULT=$(kubectl exec -n "$NS" deploy/"$svc" -- wget -q -O- http://localhost:"$PORT"/health 2>/dev/null || echo "FAILED")
    echo "  $svc: $RESULT"
  fi
done

# 10. JWKS endpoint
echo ""
echo "━━━ JWKS Endpoint ━━━"
JWKS=$(kubectl exec -n "$NS" deploy/user-service -- wget -q -O- http://localhost:4001/api/auth/jwks 2>/dev/null || echo "FAILED")
echo "  JWKS: $JWKS"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Verification complete for $NS"
echo "═══════════════════════════════════════════════════"
