from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from app.db import get_session
from app.models import User, AnswerLog

class CreateUserRequest(BaseModel):
    username: str
    timezone: str
    avatarId: str

class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    target: Optional[int] = None
    avatar_id: Optional[str] = None

router = APIRouter()

@router.post("/api/user")
async def create_user(user_info: CreateUserRequest, session: Session = Depends(get_session)):
    statement = select(User)

    # Limitation for current single user project arhitecture
    existing_user = session.exec(statement).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user already exists!"
        )

    user = User(
        timezone=user_info.timezone,
        username=user_info.username,
        avatar_id=user_info.avatarId,
    )

    try:
        session.add(user)
        session.commit()
        session.refresh(user)
    except Exception as e:
        session.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user!"
        ) from e

    return {
        "user": user
    }

@router.get("/api/user")
async def get_user(session: Session = Depends(get_session)):
    statement = select(User)
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found!"
        )

    return {
        "user": user
    }


@router.patch("/api/user")
async def update_user(update_info: ProfileUpdateRequest, session: Session = Depends(get_session)):
    statement = select(User)
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found!"
        )

    try:
        update_data = update_info.model_dump(exclude_unset=True)
        user.sqlmodel_update(update_data)

        session.commit()
        session.refresh(user)
    except Exception as e:
        session.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user!"
        ) from e

    return {
        "user": user
    }

@router.get("/api/user/daily")
async def get_daily_target(session: Session = Depends(get_session)):
    statement = select(User)
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found!"
        )

    try:
        user_tz = ZoneInfo(user.timezone)
    except Exception:
        user_tz = ZoneInfo("UTC")

    # Get the number of flashcards answered today in user's local time, starting from midnight
    local_today_start = datetime.now(user_tz).replace(hour=0, minute=0, second=0, microsecond=0)
    utc_today_start = local_today_start.astimezone(timezone.utc)

    statement = select(func.count()).select_from(AnswerLog).where(AnswerLog.answer_date >= utc_today_start)

    answered = session.exec(statement).one()

    return {
        "answered": answered,
        "target": user.target
    }