# MediTrack — HAProxy External Load Balancer

## Overview
HAProxy runs on the **nfs-haproxy node (172.31.26.112)**, NOT inside the K8s cluster.
It handles SSL/TLS termination and routes traffic to the K8s Gateway via NodePorts.

## Traffic Flow
```
Client → HAProxy:443 (TLS) → K8s NodePort:30080 → Envoy Gateway → Backend Services
```

## Setup

### 1. Copy files to the HAProxy node
```bash
scp haproxy.cfg install-haproxy.sh generate-tls-cert.sh ubuntu@172.31.26.112:~/
```

### 2. Run install script
```bash
ssh ubuntu@172.31.26.112
chmod +x install-haproxy.sh generate-tls-cert.sh
./install-haproxy.sh
```

### 3. Verify
```bash
# Check HAProxy status
sudo systemctl status haproxy

# Stats dashboard
curl http://172.31.26.112:8404/stats

# Health check
curl http://172.31.26.112:8405/health
```

## Host-based Routing

| Hostname | Backend | NodePort |
|----------|---------|----------|
| meditrack.prod.local | k8s_prod | 30080 |
| meditrack.dev.local | k8s_dev | 30081 |

## TLS Certificate
Self-signed certificate is generated during install.
To regenerate:
```bash
./generate-tls-cert.sh
sudo systemctl restart haproxy
```

## /etc/hosts (on your local machine)
```
172.31.26.112  meditrack.prod.local
172.31.26.112  meditrack.dev.local
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 503 Service Unavailable | Workers not reachable on NodePort. Check `kubectl get svc -n meditrack-infra` |
| Connection refused on :443 | HAProxy not running. `sudo systemctl start haproxy` |
| Certificate warning | Expected with self-signed cert. Use `-k` with curl |
| Stats page empty | No backends configured or all down |
