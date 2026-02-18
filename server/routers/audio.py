from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from openai import OpenAI
import os

router = APIRouter()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/audio/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio file using OpenAI Whisper"""
    try:
        # Read audio file
        audio_data = await file.read()
        
        # Create a temporary file-like object
        from io import BytesIO
        audio_file = BytesIO(audio_data)
        audio_file.name = file.filename or "audio.webm"
        
        # Transcribe using Whisper
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        
        return {"text": transcription.text}
        
    except Exception as error:
        print(f"Error transcribing audio: {error}")
        raise HTTPException(status_code=500, detail="Failed to transcribe audio")

@router.post("/audio/text-to-speech")
async def text_to_speech(text: str):
    """Convert text to speech using OpenAI TTS"""
    try:
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text
        )
        
        # Return audio stream
        return response.content
        
    except Exception as error:
        print(f"Error generating speech: {error}")
        raise HTTPException(status_code=500, detail="Failed to generate speech")
