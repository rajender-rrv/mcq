# app/schemas/user.py

from typing import Optional

from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password_hash: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password_hash: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True