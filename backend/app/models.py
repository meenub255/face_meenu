from sqlalchemy import Column, Integer, String, DateTime, PickleType
from pgvector.sqlalchemy import Vector
from .db import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    # Storing embedding as binary pickle or raw bytes.
    # EdgeFace embedding is 512 floats.
    embedding = Column(Vector(512)) 
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
