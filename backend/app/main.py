# app/main.py
"""
Antarctic Digital Twin — FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.stations import router as stations_router

app = FastAPI(
    title="Antarctic Digital Twin API",
    description=(
        "Real-time and simulated telemetry for Maitri and Bharati "
        "Antarctic research stations."
    ),
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS — allow all origins for hackathon (tighten in production)
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(stations_router, tags=["stations"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok"}
