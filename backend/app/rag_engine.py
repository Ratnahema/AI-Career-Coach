
import os
import psycopg

from dotenv import load_dotenv
from pgvector.psycopg import register_vector
from pgvector import Vector
from huggingface_hub import InferenceClient
from langchain_text_splitters import RecursiveCharacterTextSplitter
from psycopg.types.json import Jsonb

load_dotenv()

DATABASE_URL = os.getenv("SUPABASE_DB_URL")
HF_TOKEN = os.getenv("HF_TOKEN")

HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

hf_client = (
    InferenceClient(provider="hf-inference", token=HF_TOKEN)
    if HF_TOKEN else None
)

# Split resume and job description into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150,
    separators=["\n\n", "\n", ".", " ", ""]
)


def embed_texts(texts):
    """Generate 384-dimensional embeddings using Hugging Face remotely."""

    if not HF_TOKEN or not hf_client:
        raise ValueError("HF_TOKEN is missing from environment variables.")

    all_vectors = []

    # Send smaller batches to the hosted API
    for start in range(0, len(texts), 16):
        batch = texts[start:start + 16]

        result = hf_client.feature_extraction(
            batch,
            model=HF_MODEL
        )

        vectors = result.tolist() if hasattr(result, "tolist") else result

        # Handle a single returned vector
        if vectors and isinstance(vectors[0], (int, float)):
            vectors = [vectors]

        for vector in vectors:
            if len(vector) != 384:
                raise ValueError(
                    f"Expected 384 embedding dimensions, got {len(vector)}."
                )

            all_vectors.append(vector)

    if len(all_vectors) != len(texts):
        raise ValueError("Embedding count does not match input text count.")

    return all_vectors


def get_db_connection():
    if not DATABASE_URL:
        raise ValueError("SUPABASE_DB_URL is missing.")

    connection = psycopg.connect(
        DATABASE_URL,
        sslmode="require"
    )

    register_vector(connection)
    return connection


def store_documents(text, doc_type, user_id):
    if not user_id:
        raise ValueError("Authenticated user ID is required.")

    chunks = text_splitter.split_text(text)

    if not chunks:
        raise ValueError("No text available to store.")

    vectors = embed_texts(chunks)

    with get_db_connection() as connection:
        with connection.cursor() as cursor:

            cursor.execute(
                """
                DELETE FROM career_documents
                WHERE user_id = %s
                  AND metadata->>'doc_type' = %s
                """,
                (user_id, doc_type)
            )

            for chunk, vector in zip(chunks, vectors):
                cursor.execute(
                    """
                    INSERT INTO career_documents
                    (content, metadata, embedding, user_id)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        chunk,
                        Jsonb({"doc_type": doc_type}),
                        Vector(vector),
                        user_id
                    )
                )

    return len(chunks)


def retrieve_documents(query, user_id, doc_type=None, k=5):
    if not user_id:
        raise ValueError("Authenticated user ID is required.")

    query_vector = embed_texts([query])[0]

    metadata_filter = (
        {"doc_type": doc_type}
        if doc_type else {}
    )

    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    content,
                    metadata,
                    1 - (embedding <=> %s) AS similarity
                FROM career_documents
                WHERE user_id = %s
                  AND metadata @> %s
                ORDER BY embedding <=> %s
                LIMIT %s
                """,
                (
                    Vector(query_vector),
                    user_id,
                    Jsonb(metadata_filter),
                    Vector(query_vector),
                    k
                )
            )

            results = cursor.fetchall()

    return [
        {
            "content": row[1],
            "metadata": row[2],
            "similarity": float(row[3])
        }
        for row in results
    ]
