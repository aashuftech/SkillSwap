import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { authFetch } from "../lib/authFetch";
import RibbonBackground from "../components/RibbonBackground";

export default function AddSkills() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [learnSkill, setLearnSkill] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await authFetch("/api/skills", {
        method: "POST",
        body: JSON.stringify({ title, description, learnSkill }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Skill submit nahi hui.");
      setResult(data.skill);
      setTitle("");
      setDescription("");
      setLearnSkill("");
    } catch (submitError) {
      setError(submitError.message || "Server se connect nahi ho paaya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#FAF9FF] dark:bg-[#07070C] px-4 py-18 overflow-hidden transition-colors duration-300">
      <RibbonBackground variant="form" />
      <section className="relative z-10 mx-auto max-w-xl rounded-3xl bg-white dark:bg-[#13131F] p-8 sm:p-10 shadow-xl border border-gray-200 dark:border-violet-500/20 animate-fade-in-up">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1">
          <Sparkles size={14} /> AI Skill Verification
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add a skill to teach</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          AI automatically screens your skill, then it waits for quick admin approval
          before appearing live in the Community Directory.
        </p>

        <form className="mt-8 space-y-5" onSubmit={submit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
              Skill I can teach
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12121A] px-4 py-3.5 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-600"
              placeholder="e.g. React.js, UI/UX Design, Keyword Research..."
              maxLength={120}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
              Describe what you'll teach
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12121A] px-4 py-3.5 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-600"
              placeholder="What will learners walk away knowing? What are the key concepts?"
              maxLength={2000}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
              What I want to learn in return (optional)
            </span>
            <input
              value={learnSkill}
              onChange={(event) => setLearnSkill(event.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12121A] px-4 py-3.5 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-600"
              placeholder="e.g. Python, Graphic Design, Video Editing..."
              maxLength={120}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? "AI Reviewing..." : "Submit for Approval"}
          </button>
        </form>

        {error && (
          <p className="mt-5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-5 rounded-2xl bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 p-5 text-sm text-violet-900 dark:text-violet-200 animate-fade-in-up">
            <div className="flex items-center gap-2 font-bold text-violet-800 dark:text-violet-300 mb-2">
              <ShieldCheck size={18} />
              Status: Submitted for Admin Review
            </div>
            <p className="mt-1">
              Category: <b>{result.category}</b>
            </p>
            <p className="mt-1">
              AI Recommendation: <b>{result.aiReview?.recommendation}</b> ({Math.round((result.aiReview?.confidence || 0) * 100)}% confidence)
            </p>
            <p className="mt-2 text-xs text-violet-700 dark:text-violet-400">
              Your skill will appear in Browse Skills as soon as our admin approves it.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
