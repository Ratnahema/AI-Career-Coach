
from app.rag_engine import store_documents, retrieve_documents

resume_text = """
I am a Computer Science graduate.
I have knowledge of Python, Java, SQL and Machine Learning.
I have worked on data analysis using Pandas and NumPy.
I have created dashboards using Power BI.
I have experience with NLP, Generative AI and RAG.
"""

print("Step 1: Storing resume chunks in Supabase...")

count = store_documents(
    resume_text,
    "resume"
)

print(f"Successfully stored {count} chunks.")

print("\nStep 2: Retrieving relevant resume chunks...")

results = retrieve_documents(
    "What programming languages and data analysis skills does the candidate have?",
    doc_type="resume",
    k=5
)

print("\nRetrieved Results:")

for result in results:
    print("\nContent:", result["content"])
    print("Similarity:", round(result["similarity"], 4))

print("\nRAG database test completed!")
