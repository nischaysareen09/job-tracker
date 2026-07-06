from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import models, schemas, auth, ai_service
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://job-tracker-beta-eight.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

User = models.User
JobApplication = models.JobApplication

# ─── Auth ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/auth/register", response_model=schemas.Token)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=auth.hash_password(payload.password),
    )
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token": auth.create_access_token(str(user.id)), "token_type": "bearer"}

@app.post("/auth/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": auth.create_access_token(str(user.id)), "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserOut)
def get_me(current_user: User = Depends(auth.get_current_user)):
    return current_user

# ─── Applications ─────────────────────────────────────────────────────────────

@app.get("/applications", response_model=List[schemas.JobApplicationOut])
def list_applications(db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    return db.query(JobApplication).filter(JobApplication.user_id == current_user.id).order_by(JobApplication.created_at.desc()).all()

@app.post("/applications", response_model=schemas.JobApplicationOut, status_code=201)
def create_application(payload: schemas.JobApplicationCreate, db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    app_obj = JobApplication(**payload.model_dump(), user_id=current_user.id)
    db.add(app_obj); db.commit(); db.refresh(app_obj)
    return app_obj

@app.get("/applications/{app_id}", response_model=schemas.JobApplicationOut)
def get_application(app_id: int, db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    app_obj = db.query(JobApplication).filter(JobApplication.id == app_id, JobApplication.user_id == current_user.id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Not found")
    return app_obj

@app.patch("/applications/{app_id}", response_model=schemas.JobApplicationOut)
def update_application(app_id: int, payload: schemas.JobApplicationUpdate, db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    app_obj = db.query(JobApplication).filter(JobApplication.id == app_id, JobApplication.user_id == current_user.id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(app_obj, k, v)
    db.commit(); db.refresh(app_obj)
    return app_obj

@app.delete("/applications/{app_id}", status_code=204)
def delete_application(app_id: int, db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    app_obj = db.query(JobApplication).filter(JobApplication.id == app_id, JobApplication.user_id == current_user.id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(app_obj); db.commit()

# ─── Analytics ────────────────────────────────────────────────────────────────

@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    apps = db.query(JobApplication).filter(JobApplication.user_id == current_user.id).all()
    total = len(apps)
    by_status = {}
    for a in apps:
        by_status[a.status] = by_status.get(a.status, 0) + 1
    offers = by_status.get("Offer", 0)
    interviews = by_status.get("Interviewing", 0)
    scores = [a.match_score for a in apps if a.match_score]
    return {
        "total": total,
        "by_status": by_status,
        "offer_rate": round(offers / total * 100, 1) if total else 0,
        "interview_rate": round(interviews / total * 100, 1) if total else 0,
        "avg_match_score": round(sum(scores) / len(scores), 1) if scores else None,
    }

@app.get("/analytics/detailed")
def get_detailed_analytics(db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    apps = db.query(JobApplication).filter(JobApplication.user_id == current_user.id).all()
    today = datetime.utcnow().date()

    # Follow-up needed
    followup_needed = []
    for a in apps:
        if a.status == "Applied" and a.applied_date:
            days = (today - a.applied_date).days
            if days >= 7:
                followup_needed.append({
                    "id": a.id,
                    "company": a.company,
                    "role": a.role,
                    "days_since_applied": days,
                    "urgency": "high" if days >= 14 else "medium"
                })

    # Salary data
    salary_data = []
    for a in apps:
        if a.salary_range:
            salary_data.append({"company": a.company, "salary_range": a.salary_range, "status": a.status})

    # Heatmap (last 90 days)
    heatmap = {}
    for a in apps:
        if a.applied_date:
            key = str(a.applied_date)
            heatmap[key] = heatmap.get(key, 0) + 1

    # Response rate
    total = len(apps)
    responded = len([a for a in apps if a.status in ["Interviewing", "Offer", "Rejected"]])
    response_rate = round(responded / total * 100, 1) if total > 0 else 0

    # Avg days to response
    days_list = []
    for a in apps:
        if a.applied_date and a.status in ["Interviewing", "Offer"]:
            days_list.append((today - a.applied_date).days)
    avg_days = round(sum(days_list) / len(days_list), 1) if days_list else 0

    # Weekly activity (last 8 weeks)
    weekly = {}
    for a in apps:
        if a.applied_date:
            week = a.applied_date.strftime("%b %d")
            weekly[week] = weekly.get(week, 0) + 1

    return {
        "followup_needed": followup_needed,
        "salary_data": salary_data,
        "heatmap": heatmap,
        "response_rate": response_rate,
        "avg_days_to_response": avg_days,
        "total": total,
        "weekly_activity": weekly,
    }

# ─── AI ───────────────────────────────────────────────────────────────────────

@app.post("/ai/cover-letter")
def generate_cover_letter(payload: schemas.CoverLetterRequest, current_user: User = Depends(auth.get_current_user)):
    result = ai_service.generate_cover_letter(
        job_description=payload.job_description,
        resume_text=payload.resume_text,
        company=payload.company,
        role=payload.role,
    )
    return {"cover_letter": result}

@app.post("/ai/match-score")
def score_match(payload: schemas.MatchScoreRequest, current_user: User = Depends(auth.get_current_user)):
    return ai_service.score_resume_match(payload.job_description, payload.resume_text)

@app.post("/ai/interview-prep")
def generate_interview_prep(payload: dict, current_user: User = Depends(auth.get_current_user)):
    return ai_service.generate_interview_questions(
        job_description=payload.get("job_description", ""),
        resume_text=payload.get("resume_text", ""),
        role=payload.get("role", ""),
        company=payload.get("company", ""),
    )

@app.post("/ai/followup-email")
def generate_followup_email(payload: dict, current_user: User = Depends(auth.get_current_user)):
    return ai_service.generate_followup_email(
        company=payload.get("company", ""),
        role=payload.get("role", ""),
        days_since_applied=payload.get("days_since_applied", 7),
        recruiter_name=payload.get("recruiter_name", ""),
    )

@app.post("/applications/{app_id}/generate-cover-letter")
def generate_and_save_cover_letter(app_id: int, payload: schemas.CoverLetterRequest, db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    app_obj = db.query(JobApplication).filter(JobApplication.id == app_id, JobApplication.user_id == current_user.id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Not found")
    cover_letter = ai_service.generate_cover_letter(payload.job_description, payload.resume_text, payload.company, payload.role)
    app_obj.cover_letter = cover_letter
    db.commit()
    return {"cover_letter": cover_letter}

@app.post("/applications/{app_id}/score-resume")
def score_and_save_match(app_id: int, payload: schemas.MatchScoreRequest, db: Session = Depends(get_db), current_user: User = Depends(auth.get_current_user)):
    app_obj = db.query(JobApplication).filter(JobApplication.id == app_id, JobApplication.user_id == current_user.id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Not found")
    result = ai_service.score_resume_match(payload.job_description, payload.resume_text)
    app_obj.match_score = result["score"]
    app_obj.match_analysis = result["analysis"]
    db.commit()
    return result