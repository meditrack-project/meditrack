{{- define "medical-db.labels" -}}
app: {{ .Values.medicalDb.name }}
app.kubernetes.io/name: {{ .Values.medicalDb.name }}
app.kubernetes.io/part-of: meditrack-db
{{ include "meditrack.labels" . }}
{{- end -}}
