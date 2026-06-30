from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import base64
import cv2
import numpy as np
import tempfile

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://kaarigar-card.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@app.get("/")
def home():
    return {"message": "KaarigarCard Backend is Running!"}

@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):

    # File bytes padho
    file_bytes = await file.read()
    
    # Check karo — image hai ya video?
    is_video = file.content_type.startswith("video/")

    if is_video:
        # Video ka middle frame extract karo
        
        # Pehle video ko temp file mein save karo
        suffix = "." + file.filename.split(".")[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        # OpenCV se video kholo
        cap = cv2.VideoCapture(tmp_path)
        
        # Total frames count karo
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Middle frame pe jao
        middle_frame = total_frames // 2
        cap.set(cv2.CAP_PROP_POS_FRAMES, middle_frame)
        
        # Frame padho
        success, frame = cap.read()
        cap.release()
        os.unlink(tmp_path)

        if not success:
            return {"error": "Video frame extract nahi hua"}

        # Frame ko JPEG bytes mein convert karo
        _, buffer = cv2.imencode(".jpg", frame)
        image_bytes = buffer.tobytes()
        mime_type = "image/jpeg"

    else:
        # Seedha image use karo
        image_bytes = file_bytes
        mime_type = file.content_type

    # Gemini ko bhejo
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=mime_type
            ),
            types.Part.from_text(text="""You are a skill assessor for informal trade workers in India.
            Analyze this image and provide:
            1. Skill Name (e.g. Plumbing, Carpentry, Welding, Painting)
            2. Skill Level (Beginner / Intermediate / Expert)
            3. Key Observations (what you saw)
            4. Credential Statement (one line verifying the skill)
            
            Reply in this exact format:
            SKILL: ...
            LEVEL: ...
            OBSERVATIONS: ...
            CREDENTIAL: ...
            """)
        ]
    )

    response_text = response.text

    lines = response_text.strip().split("\n")
    result = {}
    for line in lines:
        if ":" in line:
            key, value = line.split(":", 1)
            result[key.strip()] = value.strip()

    return result