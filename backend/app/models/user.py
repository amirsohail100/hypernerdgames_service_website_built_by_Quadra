"""User account model."""

from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), default="")
    # NULL for accounts that only use Google or Microsoft sign-in.
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # "password", "google" or "microsoft"
    provider: Mapped[str] = mapped_column(String(20), default="password")
    provider_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
