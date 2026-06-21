"""
Application configuration loaded from environment variables.
Uses pydantic-settings for validation and type coercion.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from .env file or environment variables."""

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "whatsapp_agent"

    # Google Gemini LLM
    GOOGLE_API_KEY: str = ""

    # WhatsApp Cloud API
    WHATSAPP_API_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""

    # Webhook verification token (custom string you set in Meta dashboard)
    WEBHOOK_VERIFY_TOKEN: str = "my-verify-token"

    # Meta App Secret for webhook payload signature validation
    META_APP_SECRET: str = ""

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # WhatsApp API base URL
    WHATSAPP_API_BASE: str = "https://graph.facebook.com/v20.0"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — loaded once, reused everywhere."""
    return Settings()
