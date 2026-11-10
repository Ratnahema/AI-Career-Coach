# CareerMind AI – Intelligent RAG-Based Career Guidance Platform

An AI-powered career guidance platform that analyzes resumes, identifies skill gaps, recommends suitable career paths, and generates personalized career development reports using Retrieval-Augmented Generation (RAG).

## Overview

CareerMind AI helps students, fresh graduates, and job seekers make informed career decisions through personalized AI assistance. Users can upload their resumes, explore suitable job roles, identify missing skills, interact with an AI career chatbot, and generate downloadable career assessment reports.

The application combines Large Language Models (LLMs), semantic search, vector embeddings, and full-stack web development to deliver context-aware career guidance.

## Key Features

- **User Authentication:** Secure registration and login using Supabase Auth.
- **Resume Analysis:** Upload PDF resumes and extract relevant professional information.
- **AI Career Guidance:** Receive personalized career suggestions based on resume content.
- **RAG-Based Chatbot:** Ask question![Uploading image.png…]()
s and receive context-aware responses using retrieved resume information.
- **Skill Gap Analysis:** Identify missing technical skills and improvement areas.
- **Career Recommendations:** Discover suitable entry-level career opportunities.
- **Learning Roadmap:** Generate a personalized 12-week learning plan.
- **Career Report Generation:** Generate detailed reports covering 11 assessment sections.
- **PDF Download:** Download generated career reports.
- **Multi-User Support:** Maintain user-specific document handling and data separation.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, HTML, CSS |
| Backend | Python, FastAPI |
| LLM | Groq – GPT-OSS-20B |
| RAG Framework | LangChain |
| Embeddings | FastEmbed – all-MiniLM-L6-v2 |
| Vector Database | Supabase pgvector |
| Authentication | Supabase Auth |
| API Communication | REST API, Axios |
| Deployment | Vercel, Render |
| Version Control | Git, GitHub |

## System Architecture

1. **Authentication:** Users register and log in through Supabase Auth.
2. **Resume Upload:** The React frontend sends uploaded PDF resumes to the FastAPI backend.
3. **Text Extraction:** Resume content is extracted and prepared for processing.
4. **Document Chunking:** Extracted text is divided into smaller, manageable chunks.
5. **Embedding Generation:** FastEmbed converts document chunks into 384-dimensional vector embeddings.
6. **Vector Storage:** Embeddings and associated document information are stored in Supabase pgvector.
7. **Semantic Retrieval:** Relevant document chunks are retrieved based on the user's query.
8. **LLM Generation:** Groq GPT-OSS-20B generates personalized responses using the retrieved context.
9. **Report Generation:** The system produces structured career reports with downloadable output.

## RAG Workflow

```text
Resume PDF Upload
       |
       v
Text Extraction
       |
       v
Document Chunking
       |
       v
Embedding Generation
       |
       v
Supabase Vector Storage
       |
       v
User Query
       |
       v
Semantic Retrieval
       |
       v
Groq LLM
       |
       v
Personalized AI Response
```

## Career Assessment Report

The application generates a structured report containing 11 sections:

1. Professional Profile Summary
2. Technical Skills Assessment
3. Education, Internships and Certifications
4. Projects and Practical Experience
5. Candidate Strengths
6. Skill Gap Analysis
7. Recommended Career Opportunities
8. Personalized 12-Week Learning Roadmap
9. Three Project Recommendations
10. Five Interview Preparation Questions
11. Final Career Recommendations

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database and Authentication:** Supabase

### Live Application

[Open CareerMind AI](https://ai-career-coach-amber-two.vercel.app/)

### Backend API Documentation

[Explore API Documentation](https://ai-career-coach-2a65.onrender.com/docs)

## Environment Variables

Configure the following environment variables for local development.

### Backend

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_DB_URL=your_supabase_database_url
GROQ_API_KEY=your_groq_api_key
```

### Frontend

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

**Security:** Never commit API keys, database credentials, or private environment files to GitHub.

## Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_FOLDER
```

### 2. Backend Setup

```bash
python -m venv .venv
```

Activate the environment:

**Windows:**
```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure backend environment variables and start the server using the project's FastAPI entry point.

Example:

```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
```

Configure the frontend environment variables and start the application:

```bash
npm run dev
```

## Key Highlights

- Integrated Generative AI and Retrieval-Augmented Generation.
- Implemented 384-dimensional semantic embeddings.
- Developed a multi-user career guidance application.
- Integrated vector search with Supabase pgvector.
- Built an automated report-generation pipeline with 11 assessment sections.
- Deployed a full-stack application using cloud hosting platforms.

## Future Enhancements

- Job description and resume matching.
- ATS compatibility scoring.
- Live job portal integration.
- AI-powered mock interview simulations.
- LinkedIn profile analysis.
- Personalized course recommendations.

## Author

**Pabbineedi Ratna Hema**  
B.Tech – Computer Science and Engineering, 2026 Graduate

[LinkedIn](https://linkedin.com/in/pabbineedi-ratna-hema-78a849297/) | [GitHub](https://github.com/Ratnahema)

---

*CareerMind AI – Turning Resume Insights into Smarter Career Decisions.*
