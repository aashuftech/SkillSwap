import { API } from "../lib/apiConfig.js";
import React, { useState, useEffect } from "react";
import { Star, X, CheckCircle2, Loader2, Sparkles, MessageSquareHeart, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { authFetch } from "../lib/authFetch";


export default function ReviewPlatformModal({ isOpen, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [teachingSkill, setTeachingSkill] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setSuccessMsg("");
      try {
        const stored = JSON.parse(localStorage.getItem("skillswapUser") || "null");
        setCurrentUser(stored);
        if (stored?.skillsToTeach) {
          setTeachingSkill(stored.skillsToTeach);
        }
      } catch {
        setCurrentUser(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg("Please select a rating between 1 and 5 stars.");
      return;
    }
    if (!reviewText.trim()) {
      setErrorMsg("Please enter your review text.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const response = await authFetch("/api/platform-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          reviewText: reviewText.trim(),
          teachingSkill: teachingSkill.trim(),
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      let data = {};
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error(
          response.ok
            ? "Unexpected server response format."
            : `Server error (${response.status}). Please ensure backend is active.`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review.");
      }

      setSuccessMsg(
        data.message ||
          "Thank you for reviewing SkillSwap! Your review has been submitted and is pending admin approval."
      );
      setReviewText("");
      if (onReviewSubmitted) onReviewSubmitted(data.review);

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || "Could not submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#181824] p-6 sm:p-8 shadow-2xl border border-violet-100 dark:border-violet-900/60 transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1.5">
          <MessageSquareHeart size={16} /> SkillSwap Platform Review
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          Rate your SkillSwap experience
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6">
          Share how trading skills on SkillSwap has helped your journey. Approved reviews are featured on the homepage!
        </p>

        {/* Not Logged In Notice */}
        {!currentUser ? (
          <div className="text-center py-6 px-4 bg-violet-50 dark:bg-violet-950/40 rounded-2xl border border-violet-200 dark:border-violet-800/60">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
              You need to be logged in to leave a real platform review.
            </p>
            <Link
              to="/login"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-6 py-2.5 text-sm font-bold text-white shadow-md transition"
            >
              <LogIn size={16} /> Log In to Review
            </Link>
          </div>
        ) : successMsg ? (
          <div className="text-center py-8 px-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 animate-fadeIn">
            <CheckCircle2 size={42} className="text-emerald-500 mx-auto mb-3 animate-bounce-short" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Review Submitted!</h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
              {successMsg}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User identification badge */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#12121A] rounded-2xl border border-gray-200 dark:border-gray-800">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/40"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {currentUser.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Reviewing as</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
              </div>
            </div>

            {/* Star Rating Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Overall Rating (1–5 Stars)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-120 transition-transform cursor-pointer focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={`${
                        (hoveredRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 dark:text-gray-600 fill-transparent"
                      } transition-colors`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-extrabold text-gray-900 dark:text-white">
                  {hoveredRating || rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Your Review / Experience
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What do you love most about SkillSwap? How has it helped you learn or teach new skills?"
                rows={4}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#12121A] p-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 outline-none transition"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{errorMsg}</p>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 px-6 py-2.5 text-sm font-bold text-white shadow-md transition disabled:opacity-60 cursor-pointer"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
