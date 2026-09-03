import React, { useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Badge, Button } from "./ui";
import RibbonBackground from "./RibbonBackground";

const HERO_PHOTO = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80";

const AVATAR_STACK = [
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=100&q=80",
];

const Hero = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
  }, []);

  return (
    <section className="relative bg-[#FAF9FF] dark:bg-[#07070C] overflow-hidden border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {/* Exact Premium Luminous Silk Ribbon Flow from Reference Image (Light & Dark dynamic) */}
      <RibbonBackground variant="hero" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 max-w-7xl container mx-auto py-20 px-6 md:px-8">
        <div className="max-w-xl text-center lg:text-left">
          <Badge data-aos="fade-up" icon={<Sparkles size={14} />} className="mb-5 bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-700/60 shadow-sm">
            LEARN. TEACH. GROW TOGETHER
          </Badge>
          <h1 data-aos="fade-right" className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.15] tracking-tight">
            Exchange skills. <br />
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-300 dark:to-indigo-300">possibilities.</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-9 leading-relaxed" data-aos="fade-right">
            SkillSwap is a community-driven platform where you can learn new skills,
            teach what you know, and grow together through real 1-on-1 connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" data-aos="fade-up">
            <Button to="/start-swap" size="lg" rightIcon={<ArrowRight size={18} />}>
              Start Swapping
            </Button>
            <Button to="/explore" variant="outline" size="lg" className="border-gray-300 dark:border-violet-500/50 text-gray-800 dark:text-white hover:bg-violet-50 dark:hover:bg-violet-950/40">
              Explore Skills
            </Button>
          </div>
        </div>

        <div className="relative w-full max-w-md lg:max-w-lg" data-aos="fade-left">
          <img
            src={HERO_PHOTO}
            alt="Two people learning together"
            className="w-full h-88 sm:h-96 object-cover rounded-3xl shadow-2xl ring-1 ring-gray-200 dark:ring-violet-500/30"
          />
          <div className="absolute -bottom-5 left-5 bg-white/95 dark:bg-[#13131F]/95 backdrop-blur-md rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-3.5 border border-gray-200 dark:border-violet-500/30">
            <div className="flex -space-x-2.5">
              {AVATAR_STACK.map((src) => (
                <img key={src} className="w-9 h-9 rounded-full border-2 border-white dark:border-[#13131F] object-cover ring-1 ring-violet-400" src={src} alt="" />
              ))}
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">10K+ Members</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Skill Swappers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
