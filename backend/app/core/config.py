from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:pass@postgres:5432/shyndyq"
    redis_url: str = "redis://redis:6379/0"
    serper_api_key: str = ""
    openai_api_key: str = ""
    model_path: str = "bert-base-uncased"
    secret_key: str = "changeme"
    rate_limit_max: int = 20
    rate_limit_window: int = 60

    class Config:
        env_file = ".env"


settings = Settings()
