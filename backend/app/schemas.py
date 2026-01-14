from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .models import FacultyCategory, TeachingRank, NonTeachingRole, EnrollmentType, EnrollmentStatus

class DepartmentBase(BaseModel):
    code: str
    name: str
    head_faculty_id: Optional[int] = None

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    dept_id: int

    class Config:
        orm_mode = True

class ProgramBase(BaseModel):
    code: str
    name: str
    dept_id: int
    duration_years: Optional[int] = 4
    total_semesters: Optional[int] = 8

class ProgramCreate(ProgramBase):
    pass

class Program(ProgramBase):
    program_id: int

    class Config:
        orm_mode = True

class StudentBase(BaseModel):
    enrollment_number: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    enrollment_type: EnrollmentType
    program_id: Optional[int] = None
    admission_year: Optional[int] = None

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    student_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class FacultyBase(BaseModel):
    employee_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    dept_id: Optional[int] = None
    category: FacultyCategory
    designation: Optional[str] = None
    teaching_rank: Optional[TeachingRank] = None
    non_teaching_role: Optional[NonTeachingRole] = None

class FacultyCreate(FacultyBase):
    pass

class Faculty(FacultyBase):
    faculty_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class SubjectBase(BaseModel):
    code: str
    name: str
    dept_id: int
    credits: Optional[int] = 3
    is_elective: Optional[bool] = False

class SubjectCreate(SubjectBase):
    pass

class Subject(SubjectBase):
    subject_id: int

    class Config:
        orm_mode = True

class LocationBase(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    location_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class OfferingCreate(BaseModel):
    subject_id: int
    faculty_id: Optional[int] = None
    semester: int
    academic_year: int
    batch: Optional[str] = None

class CourseOffering(OfferingCreate):
    offering_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class EnrollmentBase(BaseModel):
    student_id: int
    offering_id: int
    status: Optional[str] = "active"

class EnrollmentCreate(EnrollmentBase):
    pass

class Enrollment(EnrollmentBase):
    enrollment_id: int
    enrolled_on: datetime

    class Config:
        orm_mode = True

class AttendanceSessionBase(BaseModel):
    offering_id: int
    scheduled_start: datetime
    scheduled_end: Optional[datetime] = None
    verify_face: Optional[bool] = True
    created_by_faculty: Optional[int] = None

class AttendanceSessionCreate(AttendanceSessionBase):
    pass

class AttendanceSession(AttendanceSessionBase):
    session_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class AttendanceRecordBase(BaseModel):
    session_id: int
    student_id: int
    punch_in: Optional[datetime] = None
    present: Optional[bool] = False
    face_verified: Optional[bool] = False
    face_similarity: Optional[float] = None

class AttendanceRecordCreate(AttendanceRecordBase):
    pass

class AttendanceRecord(AttendanceRecordBase):
    record_id: int
    created_at: datetime

    class Config:
        orm_mode = True

# ------------------------------------------------------------
# Legacy Schemas (Restored for main.py compatibility)
# ------------------------------------------------------------

class UserBase(BaseModel):
    name: str
    enrollment_number: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime
    # embedding is internal, usually not exposed in Pydantic unless needed
    
    class Config:
        orm_mode = True

class AdminBase(BaseModel):
    username: str

class AdminCreate(AdminBase):
    password: str

class AdminLogin(BaseModel):
    username: str
    password: str

class Admin(AdminBase):
    id: int

    class Config:
        orm_mode = True

class AttendanceBase(BaseModel):
    user_id: int

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int
    timestamp: datetime
    user: User

    class Config:
        orm_mode = True
