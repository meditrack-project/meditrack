{{- define "user-db.labels" -}}
app: {{ .Values.userDb.name }}
app.kubernetes.io/name: {{ .Values.userDb.name }}
app.kubernetes.io/part-of: meditrack-db
{{ include "meditrack.labels" . }}
{{- end -}}
