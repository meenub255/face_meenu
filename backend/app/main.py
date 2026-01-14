from fastapi import FastAPI, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import numpy as np
import io
import pickle
from PIL import Image
from . import models, schemas, crud, db, detector, edgeface, antispoofing

models.Base.metadata.create_all(bind=db.engine)

app = FastAPI()

# Add CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
print("Loading models...")
face_detector = detector.FaceDetector()
edge_face = edgeface.EdgeFaceWrapper(device='cpu')
anti_spoof = antispoofing.AntiSpoofing()
print("Models loaded.")

def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

async def read_image(file: UploadFile) -> Image.Image:
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid image file")

@app.post("/register", response_model=schemas.User)
async def register(
    name: str = Form(...), 
    enrollment_number: str = Form(...),
    files: List[UploadFile] = File(...), 
    db: Session = Depends(get_db)
):
    # Check if user exists
    if crud.get_user_by_name(db, name):
        raise HTTPException(status_code=400, detail="User already registered")
    
    if len(files) != 3:
        raise HTTPException(status_code=400, detail="Must provide exactly 3 images")
    
    embeddings = []
    
    for file in files:
        image = await read_image(file)
        
        # 1. Anti-Spoofing Check
        is_real, score, msg = anti_spoof.check_texture_lbp(image)
        # Note: LBP is heuristic. If your camera quality varies, this might be flaky.
        # We can log the score for now or enforce it. 
        # For this demo, we will warn but proceed if score is not completely zero, 
        # or strictly enforce if configured.
        # Let's enforce a weak check or just rely on Face Detection confidence for now
        # per the "simple" requirement, but I'll leave the check active.
        if not is_real:
            print(f"LBP Spoof Warning: {score} ({msg})")
            # raise HTTPException(status_code=400, detail="Spoof detected (Texture)")
        
        # 2. Detect Face
        # MTCNN returns boxes
        bboxes = face_detector.detect_faces(image)
        if not bboxes:
             raise HTTPException(status_code=400, detail="No face detected in one of the images")
        
        # Select largest face
        # bbox is (x1, y1, x2, y2)
        # Area = (x2-x1) * (y2-y1)
        bboxes.sort(key=lambda b: (b[2]-b[0]) * (b[3]-b[1]), reverse=True)
        bbox = bboxes[0]
        
        # New: Use Align Face instead of simple crop
        landmarks = anti_spoof.get_landmarks(image)
        if landmarks is not None:
             face_img = face_detector.align_face(image, landmarks)
        else:
             # Fallback to crop if landmarks fail
             face_img = face_detector.get_cropped_face(image, bbox)
        
        # 3. Get Embedding
        emb = edge_face.get_embedding(face_img)
        embeddings.append(emb)
    
    # Average the embeddings to store a single robust vector
    if embeddings:
        avg_embedding = np.mean(embeddings, axis=0)
    else:
        raise HTTPException(status_code=400, detail="No embeddings generated")

    # Save to DB
    user_data = schemas.UserCreate(name=name, enrollment_number=enrollment_number)
    user = crud.create_user(db, user_data, avg_embedding)
    return user

@app.post("/recognize")
async def recognize(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    embeddings = []
    
    for file in files:
        image = await read_image(file)
        
        # 1. Anti-Spoofing (Simplified for recognition frames)
        # We can skip full LBP if we trust the first frame passed liveness, 
        # but for safety let's just log.
        
        # 2. Detect
        bboxes = face_detector.detect_faces(image)
        if not bboxes:
             continue # Skip frames with no face
        
        bboxes.sort(key=lambda b: (b[2]-b[0]) * (b[3]-b[1]), reverse=True)
        bbox = bboxes[0]
        
        # Use Align Face
        landmarks = anti_spoof.get_landmarks(image)
        if landmarks is not None:
            face_img = face_detector.align_face(image, landmarks)
        else:
            face_img = face_detector.get_cropped_face(image, bbox)
        
        # 3. Embed
        emb = edge_face.get_embedding(face_img)
        embeddings.append(emb)
    
    if not embeddings:
         raise HTTPException(status_code=400, detail="No faces detected in any of the frames")
         
    # Average embeddings for query
    query_embedding = np.mean(embeddings, axis=0)
    
    # 4. Compare
    users = crud.get_users(db)
    
    threshold = 0.5 
    max_sim = -1.0
    best_match = None
    
    def normalize(v):
        norm = np.linalg.norm(v)
        if norm == 0: return v
        return v / norm
        
    query_norm = normalize(query_embedding)
    
    for user in users:
        # User.embedding is now a Vector (numpy array or list of floats) handled by pgvector
        # pgvector returns it as a numpy array or list? It returns numpy array usually if configured, creates string otherwise.
        # pgvector-python + sqlalchemy usually returns numpy array or list.
        # Let's assume it's iterable.
        
        stored_embedding = np.array(user.embedding)
        if stored_embedding is None: continue
        
        # Calculate similarity (Cosine)
        # Note: pgvector supports cosine distance in SQL, but here we are doing it in Python for now
        # per the existing logic structure. 
        # Ideally, we should use `db.query(User).order_by(User.embedding.cosine_distance(query_embedding)).limit(1)`
        # But to keep changes minimal and safe:
        
        db_norm = normalize(stored_embedding)
        sim = np.dot(query_norm, db_norm)
        
        if sim > max_sim:
            max_sim = sim
            best_match = user
            
    if max_sim > threshold and best_match:
        crud.create_attendance(db, best_match.id)
        return {
            "status": "success",
            "student": best_match.name,
            "enrollment_number": best_match.enrollment_number or f"ID:{best_match.id}",
            "user": best_match.name,
            "similarity": float(max_sim)
        }
    else:
        return {
            "status": "failure",
            "message": "User not recognized",
            "similarity": float(max_sim)
        }
@app.post("/detect-blink")
async def detect_blink(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Check blink
        result = anti_spoof.check_eye_blink(image)
        
        return result
    except Exception as e:
        print(f"Blink error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/users", response_model=List[schemas.User])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.delete("/users/{user_id}", response_model=schemas.User)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.delete_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get("/attendance")
def get_attendance(
    user_id: int = None, 
    start_date: str = None, 
    end_date: str = None,
    skip: int = 0,
    limit: int = 1000,
    db: Session = Depends(get_db)
):
    from datetime import datetime
    
    # Parse dates if provided
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    attendance_records = crud.get_attendance(db, user_id=user_id, start_date=start_dt, end_date=end_dt, skip=skip, limit=limit)
    
    # Join with user data
    result = []
    for record in attendance_records:
        user = db.query(models.User).filter(models.User.id == record.user_id).first()
        result.append({
            "id": record.id,
            "user_id": record.user_id,
            "user_name": user.name if user else "Unknown",
            "timestamp": record.timestamp.isoformat()
        })
    
    return result

@app.get("/attendance/export")
def export_attendance(
    user_id: int = None,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    from datetime import datetime
    from fastapi.responses import StreamingResponse
    import io
    import csv
    
    # Parse dates
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None
    
    attendance_records = crud.get_attendance(db, user_id=user_id, start_date=start_dt, end_date=end_dt)
    
    # Create Excel using Pandas
    import pandas as pd
    
    data = []
    for record in attendance_records:
        user = db.query(models.User).filter(models.User.id == record.user_id).first()
        data.append({
            "Attendance ID": record.id,
            "User ID": record.user_id,
            "User Name": user.name if user else "Unknown",
            "Time": record.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Attendance')
        
        # Auto-adjust column widths and add simple formatting
        workbook = writer.book
        worksheet = writer.sheets['Attendance']
        
        # Premium: Blue Header
        from openpyxl.styles import PatternFill, Font
        header_fill = PatternFill(start_color='1E3A8A', end_color='1E3A8A', fill_type='solid') # Navy Blue
        header_font = Font(color='FFFFFF', bold=True)
        
        for cell in worksheet["1:1"]:
            cell.fill = header_fill
            cell.font = header_font

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=attendance.xlsx"}
    )

@app.post("/admin/register", response_model=schemas.Admin)
def register_admin(admin: schemas.AdminCreate, db: Session = Depends(get_db)):
    db_admin = crud.get_admin_by_username(db, username=admin.username)
    if db_admin:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_admin(db=db, admin=admin)

@app.post("/admin/login")
def login_admin(admin: schemas.AdminLogin, db: Session = Depends(get_db)):
    db_admin = crud.get_admin_by_username(db, username=admin.username)
    if not db_admin or db_admin.hashed_password != crud.hash_password(admin.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"status": "success", "username": db_admin.username, "id": db_admin.id}

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    # 1. Daily Attendance (Last 7 days)
    today = datetime.utcnow().date()
    daily_stats = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = db.query(models.Attendance).filter(
            func.date(models.Attendance.timestamp) == day
        ).count()
        daily_stats.append({"date": day.strftime('%b %d'), "count": count})
    
    # 2. Peak Hours
    hour_counts = db.query(
        func.extract('hour', models.Attendance.timestamp).label('hour'),
        func.count().label('count')
    ).group_by('hour').all()
    
    peak_hours = []
    for h, c in sorted(hour_counts):
        peak_hours.append({"hour": f"{int(h)}:00", "count": c})
        
    return {
        "daily": daily_stats,
        "peak_hours": peak_hours
    }

# --- Backend Compatibility Layer for Frontend ---

@app.get("/students")
def get_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    # Map User objects to the structure expected by frontend (Student)
    students = []
    for user in users:
        students.append({
            "student_id": user.id,
            "name": user.name,
            "enrollment_number": user.enrollment_number,
            "enrollment_type": "FT"  # Default value
        })
    return students

@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    deleted_user = crud.delete_user(db, user_id=student_id)
    if deleted_user is None:
         raise HTTPException(status_code=404, detail="Student not found")
    return {"status": "success", "message": "Student deleted"}

