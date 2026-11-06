"""Application settings, loaded from environment variables or a local .env file."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Full SQLAlchemy connection URL, for example:
    # postgresql+psycopg2://USER:PASSWORD@HOST:5432/DBNAME
    database_url: str = ""

    # Secret used to sign session tokens. Must be long and random in production.
    jwt_secret: str = ""
    jwt_expire_minutes: int = 60 * 24 * 7

    # Set to true when the site is served over HTTPS.
    cookie_secure: bool = False

    # Public OAuth client IDs. These are not secrets.
    google_client_id: str = ""
    microsoft_client_id: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
