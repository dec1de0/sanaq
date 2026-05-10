from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError
from passlib.context import CryptContext
import os
import datetime
import uuid

router = APIRouter()
security = HTTPBearer()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGO = "HS256"
JWT_EXP_HOURS = 24 * 7  # 7 days

# In-memory user store for dev (swap with Supabase in production)
_users: dict[str, dict] = {}


class RegisterRequest(BaseModel):
    email: str
    password: str
    username: str
    city: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str


from typing import Optional


def _make_token(user_id: str) -> str:
    exp = datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXP_HOURS)
    return jwt.encode({"sub": user_id, "exp": exp}, JWT_SECRET, algorithm=JWT_ALGO)


def _verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user_id = _verify_token(creds.credentials)
    user = _users.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/register")
def register(req: RegisterRequest):
    if any(u["email"] == req.email for u in _users.values()):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    _users[user_id] = {
        "id": user_id,
        "email": req.email,
        "username": req.username,
        "password_hash": pwd_ctx.hash(req.password),
        "is_pro": False,
        "city": req.city,
        "created_at": datetime.datetime.utcnow().isoformat(),
        "avatar_url": None,
    }
    token = _make_token(user_id)
    return {"token": token, "user": _safe_user(_users[user_id])}


@router.post("/login")
def login(req: LoginRequest):
    user = next((u for u in _users.values() if u["email"] == req.email), None)
    if not user or not pwd_ctx.verify(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = _make_token(user["id"])
    return {"token": token, "user": _safe_user(user)}


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return _safe_user(user)


def _safe_user(user: dict) -> dict:
    return {k: v for k, v in user.items() if k != "password_hash"}
