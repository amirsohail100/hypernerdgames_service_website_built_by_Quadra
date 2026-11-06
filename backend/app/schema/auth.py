"""Request and response schemas for authentication."""

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

BCRYPT_MAX_BYTES = 72


def _check_password_size(value: str) -> str:
    if len(value.encode("utf-8")) > BCRYPT_MAX_BYTES:
        raise ValueError(f"Password must be at most {BCRYPT_MAX_BYTES} bytes long")
    return value


class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def _password_size(cls, value: str) -> str:
        return _check_password_size(value)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    remember: bool = False

    @field_validator("password")
    @classmethod
    def _password_size(cls, value: str) -> str:
        return _check_password_size(value)


class SocialIn(BaseModel):
    id_token: str = Field(min_length=10, max_length=8192)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    provider: str
