{{- define "health-db.labels" -}}
app: {{ .Values.healthDb.name }}
app.kubernetes.io/name: {{ .Values.healthDb.name }}
app.kubernetes.io/part-of: meditrack-db
{{ include "meditrack.labels" . }}
{{- end -}}
