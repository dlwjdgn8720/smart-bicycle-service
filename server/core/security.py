from passlib.context import CryptContext
import bcrypt
import os
from jose import jwt
from datetime import timedelta, datetime, timezone

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

ACCESS_SECRET = os.getenv("ACCESS_SECRET", "dev-access-secret")
REFRESH_SECRET = os.getenv("REFRESH_SECRET", "dev-refresh-secret")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

def hash_password(password:str) -> str:
    return pwd_context.hash(password)

def verify_password(raw_password:str, hashed_password:str) -> str:
    return bcrypt.checkpw(raw_password.encode(), hashed_password.encode())

#token 리턴 형식 : HEX 256 타입으로 토큰 생성 후 리턴
def _create_token(member_id:str, role:str, secret: str, expires_delta: timedelta) -> str:
   payload = {
       "sub": member_id,
       "role": role,
       "exp": datetime.now(timezone.utc) + expires_delta
   }

   return {
       jwt.encode(payload, secret, algorithm="HS256")
   }

# access_token
def create_access_token(member_id: str, role: str) -> str:
    return _create_token(
        member_id, role, ACCESS_SECRET, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

# refresh_token
def create_refresh_token(member_id:str, role:str) -> str:
    return _create_token(
            member_id, role, REFRESH_SECRET, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )





