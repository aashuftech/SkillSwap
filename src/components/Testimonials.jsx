import { API } from "../lib/apiConfig.js";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquareQuote, Star, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Section, Card } from "./ui";
import ReviewPlatformModal from "./ReviewPlatformModal";

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(3);

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

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // Carousel autoplay when reviews > 3
  useEffect(() => {
    if (reviews.length <= 3 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, reviews.length - itemsPerPage);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [reviews.length, isPaused, itemsPerPage]);

  const maxIndex = Math.max(0, reviews.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <Section tone="soft">
      {/* Header section with title and top-right View All Reviews link */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 mb-9">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1.5">
            <MessageSquareQuote size={14} /> Success stories
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Real swaps, real results
          </h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1.5">
            A few members on what trading a skill for a skill actually looked like for them.
          </p>
        </div>

        {reviews.length > 0 && (
          <Link
            to="/platform-reviews"
            className="jb-link text-violet-700 dark:text-violet-400 font-semibold text-sm md:text-base inline-flex items-center gap-1.5 group cursor-pointer"
          >
            <span>View All Reviews</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        )}
      </div>

      {reviews.length === 0 ? (
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
      ) : reviews.length <= 3 ? (
        /* 3 or less approved reviews: existing 3-card grid layout */
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
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800 shrink-0"
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
      ) : (
        /* More than 3 approved reviews: interactive carousel */
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden py-2 px-1">
            <div
              className="flex transition-transform duration-500 ease-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {reviews.map((review, idx) => (
                <div
                  key={review.id || idx}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 flex"
                >
                  <Card className="p-6 flex flex-col justify-between w-full h-full">
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
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800 shrink-0"
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
                </div>
              ))}
            </div>
          </div>

          {/* Controls: Prev / Next Buttons & Indicators */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#181824] flex items-center justify-center text-gray-700 dark:text-gray-200 hover:border-violet-600 hover:text-violet-600 dark:hover:border-violet-400 dark:hover:text-violet-400 transition cursor-pointer shadow-xs"
                aria-label="Previous review"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#181824] flex items-center justify-center text-gray-700 dark:text-gray-200 hover:border-violet-600 hover:text-violet-600 dark:hover:border-violet-400 dark:hover:text-violet-400 transition cursor-pointer shadow-xs"
                aria-label="Next review"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Slide Dots */}
            <div className="flex gap-1.5">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? "w-6 bg-violet-600 dark:bg-violet-400"
                      : "w-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
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
