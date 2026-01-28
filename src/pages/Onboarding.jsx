import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandHeader from "../components/BrandHeader";

export default function Onboarding() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    examDate: "",
    targetBand: "",
    listening: "",
    reading: "",
    writing: "",
    speaking: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const user = {
      examDate: form.examDate,
      targetBand: Number(form.targetBand),
      scores: {
        listening: Number(form.listening),
        reading: Number(form.reading),
        writing: Number(form.writing),
        speaking: Number(form.speaking),
      },
      streak: 0,
      lastActive: null,
    };

    localStorage.setItem("leapUser", JSON.stringify(user));
    navigate("/today");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col">
      {/* Header */}
      <BrandHeader />

      {/* Centered Form */}
      <div className="flex flex-1 items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">
            IELTS Setup
          </h2>

          <div>
            <label className="block text-sm font-medium">
              Exam Date
            </label>
            <input
              type="date"
              name="examDate"
              value={form.examDate}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Target Band
            </label>
            <input
              type="number"
              min="1"
              max="9"
              step="0.5"
              name="targetBand"
              value={form.targetBand}
              onChange={handleChange}
              required
              className="mt-1 w-full border rounded-lg p-2"
            />
          </div>

          {["listening", "reading", "writing", "speaking"].map(
            (skill) => (
              <div key={skill}>
                <label className="block text-sm font-medium capitalize">
                  Current {skill} Score
                </label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  step="0.5"
                  name={skill}
                  value={form[skill]}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border rounded-lg p-2"
                />
              </div>
            )
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-lg"
          >
            Generate My Plan →
          </button>
        </form>
      </div>
    </div>
  );
}
