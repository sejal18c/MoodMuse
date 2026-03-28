from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date
import subprocess
import os
from pymongo import MongoClient

# ✅ Force UTF-8 for Windows
os.environ["PYTHONIOENCODING"] = "utf-8"

# ✅ MongoDB setup
MONGO_URI = "mongodb+srv://sejuchavan1812_db_user:ZigLI2s3aWwXKt8W@moodmusecluster.lejdji0.mongodb.net/?retryWrites=true&w=majority&appName=MoodmuseCluster"
client = MongoClient(MONGO_URI)
db = client["MoodMuseDB"]
diary_collection = db.diary_entries

# ✅ FastAPI
app = FastAPI()

# ✅ CORS (updated)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:3001",  # <-- added your React frontend port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Schemas
class TextIn(BaseModel):
    text: str

class ChatRequest(BaseModel):
    text: str

class DiaryEntry(BaseModel):
    date: str
    mood: str
    content: str

# 🧠 Simple Emotion Detection
@app.post("/analyze/")
def analyze(entry: TextIn):
    text = entry.text.lower()
    if "happy" in text:
        emotion = "happy"
    elif "sad" in text:
        emotion = "sad"
    elif "angry" in text:
        emotion = "angry"
    elif "calm" in text:
        emotion = "calm"
    else:
        emotion = "neutral"
    return {"emotion": emotion}

# 🐱 Chatbot — Gemma
@app.post("/chat")
def chat_with_gemma(data: ChatRequest):
    try:
        user_text = data.text.strip()
        if not user_text:
            return {"reply": "Meow~ say something 🐾"}

        prompt = f"Reply shortly and cutely with emojis, max 2 sentences: {user_text}"
        command = f'ollama run gemma3 "{prompt}"'
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore",
            timeout=20
        )

        if result.returncode != 0:
            return {"reply": "😿 My whiskers got tangled. Try again!"}

        reply = result.stdout.strip()
        if len(reply) > 150:
            reply = reply[:150] + "..."
        return {"reply": reply}

    except subprocess.TimeoutExpired:
        return {"reply": "⏳ The cat is taking too long to think... try again!"}
    except Exception as e:
        return {"reply": f"😿 Error: {str(e)}"}

# 📖 Diary endpoints
@app.post("/diary/")
def add_diary(entry: DiaryEntry):
    diary_collection.insert_one(entry.dict())
    return {"message": "Diary entry added!"}

@app.get("/diary/")
def get_diary():
    entries = list(diary_collection.find({}, {"_id": 0}))
    return {"diary": entries}

# 📅 Get all diary entries for calendar
@app.get("/get-all-entries/")
def get_all_entries():
    entries = diary_collection.find()
    result = []
    for e in entries:
        result.append({
            "date": e["date"],
            "content": e["content"],
            "mood": e["mood"]
        })
    return result

@app.get("/")
def root():
    return {"message": "✨ MoodMuse + Gemma chatbot running!"}

@app.get("/api/entries")
def api_entries():
    entries = list(diary_collection.find({}, {"_id": 0}))
    return entries

