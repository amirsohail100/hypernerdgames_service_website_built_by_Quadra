"""Application settings, loaded from environment variables or a local .env file."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Full SQLAlchemy connection URL, for example:
    # postgresql+psycopg2://USER:PASSWORD@HOST:5432/DBNAME
    database_url: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
