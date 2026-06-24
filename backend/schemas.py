from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID
from models import ApplicationStatus


# ── Auth schemas ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Job Application schemas ───────────────────────────────────────────────────

class JobApplicationCreate(BaseModel):
    company: str
    role: str
    status: Optional[ApplicationStatus] = ApplicationStatus.APPLIED
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_description: Optional[str] = None
    notes: Optional[str] = None
    applied_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None


class JobApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_description: Optional[str] = None
    notes: Optional[str] = None
    cover_letter: Optional[str] = None
    applied_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None


class JobApplicationOut(BaseModel):
    id: UUID
    company: str
    role: str
    status: ApplicationStatus
    job_url: Optional[str]
    location: Optional[str]
    salary_range: Optional[str]
    job_description: Optional[str]
    notes: Optional[str]
    cover_letter: Optional[str]
    match_score: Optional[int]
    match_analysis: Optional[str]
    applied_date: Optional[datetime]
    follow_up_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── AI feature schemas ────────────────────────────────────────────────────────

class CoverLetterRequest(BaseModel):
    job_description: str
    resume_text: str
    company: str
    role: str


class CoverLetterResponse(BaseModel):
    cover_letter: str


class MatchScoreRequest(BaseModel):
    job_description: str
    resume_text: str


class MatchScoreResponse(BaseModel):
    score: int
    analysis: str
    strengths: list[str]
    gaps: list[str]