from sqlmodel import Session
from datetime import datetime, date
from zoneinfo import ZoneInfo

from app.models import User

def get_today_local(user_timezone: str) -> date:
    try:
        user_tz = ZoneInfo(user_timezone)
    except Exception:
        user_tz = ZoneInfo("UTC")

    return datetime.now(user_tz).date()

def update_streak(user: User, today_local: date, session: Session):
    if user.last_active == today_local:
        return

    inactive_days = (today_local - user.last_active).days if user.last_active else None

    if inactive_days == 1:
        user.current_streak += 1
    else:
        user.current_streak = 1

    user.longest_streak = max(user.longest_streak, user.current_streak)
    user.last_active = today_local

    session.add(user)

def check_user_streak(user: User, today_local: date) -> bool:
    if user.last_active is None:
        return True

    inactive_days = (today_local - user.last_active).days
    if inactive_days > 1:
        user.current_streak = 0
        return False

    return True