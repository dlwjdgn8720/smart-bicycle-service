from sqlalchemy import String, Enum, DateTime,Boolean, JSON  
from sqlalchemy.orm import Mapped, mapped_column
from database.connection import Base
from datetime import datetime, timezone
from typing import List, Optional

class MemberModel(Base):
    __tablename__ = "member"

    email: Mapped[str] = mapped_column(String(50), primary_key=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    nickname: Mapped[str] = mapped_column(String(200), nullable=False)
    ridingStyles: Mapped[Optional[List[str]]] = mapped_column(JSON(String(200)), nullable=True)
    agreeRequired: Mapped[str] = mapped_column(Boolean, nullable=False)
    agreeMarketing: Mapped[str] = mapped_column(Boolean, nullable=True)
    role: Mapped[str] = mapped_column(Enum("USER", "ADMIN", name="member_role"), nullable=False, default="USER")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    





