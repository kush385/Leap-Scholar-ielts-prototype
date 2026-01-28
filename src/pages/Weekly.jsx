import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandHeader from "../components/BrandHeader";

/* ------------------ HELPERS ------------------ */

function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

function estimateCurrentBand(scores) {
  return (
    Object.values(scores).reduce((a, b) => a + Number(b), 0) /
    Object.values(scores).length
  );
}

function computeForecast(current, target, streak) {
  const ratio = current / target;
  const base = ratio * 70;
  const streakBonus = Math.min(streak * 2, 20);
  return Math.min(Math.round(base + streakBonus), 95);
}

/* convert band score (0–9) to y-axis svg coordinate */
function scaleY(val, height = 180) {
  return height - (val / 9) * height;
}

/* ------------------ PAGE ------------------ */

export default function Weekly() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("leapUser"));
    if (!stored) navigate("/");

    setUser(stored);

    if (stored.lastActive) {
      const gap = daysBetween(stored.lastActive, new Date());
      if (gap >= 2) setRecoveryMode(true);
    }
  }, [navigate]);

  if (!user) return null;

  const skills = ["listening", "reading", "writing", "speaking"];
  const scores = skills.map((s) => Number(user.scores[s]));

  const currentBand = estimateCurrentBand(user.scores);
  const forecast = computeForecast(
    currentBand,
    user.targetBand,
    user.streak
  );

  const status =
    forecast > 75
      ? "On Track"
      : forecast > 55
      ? "Slightly Behind"
      : "At Risk";

  /* ---- GRAPH GEOMETRY ---- */

  const width = 500;
  const height = 180;
  const padding = 40;

  const xGap = (width - padding * 2) / (skills.length - 1);

  function lineFor(values) {
    return values
      .map(
        (v, i) =>
          `${padding + i * xGap},${scaleY(v, height)}`
      )
      .join(" ");
  }

  const skillLine = lineFor(scores);
  const avgLine = lineFor(skills.map(() => currentBand));
  const targetLine = lineFor(skills.map(() => user.targetBand));

  /* ------------------ UI ------------------ */

  return (
    <div className="min-h-screen bg-slate-50 p-8 space-y-6">

      <BrandHeader />

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Weekly Overview</h2>
          <p className="text-sm text-gray-600">
            Status:{" "}
            <span
              className={
                status === "On Track"
                  ? "text-green-600 font-semibold"
                  : status === "Slightly Behind"
                  ? "text-yellow-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {status}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/today")}
            className="text-blue-600 font-medium"
          >
            ← Back to Today
          </button>

          <button
            onClick={() => {
              const updated = { ...user };
              const past = new Date();
              past.setDate(past.getDate() - 4);
              updated.lastActive = past.toDateString();
              localStorage.setItem("leapUser", JSON.stringify(updated));
              setUser(updated);
              setRecoveryMode(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold"
          >
            ⚠ Simulate Inactivity
          </button>

          <button
            onClick={() => {
              localStorage.removeItem("leapUser");
              navigate("/");
            }}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-medium"
          >
            Reset Demo
          </button>
        </div>
      </div>

      {/* -------- GRAPH -------- */}

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-bold text-lg mb-4">
          Score Trajectory vs Target
        </h3>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-4xl mx-auto"
        >
          {/* grid lines */}
          {[0, 3, 6, 9].map((v) => (
            <line
              key={v}
              x1="0"
              x2={width}
              y1={scaleY(v, height)}
              y2={scaleY(v, height)}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
          ))}

          {/* TARGET */}
          <polyline
            points={targetLine}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* AVERAGE */}
          <polyline
            points={avgLine}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* SKILLS */}
          <polyline
            points={skillLine}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
          />

          {/* dots */}
          {scores.map((v, i) => (
            <circle
              key={i}
              cx={padding + i * xGap}
              cy={scaleY(v, height)}
              r="4"
              fill="#6366f1"
            />
          ))}
        </svg>

        {/* LABELS */}
        <div className="grid grid-cols-4 mt-4 text-center text-sm">
          {skills.map((s, i) => (
            <div key={s}>
              <p className="capitalize font-medium">{s}</p>
              <p className="text-gray-600">{scores[i]}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 text-xs text-center mt-3 text-gray-500">
          <div className="text-indigo-600">━━ Skill Score</div>
          <div className="text-emerald-600">- - Average</div>
          <div className="text-green-600">⋯ Target</div>
        </div>
      </div>

      {/* -------- RECOVERY MODE -------- */}

      {recoveryMode && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-2">
            Recovery Mode Activated
          </h3>

          <p className="text-sm mb-4">
            You’ve been inactive — restart with a lighter plan:
          </p>

          <div className="space-y-3 mb-4">
            {[
              "7-min Speaking Warm-up",
              "5 Quick Reading Qs",
              "Vocabulary Flash Drill",
            ].map((t) => (
              <div
                key={t}
                className="bg-white p-3 rounded-xl shadow-sm text-sm"
              >
                {t}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/today")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-xl font-semibold"
          >
            Resume Light Plan →
          </button>
        </div>
      )}
    </div>
  );
}
