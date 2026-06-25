<div align="center">

# 🎯 JobTracker

### AI-Powered Job Application Tracker

**Track every application · Generate cover letters · Score your resume against any JD**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20App-6366f1?style=for-the-badge)](https://job-tracker-beta-eight.vercel.app)
[![API Docs](https://img.shields.io/badge/📡%20API%20Docs-Swagger%20UI-009688?style=for-the-badge)](https://job-tracker-zp7u.onrender.com/docs)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)

</div>

---

## 🖥️ Live App

> **[https://job-tracker-beta-eight.vercel.app](https://job-tracker-beta-eight.vercel.app)**

### Login Page
![Login Page](https://raw.githubusercontent.com/nischaysareen09/job-tracker/main/screenshots/login.png)

### Kanban Board
![Kanban Board](https://raw.githubusercontent.com/nischaysareen09/job-tracker/main/screenshots/dashboard-board.png)

### List View
![List View](https://raw.githubusercontent.com/nischaysareen09/job-tracker/main/screenshots/dashboard-list.png)

### Add Job Form
![Add Job](https://raw.githubusercontent.com/nischaysareen09/job-tracker/main/screenshots/add-job.png)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗂️ **Drag & Drop Kanban** | Move cards across Applied → Interviewing → Offer → Rejected |
| 🤖 **AI Cover Letter** | Paste a JD + your resume → tailored cover letter via Groq LLM |
| 📊 **Resume Match Scorer** | Match % score with strengths, gaps, and analysis vs any JD |
| 📈 **Analytics Dashboard** | Pipeline funnel, response rate, offer rate at a glance |
| 📋 **Board + List View** | Toggle between visual Kanban and sortable table |
| 🔐 **JWT Auth** | Secure register/login with bcrypt password hashing |
| 🌐 **Fully Deployed** | Frontend on Vercel, backend on Render, database on Neon |

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
- **Groq SDK** — Llama 3.3 70B for AI cover letter + resume scoring

### Infrastructure
- **Neon** — serverless PostgreSQL
- **Render** — backend hosting (auto-deploy from GitHub)
- **Vercel** — frontend hosting (auto-deploy from GitHub)

---

## 🚀 Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL or a [Neon](https://neon.tech) connection string

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

```env
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
├── screenshots/             # App screenshots
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

## 🧠 AI Features

Both AI features use **Groq's Llama 3.3 70B** model (free tier):

**Cover Letter Generator** — paste a job description + your resume text, get a tailored 3-4 paragraph cover letter. Saved automatically to the job record.

**Resume Match Scorer** — paste a JD + your resume, get a 0–100 match score, overall analysis, key strengths, and skill gaps.

---

## 📄 License

MIT — feel free to fork and build on this.

---

<div align="center">
  Built by <a href="https://github.com/nischaysareen09">Nischay Sareen</a>
</div>