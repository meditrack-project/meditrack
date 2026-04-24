{{/*
─────────────────────────────────────────────────────────────
MediTrack — Global Helm helper functions
Environment: both
Phase: 2 — Kubernetes + Helm Implementation
─────────────────────────────────────────────────────────────
*/}}

{{/*
Common labels applied to every resource
*/}}
{{- define "meditrack.labels" -}}
app.kubernetes.io/part-of: meditrack
app.kubernetes.io/managed-by: helm
environment: {{ .Values.global.environment }}
{{- end -}}

{{/*
Service-specific labels
*/}}
{{- define "meditrack.serviceLabels" -}}
app: {{ .name }}
app.kubernetes.io/name: {{ .name }}
{{ include "meditrack.labels" .context }}
{{- end -}}

{{/*
Full image path helper
*/}}
{{- define "meditrack.image" -}}
{{ .registry }}/{{ .image }}:{{ .tag }}
{{- end -}}

{{/*
Init container: wait for a service on a specific port
*/}}
{{- define "meditrack.initWait" -}}
- name: wait-for-{{ .name }}
  image: busybox:1.36
  command:
    - sh
    - -c
    - |
      echo "Waiting for {{ .name }}:{{ .port }}..."
      until nc -z {{ .name }} {{ .port }}; do
        echo "{{ .name }}:{{ .port }} not ready, retrying in 3s..."
        sleep 3
      done
      echo "{{ .name }}:{{ .port }} is ready!"
  resources:
    requests:
      cpu: 10m
      memory: 16Mi
    limits:
      cpu: 50m
      memory: 32Mi
  securityContext:
    allowPrivilegeEscalation: false
    capabilities:
      drop: ["ALL"]
{{- end -}}

{{/*
Standard security context for application pods (FastAPI)
*/}}
{{- define "meditrack.appSecurityContext" -}}
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
  fsGroup: 1000
{{- end -}}

{{/*
Standard security context for frontend pods (Nginx)
*/}}
{{- define "meditrack.frontendSecurityContext" -}}
securityContext:
  runAsNonRoot: true
  runAsUser: 101
  runAsGroup: 101
  fsGroup: 101
{{- end -}}

{{/*
Standard security context for PostgreSQL pods
*/}}
{{- define "meditrack.dbSecurityContext" -}}
securityContext:
  runAsNonRoot: true
  runAsUser: 999
  runAsGroup: 999
  fsGroup: 999
{{- end -}}

{{/*
Container-level security context (all containers)
*/}}
{{- define "meditrack.containerSecurityContext" -}}
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]
{{- end -}}

{{/*
Standard deployment strategy
*/}}
{{- define "meditrack.deploymentStrategy" -}}
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
{{- end -}}

{{/*
Standard pod anti-affinity
*/}}
{{- define "meditrack.podAntiAffinity" -}}
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchLabels:
              app: {{ .name }}
          topologyKey: kubernetes.io/hostname
{{- end -}}

{{/*
Standard probes for application services
*/}}
{{- define "meditrack.appProbes" -}}
startupProbe:
  httpGet:
    path: /health
    port: {{ .port }}
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 12
livenessProbe:
  httpGet:
    path: /health
    port: {{ .port }}
  periodSeconds: 15
  timeoutSeconds: 5
  failureThreshold: 3
readinessProbe:
  httpGet:
    path: /health
    port: {{ .port }}
  periodSeconds: 10
  timeoutSeconds: 3
  failureThreshold: 3
{{- end -}}

{{/*
Standard lifecycle hook
*/}}
{{- define "meditrack.lifecycle" -}}
lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c", "sleep 5"]
{{- end -}}
