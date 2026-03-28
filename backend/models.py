# from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
# from sqlalchemy.orm import relationship
# from database import Base


# # User Table
# class User(Base):
#     __tablename__ = "users"
#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String, unique=True, index=True, nullable=False)
#     email = Column(String, unique=True, nullable=False)
#     password = Column(String, nullable=False)

#     entries = relationship("JournalEntry", back_populates="owner")

# # Journal Entries Table
# class JournalEntry(Base):
#     __tablename__ = "journal_entries"
#     id = Column(Integer, primary_key=True, index=True)
#     entry_date = Column(Date, nullable=False)
#     content = Column(Text, nullable=False)
#     mood = Column(String, nullable=False)

#     user_id = Column(Integer, ForeignKey("users.id"))
#     owner = relationship("User", back_populates="entries")

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date

# ===================== USER MODELS =====================

class UserSignup(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: Optional[str]
    name: str
    email: EmailStr


# ===================== DIARY MODELS =====================

class DiaryCreate(BaseModel):
    date: date
    mood: str = Field(..., min_length=3)
    content: str = Field(..., min_length=1)

class DiaryResponse(BaseModel):
    id: Optional[str]
    date: date
    mood: str
    content: str
    user_id: str
