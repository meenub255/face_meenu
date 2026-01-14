from sqlalchemy import create_engine, text
from app.db import SQLALCHEMY_DATABASE_URL

def add_enrollment_number():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN enrollment_number VARCHAR(64);"))
            conn.commit()
            print("Successfully added enrollment_number column to users table.")
        except Exception as e:
            if "duplicate column name" in str(e):
                print("Column enrollment_number already exists.")
            else:
                print(f"Error adding column: {e}")

if __name__ == "__main__":
    add_enrollment_number()
