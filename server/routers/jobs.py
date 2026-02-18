from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import JobResponse
import crud

router = APIRouter()

@router.get("/jobs", response_model=List[JobResponse])
async def get_jobs(db: Session = Depends(get_db)):
    """Get all job listings"""
    jobs = crud.get_all_jobs(db)
    return jobs
