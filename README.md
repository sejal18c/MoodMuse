# MoodMuse 🌸

A full-stack mood-based journaling web app with a local AI chatbot powered by LLaMA.

## 🚀 Features

* 🧠 Emotion detection (FastAPI backend)
* 🎨 Animated mood-based UI themes
* 📅 Calendar-based mood tracking
* 📝 Personal diary entries
* 🐱 AI Cat Bot (LLaMA-based local chatbot)
* 🔒 Runs locally (no external API required)

## 🛠 Tech Stack

* Frontend: React
* Backend: FastAPI (Python)
* AI Model: LLaMA (via Ollama)
* Styling: CSS animations

## 🤖 LLaMA Setup (Ollama)

### 1. Install Ollama

Download: https://ollama.com

### 2. Run model

```bash
ollama run llama3
```

### 3. Backend integration

Ensure FastAPI connects to local Ollama API:

```
http://localhost:11434
```

## 📁 Project Structure

```
MoodMuse/
 ├── frontend/
 └── backend/
```

## ⚙️ Run Project

### Frontend

```
cd frontend
npm install
npm start
```

### Backend

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🌈 Future Improvements

* Smarter chatbot responses
* Mood-based AI suggestions
* Voice interaction

## 👩‍💻 Author

Sejal Chavan
