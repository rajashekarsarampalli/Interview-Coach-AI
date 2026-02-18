from sqlalchemy.orm import Session
from datetime import datetime
import models
import schemas

# Conversation operations
def create_conversation(db: Session, title: str, conv_type: str, candidate_name: str):
    db_conversation = models.Conversation(
        title=title,
        type=conv_type,
        candidate_name=candidate_name,
        status="in_progress"
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation

def get_all_conversations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Conversation).offset(skip).limit(limit).all()

def get_conversation(db: Session, conversation_id: int):
    return db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()

def get_conversation_with_messages(db: Session, conversation_id: int):
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if conversation:
        # Eagerly load messages
        messages = get_messages_by_conversation(db, conversation_id)
        # Add messages to the conversation object dynamically
        conversation.messages = messages
    return conversation

def update_conversation_status(db: Session, conversation_id: int, status: str):
    conversation = get_conversation(db, conversation_id)
    if conversation:
        conversation.status = status
        if status == "completed":
            conversation.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(conversation)
    return conversation

# Message operations
def create_message(db: Session, conversation_id: int, role: str, content: str):
    db_message = models.Message(
        conversation_id=conversation_id,
        role=role,
        content=content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages_by_conversation(db: Session, conversation_id: int):
    return db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(models.Message.created_at).all()

# Feedback operations
def create_feedback(db: Session, conversation_id: int, feedback_data: dict):
    db_feedback = models.Feedback(
        conversation_id=conversation_id,
        overall_score=feedback_data.get("overallScore"),
        verdict=feedback_data.get("verdict"),
        summary=feedback_data.get("summary"),
        categories=feedback_data.get("categories"),
        strengths=feedback_data.get("strengths"),
        improvements=feedback_data.get("improvements"),
        recommendation=feedback_data.get("recommendation")
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def get_feedback_by_conversation(db: Session, conversation_id: int):
    return db.query(models.Feedback).filter(
        models.Feedback.conversation_id == conversation_id
    ).first()

# Job operations
def create_job(db: Session, job_data: dict):
    db_job = models.Job(**job_data)
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

def get_all_jobs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Job).offset(skip).limit(limit).all()
