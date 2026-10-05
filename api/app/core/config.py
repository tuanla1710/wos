from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")

    database_url: str = "postgresql+psycopg://workos:workos@127.0.0.1:5432/workos"
    secret_key: str = "change-me"
    session_days: int = 30
    cookie_name: str = "session"
    web_origin: str = "http://localhost:3000"


settings = Settings()
