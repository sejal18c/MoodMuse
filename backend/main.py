from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from textblob import TextBlob
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token
)
from database import diary_collection  # MongoDB collection
from datetime import datetime

app = FastAPI()

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= DATABASE (TEMP USERS) =================
users_db = {}      # username → hashed_password

# ================= MODELS =================
class User(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


class MoodRequest(BaseModel):
    text: str


class DiaryEntry(BaseModel):
    date: str
    mood: str
    content: str


# ================= AUTH DEPENDENCY =================
def get_current_user(authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token must start with Bearer")

    token = authorization.split(" ")[1]
    username = decode_token(token)

    if username is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return username


# ================= AUTH ROUTES =================
@app.post("/register")
def register(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    users_db[user.username] = hash_password(user.password)
    return {"message": "User registered successfully"}


@app.post("/login", response_model=LoginResponse)
def login(user: User):
    hashed = users_db.get(user.username)

    if not hashed or not verify_password(user.password, hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.username)

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ================= MOOD ANALYSIS =================
@app.post("/analyze/")
def analyze_mood(req: MoodRequest):
    polarity = TextBlob(req.text).sentiment.polarity

    if polarity > 0.2:
        emotion = "happy"
    elif polarity < -0.2:
        emotion = "sad"
    else:
        emotion = "calm"

    return {"emotion": emotion}


# ================= DIARY ROUTES =================
@app.post("/diary/")
def save_diary(entry: DiaryEntry, user: str = Depends(get_current_user)):
    """Save diary entry to MongoDB Atlas"""
    diary_collection.insert_one({
        "user": user,
        "date": entry.date,
        "mood": entry.mood,
        "content": entry.content,
        "created_at": datetime.utcnow()
    })
    return {"message": "Diary entry saved successfully"}


@app.get("/get-all-entries/")
def get_all_entries(user: str = Depends(get_current_user)):
    """Fetch all diary entries for the logged-in user"""
    entries = diary_collection.find({"user": user}, {"_id": 0})
    return list(entries)


# ================= TEST =================
@app.get("/protected")
def protected(user: str = Depends(get_current_user)):
    return {"message": f"Welcome {user} ❤️"}
