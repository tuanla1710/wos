from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")

    database_url: str = "postgresql+psycopg://workos:workos@127.0.0.1:5432/workos"
    secret_key: str = "change-me"
    session_days: int = 30
    cookie_name: str = "session"
    web_origin: str = "http://localhost:3000"
    admin_email: str = "admin@workos.dev"
    admin_password: str = "Admin1234"
    admin_name: str = "Admin"
    public_register: bool = False
    phone_default_country: str = "82"
    sms_provider: str = "console"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from: str = ""


settings = Settings()
