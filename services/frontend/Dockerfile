FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_USER_SERVICE_URL=http://localhost:4001
ARG VITE_MEDICAL_SERVICE_URL=http://localhost:4002
ARG VITE_HEALTH_SERVICE_URL=http://localhost:4003
ARG VITE_AI_SERVICE_URL=http://localhost:4004
ENV VITE_USER_SERVICE_URL=$VITE_USER_SERVICE_URL
ENV VITE_MEDICAL_SERVICE_URL=$VITE_MEDICAL_SERVICE_URL
ENV VITE_HEALTH_SERVICE_URL=$VITE_HEALTH_SERVICE_URL
ENV VITE_AI_SERVICE_URL=$VITE_AI_SERVICE_URL
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s \
            --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:80 || exit 1
CMD ["nginx", "-g", "daemon off;"]
