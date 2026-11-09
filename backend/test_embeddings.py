
from app.rag_engine import embeddings

print("Loading Hugging Face embedding model...")

text = "Python, SQL, Machine Learning and Data Analysis"

vector = embeddings.embed_query(text)

print("\nEmbedding model loaded successfully!")
print("Vector dimensions:", len(vector))
print("First 5 values:", vector[:5])

if len(vector) == 384:
    print("\nSUCCESS: Expected 384 dimensions.")
else:
    print("\nERROR: Unexpected vector dimensions.")
