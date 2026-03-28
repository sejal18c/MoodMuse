import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/welcome.css";

const Welcome = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    // const token = localStorage.getItem("token");
    // if (token) {
    //   navigate("/journal"); // go to diary if token exists
    // } else {
    //   navigate("/login"); // otherwise go to login
    // }
    navigate("/journal")
  };

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1 className="welcome-title">🌈 MoodMuse</h1>
        <p className="welcome-tagline">
          Your emotional journaling companion 💖
        </p>
        <button type="button" className="welcome-button" onClick={handleStart}>
          Start Journaling
        </button>
      </div>
    </div>
  );
};

export default Welcome;
