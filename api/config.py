from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    ai_mode: Literal["online", "offline"] = "offline"

    # Online (Claude) settings
    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-6"

    # Offline (Ollama) settings
    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]


settings = Settings()
