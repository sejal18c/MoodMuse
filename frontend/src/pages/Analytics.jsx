// src/pages/Analytics.jsx
import React, { useEffect, useState } from "react";
import "../styles/Analytics.css";

/* Colors used for moods */
const COLORS = {
  happy: "#ff80ab",
  calm: "#ffd1e8",
  sad: "#8e6a7a",
  angry: "#c2185b",
  excited: "#ff5da9",
  neutral: "#e0b8c9",
  unknown: "#ffc1e3",
};

/* Emoji toppings for each mood */
const EMOJIS = {
  happy: "😊",
  calm: "🌿",
  sad: "😢",
  angry: "😡",
  excited: "🤩",
  neutral: "😐",
  unknown: "❔",
};

/* Helpers to convert polar coords to cartesian for SVG */
function polarToCartesian(cx, cy, radius, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

/* Describes an annular sector path (outer arc + inner arc back) */
function describeArc(cx, cy, radiusOuter, radiusInner, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, radiusOuter, endAngle);
  const endOuter = polarToCartesian(cx, cy, radiusOuter, startAngle);
  const startInner = polarToCartesian(cx, cy, radiusInner, startAngle);
  const endInner = polarToCartesian(cx, cy, radiusInner, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${radiusOuter} ${radiusOuter} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${radiusInner} ${radiusInner} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
  return d;
}

/* Fixed sprinkle positions to avoid random jitter on each render */
const SPRINKLE_ANGLES = [10, 30, 55, 85, 120, 150, 185, 210, 245, 280, 310, 335, 350, 200];

export default function Analytics() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hover, setHover] = useState({ idx: null, x: 0, y: 0 });

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await fetch("http://localhost:8000/get-all-entries/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setEntries(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load entries");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="loading">Loading analytics...</p>;
  if (error) return <p className="error">{error}</p>;

  const total = entries.length;
  const moodCounts = entries.reduce((acc, e) => {
    const m = (e.mood || "unknown").toLowerCase();
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  const moodArray = Object.keys(moodCounts)
    .map((k) => ({ mood: k, count: moodCounts[k], color: COLORS[k] || COLORS.unknown }))
    .sort((a, b) => b.count - a.count);

  // SVG donut layout
  const size = 380;
  const cx = size / 2;
  const cy = size / 2;
  const radiusOuter = 150;
  const radiusInner = 82;

  // Build segments with angles and toppings
  let angleOffset = -90; // start top
  const segments = moodArray.map((m) => {
    const pct = m.count / total;
    const start = angleOffset;
    const end = angleOffset + pct * 360;
    angleOffset = end;
    const mid = (start + end) / 2;
    const toppingRadius = (radiusOuter + radiusInner) / 2 + 14;
    const toppingPos = polarToCartesian(cx, cy, toppingRadius, mid);
    return {
      ...m,
      start,
      end,
      mid,
      pct,
      toppingPos,
      path: describeArc(cx, cy, radiusOuter, radiusInner, start, end),
    };
  });

  // tooltip handlers
  const onSegEnter = (e, idx) => {
    setHover({ idx, x: e.clientX, y: e.clientY });
  };
  const onSegMove = (e, idx) => {
    setHover({ idx, x: e.clientX, y: e.clientY });
  };
  const onSegLeave = () => {
    setHover({ idx: null, x: 0, y: 0 });
  };

  return (
    <div className="analysis-root">
      <h1 className="analysis-title">Analytics</h1>

      {total === 0 ? (
        <p>No entries yet to analyze.</p>
      ) : (
        <div className="analytics-grid">
          <div className="donut-card">
            <svg viewBox={`0 0 ${size} ${size}`} className="analytics-svg" role="img" aria-label="Mood donut">
              <defs>
                <radialGradient id="donut-base" cx="50%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="#ffdce8" />
                  <stop offset="55%" stopColor="#ff80ab" />
                  <stop offset="100%" stopColor="#d14b7b" />
                </radialGradient>

                <radialGradient id="glaze" cx="35%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
                  <stop offset="60%" stopColor="#fff3f8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#fff3f8" stopOpacity="0.05" />
                </radialGradient>

                <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#f2a9c7" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* soft background */}
              <circle cx={cx} cy={cy} r={radiusOuter + 18} fill="#fff2f6" />

              {/* donut base (pink) */}
              <circle cx={cx} cy={cy} r={radiusOuter} fill="url(#donut-base)" filter="url(#soft)" />

              {/* additive glare / glaze */}
              <path
                d={describeArc(cx, cy, radiusOuter - 2, radiusInner + 2, -120, 80)}
                fill="url(#glaze)"
                opacity="0.95"
              />

              {/* sprinkles (fixed positions for stability) */}
              {SPRINKLE_ANGLES.map((angle, i) => {
                const rad = radiusInner + (radiusOuter - radiusInner) * (0.55 + ((i % 3) * 0.06));
                const pos = polarToCartesian(cx, cy, rad, angle + (i * 7) % 360);
                const colors = ["#ffffff", "#ffd400", "#5ad8ff", "#b8ffb0", "#ff9ac4"];
                const color = colors[i % colors.length];
                return (
                  <rect
                    key={`spr-${i}`}
                    x={pos.x - 3}
                    y={pos.y - 6}
                    width="6"
                    height="12"
                    rx="3"
                    ry="3"
                    fill={color}
                    transform={`rotate(${angle + (i * 7) % 360}, ${pos.x}, ${pos.y})`}
                    opacity="0.95"
                  />
                );
              })}

              {/* donut segments (annular sectors) */}
              {segments.map((seg, i) => (
                <g key={seg.mood}>
                  <path
                    d={seg.path}
                    fill={seg.color}
                    stroke="#fff"
                    strokeWidth={1}
                    onMouseEnter={(e) => onSegEnter(e, i)}
                    onMouseMove={(e) => onSegMove(e, i)}
                    onMouseLeave={onSegLeave}
                    style={{
                      cursor: "pointer",
                      transition: "transform 150ms",
                    }}
                    transform={hover.idx === i ? `translate(${(seg.mid ? polarToCartesian(cx, cy, 6, seg.mid).x - cx : 0)}, ${(seg.mid ? polarToCartesian(cx, cy, 6, seg.mid).y - cy : 0)}) scale(1.02)` : undefined}
                  />
                </g>
              ))}

              {/* inner hole */}
              <circle cx={cx} cy={cy} r={radiusInner} fill="#fff" stroke="rgba(0,0,0,0.04)" />

              {/* center text */}
              <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#2b2233">
                {total}
              </text>
              <text x={cx} y={cy + 16} textAnchor="middle" fontSize="12" fill="#7d6a7d">
                entries
              </text>

              {/* emoji toppings */}
              {segments.map((seg, i) => (
                <g key={`t-${seg.mood}`} transform={`translate(${seg.toppingPos.x}, ${seg.toppingPos.y})`} style={{ pointerEvents: "auto" }}>
                  <circle r={16} fill="#fff" stroke="rgba(0,0,0,0.04)" />
                  <circle r={12} fill={seg.color} />
                  <text x="0" y="6" textAnchor="middle" fontSize="14" style={{ pointerEvents: "none" }}>
                    {EMOJIS[seg.mood] || "💫"}
                  </text>
                </g>
              ))}
            </svg>

            {/* legend */}
            <div className="donut-legend">
              {segments.map((s) => (
                <div className="legend-row" key={s.mood}>
                  <span className="legend-swatch" style={{ background: s.color }} />
                  <span className="legend-name">{s.mood}</span>
                  <span className="legend-value">{s.count} ({Math.round(s.pct * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* right column */}
          <div className="bars-card">
            <h3>Counts by mood</h3>
            <div className="bars-list">
              {segments.map((m) => (
                <div key={m.mood} className="bar-row">
                  <div className="bar-label">
                    <strong style={{ textTransform: "capitalize" }}>{m.mood}</strong> <span className="muted">({m.count})</span>
                  </div>
                  <div className="bar-visual">
                    <div className="bar-filled" style={{ width: `${m.pct * 100}%`, background: m.color }} />
                  </div>
                  <div className="bar-pct">{Math.round(m.pct * 100)}%</div>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: 18 }}>Raw entries (latest 10)</h3>
            <div className="entries-list">
              {entries.slice(0, 10).map((e, i) => (
                <div key={i} className="entry-row">
                  <div className="entry-date">{new Date(e.date).toDateString()}</div>
                  <div className="entry-mood" style={{ color: COLORS[(e.mood || "unknown").toLowerCase()] || "#333" }}>
                    {e.mood}
                  </div>
                  <div className="entry-text">{(e.content || "").slice(0, 120)}{(e.content || "").length > 120 ? "…" : ""}</div>
                </div>
              ))}
            </div>
          </div>

          {/* tooltip */}
          {hover.idx !== null && (
            <div className="svg-tooltip" style={{ left: hover.x + 12, top: hover.y + 12 }}>
              <div className="tt-name" style={{ color: segments[hover.idx].color, textTransform: "capitalize" }}>
                {segments[hover.idx].mood}
              </div>
              <div className="tt-count">{segments[hover.idx].count} entries • {Math.round(segments[hover.idx].pct * 100)}%</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
