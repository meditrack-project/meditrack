{{- define "ai-service.name" -}}
{{ .Values.aiService.name }}
{{- end -}}
{{- define "ai-service.labels" -}}
app: {{ .Values.aiService.name }}
app.kubernetes.io/name: {{ .Values.aiService.name }}
{{ include "meditrack.labels" . }}
{{- end -}}
