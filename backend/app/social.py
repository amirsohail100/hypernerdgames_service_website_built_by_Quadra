"""Verify ID tokens issued by Google and Microsoft.

The browser signs the user in with the provider and sends the ID token here.
We check the token signature against the provider's public keys, then check
the audience (our client ID), issuer and expiry before trusting its claims.
"""

import jwt
from jwt import PyJWKClient

from app.config import settings

GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
MICROSOFT_JWKS_URL = "https://login.microsoftonline.com/common/discovery/v2.0/keys"
GOOGLE_ISSUERS = ("https://accounts.google.com", "accounts.google.com")

_google_keys = PyJWKClient(GOOGLE_JWKS_URL, cache_keys=True)
_microsoft_keys = PyJWKClient(MICROSOFT_JWKS_URL, cache_keys=True)


class SocialTokenError(Exception):
    """The token is missing, malformed, expired, or not issued for us."""


class SocialNotConfigured(SocialTokenError):
    """The server has no client ID for this provider."""


def _decode(token: str, keys: PyJWKClient, audience: str) -> dict:
    try:
        signing_key = keys.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=audience,
            options={"require": ["exp", "aud", "iss", "sub"]},
        )
    except jwt.PyJWTError as exc:
        raise SocialTokenError("Sign-in token is invalid or expired.") from exc


def verify_google(token: str) -> dict:
    if not settings.google_client_id:
        raise SocialNotConfigured("Google sign-in is not configured on the server.")
    claims = _decode(token, _google_keys, settings.google_client_id)
    if claims.get("iss") not in GOOGLE_ISSUERS:
        raise SocialTokenError("Token issuer is not Google.")
    if not claims.get("email_verified"):
        raise SocialTokenError("Your Google email address is not verified.")
    return {
        "provider": "google",
        "sub": str(claims["sub"]),
        "email": str(claims["email"]).lower(),
        "name": str(claims.get("name", "")),
    }


def verify_microsoft(token: str) -> dict:
    if not settings.microsoft_client_id:
        raise SocialNotConfigured("Microsoft sign-in is not configured on the server.")
    claims = _decode(token, _microsoft_keys, settings.microsoft_client_id)
    issuer = str(claims.get("iss", ""))
    # Multi-tenant endpoint: issuer is https://login.microsoftonline.com/{tenant}/v2.0
    if not (issuer.startswith("https://login.microsoftonline.com/") and issuer.endswith("/v2.0")):
        raise SocialTokenError("Token issuer is not Microsoft.")
    email = claims.get("email") or claims.get("preferred_username")
    if not email:
        raise SocialTokenError("Microsoft did not return an email address.")
    return {
        "provider": "microsoft",
        "sub": str(claims["sub"]),
        "email": str(email).lower(),
        "name": str(claims.get("name", "")),
    }
