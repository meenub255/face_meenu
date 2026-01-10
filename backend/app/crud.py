from sqlalchemy.orm import Session
from . import models, schemas
import pickle

def get_user_by_name(db: Session, name: str):
    return db.query(models.User).filter(models.User.name == name).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate, embedding):
    # embedding is a numpy array
    db_user = models.User(name=user.name, embedding=embedding)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_attendance(db: Session, user_id: int):
    db_attendance = models.Attendance(user_id=user_id)
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def delete_user(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
    return user

def get_attendance(db: Session, user_id: int = None, start_date = None, end_date = None, skip: int = 0, limit: int = 1000):
    query = db.query(models.Attendance)
    
    if user_id:
        query = query.filter(models.Attendance.user_id == user_id)
    if start_date:
        query = query.filter(models.Attendance.timestamp >= start_date)
    if end_date:
        query = query.filter(models.Attendance.timestamp <= end_date)
    
    return query.order_by(models.Attendance.timestamp.desc()).offset(skip).limit(limit).all()


