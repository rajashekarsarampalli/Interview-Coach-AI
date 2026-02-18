from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routers import interviews, audio, resume, jobs
import os

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Interview Coach AI",
    description="AI-powered interview practice platform with real-time feedback",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(interviews.router, prefix="/api", tags=["interviews"])
app.include_router(audio.router, prefix="/api", tags=["audio"])
app.include_router(resume.router, prefix="/api", tags=["resume"])
app.include_router(jobs.router, prefix="/api", tags=["jobs"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Interview Coach AI is running"}

# Serve static files in production
if os.path.exists("dist/public"):
    app.mount("/", StaticFiles(directory="dist/public", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
