import React, { useState } from "react";
import { Star, MessageSquareHeart } from "lucide-react";
import ReviewPlatformModal from "./ReviewPlatformModal";

export default function ReviewPlatformCTA() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="relative z-10 w-full border-t border-b border-violet-100 dark:border-violet-900/40 bg-gradient-to-r from-violet-50/80 via-white to-purple-50/80 dark:from-[#0D0D18] dark:via-[#141224] dark:to-[#0D0D18] py-4 px-4 transition-colors">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white shadow-xs shrink-0">
              <MessageSquareHeart size={16} />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Love SkillSwap? Tell others what you think.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                ))}
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 ml-1">
                  Rate the platform & share your experience
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:shadow-violet-600/30 cursor-pointer shrink-0"
          >
            <Star size={14} className="fill-white" /> Review SkillSwap
          </button>
        </div>
      </section>

      {/* Review Modal */}
      <ReviewPlatformModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
