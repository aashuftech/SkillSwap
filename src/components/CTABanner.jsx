import React from "react";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { Button } from "./ui";

const CTABanner = () => {
  return (
    <section className="relative overflow-hidden px-6 md:px-8 py-10">
      <div className="relative overflow-hidden max-w-7xl mx-auto rounded-3xl p-8 md:p-12 border border-violet-200 dark:border-violet-800/80 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 dark:from-[#171725] dark:via-[#1B1B2B] dark:to-[#171725] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Ambient background blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-400/25 dark:bg-violet-600/30 blur-3xl animate-blob-drift"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-400/25 dark:bg-indigo-600/30 blur-3xl"
        />

        <div className="relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2">
            <Sparkles size={14} /> Join 10K+ Active Swappers
          </div>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2.5 tracking-tight">
            Ready to start your learning journey?
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-lg">
            Join thousands of learners and teachers on SkillSwap today. Free forever.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3.5 shrink-0">
          <Button to="/signup" variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
            Join Now
          </Button>
          <Button to="/explore" variant="outline" size="lg" leftIcon={<PlayCircle size={18} />}>
            Explore Skills
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
