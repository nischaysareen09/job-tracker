from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import uuid
import enum


class ApplicationStatus(str, enum.Enum):
    APPLIED = "Applied"
    INTERVIEWING = "Interviewing"
    OFFER = "Offer"
    REJECTED = "Rejected"
    SAVED = "Saved"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("JobApplication", back_populates="user", cascade="all, delete")


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.APPLIED, nullable=False)
    job_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    salary_range = Column(String, nullable=True)
    job_description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    cover_letter = Column(Text, nullable=True)
    match_score = Column(Integer, nullable=True)
    match_analysis = Column(Text, nullable=True)

    applied_date = Column(DateTime, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")