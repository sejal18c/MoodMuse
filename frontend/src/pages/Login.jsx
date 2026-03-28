import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const API = "http://localhost:8000";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();

      // ✅ SAVE JWT TOKEN (CRITICAL FIX)
      localStorage.setItem("access_token", data.access_token);

      // (optional but recommended)
      localStorage.setItem("username", username);

      console.log("✅ Token saved:", data.access_token);

      navigate("/diary");
    } catch (error) {
      console.error("❌ Login error:", error);
      alert("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>🔐 MoodMuse Login</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}

export default Login;
