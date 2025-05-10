<h1 align="center" id="title">MindSync - AI Powered Journaling for Deeper Insights</h1>

<p id="description">MindSync is a modern journaling web app powered by AI. It helps users reflect write and grow through structured prompts mood tracking and intelligent summaries — all in a clean distraction-free interface. Designed with mental clarity and user experience in mind MindSync offers personalized insights through natural language processing.</p>

<p align="center"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&amp;logo=react&amp;logoColor=61DAFB" alt="shields"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&amp;logo=typescript&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&amp;logo=tailwind-css&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/ShadCN/UI-000000?style=for-the-badge&amp;logo=vercel&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/TanStack%20Router-EF4444?style=for-the-badge&amp;logo=reactrouter&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&amp;logo=react-query&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge&amp;logo=Zustand&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&amp;logo=fastapi&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/Python-3670A0?style=for-the-badge&amp;logo=python&amp;logoColor=ffdd54" alt="shields"><img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&amp;logo=redis&amp;logoColor=white" alt="shields"><img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&amp;logo=postgresql&amp;logoColor=white" alt="shields"></p>

<h2>Project Screenshots:</h2>
<p>Here are some screenshots of the project:</p>
<p>Landing Page</p>
<img src="/frontend/public/landing.jpeg" alt="landing_1" width="100%" height="100%/">
<p>Landing Page Section 2</p>
<img src="/frontend/public/landing_2.jpeg" alt="landing_2" width="100%" height="100%/">
<p>Landing Page Section 3</p>
<img src="/frontend/public/landing_3.jpeg" alt="landing_3" width="100%" height="100%/">
<p>Login</p>
<img src="/frontend/public/login.jpeg" alt="login" width="100%" height="100%/">
<p>Signup</p>
<img src="/frontend/public/signup_1.jpeg" alt="signup_1" width="100%" height="100%/">
<p>Verify OTP</p>
<img src="/frontend/public/signup_2.jpeg" alt="signup_2" width="100%" height="100%/">
<p>Registration Successfull</p>
<img src="/frontend/public/signup_3.jpeg" alt="signup_3" width="100%" height="100%/">
<p>Dashboard</p>
<img src="/frontend/public/dashboard.jpeg" alt="dashboard" width="100%" height="100%/">
<p>Create Journal</p>
<img src="/frontend/public/create.jpeg" alt="create" width="100%" height="100%/">
<p>Journals</p>
<img src="/frontend/public/journals.png" alt="journals" width="100%" height="100%/">
<p>View each journal</p>
<img src="/frontend/public/journals_each.png" alt="journals" width="100%" height="100%/">
<p>Calendar</p>
<img src="/frontend/public/calendar.jpeg" alt="calendar" width="100%" height="100%/">
<p>Chatbot</p>
<img src="/frontend/public/chat.png" alt="chatbot" width="100%" height="100%/">
<h2>🧐 Features</h2>

Here are some of the project's best features:

### Journaling

- AI-Powered Prompting – Smart suggestions and reflective questions to help you write meaningfully
- Rich Text Editor – Markdown + plain text support with smooth formatting experience
- Autosave – Entries are saved in real-time to prevent data loss
- Journal History – Access and browse past entries by date or search

### Insights & Summarization

- AI Summaries – Get concise summaries of your entries using NLP
- Mood Detection – Automatically detects mood or tone from your writing
- Streak Tracker – Encourages consistent writing with streak and habit visualizations

### Authentication & User Management

- Email + OTP Authentication – Simple sign-up and login with email verification
- Google OAuth – Sign in using your Google account
- Session Persistence – Cookie-based secure login with token refresh mechanism

### UI & UX

- Step-based Onboarding – Smooth registration experience using multi-step forms
- Responsive Design – Works seamlessly on mobile, tablet, and desktop

### Tools and Technologies

- FastAPI Backend – Python-based backend with clean REST APIs
- PostgreSQL & Redis – Robust data storage and caching
- Zustand for State Management – Lightweight and scalable global state in frontend
- TanStack Router – Type-safe, file-based routing
- React Query Auth Integration – Secure token-based data fetching

## ⚙️ Project Setup

#### 📦 Prerequisites

Make sure you have the following installed before setting up the project:

- [`pnpm`](https://pnpm.io/installation) – For frontend package management
- [`poetry`](https://python-poetry.org/docs/#installation) – For backend Python dependency management
- Python 3.10+
- Node.js 18+
- Create a virtual environment for the backend (recommended)

---

### 🖥️ Frontend Setup

1. Create a `.env` file in the `frontend` directory:

   ```env
   VITE_API_URL=http://localhost:8000/
   ```
2. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```


---

### Backend Setup

1. Create a `.env` file in the `backend` directory with the following format:

   ```env
   SUPABASE_URL=""
   SUPABASE_KEY=""
   JWT_SECRET=""
   JWT_ALGORITHM=""
   ACCESS_TOKEN_EXPIRE_MINS=""
   REFRESH_TOKEN_EXPIRE_DAYS=""
   RESEND_API_KEY=""
   ENCRYPTION_KEY=""
   UPSTASH_REDIS_URL=""  #https://upstash.com/
   UPSTASH_REDIS_PASSWORD=""
   OTP_EXPIRY_MINS=""
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   GOOGLE_REDIRECT_URI="http://localhost:8000/auth/v1/google/callback"
   VECTOR_MODEL=" "  #Huggingface link https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2"
   GEMINI_KEY=""
   ```

2. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

3. Create and activate a virtual environment (if not already):

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   ```

4. Install dependencies using Poetry:

   ```bash
   poetry install
   ```

5. Run the backend server:
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

<h2>💖Like my work?</h2>

For any queries related to the project you can mail me at vedant.webb@gmail.com or my friend Mohammed at mohammedrupawala8@gmail.com
