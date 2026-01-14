from sqlalchemy import create_engine, text
from app.db import SQLALCHEMY_DATABASE_URL

def update_attendance_table():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        try:
            # Add name column
            try:
                conn.execute(text("ALTER TABLE attendance ADD COLUMN name VARCHAR(255);"))
                conn.commit()
                print("Added 'name' column.")
            except Exception as e:
                print(f"Skipping 'name': {e}")

            # Add enrollment_number column
            try:
                conn.execute(text("ALTER TABLE attendance ADD COLUMN enrollment_number VARCHAR(64);"))
                conn.commit()
                print("Added 'enrollment_number' column.")
            except Exception as e:
                print(f"Skipping 'enrollment_number': {e}")
                
            print("Migration complete.")
        except Exception as e:
             print(f"General Error: {e}")

if __name__ == "__main__":
    update_attendance_table()
