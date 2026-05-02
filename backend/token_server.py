import os
import json
import hashlib
import hmac
import time
from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from livekit.api import AccessToken, VideoGrants
from dotenv import load_dotenv

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from memory import upsert_user_profile, get_user_profile

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
    allow_credentials=True,
)

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
# Simple secret for signing session cookies
COOKIE_SECRET = os.getenv('COOKIE_SECRET', os.getenv('LIVEKIT_API_SECRET', 'halo-secret-key'))


def _sign_cookie(google_id: str) -> str:
    """Create a signed session value: google_id|timestamp|signature"""
    ts = str(int(time.time()))
    payload = f"{google_id}|{ts}"
    sig = hmac.new(COOKIE_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}|{sig}"


def _verify_cookie(cookie_value: str) -> str | None:
    """Verify a signed cookie. Returns google_id if valid, None otherwise."""
    try:
        parts = cookie_value.split("|")
        if len(parts) != 3:
            return None
        google_id, ts, sig = parts
        payload = f"{google_id}|{ts}"
        expected_sig = hmac.new(COOKIE_SECRET.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        # Cookie valid for 30 days
        if int(time.time()) - int(ts) > 30 * 24 * 3600:
            return None
        return google_id
    except Exception:
        return None


@app.post('/auth/google')
async def google_auth(payload: dict = Body(...)):
    """Verify a Google ID token, upsert the user, and set a session cookie."""
    print(f"[AUTH] POST /auth/google received")
    token = payload.get('token')
    if not token:
        print("[AUTH] ERROR: No token in payload")
        raise HTTPException(status_code=400, detail="Token not provided")

    print(f"[AUTH] Verifying token with client_id={GOOGLE_CLIENT_ID[:20]}...")
    try:
        id_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        print(f"[AUTH] ERROR: Token verification failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")
    except Exception as e:
        print(f"[AUTH] ERROR: Unexpected error during verification: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Token verification error: {e}")

    google_id = id_info.get('sub')
    name = id_info.get('name', 'User')
    email = id_info.get('email', '')
    picture = id_info.get('picture', '')
    print(f"[AUTH] Verified: {name} ({email})")

    profile = upsert_user_profile(google_id, name, email, picture)
    if not profile:
        print("[AUTH] ERROR: Failed to upsert profile")
        raise HTTPException(status_code=500, detail="Failed to save user profile")

    print(f"[AUTH] SUCCESS: User {name} signed in")
    # Set signed session cookie
    response = JSONResponse(content={'user': profile})
    response.set_cookie(
        key='halo_session',
        value=_sign_cookie(google_id),
        httponly=True,
        samesite='lax',
        max_age=30 * 24 * 3600,  # 30 days
        path='/',
    )
    return response


@app.get('/auth/me')
async def auth_me(request: Request):
    """Check if the user has a valid session cookie."""
    cookie = request.cookies.get('halo_session')
    if not cookie:
        raise HTTPException(status_code=401, detail="Not authenticated")

    google_id = _verify_cookie(cookie)
    if not google_id:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    profile = get_user_profile(google_id)
    if not profile:
        raise HTTPException(status_code=401, detail="User not found")

    return profile


@app.post('/auth/logout')
async def auth_logout():
    """Clear the session cookie."""
    response = JSONResponse(content={'ok': True})
    response.delete_cookie(key='halo_session', path='/')
    return response


@app.post('/token')
@app.get('/token')
async def get_token(room: str = 'assistant-room', user: str = 'user'):
    token = (
        AccessToken(
            api_key=os.getenv('LIVEKIT_API_KEY'),
            api_secret=os.getenv('LIVEKIT_API_SECRET')
        )
        .with_identity(user)
        .with_name(user)
        .with_grants(VideoGrants(room_join=True, room=room))
        .to_jwt()
    )
    return {'token': token, 'url': os.getenv('LIVEKIT_URL'), 'room': room}
