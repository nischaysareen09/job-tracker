<div align="center">

# 🎯 JobTracker

### AI-Powered Job Application Tracker

**Track every application · Generate cover letters · Score your resume against any JD**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-job--tracker--beta--eight.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://job-tracker-beta-eight.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://job-tracker-zp7u.onrender.com/docs)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)](https://neon.tech)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗂️ **Kanban Board** | Drag & drop cards across Applied → Interviewing → Offer → Rejected |
| 🤖 **AI Cover Letter** | Paste a job description + your resume → get a tailored cover letter via Groq LLM |
| 📊 **Resume Scorer** | Get a match % score with strengths, gaps, and analysis vs any JD |
| 📈 **Analytics Dashboard** | Application funnel, response rate, offer rate at a glance |
| 🔐 **JWT Auth** | Secure register/login with bcrypt password hashing |
| 📋 **List + Board View** | Toggle between Kanban and sortable table view |
| 🌐 **Fully Deployed** | Live frontend on Vercel, backend on Render, database on Neon |

---

## 🖥️ Screenshots

> **Login Page** — Split-panel SaaS design

![Login](https://job-tracker-beta-eight.vercel.app/og-login.png)

> **Dashboard** — Kanban board with drag & drop

![Dashboard](https://job-tracker-beta-eight.vercel.app/og-dashboard.png)

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + Vite
- **Tailwind CSS v3**
- **Recharts** — analytics bar charts
- **@hello-pangea/dnd** — drag & drop
- **Axios** — API calls
- **React Router v6** — client-side routing

### Backend
- **FastAPI** — REST API with auto-generated Swagger docs
- **SQLAlchemy** — ORM with PostgreSQL
- **Pydantic v2** — request/response validation
- **python-jose** — JWT token auth
- **passlib + bcrypt** — password hashing
- **Groq SDK** — LLM API (Llama 3.3 70B) for AI features

### Infrastructure
- **Neon** — serverless PostgreSQL
- **Render** — backend hosting (auto-deploy from GitHub)
- **Vercel** — frontend hosting (auto-deploy from GitHub)

---

## 🚀 Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (local) or a [Neon](https://neon.tech) connection string

### 1. Clone the repo

```bash
git clone https://github.com/nischaysareen09/job-tracker.git
cd job-tracker
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/job_tracker
SECRET_KEY=your-random-secret-key-at-least-32-chars
GROQ_API_KEY=your-groq-api-key
```

Start the backend:

```bash
uvicorn main:app --reload
```

API docs available at: `http://localhost:8000/docs`

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

App available at: `http://localhost:5173`

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
| `GET` | `/analytics` | Get pipeline analytics |
| `POST` | `/ai/cover-letter` | Generate AI cover letter |
| `POST` | `/ai/match-score` | Score resume vs JD |

Full interactive docs: [job-tracker-zp7u.onrender.com/docs](https://job-tracker-zp7u.onrender.com/docs)

---

## 📁 Project Structure

```
job-tracker/
├── backend/
│   ├── main.py          # FastAPI app + all routes
│   ├── models.py        # SQLAlchemy models (User, JobApplication)
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── auth.py          # JWT auth + password hashing
│   ├── ai_service.py    # Groq LLM integration
│   ├── database.py      # DB engine + session
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api.js           # Axios instance
│       ├── main.jsx         # Router setup
│       └── pages/
│           ├── Login.jsx    # Auth page
│           ├── Dashboard.jsx # Kanban board + analytics
│           ├── AddJob.jsx   # Add application form
│           └── JobDetail.jsx # Job detail + AI features
└── README.md
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Random string for JWT signing (min 32 chars) |
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) (free) |

---

## 🧠 AI Features

Both AI features use **Groq's Llama 3.3 70B** model via the Groq API (free tier):

**Cover Letter Generator**
- Input: job description + resume text + company + role
- Output: tailored 3-4 paragraph cover letter
- Automatically saved to the job application record

**Resume Match Scorer**
- Input: job description + resume text
- Output: match % score (0–100) + overall analysis + key strengths + skill gaps

---

## 📄 License

MIT — feel free to fork and build on this.

---

<div align="center">
  Made by <a href="https://github.com/nischaysareen09">Nischay Sareen</a>
</div>