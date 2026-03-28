import React, { useState, useEffect, useRef } from "react";
import "./catBotStyles.css";
import meowSound from "../assets/meow.mp3";

const CatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "cat", text: "Hiii~ 🐾 I'm MeowMuse! How are you today?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  // 🐱 Toggle chatbot
  const toggleBot = () => {
    setOpen((prev) => !prev);
    const audio = new Audio(meowSound);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  };

  // ✉️ Send message to backend (Ollama via FastAPI)
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage }),
      });

      const data = await res.json();
      let reply = data.reply;

      // ✅ Clean overly long AI replies
      if (typeof reply === "string" && reply.length > 150) {
        reply = reply.slice(0, 150).split(".")[0] + " ✨";
      }

      setMessages((prev) => [...prev, { from: "cat", text: reply || "Meow~ 🐾" }]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("😿 Oops! CatBot fell asleep. Try again!");
    } finally {
      setLoading(false);
    }
  };

  // ⌨️ Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // 📜 Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="catbot-wrapper">
      {/* 🐾 Floating Cat Icon */}
      <div className="cat-peek-wrapper" onClick={toggleBot}>
        <img src="/images/catbot.png" alt="CatBot" className="peek-cat" />
        <p className="bot-name-always">MeowMuse</p>
      </div>

      {/* 💬 Chatbox */}
      {open && (
        <div className="catbot-chatbox">
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.from} fade-in`}>
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="msg cat typing-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="input-row">
            <input
              type="text"
              placeholder="Say something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={sendMessage}>💌</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatBot;
