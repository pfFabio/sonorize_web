from datetime import datetime
from typing import Optional

from pydantic import BaseModel

try:
    from pydantic import ConfigDict
    PYDANTIC_V2 = True
except ImportError:
    PYDANTIC_V2 = False


class UserCreate(BaseModel):
    login: str
    email: str
    senha: str
    lingua: Optional[str] = None


class UserResponse(BaseModel):
    if PYDANTIC_V2:
        model_config = ConfigDict(from_attributes=True)
    else:
        class Config:
            orm_mode = True

    id: int
    created_at: datetime
    login: str
    email: str
    lingua: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
