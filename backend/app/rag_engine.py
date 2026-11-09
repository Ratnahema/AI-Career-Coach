
import os
import psycopg

from dotenv import load_dotenv
from pgvector.psycopg import register_vector
from pgvector import Vector
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from psycopg.types.json import Jsonb

load_dotenv()

DATABASE_URL = os.getenv("SUPABASE_DB_URL")

# Hugging Face embedding model
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Split resume and job description into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150,
    separators=["\n\n", "\n", ".", " ", ""]
)


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
    """
    Store document chunks for one authenticated user.

    Older documents of the same type are deleted only
    for this user. Other users' documents are untouched.
    """

    if not user_id:
        raise ValueError("Authenticated user ID is required.")

    chunks = text_splitter.split_text(text)

    if not chunks:
        raise ValueError("No text available to store.")

    vectors = embeddings.embed_documents(chunks)

    with get_db_connection() as connection:
        with connection.cursor() as cursor:

            # Delete only this user's older documents
            # of the same document type.
            cursor.execute(
                """
                DELETE FROM career_documents
                WHERE user_id = %s
                  AND metadata->>'doc_type' = %s
                """,
                (user_id, doc_type)
            )

            # Store chunks with their owner's user ID.
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
    """
    Retrieve document chunks belonging only to one user.
    """

    if not user_id:
        raise ValueError("Authenticated user ID is required.")

    query_vector = embeddings.embed_query(query)

    metadata_filter = (
        {"doc_type": doc_type}
        if doc_type
        else {}
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
