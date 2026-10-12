from uuid import UUID

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import settings
from app.core.security import read_session
from app.db.session import SessionLocal
from app.models.user import User

EXEMPT_PREFIXES = ("/health", "/docs", "/redoc", "/openapi", "/api/auth")


def _exempt(path: str, method: str) -> bool:
    if any(path == prefix or path.startswith(prefix + ".") or path.startswith(prefix + "/") for prefix in EXEMPT_PREFIXES):
        return True
    if path == "/openapi.json":
        return True
    return path == "/api/me" and method == "GET"


class PhoneVerifiedMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method == "OPTIONS" or _exempt(request.url.path, request.method):
            return await call_next(request)
        token = request.cookies.get(settings.cookie_name)
        if not token:
            return await call_next(request)
        user_id = read_session(token)
        if not user_id:
            return await call_next(request)
        db = SessionLocal()
        try:
            user = db.get(User, UUID(user_id))
            if user is not None and user.phone_verified_at is None:
                return JSONResponse({"detail": "Phone verification required."}, status_code=403)
        finally:
            db.close()
        return await call_next(request)
