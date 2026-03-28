import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ FIX
import "../styles/Diary.css";
import MoodPlayer from "../components/MoodPlayer";

const API_BASE = "http://localhost:8000";

function Diary() {
  const navigate = useNavigate(); // ✅ FIX
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("calm");
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [playMusic, setPlayMusic] = useState(false);

  /* 🔹 Auto mood detection (NO autoplay music) */
  useEffect(() => {
    if (!content.trim()) return;

    const timer = setTimeout(() => {
      analyzeMood(false); // ❌ no music autoplay
    }, 1200);

    return () => clearTimeout(timer);
  }, [content]);

  /* 🔹 Analyze mood */
  const analyzeMood = async (shouldPlay = true) => {
    if (!content.trim()) return;

    setDetecting(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/analyze/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setMood(data.emotion || "calm");

      if (shouldPlay) setPlayMusic(true);
      else setPlayMusic(false); // ✅ reset on auto detect
    } catch {
      setError("⚠ Unable to analyze mood");
      setMood("calm");
    } finally {
      setDetecting(false);
    }
  };

  /* 🔹 Date validation */
  const handleDateChange = (e) => {
    if (e.target.value > today) {
      alert("❌ Future dates not allowed");
      return;
    }
    setDate(e.target.value);
  };

  /* 🔹 SAVE ENTRY (AUTH FIXED) */
  const saveEntry = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    if (!content.trim()) {
      alert("Please write something ✍️");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/save-entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 REQUIRED
        },
        body: JSON.stringify({ date, mood, content }),
      });

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
        return; // ✅ VERY IMPORTANT
      }

      if (!res.ok) throw new Error();

      alert("✅ Diary entry saved");
    } catch {
      alert("❌ Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`diary-container mood-${mood}`}>
      <h2 className="diary-title">📔 My Diary</h2>

      <input
        type="date"
        value={date}
        max={today}
        onChange={handleDateChange}
      />

      <textarea
        placeholder="Write your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="button-group">
        <button onClick={() => analyzeMood(true)} disabled={detecting}>
          {detecting ? "Detecting..." : "Analyze Mood"}
        </button>

        <button onClick={saveEntry} disabled={saving}>
          {saving ? "Saving..." : "Save Entry"}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      <p>
        Detected Mood: <strong>{mood}</strong>
      </p>

      {/* 🎵 Music plays ONLY when Analyze clicked */}
      <MoodPlayer mood={mood} play={playMusic} />
    </div>
  );
}

export default Diary;
