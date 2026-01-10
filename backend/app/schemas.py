from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class AttendanceBase(BaseModel):
    user_id: int

class Attendance(AttendanceBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
