
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is missing from .env")

client = Groq(api_key=api_key)

try:
    models = client.models.list()

    print("Groq API connection successful!")
    print("\nAvailable models:\n")

    for model in models.data:
        print(model.id)

except Exception as error:
    print("Groq connection failed:")
    print(error)
