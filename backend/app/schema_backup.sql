-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;

-- ------------------------------------------------------------
-- Types
-- ------------------------------------------------------------
CREATE TYPE faculty_category AS ENUM ('teaching','non_teaching');

CREATE TYPE teaching_rank AS ENUM (
  'professor',
  'associate_professor',
  'assistant_professor',
  'lecturer',
  'senior_lecturer'
);

CREATE TYPE non_teaching_role AS ENUM (
  'administrative',
  'technical',
  'support',
  'library',
  'lab_staff'
);

-- ------------------------------------------------------------
-- Core tables
-- ------------------------------------------------------------

-- STUDENTS
CREATE TABLE IF NOT EXISTS students (
  student_id SERIAL PRIMARY KEY,
  enrollment_number VARCHAR(64) NOT NULL UNIQUE, -- university enrollment id
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(32),
  enrollment_type VARCHAR(8) NOT NULL CHECK (enrollment_type IN ('FT','PT')), -- FT = full-time, PT = part-time
  program_id INTEGER, -- FK to programs (nullable until enrollment is assigned)
  admission_year SMALLINT,
  embedding vector(512), -- face embedding
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- FACULTY
CREATE TABLE IF NOT EXISTS faculty (
  faculty_id SERIAL PRIMARY KEY,
  employee_number VARCHAR(64) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(32),
  category faculty_category NOT NULL,
  teaching_rank teaching_rank,            -- used when category='teaching'
  non_teaching_role non_teaching_role,    -- used when category='non_teaching'
  department_id INTEGER,
  embedding vector(512), -- face embedding (optional)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
  CHECK (
    (category = 'teaching' AND teaching_rank IS NOT NULL AND non_teaching_role IS NULL)
    OR
    (category = 'non_teaching' AND non_teaching_role IS NOT NULL AND teaching_rank IS NULL)
  )
);

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  department_id SERIAL PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL
);

-- PROGRAMS / COURSES (e.g., MBA, BTech)
CREATE TABLE IF NOT EXISTS programs (
  program_id SERIAL PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  total_semesters SMALLINT DEFAULT 2
);

-- SUBJECTS (atomic courses taught in a semester)
CREATE TABLE IF NOT EXISTS subjects (
  subject_id SERIAL PRIMARY KEY,
  program_id INTEGER NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  semester SMALLINT NOT NULL,
  credits SMALLINT DEFAULT 3,
  UNIQUE(program_id, code)
);

-- CLASS / COURSE_OFFERING ties a subject to an academic term and possibly a faculty
CREATE TABLE IF NOT EXISTS course_offerings (
  offering_id SERIAL PRIMARY KEY,
  subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  academic_year VARCHAR(16) NOT NULL,  -- e.g., '2025-26'
  term VARCHAR(16) NOT NULL,           -- e.g., 'Semester 1'
  faculty_id INTEGER REFERENCES faculty(faculty_id) ON DELETE SET NULL,
  location_id INTEGER REFERENCES locations(location_id) ON DELETE SET NULL,
  max_capacity INTEGER,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
  UNIQUE (subject_id, academic_year, term)
);

-- LOCATIONS (campus rooms, with spatial point)
CREATE TABLE IF NOT EXISTS locations (
  location_id SERIAL PRIMARY KEY,
  code VARCHAR(64) UNIQUE,
  name VARCHAR(255),
  building VARCHAR(128),
  floor VARCHAR(32),
  -- PostGIS point (longitude, latitude). Use SRID 4326.
  geom geometry(Point, 4326),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- ENROLLMENTS (students in program / offering)
CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  offering_id INTEGER NOT NULL REFERENCES course_offerings(offering_id) ON DELETE CASCADE,
  enrolled_on TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
  status VARCHAR(16) DEFAULT 'active' CHECK (status IN ('active','dropped','completed')),
  UNIQUE (student_id, offering_id)
);

-- ATTENDANCE SESSION (a specific class/lecture/lab instance)
CREATE TABLE IF NOT EXISTS attendance_sessions (
  session_id SERIAL PRIMARY KEY,
  offering_id INTEGER NOT NULL REFERENCES course_offerings(offering_id) ON DELETE CASCADE,
  scheduled_start TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITHOUT TIME ZONE,
  verify_face BOOLEAN DEFAULT TRUE, -- whether face verification is required for this session
  location_geom geometry(Point,4326), -- optional recorded location of the session (where the session was taken)
  location_accuracy_meters REAL,      -- optional accuracy
  created_by_faculty INTEGER REFERENCES faculty(faculty_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
  notes TEXT
);

-- ATTENDANCE RECORDS (actual punches/records for a person for a session)
CREATE TABLE IF NOT EXISTS attendance_records (
  record_id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES attendance_sessions(session_id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
  punch_in TIMESTAMP WITHOUT TIME ZONE,
  punch_out TIMESTAMP WITHOUT TIME ZONE,
  present BOOLEAN DEFAULT FALSE,
  face_verified BOOLEAN DEFAULT FALSE, -- whether face verification succeeded
  face_similarity REAL,                -- similarity score if face verification done
  device_info VARCHAR(255),            -- optional device identifier (e.g., mobile_id, kiosk_id)
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
  CHECK (student_id IS NOT NULL) -- currently only students recorded here. If you want faculty attendance, add faculty_id and relevant constraints.
);

-- Optionally: faculty_attendance if you want to track faculty punches separately
CREATE TABLE IF NOT EXISTS faculty_attendance_records (
  record_id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES attendance_sessions(session_id) ON DELETE CASCADE,
  faculty_id INTEGER REFERENCES faculty(faculty_id) ON DELETE CASCADE,
  punch_in TIMESTAMP WITHOUT TIME ZONE,
  punch_out TIMESTAMP WITHOUT TIME ZONE,
  present BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- ------------------------------------------------------------
-- Indexes (including vector index examples)
-- ------------------------------------------------------------

-- Common indexes
CREATE INDEX IF NOT EXISTS ix_students_enrollment_number ON students (enrollment_number);
CREATE INDEX IF NOT EXISTS ix_students_name ON students (name);
CREATE INDEX IF NOT EXISTS ix_faculty_employee_number ON faculty (employee_number);
CREATE INDEX IF NOT EXISTS ix_course_offerings_subject ON course_offerings (subject_id);
CREATE INDEX IF NOT EXISTS ix_enrollments_student_id ON enrollments (student_id);
CREATE INDEX IF NOT EXISTS ix_enrollments_offering_id ON enrollments (offering_id);
CREATE INDEX IF NOT EXISTS ix_attendance_sessions_offering_id ON attendance_sessions (offering_id);
CREATE INDEX IF NOT EXISTS ix_attendance_records_session_id ON attendance_records (session_id);
CREATE INDEX IF NOT EXISTS ix_attendance_records_student_id ON attendance_records (student_id);

-- PostGIS spatial indexes
CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_location_geom ON attendance_sessions USING GIST (location_geom);

-- pgvector indexes for nearest-neighbor search (example using ivfflat)
-- NOTE: choose appropriate operator class: vector_l2_ops (L2 distance) or vector_cosine_ops for cosine similarity
-- Example (L2):
CREATE INDEX IF NOT EXISTS idx_students_embedding_ivfflat ON students USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_faculty_embedding_ivfflat ON faculty USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- For small datasets you can also use a simple GIN or none. If using ivfflat, ensure you run: SELECT vector_cosine_distance(...) or appropriate functions and run ANALYZE, etc.

-- ------------------------------------------------------------
-- Views for reporting
-- ------------------------------------------------------------

-- 1) Student attendance summary: total sessions vs attended sessions (overall)
CREATE OR REPLACE VIEW vw_student_attendance_summary AS
SELECT
  s.student_id,
  s.enrollment_number,
  s.name,
  COUNT(DISTINCT asess.session_id) AS total_sessions_available,
  COUNT(ar.record_id) FILTER (WHERE ar.present = TRUE) AS attended_sessions,
  CASE WHEN COUNT(DISTINCT asess.session_id) = 0 THEN 0
       ELSE ROUND(100.0 * (COUNT(ar.record_id) FILTER (WHERE ar.present = TRUE))::numeric / COUNT(DISTINCT asess.session_id), 2)
  END AS attendance_percentage
FROM students s
LEFT JOIN enrollments e ON e.student_id = s.student_id
LEFT JOIN attendance_sessions asess ON asess.offering_id = e.offering_id
LEFT JOIN attendance_records ar ON ar.session_id = asess.session_id AND ar.student_id = s.student_id
GROUP BY s.student_id, s.enrollment_number, s.name;

-- 2) Session attendance detail (who attended / counts)
CREATE OR REPLACE VIEW vw_session_attendance_detail AS
SELECT
  asess.session_id,
  co.offering_id,
  sub.subject_id,
  sub.name AS subject_name,
  co.academic_year,
  co.term,
  asess.scheduled_start,
  asess.scheduled_end,
  COUNT(ar.record_id) FILTER (WHERE ar.present = TRUE) AS present_count,
  COUNT(ar.record_id) AS total_records
FROM attendance_sessions asess
JOIN course_offerings co ON co.offering_id = asess.offering_id
JOIN subjects sub ON sub.subject_id = co.subject_id
LEFT JOIN attendance_records ar ON ar.session_id = asess.session_id
GROUP BY asess.session_id, co.offering_id, sub.subject_id, sub.name, co.academic_year, co.term, asess.scheduled_start, asess.scheduled_end;

-- ------------------------------------------------------------
-- Permissions / small helper constraints (examples)
-- ------------------------------------------------------------

-- Ensure subject semester is within program total_semesters (optional)
-- This requires a function or trigger for full enforcement; a simple check can't reference another table.
-- Example enforcement via trigger is left out for simplicity.

-- ------------------------------------------------------------
-- Example helper queries (commented)
-- ------------------------------------------------------------
-- -- Find nearest student embedding to a probe embedding (:probe)
-- -- SELECT student_id, name, embedding <-> :probe AS distance
-- -- FROM students ORDER BY embedding <-> :probe LIMIT 5;

-- ------------------------------------------------------------
-- End of schema
-- ------------------------------------------------------------
