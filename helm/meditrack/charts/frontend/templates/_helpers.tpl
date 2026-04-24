{{- define "frontend.labels" -}}
app: {{ .Values.frontend.name }}
app.kubernetes.io/name: {{ .Values.frontend.name }}
{{ include "meditrack.labels" . }}
{{- end -}}
