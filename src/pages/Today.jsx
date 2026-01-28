import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandHeader from "../components/BrandHeader";

function daysUntil(dateStr) {
  const today = new Date();
  const exam = new Date(dateStr);
  return Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
}

function estimateCurrentBand(scores) {
  return (
    Object.values(scores).reduce((a, b) => a + Number(b), 0) /
    Object.values(scores).length
  );
}

function biggestGap(scores, target) {
  let maxGap = -1;
  let weakest = "";

  for (const skill in scores) {
    const gap = target - Number(scores[skill]);
    if (gap > maxGap) {
      maxGap = gap;
      weakest = skill;
    }
  }
  return weakest;
}

function computeForecast(current, target, streak) {
  const ratio = current / target;
  const base = ratio * 70;
  const streakBonus = Math.min(streak * 2, 20);
  return Math.min(Math.round(base + streakBonus), 95);
}

/* IELTS demo content */
const demoContent = {
  listening: {
    title: "Listening Section 2",
    body:
      "🎧 *IELTS Listening Practice*\n\nYou will hear a conversation about university accommodation. Answer Q1–Q5:\n\n1) What does the student prefer?\nA) On-campus\nB) Private housing\nC) Hostel\nD) Family share\n\n*(Audio placeholder here — simulate playing audio)*",
  },
  reading: {
    title: "Reading Passage — Urban Growth",
    body:
      "📖 *IELTS Reading Practice*\n\nUrbanisation has increased congestion in megacities. According to the passage, what is the PRIMARY cause?\n\n1. Population boom\n2. Insufficient transport\n3. Poor planning\n4. Economic shifts\n\n*(Simulate scrolling text, highlight keywords)*",
  },
  writing: {
    title: "Writing Task 2 — Online vs Classroom",
    body:
      "✍️ *IELTS Writing Task*\n\nSome people think online education is superior to classroom teaching. Discuss both views and give your opinion.\n\nPlan:\n• Intro\n• 2 body paragraphs\n• Conclusion\n\n*(Demo text box for writing)*",
  },
  speaking: {
    title: "Speaking Cue Card — Describe an Influencer",
    body:
      "🗣️ *IELTS Speaking Practice*\n\nDescribe a teacher who influenced your education.\nYou should say:\n• Who they are\n• How they helped you\n• Why they mattered\n\n*(Record your answer here — mic placeholder)*",
  },
  mixed: {
    title: "Mini Mock Sampler",
    body:
      "🧩 *Mini Mock*\n\n• 1 Listening question\n• 1 Reading question\n• 1 Speaking cue\n• 1 Writing prompt\n\n*(Simulated mixed practice — show all types together)*",
  },
  review: {
    title: "Review Your Mistakes",
    body:
      "📊 *Review Mode*\nYou missed:\n• Listening Q3 – detail trap\n• Reading Q5 – inference error\n\nSuggested drills:\n• Listening focus questions\n• Reading speed practice\n\n*(Show highlighted errors with hints)*",
  },
};

export default function Today() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [weakest, setWeakest] = useState("");
  const [currentBand, setCurrentBand] = useState(0);
  const [forecast, setForecast] = useState(0);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("leapUser"));

    if (!stored) {
      navigate("/");
      return;
    }

    const todayStr = new Date().toDateString();
    if (stored.lastActive !== todayStr) {
      stored.streak = stored.lastActive ? stored.streak + 1 : 1;
      stored.lastActive = todayStr;
      localStorage.setItem("leapUser", JSON.stringify(stored));
    }

    setUser(stored);

    const current = estimateCurrentBand(stored.scores);
    setCurrentBand(current.toFixed(1));

    const weak = biggestGap(stored.scores, stored.targetBand);
    setWeakest(weak);

    const f = computeForecast(current, stored.targetBand, stored.streak);
    setForecast(f);
  }, [navigate]);

  if (!user) return null;

  const daysLeft = daysUntil(user.examDate);
  const gapRemaining = (user.targetBand - currentBand).toFixed(1);

  const sprintTasks = [
    {
      id: 1,
      skill: weakest,
      title: `Boost ${weakest} Practice`,
      desc: "High-impact focused drill",
    },
    {
      id: 2,
      skill:
        weakest === "writing"
          ? "speaking"
          : weakest === "speaking"
          ? "writing"
          : weakest,
      title: `Timed ${weakest === "writing"
        ? "Speaking"
        : weakest === "speaking"
        ? "Writing"
        : weakest} Set`,
      desc: "Exam-like questions",
    },
    {
      id: 3,
      skill: "mixed",
      title: "Mini Mock",
      desc: "Cross-skill sampler",
    },
  ];

  const extras = [
    { label: "Full Mock Test", skill: "mixed" },
    { label: "Speaking Eval", skill: "speaking" },
    { label: "Review Mistakes", skill: "review" },
  ];

  return (
    
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        <BrandHeader />

        {/* Header + Forecast */}
        <div className="bg-white shadow-md rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Today’s Plan
              </h1>
              <p className="text-sm text-gray-600">
                Exam in <strong>{daysLeft} days</strong> · Focus:{" "}
                <strong className="capitalize">{weakest}</strong>
              </p>
            </div>
            <button
              onClick={() => navigate("/weekly")}
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              View Weekly 
            </button>
            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
  🔥 {user.streak}-day streak · ⭐ {user.streak * 120} pts
</div>

          </div>

          {/* Progress Bars */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="bg-slate-100 p-3 rounded-lg text-center">
              <p className="text-lg font-semibold text-indigo-700">{currentBand}</p>
              <p className="text-xs text-gray-500">Current Band</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg text-center">
              <p className="text-lg font-semibold text-indigo-700">{user.targetBand}</p>
              <p className="text-xs text-gray-500">Target Band</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg text-center">
              <p className="text-lg font-semibold text-indigo-700">{gapRemaining}</p>
              <p className="text-xs text-gray-500">Gap</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg text-center">
              <p className="text-lg font-semibold text-indigo-700">{forecast}%</p>
              <p className="text-xs text-gray-500">Target Reach Projection
</p>
            </div>
          </div>

          <button
            onClick={() =>
              setActiveLesson({
                skill: weakest,
                ...demoContent[weakest],
              })
            }
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg text-lg font-semibold"
          >
            ▶ Start Today’s Lesson
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* 🧠 Big Lesson Panel */}
          <div className="col-span-7 bg-white shadow-md rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              Lesson Preview
            </h2>

            {activeLesson ? (
              <>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {activeLesson.title}
                </h3>
                <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded-lg mb-4 text-gray-800">
                  {activeLesson.body}
                </pre>

                <button
                  onClick={() => setActiveLesson(null)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Complete ➤
                </button>
              </>
            ) : (
              <p className="text-gray-500">
                Select a sprint or click Start to begin your session.
              </p>
            )}
          </div>

          {/* 📌 Sprint Actions */}
          <div className="col-span-3 space-y-4">
            {sprintTasks.map((task) => (
              <div
                key={task.id}
                onClick={() =>
                  setActiveLesson({
                    skill: task.skill,
                    ...demoContent[task.skill],
                  })
                }
                className="bg-white shadow-md rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition"
              >
                <p className="font-semibold text-sm text-gray-800">
                  {task.title}
                </p>
                <p className="text-xs text-gray-500">{task.desc}</p>
              </div>
            ))}
          </div>

          {/* 🔎 Extra Options */}
          <div className="col-span-2 space-y-3">
            {extras.map((e) => (
              <div
                key={e.label}
                onClick={() =>
                  setActiveLesson({
                    skill: e.skill,
                    ...demoContent[e.skill],
                  })
                }
                className="bg-white shadow rounded-xl text-center text-sm text-indigo-700 cursor-pointer hover:bg-slate-50 py-3"
              >
                {e.label}
              </div>
            ))}
          </div>

        </div>
        {/* REWARD INFO (SECONDARY) */}
<div className="flex justify-center mt-8">
  <div className="bg-slate-100 border border-slate-200 rounded-xl px-6 py-4 max-w-md w-full text-center">
    <p className="text-sm font-semibold text-gray-700">
      Rewards you can unlock
    </p>

    <div className="flex justify-between mt-3 text-xs text-indigo-700">
      <span>500 pts → Mock Fee Discount</span>
      <span>800 pts → App Fee Waiver</span>
      <span>1200 pts → Consult Voucher</span>
    </div>
  </div>
</div>

      </div>
</div>
  );
}
