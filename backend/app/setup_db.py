import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ADMIN_DB = os.getenv("POSTGRES_ADMIN_DB", "postgres")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set")

DB_NAME = DATABASE_URL.rsplit("/", 1)[-1]
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "schema.sql")

if not os.path.exists(SCHEMA_FILE):
    raise RuntimeError("schema.sql not found")

def setup_database():
    print(f"Creating database '{DB_NAME}'...")

    admin_url = DATABASE_URL.replace(f"/{DB_NAME}", f"/{ADMIN_DB}")


    # 1. Create database (Drop if exists)
    conn = psycopg2.connect(admin_url)
    conn.autocommit = True
    cur = conn.cursor()

    # Terminate existing connections
    cur.execute(f"""
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '{DB_NAME}'
        AND pid <> pg_backend_pid();
    """)

    cur.execute(f'DROP DATABASE IF EXISTS "{DB_NAME}";')
    cur.execute(f'CREATE DATABASE "{DB_NAME}";')

    cur.close()
    conn.close()

    print("Database recreated.")

    # 2. Apply schema
    print("Applying schema...")

    with open(SCHEMA_FILE, "r") as f:
        schema_sql = f.read()

    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()

    cur.execute(schema_sql)

    cur.close()
    conn.close()

    print("✅ Schema applied successfully.")

if __name__ == "__main__":
    setup_database()
