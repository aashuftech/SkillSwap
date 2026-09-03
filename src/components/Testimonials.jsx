import { API } from "../lib/apiConfig.js";
import React, { useEffect, useState } from "react";
import { MessageSquareQuote, Star, Sparkles } from "lucide-react";
import { Section, SectionHeading, Card } from "./ui";
import ReviewPlatformModal from "./ReviewPlatformModal";


const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReviews = () => {
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
  }, []);

  return (
    <Section tone="soft">
      <SectionHeading
        eyebrow="Success stories"
        eyebrowIcon={<MessageSquareQuote size={13} />}
        title="Real swaps, real results"
        subtitle="A few members on what trading a skill for a skill actually looked like for them."
      />

      {reviews.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id || review.name} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={15}
                      className={index < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"}
                    />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-6 mb-6 grow">
                  "{review.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                {review.img ? (
                  <img
                    src={review.img}
                    alt={review.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    {review.name?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{review.role || "Skill Swapper"}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-10 px-6 bg-white dark:bg-[#181824] rounded-3xl border border-violet-200 dark:border-violet-900/60 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={22} />
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
            Be the first to review SkillSwap!
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Share your swap experience with the community. Approved reviews are highlighted here.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
          >
            <Star size={14} className="fill-white" /> Write a Review
          </button>
        </div>
      )}

      {/* Review Modal */}
      <ReviewPlatformModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onReviewSubmitted={fetchReviews}
      />
    </Section>
  );
};

export default Testimonials;
