import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import base64
from jose import JWTError, jwt, jwk
from jose.constants import ALGORITHMS
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

# Load RS256 Keys
JWT_PRIVATE_KEY_B64 = os.getenv("JWT_PRIVATE_KEY_B64", "")
JWT_PUBLIC_KEY_B64 = os.getenv("JWT_PUBLIC_KEY_B64", "")

JWT_PRIVATE_KEY = base64.b64decode(JWT_PRIVATE_KEY_B64).decode('utf-8') if JWT_PRIVATE_KEY_B64 else ""
JWT_PUBLIC_KEY = base64.b64decode(JWT_PUBLIC_KEY_B64).decode('utf-8') if JWT_PUBLIC_KEY_B64 else ""

JWT_ALGORITHM = ALGORITHMS.RS256
JWT_EXPIRY_HOURS = 24
JWKS_KID = "meditrack-key-1"

security = HTTPBearer()


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    headers = {"kid": JWKS_KID}
    return jwt.encode(payload, JWT_PRIVATE_KEY, algorithm=JWT_ALGORITHM, headers=headers)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_PUBLIC_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid or expired token"},
        )


def get_jwks() -> dict:
    """Generate JWKS payload from the public key."""
    if not JWT_PUBLIC_KEY:
        return {"keys": []}
    
    key = jwk.construct(JWT_PUBLIC_KEY, algorithm=JWT_ALGORITHM)
    key_dict = key.to_dict()
    key_dict["kid"] = JWKS_KID
    key_dict["use"] = "sig"
    return {"keys": [key_dict]}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid token payload"},
        )
    try:
        user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid user ID in token"},
        )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "User not found"},
        )
    return user
