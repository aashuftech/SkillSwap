import React from "react";

/**
 * Premium Flowing Luminous Silk Ribbon Background (100% Vector CSS/SVG)
 * Recreates the exact flowing luminous purple/violet silk ribbon light effect from the reference image.
 * Explicitly placed behind all content (z-0, pointer-events-none).
 * Zero images, zero canvas, 60fps performance.
 */
export default function RibbonBackground({ variant = "hero", className = "" }) {
  // 1. HERO VARIANT: Symmetrical V-shaped luminous silk ribbons from corners
  if (variant === "hero") {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      >
        {/* Dark Mode Version */}
        <svg
          className="hidden dark:block w-full h-full opacity-95"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="heroDarkLeftGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#9333EA" stopOpacity="0.75" />
              <stop offset="65%" stopColor="#4F46E5" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroDarkLeftEdge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="25%" stopColor="#F3E8FF" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#C084FC" stopOpacity="0.85" />
              <stop offset="85%" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroDarkRightGlow" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.85" />
              <stop offset="30%" stopColor="#9333EA" stopOpacity="0.75" />
              <stop offset="65%" stopColor="#4F46E5" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroDarkRightEdge" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="25%" stopColor="#F3E8FF" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#C084FC" stopOpacity="0.85" />
              <stop offset="85%" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroDarkCurtain" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#1E1B4B" stopOpacity="0" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            <filter id="heroDarkBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="30" />
            </filter>
            <filter id="heroDarkEdge" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <path d="M-100,200 C300,500 1140,500 1540,200 L1540,900 L-100,900 Z" fill="url(#heroDarkCurtain)" />
          <path d="M-60,-80 C180,180 440,460 720,680 C500,720 220,540 -80,240 Z" fill="url(#heroDarkLeftGlow)" filter="url(#heroDarkBlur)" />
          <path d="M-50,-60 C180,180 440,460 720,680" stroke="url(#heroDarkLeftEdge)" strokeWidth="4" fill="none" filter="url(#heroDarkEdge)" />
          <path d="M1500,-80 C1260,180 1000,460 720,680 C940,720 1220,540 1520,240 Z" fill="url(#heroDarkRightGlow)" filter="url(#heroDarkBlur)" />
          <path d="M1490,-60 C1260,180 1000,460 720,680" stroke="url(#heroDarkRightEdge)" strokeWidth="4" fill="none" filter="url(#heroDarkEdge)" />
        </svg>

        {/* Light Mode Version */}
        <svg
          className="dark:hidden w-full h-full opacity-65"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="heroLightLeftGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#C4B5FD" stopOpacity="0.60" />
              <stop offset="80%" stopColor="#A78BFA" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroLightLeftEdge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="heroLightRightGlow" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#C4B5FD" stopOpacity="0.60" />
              <stop offset="80%" stopColor="#A78BFA" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroLightRightEdge" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
            </linearGradient>
            <filter id="heroLightBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="28" />
            </filter>
          </defs>

          <path d="M-60,-80 C180,180 440,460 720,680 C500,720 220,540 -80,240 Z" fill="url(#heroLightLeftGlow)" filter="url(#heroLightBlur)" />
          <path d="M-50,-60 C180,180 440,460 720,680" stroke="url(#heroLightLeftEdge)" strokeWidth="3" fill="none" opacity="0.8" />
          <path d="M1500,-80 C1260,180 1000,460 720,680 C940,720 1220,540 1520,240 Z" fill="url(#heroLightRightGlow)" filter="url(#heroLightBlur)" />
          <path d="M1490,-60 C1260,180 1000,460 720,680" stroke="url(#heroLightRightEdge)" strokeWidth="3" fill="none" opacity="0.8" />
        </svg>
      </div>
    );
  }

  // 2. EXPLORE VARIANT: Diagonal sweeping silk ribbon wave
  if (variant === "explore") {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      >
        <svg
          className="hidden dark:block w-full h-full opacity-90"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="diagDarkGlow" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#7C3AED" stopOpacity="0.65" />
              <stop offset="75%" stopColor="#3B82F6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="diagDarkEdge" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#E9D5FF" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#A855F7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
            <filter id="diagDarkBlur"><feGaussianBlur stdDeviation="28" /></filter>
            <filter id="diagDarkEdgeGlow"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          <path d="M-80,100 C300,120 700,450 1520,600 C1300,750 600,600 -80,350 Z" fill="url(#diagDarkGlow)" filter="url(#diagDarkBlur)" />
          <path d="M-80,100 C300,120 700,450 1520,600" stroke="url(#diagDarkEdge)" strokeWidth="3.5" fill="none" filter="url(#diagDarkEdgeGlow)" />
          <path d="M800,920 C1050,750 1280,680 1520,720" stroke="url(#diagDarkEdge)" strokeWidth="2.5" fill="none" opacity="0.7" />
        </svg>

        <svg
          className="dark:hidden w-full h-full opacity-65"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="diagLightGlow" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#C4B5FD" stopOpacity="0.5" />
              <stop offset="80%" stopColor="#E0E7FF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="diagLightEdge" x1="0%" y1="0%" x2="100%" y2="80%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
            </linearGradient>
            <filter id="diagLightBlur"><feGaussianBlur stdDeviation="24" /></filter>
          </defs>

          <path d="M-80,100 C300,120 700,450 1520,600 C1300,750 600,600 -80,350 Z" fill="url(#diagLightGlow)" filter="url(#diagLightBlur)" />
          <path d="M-80,100 C300,120 700,450 1520,600" stroke="url(#diagLightEdge)" strokeWidth="2.5" fill="none" opacity="0.7" />
        </svg>
      </div>
    );
  }

  // 3. FORM VARIANT: Concentric embracing ribbon loops framing center
  if (variant === "form") {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      >
        <svg
          className="hidden dark:block w-full h-full opacity-90"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="formDarkGlow" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="formDarkEdge" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0" />
              <stop offset="25%" stopColor="#C084FC" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="75%" stopColor="#C084FC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
            <filter id="formDarkBlur"><feGaussianBlur stdDeviation="30" /></filter>
          </defs>

          <path d="M100,-50 C400,300 1040,300 1340,-50 C1140,400 300,400 100,-50 Z" fill="url(#formDarkGlow)" filter="url(#formDarkBlur)" />
          <path d="M100,-50 C400,300 1040,300 1340,-50" stroke="url(#formDarkEdge)" strokeWidth="3.5" fill="none" />
          <path d="M0,750 C450,550 990,550 1440,750" stroke="url(#formDarkEdge)" strokeWidth="2.5" fill="none" opacity="0.6" />
        </svg>

        <svg
          className="dark:hidden w-full h-full opacity-65"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="formLightGlow" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#C4B5FD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="formLightEdge" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.8" />
            </linearGradient>
            <filter id="formLightBlur"><feGaussianBlur stdDeviation="26" /></filter>
          </defs>

          <path d="M100,-50 C400,300 1040,300 1340,-50 C1140,400 300,400 100,-50 Z" fill="url(#formLightGlow)" filter="url(#formLightBlur)" />
          <path d="M100,-50 C400,300 1040,300 1340,-50" stroke="url(#formLightEdge)" strokeWidth="2.5" fill="none" />
        </svg>
      </div>
    );
  }

  // 4. PRICING VARIANT: Majestic crown ribbon arch framing tiers
  if (variant === "pricing") {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      >
        <svg
          className="hidden dark:block w-full h-full opacity-90"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pricingDarkGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#9333EA" stopOpacity="0.6" />
              <stop offset="85%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="pricingDarkEdge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#C084FC" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#FBBF24" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
            <filter id="pricingDarkBlur"><feGaussianBlur stdDeviation="30" /></filter>
          </defs>

          <path d="M-50,50 C400,250 1040,250 1490,50 C1300,450 150,450 -50,50 Z" fill="url(#pricingDarkGlow)" filter="url(#pricingDarkBlur)" />
          <path d="M-50,50 C400,250 1040,250 1490,50" stroke="url(#pricingDarkEdge)" strokeWidth="3.5" fill="none" />
          <path d="M100,750 C500,600 940,600 1340,750" stroke="url(#pricingDarkEdge)" strokeWidth="2.5" fill="none" opacity="0.6" />
        </svg>

        <svg
          className="dark:hidden w-full h-full opacity-65"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pricingLightGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#C4B5FD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="pricingLightEdge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
            </linearGradient>
            <filter id="pricingLightBlur"><feGaussianBlur stdDeviation="24" /></filter>
          </defs>

          <path d="M-50,50 C400,250 1040,250 1490,50 C1300,450 150,450 -50,50 Z" fill="url(#pricingLightGlow)" filter="url(#pricingLightBlur)" />
          <path d="M-50,50 C400,250 1040,250 1490,50" stroke="url(#pricingLightEdge)" strokeWidth="2.5" fill="none" />
        </svg>
      </div>
    );
  }

  // 5. MENTORS / FEATURED VARIANT: Intersecting ribbon rays with violet & gold specular glow
  if (variant === "mentors") {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
      >
        <svg
          className="hidden dark:block w-full h-full opacity-90"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mentorDarkGlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="mentorDarkEdge" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="40%" stopColor="#FDE68A" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#C084FC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
            <filter id="mentorDarkBlur"><feGaussianBlur stdDeviation="28" /></filter>
          </defs>

          <path d="M-50,750 C400,650 800,200 1500,100 C1300,300 700,750 -50,850 Z" fill="url(#mentorDarkGlow)" filter="url(#mentorDarkBlur)" />
          <path d="M-50,750 C400,650 800,200 1500,100" stroke="url(#mentorDarkEdge)" strokeWidth="3.5" fill="none" />
          <path d="M200,900 C600,700 1100,500 1450,450" stroke="url(#mentorDarkEdge)" strokeWidth="2" fill="none" opacity="0.6" />
        </svg>

        <svg
          className="dark:hidden w-full h-full opacity-65"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mentorLightGlow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#FEF3C7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="mentorLightEdge" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#D97706" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
            </linearGradient>
            <filter id="mentorLightBlur"><feGaussianBlur stdDeviation="22" /></filter>
          </defs>

          <path d="M-50,750 C400,650 800,200 1500,100 C1300,300 700,750 -50,850 Z" fill="url(#mentorLightGlow)" filter="url(#mentorLightBlur)" />
          <path d="M-50,750 C400,650 800,200 1500,100" stroke="url(#mentorLightEdge)" strokeWidth="2.5" fill="none" />
        </svg>
      </div>
    );
  }

  // 6. FLOW VARIANT: Serpentine flowing ribbon wave for About, HowItWorks & Community
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 ${className}`}
    >
      <svg
        className="hidden dark:block w-full h-full opacity-85"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="flowDarkGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="flowDarkEdge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#C084FC" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.6" />
          </linearGradient>
          <filter id="flowDarkBlur"><feGaussianBlur stdDeviation="26" /></filter>
        </defs>

        <path d="M-50,200 C400,50 800,500 1500,250 C1200,600 600,300 -50,600 Z" fill="url(#flowDarkGlow)" filter="url(#flowDarkBlur)" />
        <path d="M-50,200 C400,50 800,500 1500,250" stroke="url(#flowDarkEdge)" strokeWidth="3.5" fill="none" />
        <path d="M-50,600 C600,300 1000,750 1500,600" stroke="url(#flowDarkEdge)" strokeWidth="2.5" fill="none" opacity="0.7" />
      </svg>

      <svg
        className="dark:hidden w-full h-full opacity-60"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="flowLightGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#C4B5FD" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flowLightEdge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
          </linearGradient>
          <filter id="flowLightBlur"><feGaussianBlur stdDeviation="22" /></filter>
        </defs>

        <path d="M-50,200 C400,50 800,500 1500,250 C1200,600 600,300 -50,600 Z" fill="url(#flowLightGlow)" filter="url(#flowLightBlur)" />
        <path d="M-50,200 C400,50 800,500 1500,250" stroke="url(#flowLightEdge)" strokeWidth="2.5" fill="none" />
      </svg>
    </div>
  );
}
