import React, { useEffect } from "react";
import { Users2, Sparkles, HeartHandshake } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button, Badge } from "../components/ui";
import RibbonBackground from "../components/RibbonBackground";

const Collaboration = () => {
  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FAF9FF] dark:bg-[#07070C] py-20 px-6 md:px-16 overflow-hidden transition-colors duration-300">
      {/* Flowing Ribbon Background */}
      <RibbonBackground variant="flow" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <Badge data-aos="fade-up" icon={<HeartHandshake size={13} />} className="mx-auto mb-5">
          Peer-to-Peer Learning
        </Badge>
        <h1
          data-aos="fade-up"
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 text-gray-900 dark:text-white tracking-tight"
        >
          Collaboration
        </h1>
        <p
          data-aos="fade-up"
          className="text-gray-600 dark:text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed"
        >
          Build meaningful connections and collaborate through 1-on-1 skill-swapping.
        </p>

        {/* Premium Dark-Mode Optimized Card */}
        <div
          data-aos="fade-up"
          className="p-8 sm:p-12 max-w-3xl mx-auto text-center rounded-3xl border border-violet-200/80 dark:border-violet-900/60 bg-white/90 dark:bg-[#181824]/90 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-violet-500/60 hover:shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-5 shadow-xs ring-2 ring-violet-500/20">
            <Users2 size={32} />
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
            Start Collaborating Today!
          </h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Pair up with learners who complement your skills and begin your learning journey together.
          </p>

          <Button
            to="/start-swap"
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md hover:shadow-violet-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles size={16} /> Find Your Match
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Collaboration;
