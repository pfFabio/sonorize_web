from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    login: str
    email: str
    senha: str

class UserResponse(BaseModel):
    id: int
    created_at: datetime
    login: str
    email: str
    lingua: Optional[str] = None

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
