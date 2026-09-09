import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.database.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("ResearchProject", back_populates="user", cascade="all, delete-orphan")

class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    question = Column(Text, nullable=False)
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    token_count = Column(Integer, default=0)
    cost_estimate = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    tasks = relationship("ResearchTask", back_populates="project", cascade="all, delete-orphan")
    sources = relationship("Source", back_populates="project", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="project", cascade="all, delete-orphan")
    conflicts = relationship("Conflict", back_populates="project", cascade="all, delete-orphan")
    report = relationship("Report", back_populates="project", uselist=False, cascade="all, delete-orphan")

class ResearchTask(Base):
    __tablename__ = "research_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="pending")  # pending, in_progress, completed, inconclusive, failed
    order_index = Column(Integer, default=0)

    project = relationship("ResearchProject", back_populates="tasks")

class Source(Base):
    __tablename__ = "sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    url = Column(String(2000), nullable=False)
    publisher = Column(String(255), nullable=True)
    content = Column(Text, nullable=True)
    date = Column(String(100), nullable=True)
    reliability_score = Column(Float, default=0.8)

    project = relationship("ResearchProject", back_populates="sources")
    evidence_items = relationship("Evidence", back_populates="source", cascade="all, delete-orphan")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False)
    claim_text = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.0)
    verification_method = Column(String(255), default="agreement_count_llm_judge")
    status = Column(String(50), default="unverified")  # verified, unverified, disputed

    project = relationship("ResearchProject", back_populates="claims")
    evidence_items = relationship("Evidence", back_populates="claim", cascade="all, delete-orphan")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    claim_id = Column(String(36), ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    source_id = Column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False)
    stance = Column(String(50), nullable=False)  # supports, contradicts, neutral

    claim = relationship("Claim", back_populates="evidence_items")
    source = relationship("Source", back_populates="evidence_items")

class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False)
    claim_a_id = Column(String(36), ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    claim_b_id = Column(String(36), ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    reason = Column(Text, nullable=False)
    resolution_note = Column(Text, nullable=True)

    project = relationship("ResearchProject", back_populates="conflicts")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("research_projects.id", ondelete="CASCADE"), unique=True, nullable=False)
    content = Column(Text, nullable=False)  # Stores JSON structure or Markdown content
    format = Column(String(50), default="markdown")
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("ResearchProject", back_populates="report")

class CareerAnalysis(Base):
    __tablename__ = "career_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    github_username = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    job_role = Column(String(255), nullable=False)
    job_description = Column(Text, nullable=True)
    match_score = Column(Integer, default=75)
    result_json = Column(Text, nullable=False)  # Stores serialized full analysis dictionary
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="career_analyses")

