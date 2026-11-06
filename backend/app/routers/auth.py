"""Authentication endpoints: email/password and Google/Microsoft sign-in."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schema.auth import LoginIn, SignupIn, SocialIn, UserOut
from app.security import SESSION_COOKIE, create_access_token, hash_password, verify_password
from app.social import SocialNotConfigured, SocialTokenError, verify_google, verify_microsoft

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _set_session(response: Response, user: User, remember: bool) -> None:
    max_age = settings.jwt_expire_minutes * 60 if remember else None
    response.set_cookie(
        SESSION_COOKIE,
        create_access_token(user.id),
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=max_age,
        path="/",
    )


def _find_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupIn, response: Response, db: Session = Depends(get_db)) -> User:
    if _find_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")
    user = User(
        email=payload.email.lower(),
        name=payload.name.strip(),
        password_hash=hash_password(payload.password),
        provider="password",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    _set_session(response, user, remember=True)
    return user


@router.post("/login", response_model=UserOut)
def login(payload: LoginIn, response: Response, db: Session = Depends(get_db)) -> User:
    user = _find_by_email(db, payload.email)
    # Same message for "no account", "wrong password" and "social-only account" to avoid leaking which emails exist.
    if user is None or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email or password is incorrect")
    _set_session(response, user, remember=payload.remember)
    return user


def _sign_in_with_profile(profile: dict, response: Response, db: Session) -> User:
    user = _find_by_email(db, profile["email"])
    if user is None:
        user = User(
            email=profile["email"],
            name=profile["name"][:120],
            provider=profile["provider"],
            provider_id=profile["sub"],
        )
        db.add(user)
    elif user.password_hash and user.provider != profile["provider"]:
        # Do not auto-link an existing password account to a social login.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email already has a password account. Log in with your password.",
        )
    elif user.provider_id is None:
        user.provider = profile["provider"]
        user.provider_id = profile["sub"]
    db.commit()
    db.refresh(user)
    _set_session(response, user, remember=True)
    return user


@router.post("/google", response_model=UserOut)
def google_login(payload: SocialIn, response: Response, db: Session = Depends(get_db)) -> User:
    try:
        profile = verify_google(payload.id_token)
    except SocialNotConfigured as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except SocialTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    return _sign_in_with_profile(profile, response, db)


@router.post("/microsoft", response_model=UserOut)
def microsoft_login(payload: SocialIn, response: Response, db: Session = Depends(get_db)) -> User:
    try:
        profile = verify_microsoft(payload.id_token)
    except SocialNotConfigured as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except SocialTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    return _sign_in_with_profile(profile, response, db)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout() -> Response:
    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    response.delete_cookie(SESSION_COOKIE, path="/")
    return response
