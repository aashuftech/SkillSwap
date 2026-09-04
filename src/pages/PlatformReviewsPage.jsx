import { API } from "../lib/apiConfig.js";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquareQuote, Star, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { Section, Card } from "../components/ui";
import RibbonBackground from "../components/RibbonBackground";
import ReviewPlatformModal from "../components/ReviewPlatformModal";

export default function PlatformReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReviews = () => {
    setLoading(true);
    fetch(`${API}/api/platform-reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--jb-bg)] dark:bg-[#07070D] transition-colors duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#181126] via-[#24173d] to-violet-950 px-6 py-16 text-white shadow-xl sm:px-12">
        <RibbonBackground variant="hero" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-white transition mb-6"
          >
            <ArrowLeft size={15} /> Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200 mb-3">
                <MessageSquareQuote size={14} className="text-yellow-300" />
                <span>Community Feedback</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Platform Reviews & Stories
              </h1>
              <p className="mt-3 text-sm md:text-base text-purple-200/80 max-w-2xl leading-relaxed">
                Read authentic reviews from members on what trading skills on SkillSwap actually looks like.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm px-6 py-3 shadow-lg shadow-violet-900/50 transition cursor-pointer shrink-0"
            >
              <Star size={16} className="fill-white" /> Review SkillSwap
            </button>
          </div>
        </div>
      </div>

      {/* Main Reviews Grid */}
      <Section className="py-12 max-w-7xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading member reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white dark:bg-[#181824] rounded-3xl border border-violet-200 dark:border-violet-900/60 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
              <Sparkles size={22} />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
              Be the first to review SkillSwap!
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Share your skill exchange experience with our community.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
            >
              <Star size={14} className="fill-white" /> Write a Review
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.id || review.name} className="p-6 flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={16}
                          className={index < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"}
                        />
                      ))}
                    </div>
                    {review.createdAt && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-6 font-normal">
                    "{review.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                  {review.img ? (
                    <img
                      src={review.img}
                      alt={review.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800/60"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {review.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{review.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{review.role || "Skill Swapper"}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Modal */}
      <ReviewPlatformModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onReviewSubmitted={fetchReviews}
      />
    </div>
  );
}
