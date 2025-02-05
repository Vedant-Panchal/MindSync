# NeuralNotes

## Problem Statement

Existing journaling apps lack personalized insights and automated analysis of user entries, forcing users to manually track patterns in their thoughts, moods, and behaviors. This project aims to build an AI-driven journaling platform that:

- Automatically analyzes journal entries for mood, topics, and behavioral trends.
- Provides actionable insights through interactive dashboards.
- Simplifies journaling with smart features like speech-to-text, auto-drafts, and AI-generated summaries.

## Key Requirements

### Functional Requirements

- **User Authentication**: Secure signup/login with OAuth (Google/Apple).
- **Journal Input**:
    - Free-form text or speech-to-text entries.
    - Auto-save drafts, submit at midnight (user’s time zone).
- **Search & Filter**:
    - Search by date, mood, or custom tags (e.g., "work", "family").
    - Semantic search using embeddings (e.g., "stressful days").
- **Dashboard**:
    - Mood heatmap, keyword frequency trends, personality insights.
    - AI-generated "Story of Your Life" from past entries.
- **Themes & Customization**: Light/dark mode, visual themes.
- **CRUD Operations**: Edit/delete entries, pin favorites.

### Non-Functional Requirements

- **Scalability**: Support 10k+ users with ~500 entries/user.
- **Security**: End-to-end encryption for journal data.
- **Performance**: <2s latency for AI-generated insights.
- **Usability**: Intuitive UI with minimal onboarding friction.

## Tech Stack

### Frontend

- **Framework**: React.js + TypeScript (or Flutter for cross-platform).
- **Libraries**:
    - `react-speech-recognition` for speech-to-text.
    - `react-heatmap-grid` for GitHub-style streaks.
    - `Chart.js` for data visualization.

### Backend

- **Framework**: Node.js (Express) / Python (FastAPI).
- **Database**:
    - Primary: PostgreSQL (structured data: users, journals, tags).
    - Vector DB: Pinecone (semantic search embeddings).
- **APIs**: RESTful endpoints with JWT authentication.

### AI/ML Components

- **NLP**: Hugging Face Transformers (`sentiment-roberta`) for mood analysis.
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional vectors).
- **Story Generation**: OpenAI GPT-3.5/4 with RAG (Retrieval-Augmented Generation).

### DevOps

- **Hosting**: AWS EC2 (backend), Vercel (frontend).
- **CI/CD**: GitHub Actions.
- **Monitoring**: Prometheus + Grafana.