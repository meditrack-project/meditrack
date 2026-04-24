# MediTrack — Phase 2: Kubernetes + Helm Deployment

## Architecture Overview

Phase 2 transitions MediTrack from Docker Compose to a production-grade Kubernetes deployment using Helm umbrella charts, Envoy Gateway for API routing with JWT authentication, and NFS-backed persistent storage.

### What Changed from Phase 1

| Feature | Phase 1 | Phase 2 |
|---------|---------|---------|
| Orchestration | Docker Compose | Kubernetes (kubeadm) |
| JWT Signing | HS256 (shared secret) | RS256 (asymmetric keys) |
| Auth Validation | Every service validates JWT | KGateway validates, injects X-User-ID |
| Load Balancing | Nginx reverse proxy | HAProxy → Envoy Gateway |
| Storage | Docker volumes | NFS dynamic provisioning |
| Secrets | `.env` file | Sealed Secrets (encrypted in Git) |
| Scaling | Manual | HPA (auto-scaling) |
| HA | None | PDB + pod anti-affinity |

### Architecture Diagram

```
Internet
  ↓
HAProxy (172.31.26.112:443)
SSL termination + host routing
  ↓
┌─────────────────────────────────────────┐
│              K8s Cluster                │
│  ┌───────────────────────────────────┐  │
│  │        meditrack-infra            │  │
│  │  Envoy Gateway                    │  │
│  │  1 Gateway, 2 listeners          │  │
│  │  JWT validation via JWKS          │  │
│  └──────────┬────────────────────────┘  │
│             │ path-based routing         │
│    ┌────────┴────────┐                  │
│    ▼                 ▼                  │
│  meditrack-prod   meditrack-dev         │
│  5 deployments    5 deployments         │
│  3 StatefulSets   3 StatefulSets        │
│  (NFS backed)     (NFS backed)          │
│  Redis hostPath   Redis emptyDir        │
│  HPA + PDB        No HPA/PDB           │
└─────────────────────────────────────────┘
         ↓
NFS Server (172.31.26.112)
/srv/nfs/meditrack
```

### Node Layout

| Node | IP | Role |
|------|-----|------|
| master | 172.31.73.167 | Control-plane only |
| worker-1 | 172.31.79.137 | App pods + Redis (labeled) |
| worker-2 | 172.31.28.90 | App pods |
| nfs-node | 172.31.26.112 | NFS Server + HAProxy |

---

## Prerequisites Checklist

```
[ ] kubectl get nodes → 3 nodes Ready
[ ] Helm 3 installed
[ ] worker-1 labeled: meditrack-redis-node=true
[ ] /data/meditrack/redis exists on worker-1
[ ] NFS provisioner running in meditrack-infra
[ ] Sealed Secrets controller in kube-system
[ ] Envoy Gateway running
[ ] Gateway API CRDs installed
[ ] metrics-server running
[ ] kubeseal CLI installed
[ ] All secrets sealed for dev + prod
[ ] HAProxy running on 172.31.26.112
[ ] /etc/hosts entries for meditrack.prod.local
```

---

## Installation Order

### Step 1: Install Prerequisites (on master)
```bash
chmod +x scripts/*.sh
./scripts/install-prerequisites.sh
```

### Step 2: Label Nodes
```bash
./scripts/label-nodes.sh

# SSH to worker-1 and create Redis dir:
ssh worker-1 "sudo mkdir -p /data/meditrack/redis && sudo chmod 777 /data/meditrack/redis"
```

### Step 3: Create Namespaces (needed before sealing)
```bash
kubectl create namespace meditrack-dev
kubectl create namespace meditrack-prod
kubectl create namespace meditrack-infra
kubectl create namespace meditrack-monitoring
```

### Step 4: Seal Secrets
```bash
./scripts/seal-secrets.sh
kubectl apply -f k8s/sealed-secrets/
```

### Step 5: Setup HAProxy (on 172.31.26.112)
```bash
cd haproxy/
./install-haproxy.sh
```

### Step 6: Add /etc/hosts Entries
On your local machine:
```
172.31.26.112  meditrack.prod.local
172.31.26.112  meditrack.dev.local
```

### Step 7: Deploy DEV
```bash
./scripts/deploy-dev.sh
./scripts/verify.sh meditrack-dev
```

### Step 8: Deploy PROD
```bash
./scripts/deploy-prod.sh
./scripts/verify.sh meditrack-prod
```

---

## Helm Commands Reference

```bash
# Lint (validates chart)
helm lint helm/meditrack/ -f helm/meditrack/values.yaml -f helm/meditrack/values-dev.yaml

# Template (dry-run render)
helm template meditrack-dev helm/meditrack/ -f helm/meditrack/values.yaml -f helm/meditrack/values-dev.yaml --namespace meditrack-dev

# Install
helm install meditrack-prod helm/meditrack/ --namespace meditrack-prod -f helm/meditrack/values.yaml -f helm/meditrack/values-prod.yaml

# Upgrade
helm upgrade meditrack-prod helm/meditrack/ --namespace meditrack-prod -f helm/meditrack/values.yaml -f helm/meditrack/values-prod.yaml

# Rollback
helm rollback meditrack-prod 1 --namespace meditrack-prod

# Uninstall
helm uninstall meditrack-prod --namespace meditrack-prod
```

---

## Verification Commands

```bash
# All resources
kubectl get all -n meditrack-prod
kubectl get all -n meditrack-dev

# HPA status
kubectl get hpa -n meditrack-prod

# PDB status
kubectl get pdb -n meditrack-prod

# PVCs
kubectl get pvc -n meditrack-prod

# Gateway
kubectl get gateway -n meditrack-infra
kubectl get httproute -n meditrack-prod

# Secrets
kubectl get sealedsecret -n meditrack-prod
kubectl get secret -n meditrack-prod
```

### JWT Auth Verification
```bash
# JWKS endpoint (should return JSON with keys array)
curl http://meditrack.prod.local/api/auth/jwks

# Register (no token needed)
curl -X POST http://meditrack.prod.local/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@test.com","password":"test1234"}'

# Login (returns RS256 JWT)
curl -X POST http://meditrack.prod.local/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test1234"}'

# Protected route without token → 401
curl http://meditrack.prod.local/api/medications

# Protected route with token → 200
curl http://meditrack.prod.local/api/medications \
  -H "Authorization: Bearer <TOKEN>"
```

---

## PDB Drain Procedure

PDB with `minAvailable:1` on single-replica StatefulSets means the pod CANNOT be voluntarily evicted. To drain a node with a DB pod:

```bash
# 1. Delete the PDB temporarily
kubectl delete pdb user-db-pdb -n meditrack-prod

# 2. Drain the node
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# 3. Re-apply PDB after drain completes
kubectl apply -f <pdb-yaml>
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Pod Pending | PVC not binding | Check NFS provisioner + NFS export |
| CrashLoopBackOff | Init container failing | `kubectl logs <pod> -c wait-for-<dep>` |
| 401 on all routes | KGateway JWT config wrong | Check SecurityPolicy + JWKS endpoint |
| JWKS fetch fails | user-service not healthy | `kubectl get pods -n <ns>` |
| HPA shows "unknown" | metrics-server not running | Check `kube-system` pods |
| PVC not binding | NFS export misconfigured | `showmount -e 172.31.26.112` |
| Gateway 503 | Backend pods not ready | Check endpoints + network policies |
| Redis not scheduling | Node label missing | `kubectl label node worker-1 meditrack-redis-node=true` |
| DB permission denied | init-permissions failed | Check initContainer logs |
| Cross-namespace access | NetworkPolicy blocking | Verify allow-from-infra-namespace policy |
