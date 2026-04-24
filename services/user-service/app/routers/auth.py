from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import User
from app.schemas import RegisterRequest, LoginRequest, UserResponse, UserBriefResponse
from app.utils.hashing import hash_password, verify_password
from app.utils.auth import create_token, get_current_user, get_jwks

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.get("/jwks")
def jwks():
    """Return the public keys in JWKS format for KGateway validation."""
    return get_jwks()

@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def register(request: Request, body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Email already registered"},
        )

    hashed = hash_password(body.password)
    user = User(name=body.name, email=body.email, password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(str(user.id), user.email)

    return {
        "success": True,
        "data": {
            "token": token,
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "created_at": user.created_at.isoformat(),
            },
        },
    }


@router.post("/login")
@limiter.limit("10/15minutes")
async def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid email or password"},
        )

    if not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid email or password"},
        )

    token = create_token(str(user.id), user.email)

    return {
        "success": True,
        "data": {
            "token": token,
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "age": user.age,
                "weight": user.weight,
                "blood_group": user.blood_group,
                "conditions": user.conditions,
                "created_at": user.created_at.isoformat(),
            },
        },
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "data": {
            "id": str(current_user.id),
            "name": current_user.name,
            "email": current_user.email,
            "age": current_user.age,
            "weight": current_user.weight,
            "blood_group": current_user.blood_group,
            "conditions": current_user.conditions,
            "created_at": current_user.created_at.isoformat(),
        },
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}
