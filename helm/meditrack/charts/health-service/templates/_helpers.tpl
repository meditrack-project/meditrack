{{- define "health-service.name" -}}
{{ .Values.healthService.name }}
{{- end -}}
{{- define "health-service.labels" -}}
app: {{ .Values.healthService.name }}
app.kubernetes.io/name: {{ .Values.healthService.name }}
{{ include "meditrack.labels" . }}
{{- end -}}
