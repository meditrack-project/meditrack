{{- define "medical-service.name" -}}
{{ .Values.medicalService.name }}
{{- end -}}
{{- define "medical-service.labels" -}}
app: {{ .Values.medicalService.name }}
app.kubernetes.io/name: {{ .Values.medicalService.name }}
{{ include "meditrack.labels" . }}
{{- end -}}
