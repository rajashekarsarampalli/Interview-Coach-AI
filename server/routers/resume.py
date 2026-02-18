from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import ResumeAnalyzeRequest, ResumeAnalyzeResponse
from openai import OpenAI
import os
import json
import crud

router = APIRouter()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/resume/analyze", response_model=ResumeAnalyzeResponse)
async def analyze_resume(request: ResumeAnalyzeRequest, db: Session = Depends(get_db)):
    """Analyze resume and suggest matching jobs"""
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert career coach and job market analyst. 
                    Analyze the provided resume text.
                    1. Identify key skills and experience level.
                    2. Suggest 5 specific, relevant job titles and simulated job listings that would be a good fit.
                    3. For each job, provide a company name, location, and a brief description.
                    4. Provide a 'matchScore' (0-100) based on how well the resume fits.
                    5. Provide a list of 'requirements' for each job.
                    
                    Return ONLY a JSON object with this structure:
                    {
                      "message": "Analysis summary...",
                      "matchedJobs": [
                        {
                          "title": "Job Title",
                          "company": "Company Name",
                          "location": "Location",
                          "description": "Brief description...",
                          "requirements": ["req1", "req2"],
                          "matchScore": 85
                        }
                      ]
                    }"""
                },
                {"role": "user", "content": request.text}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # Store matched jobs in database
        if "matchedJobs" in result:
            for job_data in result["matchedJobs"]:
                crud.create_job(db, {
                    "title": job_data["title"],
                    "company": job_data["company"],
                    "location": job_data["location"],
                    "description": job_data["description"],
                    "requirements": job_data.get("requirements", []),
                    "match_score": job_data.get("matchScore", 0)
                })
        
        return result
        
    except Exception as error:
        print(f"Error analyzing resume: {error}")
        raise HTTPException(status_code=500, detail="Failed to analyze resume")
