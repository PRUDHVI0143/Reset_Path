from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Research Schemas
class ResearchCreate(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)

class TaskSchema(BaseModel):
    id: str
    description: str
    status: str
    order_index: int

    class Config:
        from_attributes = True

class SourceSchema(BaseModel):
    id: str
    title: str
    url: str
    publisher: Optional[str] = None
    content: Optional[str] = None
    date: Optional[str] = None
    reliability_score: float

    class Config:
        from_attributes = True

class ClaimSchema(BaseModel):
    id: str
    claim_text: str
    confidence_score: float
    verification_method: str
    status: str

    class Config:
        from_attributes = True

class ConflictSchema(BaseModel):
    id: str
    claim_a_id: str
    claim_b_id: str
    reason: str
    resolution_note: Optional[str] = None

    class Config:
        from_attributes = True

class ResearchStatusResponse(BaseModel):
    id: str
    question: str
    status: str
    token_count: int
    cost_estimate: float
    created_at: datetime
    tasks: List[TaskSchema] = []
    sources_count: int = 0
    claims_count: int = 0
    verified_claims_count: int = 0
    conflicts_count: int = 0

    class Config:
        from_attributes = True

class ResearchDetailResponse(ResearchStatusResponse):
    sources: List[SourceSchema] = []
    claims: List[ClaimSchema] = []
    conflicts: List[ConflictSchema] = []

class ExportRequest(BaseModel):
    research_id: str
    format: str = Field("pdf", pattern="^(pdf|docx|markdown)$")

# Career & CV Intelligence Schemas
class CareerCreateRequest(BaseModel):
    github_username: str = Field(..., min_length=1, max_length=255)
    company_name: str = Field(..., min_length=1, max_length=255)
    job_role: str = Field(..., min_length=1, max_length=255)
    job_description: Optional[str] = None

class CareerAnalysisResponse(BaseModel):
    id: str
    github_username: str
    company_name: str
    job_role: str
    job_description: Optional[str] = None
    match_score: int
    result: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class CareerListItemResponse(BaseModel):
    id: str
    github_username: str
    company_name: str
    job_role: str
    match_score: int
    created_at: datetime

    class Config:
        from_attributes = True

