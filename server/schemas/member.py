from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import List, Optional

# LoginItem class
class LoginItem(BaseModel):
    email: str
    password: str

    model_config = ConfigDict(
        json_schema_extra={
            "example":
                {
                    "email": "test@gmail.com",
                    "password": "****"
                }
        }
    )

# MemberItem class 생성
class MemberItem(BaseModel):
    email: str
    password: str
    nickname: str
    ridingStyles: Optional[List[str]] = None  # 클라이언트가 리스트로 보낼 수 있도록 List[str]로 지정
    agreeRequired: bool
    agreeMarketing: bool

    # swagger 테스트시 model_config 필요 react X
    model_config = ConfigDict(
        json_schema_extra = {
            "examples":[
                {
                    "email": "test1@gmail.com",
                    "password": "pw1234",
                    "nickname": "홍길동",
                    "ridingStyles": "[로드,...]",
                    "agreeRequired": "True",
                    "agreeMarketing": "True"
                }
            ]
        }
    )

# Member class
class Member(BaseModel):
    email: str
    password: str
    nickname: str
    ridingStyles: Optional[List[str]]
    agreeRequired: bool
    agreeMarketing: bool
    role: str
    created_at: datetime

