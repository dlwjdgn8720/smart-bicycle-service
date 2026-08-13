from fastapi import APIRouter, Depends, HTTPException, status, Response
from core.security import hash_password, verify_password, create_access_token, create_refresh_token
from schemas.member import MemberItem, LoginItem
from models.member import MemberModel
from sqlalchemy.orm import Session
from database.connection import get_db
from jose import jwt,JWTError
from fastapi.security import OAuth2PasswordBearer
import os

member_router = APIRouter()

# 토큰명, 유효기간 설정
REFRESH_COOKIE_NAME ="refreshToken"
REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 # 7일

SECRET_KEY = os.getenv("ACCESS_SECRET", "dev-access-secret") 
ALGORITHM = "HS256"

# 💡 프론트엔드가 헤더에 실어 보낸 'Bearer <토큰>'을 추출하는 객체
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/member/login")

# 🛠️ [추가] 토큰을 검증하고 현재 유저 객체를 찾아주는 의존성 함수
async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> MemberModel:
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 자격 증명이 유효하지 않거나 만료되었습니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. 프론트엔드가 보낸 엑세스 토큰 해독
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        print("payload::", payload)
        
        # 💡 login 함수에서 create_access_token(memberModel.email, ...) 형태로 
        # 첫 번째 인자에 넣었던 값(이메일)이 payload의 'sub'에 담깁니다.
        email: str = payload.get("sub")
        
        if email is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    # 2. 토큰에서 추출한 이메일로 DB에서 유저 조회
    memberModel = db.get(MemberModel, email)
    if memberModel is None:
        raise credentials_exception
        
    return memberModel


# 로그인
@member_router.post("/login")
async def login(loginItem: LoginItem,
                response: Response, 
                db: Session = Depends(get_db)) -> dict:
    
    #1. id를 통해 DB 데이터 가져오기
    memberModel = db.get(MemberModel, loginItem.email)

    # 2. 유저가 없거나 비밀번호가 틀리면 즉시 401 예외 발생
    if memberModel is None or not verify_password(loginItem.password, memberModel.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 일치하지 않습니다."
        )

    #2. 0 => core.security 파일의 verify함수 실행, 비교
    # result = verify_password(loginItem.password, memberModel.password)
    # if result:

    access_token = create_access_token(memberModel.email, memberModel.role)
    refresh_token = create_refresh_token(memberModel.email, memberModel.role)

    print("refresh_token", refresh_token)

    response.set_cookie(
        key= REFRESH_COOKIE_NAME,
        value= refresh_token,
        httponly= True,
        samesite= "lax",
        secure= False,
        max_age= REFRESH_COOKIE_MAX_AGE
    ) 

    #3. X => 메시지 리턴
    return {
        "email": memberModel.email,
        "nickname": memberModel.nickname,
        "isLogin": True,
        "role": memberModel.role,
        "accessToken": access_token
    }

# 로그아웃
@member_router.post("/logout")
async def logout(response:Response) -> dict:
    response.delete_cookie(REFRESH_COOKIE_NAME)
     
    return {
        "isLogout": True
    }

@member_router.get("/me")
async def get_me(current_user: MemberModel = Depends(get_current_user)) -> dict:
    print("current_user", current_user)
    return {
       "user":{
        "nickname": current_user.nickname    
       }      
    }
    
#아이디 중복 체크
# @member_router.get("/idCheck/{email}")
# async def idCheck(email : str,
#                   db: Session = Depends(get_db)) -> dict:
#     memberModel = db.get(MemberModel, email)

#     if memberModel is None:
#         return {
#             "isFind": False
#         }
#         # raise HTTPException(
#         #     status_code= status.HTTP_404_NOT_FOUND,
#         #     detail= "ID does not exit"
#         # )

#     return {
#         "isFind": True
#     }


# 회원가입
@member_router.post("/signup")
async def signup(memberItem: MemberItem,
                 db: Session = Depends(get_db)) -> dict:
    print(memberItem)
    
    # DB 연동  
    # 1. models.MemberModel에 memberItem 저장
    memberModel = MemberModel(
        email = memberItem.email,
        password = hash_password(memberItem.password),
        nickname = memberItem.nickname,
        ridingStyles = memberItem.ridingStyles,
        agreeRequired = memberItem.agreeRequired,
        agreeMarketing = memberItem.agreeMarketing
    )

    # 2. 연결된 db session의 add() 함수 호출
    db.add(memberModel)

    # 3. commit
    db.commit()

    # 4. refresh 함수를 통해 저장된 데이터 가져오기
    db.refresh(memberModel)

    return {
        "isSignup": True
    }


    