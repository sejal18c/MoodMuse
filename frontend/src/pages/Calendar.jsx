import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Calendar.css";

/* 🔹 Mood → Emoji Mapping */
const moodEmojiMap = {
  happy: "😊",
  sad: "😔",
  angry: "😡",
  neutral: "😐",
  calm: "😌",
  excited: "🤩",
  anxious: "😰",
};

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* 🔹 Fetch diary entries */
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch("http://localhost:8000/get-all-entries/", {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        if (!res.ok) throw new Error("Failed to fetch entries");

        const data = await res.json();
        const mappedEntries = {};

        data.forEach((entry) => {
          const dateKey = new Date(entry.date).toDateString();
          mappedEntries[dateKey] = {
            mood: entry.mood.toLowerCase(),
            text: entry.content,
          };
        });

        setEntries(mappedEntries);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Could not load diary entries.");
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  /* 🔹 On date click */
  const handleDateClick = (date) => {
    const dateKey = date.toDateString();
    setSelectedDate(date);
    setSelectedEntry(entries[dateKey] || null);
  };

  /* 🔹 Calendar tile: TEXT + EMOJI */
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const entry = entries[date.toDateString()];
    if (!entry) return null;

    const emoji = moodEmojiMap[entry.mood] || "📝";

    return (
      <div className="calendar-mood">
        <span className="mood-text">{entry.mood}</span>
        <span className="mood-emoji">{emoji}</span>
      </div>
    );
  };

  if (loading) return <p className="loading">Loading diary entries...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="calendar-container">
      <h2 className="calendar-title">📅 My Mood Calendar</h2>

      <Calendar
        onClickDay={handleDateClick}
        value={selectedDate}
        tileContent={tileContent}
        className="date-picker"
        maxDate={new Date()}
      />

      {selectedEntry ? (
        <div className="entry-card">
          <h3>{selectedDate.toDateString()}</h3>
          <p>
            <strong>Mood:</strong>{" "}
            {selectedEntry.mood} {moodEmojiMap[selectedEntry.mood]}
          </p>
          <p>
            <strong>Entry:</strong> {selectedEntry.text}
          </p>
        </div>
      ) : (
        <p className="no-entry">
          No entry for {selectedDate.toDateString()} 📝
        </p>
      )}
    </div>
  );
};

export default CalendarPage;
