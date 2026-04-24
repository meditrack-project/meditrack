#!/bin/bash
# ─────────────────────────────────────────────────────────────
# MediTrack — Install all K8s cluster prerequisites
# Run on: master node (172.31.73.167)
# Phase: 2 — Kubernetes + Helm Implementation
# ─────────────────────────────────────────────────────────────
set -euo pipefail

echo "═══════════════════════════════════════════════════"
echo "  MediTrack — Installing Cluster Prerequisites"
echo "═══════════════════════════════════════════════════"

# 1. Metrics Server
echo ""
echo "→ [1/6] Installing Metrics Server..."
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
# Patch for kubeadm (no valid TLS on kubelets)
kubectl patch deployment metrics-server -n kube-system --type='json' \
  -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]' 2>/dev/null || true
echo "   ✅ Metrics Server installed"

# 2. Sealed Secrets Controller
echo ""
echo "→ [2/6] Installing Sealed Secrets Controller..."
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm repo update
helm install sealed-secrets-controller sealed-secrets/sealed-secrets \
  --namespace kube-system \
  --set fullnameOverride=sealed-secrets-controller \
  --wait
echo "   ✅ Sealed Secrets Controller installed"

# 3. kubeseal CLI
echo ""
echo "→ [3/6] Installing kubeseal CLI..."
KUBESEAL_VERSION=$(curl -s https://api.github.com/repos/bitnami-labs/sealed-secrets/releases/latest | grep tag_name | cut -d '"' -f4)
curl -OL "https://github.com/bitnami-labs/sealed-secrets/releases/download/${KUBESEAL_VERSION}/kubeseal-${KUBESEAL_VERSION#v}-linux-amd64.tar.gz"
tar -xvzf kubeseal-*.tar.gz kubeseal
sudo install -m 755 kubeseal /usr/local/bin/kubeseal
rm -f kubeseal kubeseal-*.tar.gz
echo "   ✅ kubeseal CLI installed: $(kubeseal --version)"

# 4. Gateway API CRDs
echo ""
echo "→ [4/6] Installing Gateway API CRDs (standard channel v1.0.0)..."
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.0.0/standard-install.yaml
echo "   ✅ Gateway API CRDs installed"

# 5. Envoy Gateway
echo ""
echo "→ [5/6] Installing Envoy Gateway v1.0.0..."
kubectl apply -f https://github.com/envoyproxy/gateway/releases/download/v1.0.0/install.yaml
echo "   Waiting for Envoy Gateway to be ready..."
kubectl wait --for=condition=available deployment/envoy-gateway -n envoy-gateway-system --timeout=120s
echo "   ✅ Envoy Gateway installed"

# 6. NFS Subdir External Provisioner
echo ""
echo "→ [6/6] Installing NFS Provisioner..."
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
helm repo update
helm install nfs-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
  --namespace meditrack-infra \
  --create-namespace \
  --set nfs.server=172.31.26.112 \
  --set nfs.path=/srv/nfs/meditrack \
  --set storageClass.name=meditrack-nfs \
  --set storageClass.provisionerName=cluster.local/nfs-provisioner \
  --set storageClass.reclaimPolicy=Retain \
  --set storageClass.allowVolumeExpansion=true \
  --wait
echo "   ✅ NFS Provisioner installed"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  ✅ All prerequisites installed successfully!"
echo ""
echo "  Verify with:"
echo "    kubectl get pods -n kube-system | grep metrics"
echo "    kubectl get pods -n kube-system | grep sealed"
echo "    kubectl get pods -n envoy-gateway-system"
echo "    kubectl get pods -n meditrack-infra"
echo "    kubectl get sc meditrack-nfs"
echo "═══════════════════════════════════════════════════"
