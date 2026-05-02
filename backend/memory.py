import os
from sqlalchemy import create_engine, Column, String, Text, Integer, DateTime
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

class Base(DeclarativeBase): pass

class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    session_id = Column(String, index=True)
    role = Column(String)        # 'user' or 'assistant'
    content = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class UserProfile(Base):
    __tablename__ = 'user_profiles'
    id = Column(Integer, primary_key=True)
    google_id = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    email = Column(String)
    picture_url = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/voice_assistant')
engine = create_engine(db_url)
Base.metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)

def save_message(session_id: str, role: str, content: str):
    try:
        with SessionLocal() as s:
            s.add(Message(session_id=session_id, role=role, content=content))
            s.commit()
    except Exception as e:
        print(f"Error saving message: {e}")

def load_history(session_id: str, limit: int = 20) -> list[dict]:
    """Returns the last N messages for a session, in chronological order."""
    try:
        with SessionLocal() as s:
            rows = (
                s.query(Message)
                .filter_by(session_id=session_id)
                .order_by(Message.created_at.desc())
                .limit(limit).all()
            )
            return [{'role': r.role, 'content': r.content} for r in reversed(rows)]
    except Exception as e:
        print(f"Error loading history: {e}")
        return []

def upsert_user_profile(google_id: str, display_name: str, email: str = None, picture_url: str = None) -> dict:
    """Creates or updates a user profile. Returns the profile as a dict."""
    try:
        with SessionLocal() as s:
            profile = s.query(UserProfile).filter_by(google_id=google_id).first()
            if profile:
                profile.display_name = display_name
                if email:
                    profile.email = email
                if picture_url:
                    profile.picture_url = picture_url
                profile.updated_at = datetime.now(timezone.utc)
            else:
                profile = UserProfile(
                    google_id=google_id,
                    display_name=display_name,
                    email=email,
                    picture_url=picture_url,
                )
                s.add(profile)
            s.commit()
            s.refresh(profile)
            return {
                'google_id': profile.google_id,
                'name': profile.display_name,
                'email': profile.email,
                'picture': profile.picture_url,
            }
    except Exception as e:
        print(f"Error upserting user profile: {e}")
        return None

def get_user_profile(google_id: str) -> dict | None:
    """Returns a user profile dict or None if not found."""
    try:
        with SessionLocal() as s:
            profile = s.query(UserProfile).filter_by(google_id=google_id).first()
            if profile:
                return {
                    'google_id': profile.google_id,
                    'name': profile.display_name,
                    'email': profile.email,
                    'picture': profile.picture_url,
                }
            return None
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return None
