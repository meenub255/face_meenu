from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
# Use SQLite for simplicity now, or PostgreSQL if configured.
# Plan mentioned psycopg2, implies Postgres. I'll use a local URL or env var.
# Defaulting to sqlite for easy local testing unless user provided config.
# User mentioned psycopg2-binary in plan, so I will prepare for Postgres but fallback/default to sqlite for immediate runnability if config missing.

# SQLALCHEMY_DATABASE_URL = "sqlite:///./attendance.db"
import os
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:root@localhost/attendance_db")
engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
