
import os
import psycopg

from dotenv import load_dotenv
from pgvector.psycopg import register_vector
from pgvector import Vector
from fastembed import TextEmbedding
from langchain_text_splitters import RecursiveCharacterTextSplitter
from psycopg.types.json import Jsonb

load_dotenv()

DATABASE_URL = os.getenv("SUPABASE_DB_URL")

# Load the embedding model locally instead of using paid Hugging Face API
_embedding_model = None


def get_embedding_model():
    global _embedding_model

    if _embedding_model is None:
        _embedding_model = TextEmbedding(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

    return _embedding_model


# Split resume and job description into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150,
    separators=["\n\n", "\n", ".", " ", ""]
)


def embed_texts(texts):
    """Generate 384-dimensional embeddings locally using FastEmbed."""

    if not texts:
        return []

    model = get_embedding_model()

    vectors = list(model.embed(texts))

    all_vectors = [vector.tolist() for vector in vectors]

    for vector in all_vectors:
        if len(vector) != 384:
            raise ValueError(
                f"Expected 384 embedding dimensions, got {len(vector)}."
            )

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
