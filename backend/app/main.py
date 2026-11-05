"""FastAPI entry point.

API routes live under /api. The static website is mounted at "/" last,
so API routes take priority over static files.
"""

from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

# backend/app/main.py -> project root is parents[2]
STATIC_DIR = Path(__file__).resolve().parents[2] / "static"

app = FastAPI(title="HypernerdGames API", version="0.1.0")


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/db/health", tags=["health"])
def db_health(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"status": "ok"}


app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
