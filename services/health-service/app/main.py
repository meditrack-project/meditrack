import os
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import symptoms, visits

app = FastAPI(
    title="MediTrack Health Service",
    description="Symptom logging and doctor visit management",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)


app.include_router(symptoms.router)
app.include_router(visits.router)


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "health-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
