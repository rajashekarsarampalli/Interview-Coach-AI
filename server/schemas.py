from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

# Base schemas
class InterviewCreate(BaseModel):
    type: str
    candidate_name: str

class MessageCreate(BaseModel):
    conversation_id: int
    role: str
    content: str

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class InterviewResponse(BaseModel):
    id: int
    title: str
    type: Optional[str] = None
    candidate_name: Optional[str] = None
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    messages: Optional[List[MessageResponse]] = []
    
    class Config:
        from_attributes = True

class FeedbackCategory(BaseModel):
    score: int
    feedback: str

class FeedbackResponse(BaseModel):
    overallScore: int
    verdict: str
    summary: str
    categories: Dict[str, FeedbackCategory]
    strengths: List[str]
    improvements: List[str]
    recommendation: str

class ResumeAnalyzeRequest(BaseModel):
    text: str

class JobMatch(BaseModel):
    title: str
    company: str
    location: str
    description: str
    requirements: List[str]
    matchScore: int

class ResumeAnalyzeResponse(BaseModel):
    message: str
    matchedJobs: List[JobMatch]

class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    description: str
    requirements: Optional[List[str]] = []
    match_score: Optional[int] = None
    
    class Config:
        from_attributes = True
