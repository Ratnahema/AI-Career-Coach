
import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("SUPABASE_DB_URL")

if not DATABASE_URL:
    raise ValueError("SUPABASE_DB_URL is missing from the .env file")

try:
    with psycopg.connect(DATABASE_URL, sslmode="require") as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            result = cursor.fetchone()

            print("Supabase connection successful!")
            print("Database version:", result[0])

except Exception as error:
    print("Database connection failed.")
    print("Error:", error)
