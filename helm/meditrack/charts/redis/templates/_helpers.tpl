{{- define "redis.labels" -}}
app: {{ .Values.redis.name }}
app.kubernetes.io/name: {{ .Values.redis.name }}
{{ include "meditrack.labels" . }}
{{- end -}}
