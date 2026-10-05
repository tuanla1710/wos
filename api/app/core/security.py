from datetime import timedelta

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from passlib.context import CryptContext

from app.core.config import settings

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
_serializer = URLSafeTimedSerializer(settings.secret_key, salt="workos-session")


def hash_password(password: str) -> str:
    return pwd.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd.verify(password, password_hash)


def sign_session(user_id: str) -> str:
    return _serializer.dumps({"uid": user_id})


def read_session(token: str) -> str | None:
    try:
        data = _serializer.loads(token, max_age=int(timedelta(days=settings.session_days).total_seconds()))
        return data.get("uid")
    except (BadSignature, SignatureExpired, TypeError):
        return None
