// src/pages/Settings.jsx
import React, { useEffect, useState, useRef } from "react";
import "../styles/Settings.css";
import cat1 from "../assets/avatars/cat1.png";
import cat2 from "../assets/avatars/cat2.png";
import cat3 from "../assets/avatars/cat3.png";
import cat4 from "../assets/avatars/cat4.png";

const DEFAULT_CATS = [
  { url: cat1, label: "Angry Cat 😾" },
  { url: cat2, label: "Happy Cat 😺" },
  { url: cat3, label: "Sleepy Cat 😴" },
  { url: cat4, label: "Chill Cat 😌" },
];

export default function Settings() {
  const [username, setUsername] = useState("");
  const [autoMoodDetect, setAutoMoodDetect] = useState(true);
  const [saveLocally, setSaveLocally] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [selectedCat, setSelectedCat] = useState(DEFAULT_CATS[0].url);

  // daily reminder
  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [dailyTime, setDailyTime] = useState("09:00");
  const timerRef = useRef(null);

  useEffect(() => {
    // load saved settings
    setUsername(localStorage.getItem("username") || "");
    setAutoMoodDetect(JSON.parse(localStorage.getItem("autoMoodDetect")) ?? true);
    setSaveLocally(JSON.parse(localStorage.getItem("saveLocally")) ?? true);
    setNotifications(JSON.parse(localStorage.getItem("notificationsEnabled")) ?? false);
    const stored = localStorage.getItem("catAvatar");
    if (stored) setSelectedCat(stored);

    const savedDailyEnabled = JSON.parse(localStorage.getItem("dailyEnabled")) ?? false;
    const savedDailyTime = localStorage.getItem("dailyTime") || "09:00";
    setDailyEnabled(savedDailyEnabled);
    setDailyTime(savedDailyTime);

    if (savedDailyEnabled) {
      scheduleDailyNotification(savedDailyTime);
    }

    return () => {
      clearScheduled();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scheduling helpers
  const msUntilNextTime = (hhmm) => {
    const [hh, mm] = hhmm.split(":").map(Number);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    return target.getTime() - now.getTime();
  };

  const clearScheduled = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleDailyNotification = (time) => {
    clearScheduled();
    const ms = msUntilNextTime(time);
    if (!isFinite(ms) || ms <= 0) return;
    timerRef.current = setTimeout(() => {
      try {
        new Notification("📝 Time to write your journal", {
          body: "A quick moment each day helps. Open MoodMuse and jot down a line!",
          icon: selectedCat,
        });
      } catch (err) {
        console.error("notify error:", err);
      }
      // schedule next day
      scheduleDailyNotification(time);
    }, ms);
  };

  // enable/disable daily reminder (requests permission)
  const enableDailyToggle = async (checked) => {
    if (checked) {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        alert("Please allow notifications in your browser to enable daily reminders.");
        return;
      }
      setDailyEnabled(true);
      localStorage.setItem("dailyEnabled", "true");
      localStorage.setItem("dailyTime", dailyTime);
      scheduleDailyNotification(dailyTime);
      // ensure master notifications state on
      setNotifications(true);
      localStorage.setItem("notificationsEnabled", "true");
    } else {
      setDailyEnabled(false);
      localStorage.setItem("dailyEnabled", "false");
      clearScheduled();
    }
  };

  // other handlers
  const toggleNotifications = async (checked) => {
    if (checked) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotifications(true);
        localStorage.setItem("notificationsEnabled", "true");
        try {
          new Notification("MoodMuse", { body: "Notifications enabled! 🎀", icon: selectedCat });
        } catch (e) {
          /* ignore */
        }
      } else {
        alert("Notifications blocked by browser.");
      }
    } else {
      setNotifications(false);
      localStorage.setItem("notificationsEnabled", "false");
    }
  };

  const testNotification = () => {
    if (notifications && Notification.permission === "granted") {
      new Notification("MoodMuse Reminder", {
        body: "Hi! Take a moment for a quick journal 📝",
        icon: selectedCat,
      });
    } else {
      alert("Enable notifications first.");
    }
  };

  const handleSave = () => {
    localStorage.setItem("username", username);
    localStorage.setItem("autoMoodDetect", JSON.stringify(autoMoodDetect));
    localStorage.setItem("saveLocally", JSON.stringify(saveLocally));
    localStorage.setItem("notificationsEnabled", JSON.stringify(notifications));
    localStorage.setItem("catAvatar", selectedCat);
    localStorage.setItem("dailyEnabled", JSON.stringify(dailyEnabled));
    localStorage.setItem("dailyTime", dailyTime);
    alert("✅ Settings saved!");
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all local data?")) {
      localStorage.clear();
      clearScheduled();
      alert("🧹 All local data cleared!");
      window.location.reload();
    }
  };

  // reschedule if dailyTime changes while enabled
  useEffect(() => {
    if (dailyEnabled) {
      localStorage.setItem("dailyTime", dailyTime);
      scheduleDailyNotification(dailyTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyTime]);

  return (
    <div className="settings-root">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p className="sub">Personalize your MoodMuse experience</p>
      </div>

      <div className="settings-grid">
        {/* Left column: profile preview */}
        <div className="settings-card">
          <h3>Your Profile</h3>

          <div className="profile-preview">
            <div className="profile-circle">
              <img src={selectedCat} alt="selected avatar" className="profile-avatar-large" />
            </div>
            <div className="profile-meta">
              <div className="profile-name">{username || "Your name"}</div>
              <div className="profile-sub">Selected avatar</div>
            </div>
          </div>

          <label style={{ marginTop: 14, display: "block", color: "#4a3a4a", fontWeight: 600 }}>
            Change display name
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="settings-input"
            placeholder="Enter your name"
          />
        </div>

        {/* Right: avatar picker */}
        <div className="settings-card">
          <h3>Choose Your Cat Avatar</h3>
          <div className="cat-grid">
            {DEFAULT_CATS.map((cat, idx) => (
              <div
                key={idx}
                className={`cat-card ${selectedCat === cat.url ? "selected" : ""}`}
                onClick={() => {
                  setSelectedCat(cat.url);
                }}
              >
                <img src={cat.url} alt={cat.label} className="cat-img" />
                <div className="cat-name">{cat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Full-width: Preferences + Actions */}
        <div className="settings-card" style={{ gridColumn: "1 / -1" }}>
          <h3>Preferences</h3>

          <div className="prefs-row">
            <div className="pref-item">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={autoMoodDetect}
                  onChange={(e) => setAutoMoodDetect(e.target.checked)}
                />
                <span className="slider" />
                <span className="switch-label">Auto Mood Detection</span>
              </label>
            </div>

            <div className="pref-item">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={saveLocally}
                  onChange={(e) => setSaveLocally(e.target.checked)}
                />
                <span className="slider" />
                <span className="switch-label">Save Journals Locally</span>
              </label>
            </div>

            <div className="pref-item">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => toggleNotifications(e.target.checked)}
                />
                <span className="slider" />
                <span className="switch-label">Enable Notifications</span>
              </label>

              {/* 🐾 Show test button only when notifications are on and daily reminder is off */}
              {notifications && !dailyEnabled && (
                <button className="test-button" onClick={testNotification} style={{ marginLeft: 10 }}>
                  Paw Notification
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="input-label">Daily Reminder</label>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <label className="switch" style={{ alignItems: "center" }}>
                <input type="checkbox" checked={dailyEnabled} onChange={(e) => enableDailyToggle(e.target.checked)} />
                <span className="slider" />
                <span className="switch-label">Enable Daily Reminder</span>
              </label>

              <input
                type="time"
                value={dailyTime}
                onChange={(e) => setDailyTime(e.target.value)}
                className="settings-input"
                style={{ width: 120 }}
              />

              {/* Quick 5s demo only shown when daily is not already enabled (optional) */}
              {!dailyEnabled && notifications && (
                <button
                  className="test-button"
                  onClick={() => {
                    if (Notification.permission !== "granted") {
                      alert("Please enable notifications first.");
                      return;
                    }
                    setTimeout(() => {
                      try {
                        new Notification("🐾 Quick test", { body: "This is your quick test reminder.", icon: selectedCat });
                      } catch (e) {
                        /* ignore */
                      }
                    }, 5000);
                  }}
                >
                  Quick test (5s)
                </button>
              )}
            </div>
          </div>

          <div className="actions-row">
            <button className="save-button" onClick={handleSave}>
              💾 Save Settings
            </button>
            <button className="clear-button" onClick={handleClearData}>
              🧹 Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
