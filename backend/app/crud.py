from sqlalchemy.orm import Session
from . import models, schemas
import hashlib
from datetime import datetime

# ------------------------------------------------------------
# Departments
# ------------------------------------------------------------
def get_departments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Department).offset(skip).limit(limit).all()

def create_department(db: Session, department: schemas.DepartmentCreate):
    db_dept = models.Department(
        name=department.name,
        code=department.code,
        head_faculty_id=department.head_faculty_id
    )
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

def delete_department(db: Session, dept_id: int):
    dept = db.query(models.Department).filter(models.Department.dept_id == dept_id).first()
    if dept:
        db.delete(dept)
        db.commit()
    return dept

# ------------------------------------------------------------
# Programs
# ------------------------------------------------------------
def get_programs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Program).offset(skip).limit(limit).all()

def create_program(db: Session, program: schemas.ProgramCreate):
    db_program = models.Program(
        name=program.name,
        dept_id=program.dept_id,
        duration_years=program.duration_years
    )
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program

def delete_program(db: Session, program_id: int):
    prog = db.query(models.Program).filter(models.Program.program_id == program_id).first()
    if prog:
        db.delete(prog)
        db.commit()
    return prog

# ------------------------------------------------------------
# Subjects
# ------------------------------------------------------------
def get_subjects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Subject).offset(skip).limit(limit).all()

def create_subject(db: Session, subject: schemas.SubjectCreate):
    db_subject = models.Subject(
        name=subject.name,
        code=subject.code,
        dept_id=subject.dept_id,
        credits=subject.credits,
        is_elective=subject.is_elective
    )
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def delete_subject(db: Session, subject_id: int):
    subj = db.query(models.Subject).filter(models.Subject.subject_id == subject_id).first()
    if subj:
        db.delete(subj)
        db.commit()
    return subj

# ------------------------------------------------------------
# Locations
# ------------------------------------------------------------
def get_locations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Location).offset(skip).limit(limit).all()

def create_location(db: Session, location: schemas.LocationCreate):
    # Ignoring polygon logic for simplicity, assuming simple insert
    db_loc = models.Location(
        name=location.name,
        floor=location.floor,
        building=location.building
    )
    db.add(db_loc)
    db.commit()
    db.refresh(db_loc)
    return db_loc

def delete_location(db: Session, location_id: int):
    loc = db.query(models.Location).filter(models.Location.location_id == location_id).first()
    if loc:
        db.delete(loc)
        db.commit()
    return loc

# ------------------------------------------------------------
# Faculty
# ------------------------------------------------------------
def get_faculty(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Faculty).offset(skip).limit(limit).all()

def create_faculty(db: Session, faculty: schemas.FacultyCreate):
    db_fac = models.Faculty(
        employee_id=faculty.employee_id,
        name=faculty.name,
        email=faculty.email,
        phone=faculty.phone,
        dept_id=faculty.dept_id,
        category=faculty.category,
        designation=faculty.designation
    )
    db.add(db_fac)
    db.commit()
    db.refresh(db_fac)
    return db_fac

def delete_faculty(db: Session, faculty_id: int):
    fac = db.query(models.Faculty).filter(models.Faculty.faculty_id == faculty_id).first()
    if fac:
        db.delete(fac)
        db.commit()
    return fac

# ------------------------------------------------------------
# Course Offerings
# ------------------------------------------------------------
def get_offerings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.CourseOffering).offset(skip).limit(limit).all()

def create_offering(db: Session, offering: schemas.OfferingCreate):
    db_off = models.CourseOffering(
        subject_id=offering.subject_id,
        faculty_id=offering.faculty_id,
        semester=offering.semester,
        academic_year=offering.academic_year,
        batch=offering.batch
    )
    db.add(db_off)
    db.commit()
    db.refresh(db_off)
    return db_off

def delete_offering(db: Session, offering_id: int):
    off = db.query(models.CourseOffering).filter(models.CourseOffering.offering_id == offering_id).first()
    if off:
        db.delete(off)
        db.commit()
    return off

# ------------------------------------------------------------
# Student CRUD
# ------------------------------------------------------------
def get_student_by_enrollment(db: Session, enrollment_number: str):
    return db.query(models.Student).filter(models.Student.enrollment_number == enrollment_number).first()

def get_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Student).offset(skip).limit(limit).all()

def create_student(db: Session, student: schemas.StudentCreate, embedding):
    db_student = models.Student(
        enrollment_number=student.enrollment_number,
        name=student.name,
        email=student.email,
        phone=student.phone,
        enrollment_type=student.enrollment_type,
        program_id=student.program_id,
        admission_year=student.admission_year,
        embedding=embedding
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int):
    student = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if student:
        db.delete(student)
        db.commit()
    return student

# ------------------------------------------------------------
# Attendance CRUD
# ------------------------------------------------------------
def create_attendance_record(db: Session, session_id: int, student_id: int, verified: bool = True, similarity: float = None):
    db_record = models.AttendanceRecord(
        session_id=session_id,
        student_id=student_id,
        present=True,
        punch_in=datetime.utcnow(),
        face_verified=verified,
        face_similarity=similarity
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_attendance_records(db: Session, student_id: int = None, start_date = None, end_date = None, skip: int = 0, limit: int = 1000):
    query = db.query(models.AttendanceRecord)
    
    if student_id:
        query = query.filter(models.AttendanceRecord.student_id == student_id)
    if start_date:
        query = query.filter(models.AttendanceRecord.punch_in >= start_date)
    if end_date:
        query = query.filter(models.AttendanceRecord.punch_in <= end_date)
    
    return query.order_by(models.AttendanceRecord.punch_in.desc()).offset(skip).limit(limit).all()

# ------------------------------------------------------------
# Session Internal Helper
# ------------------------------------------------------------
def get_active_session(db: Session):
    return db.query(models.AttendanceSession).order_by(models.AttendanceSession.scheduled_start.desc()).first()

def create_adhoc_session(db: Session, offering_id: int):
    db_session = models.AttendanceSession(
        offering_id=offering_id,
        scheduled_start=datetime.utcnow(),
        verify_face=True
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

# ------------------------------------------------------------
# Legacy CRUD (Restored for main.py compatibility)
# ------------------------------------------------------------

def get_user_by_name(db: Session, name: str):
    return db.query(models.User).filter(models.User.name == name).first()

def create_user(db: Session, user: schemas.UserCreate, embedding):
    db_user = models.User(
        name=user.name, 
        enrollment_number=user.enrollment_number,
        embedding=embedding
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def delete_user(db: Session, user_id: int):
    # This might conflict with strict schemas if response model expects something specific
    # Main.py expects returning the deleted user
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
    return user

def create_attendance(db: Session, user_id: int):
    db_attendance = models.Attendance(user_id=user_id)
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def get_attendance(db: Session, user_id: int = None, start_date = None, end_date = None, skip: int = 0, limit: int = 1000):
    query = db.query(models.Attendance)
    if user_id:
        query = query.filter(models.Attendance.user_id == user_id)
    # Check if start_date/end_date logic matches main.py expectations
    # main.py does: if start_date: ... filter(models.Attendance.timestamp >= start_date)
    # The existing get_attendance_records uses 'punch_in'.
    # I should check main.py usage again or just implement safely.
    
    if start_date:
        query = query.filter(models.Attendance.timestamp >= start_date)
    if end_date:
        query = query.filter(models.Attendance.timestamp <= end_date)
        
    return query.order_by(models.Attendance.timestamp.desc()).offset(skip).limit(limit).all()

# Admin
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_admin_by_username(db: Session, username: str):
    return db.query(models.Admin).filter(models.Admin.username == username).first()

def create_admin(db: Session, admin: schemas.AdminCreate):
    db_admin = models.Admin(
        username=admin.username,
        hashed_password=hash_password(admin.password)
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin
