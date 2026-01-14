from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, ForeignKey, SmallInteger, 
    Text, Enum as SAEnum, CheckConstraint, Float
)
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from geoalchemy2 import Geometry
from .db import Base
import datetime
import enum
import pytz

# Enum definitions matching Postgres types
class FacultyCategory(str, enum.Enum):
    teaching = "teaching"
    non_teaching = "non_teaching"

class TeachingRank(str, enum.Enum):
    professor = "professor"
    associate_professor = "associate_professor"
    assistant_professor = "assistant_professor"
    lecturer = "lecturer"
    senior_lecturer = "senior_lecturer"

class NonTeachingRole(str, enum.Enum):
    administrative = "administrative"
    technical = "technical"
    support = "support"
    library = "library"
    lab_staff = "lab_staff"

class EnrollmentType(str, enum.Enum):
    FT = "FT" # Full-time
    PT = "PT" # Part-time

class EnrollmentStatus(str, enum.Enum):
    active = "active"
    dropped = "dropped"
    completed = "completed"

# ------------------------------------------------------------
# Core Models
# ------------------------------------------------------------

class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    enrollment_number = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True)
    phone = Column(String(32))
    enrollment_type = Column(SAEnum(EnrollmentType, name="enrollment_type_enum"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.program_id"))
    admission_year = Column(SmallInteger)
    embedding = Column(Vector(512)) # face embedding
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    program = relationship("Program", back_populates="students")
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="student", cascade="all, delete-orphan")


class Faculty(Base):
    __tablename__ = "faculty"

    faculty_id = Column(Integer, primary_key=True, index=True)
    employee_number = Column(String(64), unique=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True)
    phone = Column(String(32))
    category = Column(SAEnum(FacultyCategory, name="faculty_category"), nullable=False)
    teaching_rank = Column(SAEnum(TeachingRank, name="teaching_rank"), nullable=True)
    non_teaching_role = Column(SAEnum(NonTeachingRole, name="non_teaching_role"), nullable=True)
    department_id = Column(Integer) # Can link to a Departments table if normalized further
    embedding = Column(Vector(512)) # face embedding
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        CheckConstraint(
            "(category = 'teaching' AND teaching_rank IS NOT NULL AND non_teaching_role IS NULL) OR "
            "(category = 'non_teaching' AND non_teaching_role IS NOT NULL AND teaching_rank IS NULL)",
            name="check_faculty_role_validity"
        ),
    )

    # Relationships
    course_offerings = relationship("CourseOffering", back_populates="faculty")


class Department(Base):
    __tablename__ = "departments"

    department_id = Column(Integer, primary_key=True, index=True)
    code = Column(String(32), unique=True, nullable=False)
    name = Column(String(255), nullable=False)


class Program(Base):
    __tablename__ = "programs"

    program_id = Column(Integer, primary_key=True, index=True)
    code = Column(String(64), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    total_semesters = Column(SmallInteger, default=2)

    # Relationships
    subjects = relationship("Subject", back_populates="program", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="program")


class Subject(Base):
    __tablename__ = "subjects"

    subject_id = Column(Integer, primary_key=True, index=True)
    program_id = Column(Integer, ForeignKey("programs.program_id"), nullable=False)
    code = Column(String(64), nullable=False)
    name = Column(String(255), nullable=False)
    semester = Column(SmallInteger, nullable=False)
    credits = Column(SmallInteger, default=3)

    __table_args__ = (
        # UNIQUE(program_id, code) handled by DB, optional in ORM unless strict validation needed here
    )

    # Relationships
    program = relationship("Program", back_populates="subjects")
    course_offerings = relationship("CourseOffering", back_populates="subject", cascade="all, delete-orphan")


class Location(Base):
    __tablename__ = "locations"

    location_id = Column(Integer, primary_key=True, index=True)
    code = Column(String(64), unique=True)
    name = Column(String(255))
    building = Column(String(128))
    floor = Column(String(32))
    # PostGIS point (longitude, latitude). Use SRID 4326.
    geom = Column(Geometry(geometry_type='POINT', srid=4326))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    course_offerings = relationship("CourseOffering", back_populates="location")


class CourseOffering(Base):
    __tablename__ = "course_offerings"

    offering_id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    academic_year = Column(String(16), nullable=False)
    term = Column(String(16), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.faculty_id"))
    location_id = Column(Integer, ForeignKey("locations.location_id"))
    max_capacity = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    subject = relationship("Subject", back_populates="course_offerings")
    faculty = relationship("Faculty", back_populates="course_offerings")
    location = relationship("Location", back_populates="course_offerings")
    enrollments = relationship("Enrollment", back_populates="offering", cascade="all, delete-orphan")
    attendance_sessions = relationship("AttendanceSession", back_populates="offering", cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "enrollments"

    enrollment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.student_id"), nullable=False)
    offering_id = Column(Integer, ForeignKey("course_offerings.offering_id"), nullable=False)
    enrolled_on = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(16), default="active") # Simple string check in DB

    # Relationships
    student = relationship("Student", back_populates="enrollments")
    offering = relationship("CourseOffering", back_populates="enrollments")


class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    session_id = Column(Integer, primary_key=True, index=True)
    offering_id = Column(Integer, ForeignKey("course_offerings.offering_id"), nullable=False)
    scheduled_start = Column(DateTime, nullable=False)
    scheduled_end = Column(DateTime)
    verify_face = Column(Boolean, default=True)
    location_geom = Column(Geometry(geometry_type='POINT', srid=4326))
    location_accuracy_meters = Column(Float)
    created_by_faculty = Column(Integer, ForeignKey("faculty.faculty_id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text)

    # Relationships
    offering = relationship("CourseOffering", back_populates="attendance_sessions")
    attendance_records = relationship("AttendanceRecord", back_populates="session", cascade="all, delete-orphan")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    record_id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("attendance_sessions.session_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.student_id"))
    punch_in = Column(DateTime)
    punch_out = Column(DateTime)
    present = Column(Boolean, default=False)
    face_verified = Column(Boolean, default=False)
    face_similarity = Column(Float)
    device_info = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    session = relationship("AttendanceSession", back_populates="attendance_records")
    student = relationship("Student", back_populates="attendance_records")

# ------------------------------------------------------------
# Legacy Models (Restored for main.py compatibility)
# ------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    enrollment_number = Column(String(64), unique=True, index=True)
    embedding = Column(Vector(512))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))

class Attendance(Base):
    __tablename__ = "attendance"
    
    # IST Generator
    def get_ist_time():
        return datetime.datetime.now(pytz.timezone('Asia/Kolkata'))

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Snapshot user details
    name = Column(String(255))
    enrollment_number = Column(String(64))
    
    timestamp = Column(DateTime, default=get_ist_time)

    user = relationship("User")
