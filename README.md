# Attendance System – A React Approach

A modern, secure, and scalable university attendance management system built with React and Python, leveraging face recognition and location awareness to ensure accurate and tamper-resistant attendance tracking.

---

## Abstract

This project presents a reliable and efficient attendance system designed for academic institutions. By combining facial recognition, anti-spoofing mechanisms, and location verification, the system minimizes proxy attendance and manual errors.  
The backend is structured around a clean relational schema for students, faculty, courses, and sessions, while the frontend provides a responsive and intuitive user interface for daily academic operations.

---

## Key Features

- Face recognition-based attendance
- Anti-spoofing protection
- Location-aware attendance validation
- Student and faculty management
- Course and enrollment handling
- Attendance history and reports
- Fast and responsive React UI
- Dockerized deployment support

---

## Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- JavaScript (ES6+)

### Backend

- Python
- FastAPI
- Uvicorn
- Face recognition and anti-spoofing models
- PostgreSQL / SQL-based schema

### DevOps

- Docker and Docker Compose
- GitHub Actions (CI)
- ONNX model export support

---

## Project Structure (Compressed)

``` bash
├── backend/
│ ├── app/
│ │ ├── routes/ # API endpoints (users, enroll, recognize)
│ │ ├── models.py # Database models
│ │ ├── schemas.py # Pydantic schemas
│ │ ├── crud.py # DB operations
│ │ ├── main.py # FastAPI entry point
│ │ ├── antispoofing.py # Anti-spoofing logic
│ │ └── utils.py
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ │ ├── components/ # React UI components
│ │ ├── services/ # API services
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── package.json
│ └── vite.config.js
│
├── docker-compose.yml
├── Dockerfile
├── scripts/
│ └── export_edgeface_to_onnx.sh
└── README.md

```

Note: node_modules and generated files are intentionally excluded.

---

## Installation and Setup

### Backend Setup (Python)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:


``` bash
pip install -r requirements.txt
```

3. Run the backend server:
   
``` bash
uvicorn app.main:app --reload
```
Backend will be available at: http://localhost:8000

### Frontend Setup (React)
   
4. Navigate to the frontend directory:


``` bash
cd frontend
```
5. Install dependencies:

``` bash
npm install
```

### Start the development server:

``` bash
npm run dev
```

Frontend will be available at: http://localhost:5173

``` bash
[ React Frontend ]
        |
        v
[ FastAPI Backend ]
        |
        v
[ Face Recognition and Anti-Spoofing ]
        |
        v
[ SQL Database ]
```

### Security Considerations
- Face anti-spoofing to prevent photo and video attacks
- Location validation to avoid remote attendance
- Structured schema to maintain data integrity
- API-based separation of concerns

### Use Cases
- University lecture attendance
- Secure exam attendance tracking
- Faculty-led session monitoring
- Academic reporting and auditing

### Future Enhancements
- Mobile application support
- Cloud-based face model hosting
- Advanced analytics dashboard
- Real-time notifications
- Role-based access control (RBAC)