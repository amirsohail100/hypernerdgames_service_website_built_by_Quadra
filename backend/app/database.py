"""Database engine, session factory and declarative base.

The engine is created only when DATABASE_URL is set, so the API can still
start (and serve the static site) before credentials are configured.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    """Base class for all ORM models."""


engine = None
SessionLocal = None

if settings.database_url:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session and closes it afterwards."""
    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL is not set. Add it to backend/.env.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
