import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { HOW_IT_WORKS_STEPS } from "../data/howItWorks";
import { Section } from "./ui";
import { Link } from "react-router-dom";
import RibbonBackground from "./RibbonBackground";

const HowItWorks = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
  }, []);

  return (
    <Section id="how-it-works" tone="white" className="relative overflow-hidden scroll-mt-24 py-20">
      {/* Exact Flowing Ribbon Background */}
      <RibbonBackground variant="flow" />

      <div className="relative z-10 text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1.5">
          Simple 4-Step Process
        </p>
        <h2 data-aos="fade-up" className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          How SkillSwap Works
        </h2>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2">
          From finding a partner to exchanging skills, here is how you can start today.
        </p>
      </div>

      <div data-aos="fade-up" className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {HOW_IT_WORKS_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.number}
              to={step.path}
              className="p-6 relative rounded-2xl border border-gray-200 dark:border-[#2C2C3E] bg-white dark:bg-[#181824] shadow-sm hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-250 flex flex-col justify-between group"
            >
              <span className="absolute -top-3 left-6 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                Step {step.number}
              </span>
              <div>
                <div className="w-13 h-13 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center mb-4 mt-2 text-violet-600 dark:text-violet-400 shadow-xs group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
};

export default HowItWorks;
