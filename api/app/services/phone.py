from __future__ import annotations

import hashlib
import hmac
import logging
import re
import secrets
from datetime import datetime, timedelta
from datetime import timezone as tz
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User

log = logging.getLogger("workos.sms")

OTP_TTL = timedelta(minutes=10)
RESEND_AFTER = timedelta(seconds=60)
MAX_ATTEMPTS = 5


def normalize_phone(raw: str, default_cc: str | None = None) -> str:
    raw = (raw or "").strip()
    if not raw:
        raise HTTPException(400, "Phone number is required.")
    cc = (default_cc or settings.phone_default_country or "82").lstrip("+")
    digits = re.sub(r"\D", "", raw)
    if raw.startswith("+"):
        e164 = "+" + digits
    elif digits.startswith("00"):
        e164 = "+" + digits[2:]
    elif digits.startswith("0"):
        e164 = f"+{cc}{digits[1:]}"
    elif digits.startswith(cc):
        e164 = "+" + digits
    else:
        e164 = f"+{cc}{digits}"
    number = e164[1:]
    if not number.isdigit() or not (10 <= len(number) <= 15):
        raise HTTPException(400, "Enter a valid phone number.")
    return e164


def hash_otp(code: str) -> str:
    return hmac.new(settings.secret_key.encode(), code.encode(), hashlib.sha256).hexdigest()


def assert_phone_free(db: Session, phone: str, user_id=None) -> None:
    q = db.query(User).filter(User.phone == phone)
    if user_id is not None:
        q = q.filter(User.id != user_id)
    if q.first():
        raise HTTPException(400, "Phone number is already in use.")


def send_sms(phone: str, body: str) -> None:
    if settings.sms_provider == "twilio":
        sid = settings.twilio_account_sid
        token = settings.twilio_auth_token
        sender = settings.twilio_from
        if not (sid and token and sender):
            raise HTTPException(500, "SMS is not configured.")
        data = urlencode({"From": sender, "To": phone, "Body": body}).encode()
        req = Request(
            f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
            data=data,
            method="POST",
        )
        raw = f"{sid}:{token}".encode()
        req.add_header("Authorization", "Basic " + __import__("base64").b64encode(raw).decode())
        try:
            with urlopen(req, timeout=10) as res:
                res.read()
        except Exception as exc:
            raise HTTPException(502, "Could not send the verification code.") from exc
        return
    log.info("SMS %s: %s", phone, body)


def issue_otp(db: Session, user: User, phone: str | None) -> dict:
    now = datetime.now(tz.utc)
    if user.phone_verified_at is not None and not phone:
        raise HTTPException(400, "Phone is already verified.")
    if user.phone_otp_sent_at and now - user.phone_otp_sent_at < RESEND_AFTER:
        raise HTTPException(400, "Wait a minute before requesting another code.")
    next_phone = normalize_phone(phone or user.phone or "")
    assert_phone_free(db, next_phone, user.id)
    code = f"{secrets.randbelow(1_000_000):06d}"
    user.phone = next_phone
    user.phone_otp_hash = hash_otp(code)
    user.phone_otp_expires_at = now + OTP_TTL
    user.phone_otp_sent_at = now
    user.phone_otp_attempts = 0
    db.commit()
    send_sms(next_phone, f"Work OS code: {code}")
    out = {"ok": True, "phone": next_phone}
    if settings.sms_provider == "console":
        out["dev_code"] = code
    return out


def confirm_otp(db: Session, user: User, code: str) -> User:
    now = datetime.now(tz.utc)
    if not user.phone or not user.phone_otp_hash or not user.phone_otp_expires_at:
        raise HTTPException(400, "Request a verification code first.")
    if user.phone_otp_expires_at < now:
        raise HTTPException(400, "That code has expired. Request a new one.")
    if user.phone_otp_attempts >= MAX_ATTEMPTS:
        raise HTTPException(400, "Too many attempts. Request a new code.")
    user.phone_otp_attempts += 1
    if not hmac.compare_digest(user.phone_otp_hash, hash_otp(code.strip())):
        db.commit()
        raise HTTPException(400, "That code is wrong.")
    user.phone_verified_at = now
    user.phone_otp_hash = None
    user.phone_otp_expires_at = None
    user.phone_otp_sent_at = None
    user.phone_otp_attempts = 0
    user.updated_at = now
    db.commit()
    db.refresh(user)
    return user
