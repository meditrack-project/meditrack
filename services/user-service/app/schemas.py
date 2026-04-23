import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


# --- Request Schemas ---

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    age: Optional[int] = Field(None, ge=1, le=150)
    weight: Optional[float] = Field(None, ge=1, le=500)
    blood_group: Optional[str] = None
    conditions: Optional[List[str]] = None

    def validate_blood_group(self):
        allowed = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
        if self.blood_group is not None and self.blood_group not in allowed:
            return False
        return True


class PasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


# --- Response Schemas ---

class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    age: Optional[int] = None
    weight: Optional[float] = None
    blood_group: Optional[str] = None
    conditions: Optional[List[str]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserBriefResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    token: str
    user: UserBriefResponse


class SuccessDataResponse(BaseModel):
    success: bool = True
    data: dict


class SuccessMessageResponse(BaseModel):
    success: bool = True
    message: str
