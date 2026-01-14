from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas
from ..db import get_db

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={404: {"description": "Not found"}},
)

# ------------------------------------------------------------
# Departments
# ------------------------------------------------------------
@router.post("/departments", response_model=schemas.Department)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    return crud.create_department(db=db, department=department)

@router.get("/departments", response_model=List[schemas.Department])
def read_departments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_departments(db, skip=skip, limit=limit)

@router.delete("/departments/{dept_id}", response_model=schemas.Department)
def delete_department(dept_id: int, db: Session = Depends(get_db)):
    db_dept = crud.delete_department(db, dept_id=dept_id)
    if not db_dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return db_dept

# ------------------------------------------------------------
# Programs
# ------------------------------------------------------------
@router.post("/programs", response_model=schemas.Program)
def create_program(program: schemas.ProgramCreate, db: Session = Depends(get_db)):
    return crud.create_program(db=db, program=program)

@router.get("/programs", response_model=List[schemas.Program])
def read_programs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_programs(db, skip=skip, limit=limit)

@router.delete("/programs/{program_id}", response_model=schemas.Program)
def delete_program(program_id: int, db: Session = Depends(get_db)):
    db_program = crud.delete_program(db, program_id=program_id)
    if not db_program:
        raise HTTPException(status_code=404, detail="Program not found")
    return db_program

# ------------------------------------------------------------
# Subjects
# ------------------------------------------------------------
@router.post("/subjects", response_model=schemas.Subject)
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    return crud.create_subject(db=db, subject=subject)

@router.get("/subjects", response_model=List[schemas.Subject])
def read_subjects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_subjects(db, skip=skip, limit=limit)

@router.delete("/subjects/{subject_id}", response_model=schemas.Subject)
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    db_subject = crud.delete_subject(db, subject_id=subject_id)
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return db_subject

# ------------------------------------------------------------
# Locations
# ------------------------------------------------------------
@router.post("/locations", response_model=schemas.Location)
def create_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    return crud.create_location(db=db, location=location)

@router.get("/locations", response_model=List[schemas.Location])
def read_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_locations(db, skip=skip, limit=limit)

@router.delete("/locations/{location_id}", response_model=schemas.Location)
def delete_location(location_id: int, db: Session = Depends(get_db)):
    db_loc = crud.delete_location(db, location_id=location_id)
    if not db_loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_loc

# ------------------------------------------------------------
# Faculty
# ------------------------------------------------------------
@router.post("/faculty", response_model=schemas.Faculty)
def create_faculty(faculty: schemas.FacultyCreate, db: Session = Depends(get_db)):
    return crud.create_faculty(db=db, faculty=faculty)

@router.get("/faculty", response_model=List[schemas.Faculty])
def read_faculty(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_faculty(db, skip=skip, limit=limit)

@router.delete("/faculty/{faculty_id}", response_model=schemas.Faculty)
def delete_faculty(faculty_id: int, db: Session = Depends(get_db)):
    db_fac = crud.delete_faculty(db, faculty_id=faculty_id)
    if not db_fac:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return db_fac

# ------------------------------------------------------------
# Course Offerings
# ------------------------------------------------------------
@router.post("/offerings", response_model=schemas.CourseOffering)
def create_offering(offering: schemas.OfferingCreate, db: Session = Depends(get_db)):
    return crud.create_offering(db=db, offering=offering)

@router.get("/offerings", response_model=List[schemas.CourseOffering])
def read_offerings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_offerings(db, skip=skip, limit=limit)

@router.delete("/offerings/{offering_id}", response_model=schemas.CourseOffering)
def delete_offering(offering_id: int, db: Session = Depends(get_db)):
    db_off = crud.delete_offering(db, offering_id=offering_id)
    if not db_off:
        raise HTTPException(status_code=404, detail="Offering not found")
    return db_off
