# 🏥 MediTrack — Personal Health & Medication Tracking Platform

A production-grade personal health and medication management platform built with microservices architecture. Track medications, log symptoms, record doctor visits, and get AI-powered health insights.

## ✨ Features

- **💊 Medication Tracking** — Add medications, track daily intake, monitor adherence with charts
- **🩺 Symptom Journal** — Log daily symptoms, mood, energy with interactive sliders
- **🏥 Doctor Visit Records** — Track visits, diagnoses, prescriptions, follow-ups
- **🤖 AI Health Insights** — Personalized analysis powered by Google Gemini AI
- **📊 Analytics** — Adherence charts, mood/energy trends, symptom patterns
- **🔐 Secure Auth** — JWT-based stateless authentication with bcrypt
- **⚡ Redis Caching** — Response caching with smart invalidation
- **🐳 Docker Ready** — Full Docker Compose orchestration

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │     │ User Service│     │Medical Svc  │     │Health Svc   │
│  React+Vite  │────▶│  Port 4001  │     │  Port 4002  │     │  Port 4003  │
│   Port 80    │     │             │     │             │     │             │
└─────────────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │                    │
                      ┌────▼────┐          ┌────▼────┐         ┌────▼────┐
                      │ user-db │          │medical-db│         │health-db│
                      │ PG 16   │          │ PG 16    │         │ PG 16   │
                      └─────────┘          └─────────┘         └─────────┘

                    ┌─────────────┐     ┌─────────────┐
                    │  AI Service │────▶│    Redis 7   │
                    │  Port 4004  │     │  Cache+Rate  │
                    │ Gemini API  │     └─────────────┘
                    └─────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12 + FastAPI + SQLAlchemy 2.0 |
| Frontend | React 18 + Vite (JavaScript) |
| Styling | Plain CSS (CSS Variables) |
| Database | PostgreSQL 16 (3 instances) |
| Cache | Redis 7 |
| AI | Google Gemini API (gemini-2.0-flash) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Charts | Recharts |
| HTTP Client | Axios (frontend), httpx (backend) |

## 📋 Services

| Service | Port | Database | Responsibility |
|---------|------|----------|---------------|
| user-service | 4001 | user-db | Auth, profiles |
| medical-service | 4002 | medical-db | Medications, logs, adherence |
| health-service | 4003 | health-db | Symptoms, visits |
| ai-service | 4004 | None (Redis) | AI insights via Gemini |
| frontend | 80 | None | React SPA |

## 📦 Prerequisites

- Docker & Docker Compose
- Google Gemini API key (free)

## 🔑 Getting a Free Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the key to your `.env` file

## 🚀 Quick Start

```bash
# 1. Clone
git clone <repo-url> && cd meditrack-project

# 2. Create .env from example
cp .env.example .env

# 3. Edit .env — set your values
#    POSTGRES_USER=meditrack
#    POSTGRES_PASSWORD=your-strong-password
#    JWT_SECRET=your-random-32-char-string
#    GEMINI_API_KEY=your-gemini-key

# 4. Build and start
docker compose up --build -d

# 5. Access
open http://localhost
```

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| User Service API | http://localhost:4001 |
| Medical Service API | http://localhost:4002 |
| Health Service API | http://localhost:4003 |
| AI Service API | http://localhost:4004 |
| Swagger Docs | http://localhost:400X/docs |

## 🧪 Test Flow

```bash
# 1. Register
curl -X POST http://localhost:4001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 2. Login (save the token)
TOKEN=$(curl -s -X POST http://localhost:4001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r '.data.token')

# 3. Add medication
curl -X POST http://localhost:4002/api/medications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Aspirin","dosage":"100mg","frequency":"once daily","start_date":"2024-01-01"}'

# 4. Log symptoms
curl -X POST http://localhost:4003/api/symptoms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-01-15","symptoms":["headache","fatigue"],"severity":5,"mood":6,"energy":7}'

# 5. Add visit
curl -X POST http://localhost:4003/api/visits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"doctor_name":"Dr. Smith","specialty":"General Physician","visit_date":"2024-01-15"}'

# 6. AI weekly report
curl -X POST http://localhost:4004/api/ai/weekly-report \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{}'
```

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| POSTGRES_USER | PostgreSQL username |
| POSTGRES_PASSWORD | PostgreSQL password |
| JWT_SECRET | JWT signing secret (min 32 chars) |
| GEMINI_API_KEY | Google Gemini API key |
| REDIS_URL | Redis connection URL |
| MEDICAL_SERVICE_URL | Internal medical service URL |
| HEALTH_SERVICE_URL | Internal health service URL |

## 🐳 Docker Commands

```bash
docker compose up --build -d    # Build and start
docker compose ps               # Check status
docker compose logs -f          # Follow logs
docker compose down             # Stop all
docker compose down -v          # Stop + remove volumes
docker compose restart <svc>    # Restart one service
```

## 🔍 Troubleshooting

| Issue | Solution |
|-------|---------|
| DB connection error | Wait for healthcheck, check POSTGRES_USER/PASSWORD |
| Port conflict | Change host ports in docker-compose.yml |
| Gemini 403 | Verify API key at aistudio.google.com |
| Redis timeout | Check Redis container health |
| 401 on requests | Token expired, re-login |

## 🗺️ Roadmap

- [x] **Phase 1**: Application + Docker + Docker Compose
- [ ] **Phase 2**: Kubernetes + KGateway
- [ ] **Phase 3**: Helm Charts
- [ ] **Phase 4**: GitHub Actions CI/CD
- [ ] **Phase 5**: GitOps with Argo CD

---

Built with ❤️ using FastAPI, React, and Google Gemini AI
