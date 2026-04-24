{{/* user-service helpers */}}
{{- define "user-service.name" -}}
{{ .Values.userService.name }}
{{- end -}}
{{- define "user-service.labels" -}}
app: {{ .Values.userService.name }}
app.kubernetes.io/name: {{ .Values.userService.name }}
{{ include "meditrack.labels" . }}
{{- end -}}
