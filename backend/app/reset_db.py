import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ADMIN_DB = os.getenv("POSTGRES_ADMIN_DB", "postgres")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

# Extract DB name safely
DB_NAME = DATABASE_URL.rsplit("/", 1)[-1]

def reset_database():
    print("⚠️  WARNING: This will DROP the entire database:", DB_NAME)
    confirm = input("Type 'DROP' to continue: ")

    if confirm != "DROP":
        print("Aborted.")
        return

    # Connect to admin DB (NOT attendance_db)
    admin_url = DATABASE_URL.replace(f"/{DB_NAME}", f"/{ADMIN_DB}")

    conn = psycopg2.connect(admin_url)
    conn.autocommit = True
    cur = conn.cursor()

    print(f"Dropping database '{DB_NAME}'...")

    # Terminate active connections
    cur.execute(f"""
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = %s AND pid <> pg_backend_pid();
    """, (DB_NAME,))

    cur.execute(f'DROP DATABASE IF EXISTS "{DB_NAME}";')

    cur.close()
    conn.close()

    print("✅ Database dropped successfully.")

if __name__ == "__main__":
    reset_database()
