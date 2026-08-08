# 🎯 JobTracker

### AI-Powered Career Management Platform with Agentic AI

**Track every application · BunnyBee AI Agent · Cover letters · Resume scoring · Interview prep · Follow-up tracker**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-6366f1?style=for-the-badge)](https://job-tracker-beta-eight.vercel.app)
[![API Docs](https://img.shields.io/badge/📡%20API%20Docs-Swagger%20UI-009688?style=for-the-badge)](https://job-tracker-zp7u.onrender.com/docs)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?style=for-the-badge)](https://console.groq.com)

---

## 🖥️ Live App

> **https://job-tracker-beta-eight.vercel.app**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🐝 **BunnyBee AI Agent** | Agentic AI with tool calling — chat naturally to analyze applications, prep for interviews, draft follow-ups |
| 🗂️ **Drag & Drop Kanban** | Move cards across Saved → Applied → Interviewing → Offer → Rejected |
| 🤖 **AI Cover Letter** | Paste a JD + your resume → tailored cover letter via Groq LLM |
| ⚡ **Resume Match Scorer** | Match % score with strengths, gaps, and analysis vs any JD |
| 🎯 **AI Interview Prep** | Role-specific technical, behavioral, and situational questions with ideal answers |
| 📧 **Follow-up Email Generator** | AI-crafted follow-up emails with days-since-applied tracker and urgency flags |
| 📈 **Analytics Dashboard** | Pipeline funnel, response rate, offer rate, activity timeline charts |
| 📋 **Board + List View** | Toggle between visual Kanban and sortable table |
| 🔐 **JWT Auth** | Secure register/login with bcrypt password hashing |
| 🌐 **Fully Deployed** | Frontend on Vercel, backend on Render, database on Neon |

---

## 🐝 BunnyBee — AI Agent

BunnyBee is the centerpiece feature. It's a conversational AI agent built with **Groq tool calling** that has full access to your job application data and autonomously decides which actions to take.

### How it works

Instead of clicking separate buttons, you just chat:

- *"Prepare me for my Google interview tomorrow"* → agent calls `prepare_for_interview` with Google's JD
- *"Which applications need follow-up?"* → agent calls `prioritize_applications` and checks days since applied
- *"Write me a cover letter for Amazon"* → agent calls `generate_cover_letter_for_job`
- *"Analyze my job search pipeline"* → agent calls `analyze_applications` and gives strategic advice

### Tools available to the agent

| Tool | What it does |
|---|---|
| `analyze_applications` | Reads all your jobs, gives stats and insights |
| `get_application_details` | Looks up a specific company's application |
| `generate_cover_letter_for_job` | Generates tailored cover letter |
| `score_resume_for_job` | Scores resume against JD |
| `prepare_for_interview` | Generates interview prep questions |
| `generate_followup_for_job` | Drafts follow-up email |
| `prioritize_applications` | Recommends which jobs to focus on |

### Why this is technically significant

- **Tool calling / function calling** — LLM decides which tools to invoke, not the user
- **Multi-step reasoning** — agent chains multiple tool calls in one turn
- **Real data access** — agent reads from live PostgreSQL database
- **Agentic AI** — autonomous decision-making, not just prompt → response

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + Vite
- **Tailwind CSS v3**
- **Recharts** — analytics charts (bar, pie, line)
- **Native HTML5 Drag & Drop API**
- **Axios** with interceptors — auto JWT headers + 401 handling
- **React Router v6** — client-side routing with protected routes

### Backend
- **FastAPI** — async REST API with auto Swagger docs
- **SQLAlchemy** — ORM with PostgreSQL
- **Pydantic v2** — request/response validation
- **python-jose** — JWT token signing (HS256)
- **passlib + bcrypt** — secure password hashing
- **Groq SDK** — Llama 3.3 70B for all AI features + agent tool calling

### Infrastructure
- **Neon** — serverless PostgreSQL (cloud)
- **Render** — backend hosting (auto-deploy from GitHub)
- **Vercel** — frontend hosting with CDN (auto-deploy from GitHub)

---

## 🚀 Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL or a [Neon](https://neon.tech) connection string
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone
```bash
git clone https://github.com/nischaysareen09/job-tracker.git
cd job-tracker
```

### 2. Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/job_tracker
SECRET_KEY=your-random-secret-key-at-least-32-chars
GROQ_API_KEY=your-groq-api-key
```

```bash
uvicorn main:app --reload
# API docs → http://localhost:8000/docs
```

### 3. Frontend
```bash
cd ../frontend
npm install
npm run dev
# App → http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and get JWT token |
| `GET` | `/auth/me` | Get current user |
| `GET` | `/applications` | List all applications |
| `POST` | `/applications` | Create a new application |
| `PATCH` | `/applications/{id}` | Update an application |
| `DELETE` | `/applications/{id}` | Delete an application |
| `GET` | `/analytics` | Pipeline analytics |
| `GET` | `/analytics/detailed` | Detailed analytics with follow-up flags |
| `POST` | `/ai/cover-letter` | Generate AI cover letter |
| `POST` | `/ai/match-score` | Score resume vs JD |
| `POST` | `/ai/interview-prep` | Generate interview questions |
| `POST` | `/ai/followup-email` | Generate follow-up email |
| `POST` | `/ai/agent` | BunnyBee AI agent with tool calling |

Full interactive docs: [job-tracker-zp7u.onrender.com/docs](https://job-tracker-zp7u.onrender.com/docs)

---

## 📁 Project Structure

```
job-tracker/
├── backend/
│   ├── main.py          # FastAPI app + all 15 routes
│   ├── models.py        # SQLAlchemy models (User, JobApplication)
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── auth.py          # JWT auth + bcrypt password hashing
│   ├── ai_service.py    # Groq LLM + BunnyBee agent with tool calling
│   ├── database.py      # DB engine + session
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api.js           # Axios instance with interceptors
│       ├── main.jsx         # Router setup with protected routes
│       └── pages/
│           ├── Login.jsx       # Auth page (split panel dark theme)
│           ├── Dashboard.jsx   # Kanban board + drag & drop
│           ├── AddJob.jsx      # Add application form
│           ├── JobDetail.jsx   # Job detail + 4 AI tabs
│           ├── Analytics.jsx   # Full analytics page with charts
│           └── Agent.jsx       # BunnyBee AI agent chat UI
└── README.md
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Random string for JWT signing (min 32 chars) |
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) — free tier |

---

## 🧠 AI Features Overview

All AI features use **Groq's Llama 3.3 70B** model (free tier, very fast):

**🐝 BunnyBee Agent** — conversational AI with tool calling. Autonomously decides which tools to use based on your message. Maintains conversation history for multi-turn interactions.

**✍️ Cover Letter Generator** — paste a JD + resume → tailored 3-paragraph cover letter saved to the application.

**⚡ Resume Match Scorer** — paste a JD + resume → 0–100 score, analysis, strengths, and skill gaps.

**🎯 Interview Prep** — generates 10 questions split into Technical (with difficulty ratings), Behavioral (with tips), and Role Specific. Each question is expandable with ideal answer.

**📧 Follow-up Email Generator** — generates professional follow-up email with subject line. One-click "Open in Mail" button. Includes follow-up best practices.

---

## 📄 License

MIT — feel free to fork and build on this.

---

Built by [Nischay Sareen](https://github.com/nischaysareen09)