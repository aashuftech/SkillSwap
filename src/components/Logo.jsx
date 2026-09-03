import React from "react";

// Inline SVG logo replacing the old PNG asset — same "SkillSwap" brand,
// redrawn to match the gradient diamond mark + wordmark from the reference design.
const Logo = ({ className = "", textClassName = "", dark = false }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="55%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="32" height="32" rx="10" fill="url(#logoGrad)" transform="rotate(-8 17 17)" />
        <path
          d="M11 21.5L17 15.5H14.5L20 9.5"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M23 12.5L17 18.5H19.5L14 24.5"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.85"
        />
      </svg>
      <span className={`font-bold text-xl ${dark ? "text-white" : "text-gray-900"} ${textClassName}`}>
        <span className="bg-gradient-to-r from-[var(--jb-primary)] to-[var(--jb-accent)] bg-clip-text text-transparent">S</span>
        killSwap
      </span>
    </div>
  );
};

export default Logo;
