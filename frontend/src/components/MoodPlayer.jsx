import React, { useState, useEffect } from "react";

/* ---------------- MOOD → MUSIC MAPPING ---------------- */
const MOOD_TO_MUSIC = {
  sad: "happy",
  angry: "calm",
  anxious: "calm",
  happy: "happy",
  calm: "calm",
};

/* ---------------- TRACK POOL ---------------- */
const TRACKS_BY_MOOD = {
  happy: [
    "3n3Ppam7vgaVa1iaRUc9Lp",
    "1hKdDCpiI9mqz1jVHRKG0E",
    "2TpxZ7JUBn3uw46aR7qd6V",
  ],
  calm: [
    "4uLU6hMCjMI75M1A2tKUQC",
    "0VjIjW4GlUZAMYd2vXMi3b",
    "6I9VzXrHxO9rA9A5euc8Ak",
  ],
};

/* ---------------- PLAYLIST POOL ---------------- */
const MOOD_PLAYLISTS = {
  happy: [
    "37i9dQZF1DXdPec7aLTmlC",
    "37i9dQZF1DWYBO1MoTDhZI",
  ],
  calm: [
    "37i9dQZF1DX4sWSpwq3LiO",
    "37i9dQZF1DX3Ogo9pFvBkY",
  ],
};

/* ---------------- RANDOM TRACK (NO REPEAT) ---------------- */
function getRandomTrackWithHistory(musicMood) {
  const list = TRACKS_BY_MOOD[musicMood] || [];
  if (!list.length) return null;

  const key = `played-${musicMood}`;
  const played = JSON.parse(localStorage.getItem(key)) || [];
  const remaining = list.filter((id) => !played.includes(id));

  let selected;
  if (remaining.length === 0) {
    localStorage.setItem(key, JSON.stringify([]));
    selected = list[Math.floor(Math.random() * list.length)];
  } else {
    selected = remaining[Math.floor(Math.random() * remaining.length)];
  }

  localStorage.setItem(key, JSON.stringify([...played, selected]));
  return selected;
}

/* ---------------- RANDOM PLAYLIST ---------------- */
function getRandomPlaylist(musicMood) {
  const list = MOOD_PLAYLISTS[musicMood] || [];
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
}

/* ---------------- COMPONENT ---------------- */
export default function MoodPlayer({ mood }) {
  const [trackId, setTrackId] = useState(null);
  const [playlistId, setPlaylistId] = useState(null);
  const [usePlaylist, setUsePlaylist] = useState(false);

  // Convert detected mood → music mood
  const musicMood = MOOD_TO_MUSIC[mood] || "calm";

  useEffect(() => {
    if (Math.random() > 0.5) {
      setUsePlaylist(true);
      setPlaylistId(getRandomPlaylist(musicMood));
      setTrackId(null);
    } else {
      setUsePlaylist(false);
      setTrackId(getRandomTrackWithHistory(musicMood));
      setPlaylistId(null);
    }
  }, [musicMood]);

  const next = () => {
    if (usePlaylist) {
      setPlaylistId(getRandomPlaylist(musicMood));
    } else {
      setTrackId(getRandomTrackWithHistory(musicMood));
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 420, marginTop: 20 }}>
      <p style={{ textAlign: "center", fontWeight: "bold" }}>
        🎧 Playing {musicMood} music to balance your mood
      </p>

      {trackId && (
        <iframe
          title="spotify-track"
          src={`https://open.spotify.com/embed/track/${trackId}`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="encrypted-media"
          style={{ borderRadius: 10 }}
        />
      )}

      {playlistId && (
        <iframe
          title="spotify-playlist"
          src={`https://open.spotify.com/embed/playlist/${playlistId}`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="encrypted-media"
          style={{ borderRadius: 10 }}
        />
      )}

      <button
        onClick={next}
        style={{
          marginTop: 10,
          padding: "6px 14px",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        ⏭ Next
      </button>
    </div>
  );
}
