from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import InterviewCreate, InterviewResponse, MessageCreate, MessageResponse
import crud
from openai import OpenAI
import os
import json

router = APIRouter()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/interviews", response_model=InterviewResponse, status_code=201)
async def create_interview(interview: InterviewCreate, db: Session = Depends(get_db)):
    """Create a new interview conversation"""
    title = f"{interview.type} Interview - {interview.candidate_name}"
    conversation = crud.create_conversation(
        db, 
        title=title, 
        conv_type=interview.type, 
        candidate_name=interview.candidate_name
    )
    return conversation

@router.get("/interviews", response_model=List[InterviewResponse])
async def get_interviews(db: Session = Depends(get_db)):
    """Get all interviews"""
    conversations = crud.get_all_conversations(db)
    return conversations

@router.get("/interviews/{interview_id}", response_model=InterviewResponse)
async def get_interview(interview_id: int, db: Session = Depends(get_db)):
    """Get a specific interview with messages"""
    interview = crud.get_conversation_with_messages(db, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview

@router.post("/interviews/{interview_id}/messages", response_model=MessageResponse)
async def create_message(interview_id: int, message: MessageCreate, db: Session = Depends(get_db)):
    """Add a message to an interview"""
    # Verify interview exists
    interview = crud.get_conversation(db, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Create message
    db_message = crud.create_message(
        db,
        conversation_id=interview_id,
        role=message.role,
        content=message.content
    )
    return db_message

@router.post("/interviews/{interview_id}/end")
async def end_interview(interview_id: int, db: Session = Depends(get_db)):
    """End an interview and generate feedback"""
    # Get interview and messages
    interview = crud.get_conversation(db, interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    messages = crud.get_messages_by_conversation(db, interview_id)
    
    # Build transcript
    transcript = "\n".join([f"{m.role}: {m.content}" for m in messages])
    
    try:
        # Generate feedback using OpenAI
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """Analyze the following interview transcript and provide detailed feedback.
                    Return a JSON object with:
                    {
                      "overallScore": number (0-10),
                      "verdict": "Strong Hire" | "Hire" | "Hold" | "No Hire",
                      "summary": "text",
                      "categories": {
                        "technical": { "score": number, "feedback": "text" },
                        "communication": { "score": number, "feedback": "text" },
                        "problem_solving": { "score": number, "feedback": "text" },
                        "cultural_fit": { "score": number, "feedback": "text" },
                        "confidence": { "score": number, "feedback": "text" }
                      },
                      "strengths": ["text"],
                      "improvements": ["text"],
                      "recommendation": "text"
                    }"""
                },
                {"role": "user", "content": transcript}
            ],
            response_format={"type": "json_object"}
        )
        
        feedback_data = json.loads(response.choices[0].message.content)
        
        # Store feedback in database
        crud.create_feedback(db, interview_id, feedback_data)
        
        # Update conversation status
        crud.update_conversation_status(db, interview_id, "completed")
        
        return feedback_data
        
    except Exception as error:
        print(f"Error generating feedback: {error}")
        raise HTTPException(status_code=500, detail="Failed to generate feedback")

@router.get("/interviews/{interview_id}/feedback")
async def get_feedback(interview_id: int, db: Session = Depends(get_db)):
    """Get feedback for a completed interview"""
    feedback = crud.get_feedback_by_conversation(db, interview_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    return {
        "overallScore": feedback.overall_score,
        "verdict": feedback.verdict,
        "summary": feedback.summary,
        "categories": feedback.categories,
        "strengths": feedback.strengths,
        "improvements": feedback.improvements,
        "recommendation": feedback.recommendation
    }
