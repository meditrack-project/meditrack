{{- define "haproxy.labels" -}}
app: haproxy
app.kubernetes.io/name: haproxy
{{ include "meditrack.labels" . }}
{{- end -}}
