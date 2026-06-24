from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

import models
import schemas
import auth
import ai_service
from database import engine, get_db

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ── Auth routes ───────────────────────────────────────────────────────────────

@app.post("/auth/register", response_model=schemas.Token, status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        email=payload.email,
        hashed_password=auth.hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = auth.create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


@app.post("/auth/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = auth.create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer"}


@app.get("/auth/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


# ── Job Application routes ────────────────────────────────────────────────────

@app.get("/applications", response_model=List[schemas.JobApplicationOut])
def list_applications(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.JobApplication).filter(
        models.JobApplication.user_id == current_user.id
    )
    if status:
        query = query.filter(models.JobApplication.status == status)
    return query.order_by(models.JobApplication.created_at.desc()).all()


@app.post("/applications", response_model=schemas.JobApplicationOut, status_code=201)
def create_application(
    payload: schemas.JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    app_obj = models.JobApplication(**payload.model_dump(), user_id=current_user.id)
    db.add(app_obj)
    db.commit()
    db.refresh(app_obj)
    return app_obj


@app.get("/applications/{app_id}", response_model=schemas.JobApplicationOut)
def get_application(
    app_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    app_obj = db.query(models.JobApplication).filter(
        models.JobApplication.id == app_id,
        models.JobApplication.user_id == current_user.id,
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    return app_obj


@app.patch("/applications/{app_id}", response_model=schemas.JobApplicationOut)
def update_application(
    app_id: UUID,
    payload: schemas.JobApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    app_obj = db.query(models.JobApplication).filter(
        models.JobApplication.id == app_id,
        models.JobApplication.user_id == current_user.id,
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(app_obj, field, value)

    db.commit()
    db.refresh(app_obj)
    return app_obj


@app.delete("/applications/{app_id}", status_code=204)
def delete_application(
    app_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    app_obj = db.query(models.JobApplication).filter(
        models.JobApplication.id == app_id,
        models.JobApplication.user_id == current_user.id,
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app_obj)
    db.commit()


# ── Analytics route ───────────────────────────────────────────────────────────

@app.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    apps = db.query(models.JobApplication).filter(
        models.JobApplication.user_id == current_user.id
    ).all()

    status_counts = {}
    for a in apps:
        key = a.status.value
        status_counts[key] = status_counts.get(key, 0) + 1

    total = len(apps)
    offers = status_counts.get("Offer", 0)
    interviews = status_counts.get("Interviewing", 0)

    return {
        "total": total,
        "by_status": status_counts,
        "offer_rate": round((offers / total * 100), 1) if total else 0,
        "interview_rate": round((interviews / total * 100), 1) if total else 0,
        "avg_match_score": round(
            sum(a.match_score for a in apps if a.match_score) /
            max(len([a for a in apps if a.match_score]), 1), 1
        ),
    }


# ── AI routes ─────────────────────────────────────────────────────────────────

@app.post("/ai/cover-letter", response_model=schemas.CoverLetterResponse)
def generate_cover_letter(
    payload: schemas.CoverLetterRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    try:
        letter = ai_service.generate_cover_letter(
            payload.job_description,
            payload.resume_text,
            payload.company,
            payload.role,
        )
        return {"cover_letter": letter}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@app.post("/ai/match-score", response_model=schemas.MatchScoreResponse)
def score_match(
    payload: schemas.MatchScoreRequest,
    current_user: models.User = Depends(auth.get_current_user),
):
    try:
        result = ai_service.score_resume_match(payload.job_description, payload.resume_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI scoring failed: {str(e)}")


@app.post("/applications/{app_id}/generate-cover-letter", response_model=schemas.JobApplicationOut)
def generate_and_save_cover_letter(
    app_id: UUID,
    resume_text: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    app_obj = db.query(models.JobApplication).filter(
        models.JobApplication.id == app_id,
        models.JobApplication.user_id == current_user.id,
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    if not app_obj.job_description:
        raise HTTPException(status_code=400, detail="Add a job description first")

    letter = ai_service.generate_cover_letter(
        app_obj.job_description, resume_text, app_obj.company, app_obj.role
    )
    app_obj.cover_letter = letter
    db.commit()
    db.refresh(app_obj)
    return app_obj


@app.post("/applications/{app_id}/score-resume", response_model=schemas.JobApplicationOut)
def score_and_save_match(
    app_id: UUID,
    resume_text: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    app_obj = db.query(models.JobApplication).filter(
        models.JobApplication.id == app_id,
        models.JobApplication.user_id == current_user.id,
    ).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    if not app_obj.job_description:
        raise HTTPException(status_code=400, detail="Add a job description first")

    result = ai_service.score_resume_match(app_obj.job_description, resume_text)
    app_obj.match_score = result["score"]
    app_obj.match_analysis = result["analysis"]
    db.commit()
    db.refresh(app_obj)
    return app_obj