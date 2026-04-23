from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import ProfileUpdateRequest, PasswordUpdateRequest
from app.utils.hashing import hash_password, verify_password
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])


def user_to_dict(user: User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "age": user.age,
        "weight": user.weight,
        "blood_group": user.blood_group,
        "conditions": user.conditions,
        "created_at": user.created_at.isoformat(),
    }


@router.get("")
async def get_profile(current_user: User = Depends(get_current_user)):
    return {"success": True, "data": user_to_dict(current_user)}


@router.put("")
async def update_profile(
    body: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.validate_blood_group():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "success": False,
                "message": "Invalid blood group. Allowed: A+, A-, B+, B-, O+, O-, AB+, AB-",
            },
        )

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return {"success": True, "data": user_to_dict(current_user)}


@router.put("/password")
async def update_password(
    body: PasswordUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Current password is incorrect"},
        )

    current_user.password = hash_password(body.new_password)
    db.commit()

    return {"success": True, "message": "Password updated successfully"}


@router.delete("")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.delete(current_user)
    db.commit()

    return {"success": True, "message": "Account deleted successfully"}
