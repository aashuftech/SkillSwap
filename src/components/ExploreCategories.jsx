import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Code, Smartphone, Palette, PenTool, FileText, Search, Megaphone, Database, Video, Globe2, Music2, Layers } from "lucide-react";
import { Section } from "./ui";
import RibbonBackground from "./RibbonBackground";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const CATEGORIES = [
  { name: "Web Development", icon: Code, path: "/web-development" },
  { name: "Mobile Development", icon: Smartphone, path: "/mobile-development" },
  { name: "UI/UX Design", icon: Palette, path: "/ui-ux-design" },
  { name: "Graphic Design", icon: PenTool, path: "/graphic-design" },
  { name: "Content Writing", icon: FileText, path: "/content-writing" },
  { name: "SEO", icon: Search, path: "/seo" },
  { name: "Digital Marketing", icon: Megaphone, path: "/digital-marketing" },
  { name: "Data Science", icon: Database, path: "/data-science" },
  { name: "Video Editing", icon: Video, path: "/video-editing" },
  { name: "Language Exchange", icon: Globe2, path: "/language-exchange" },
  { name: "Music", icon: Music2, path: "/music" },
  { name: "Others", icon: Layers, path: "/others" },
];

const ExploreCategories = () => {
  const [counts, setCounts] = useState({});
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/categories/counts`)
      .then((res) => res.json())
      .then((data) => {
        if (data.counts && typeof data.counts === "object") {
          setCounts(data.counts);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleViewAll = (e) => {
    if (window.location.pathname === "/explore") {
      e.preventDefault();
      const el = document.getElementById("all-skills");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Seamless 24 items loop for infinite horizontal auto-scrolling
  const marqueeItems = [...CATEGORIES, ...CATEGORIES];

  return (
    <Section tone="white" className="relative overflow-hidden py-18">
      {/* Exact Flowing Ribbon Background */}
      <RibbonBackground variant="flow" />

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 mb-9">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1.5">
            <Sparkles size={14} /> 12 Community Categories
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Explore Top Categories
          </h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1.5">
            Browse skills offered across our 12 specialized community domains.
          </p>
        </div>

        <Link
          to="/explore#all-skills"
          onClick={handleViewAll}
          className="jb-link text-violet-700 dark:text-violet-400 font-semibold text-sm md:text-base inline-flex items-center gap-1.5 group cursor-pointer"
        >
          <span>View all skills</span>
          <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>

      {/* Infinite Horizontal Auto-Scrolling Track */}
      <div className="relative z-10 w-full overflow-hidden py-2">
        <div className="marquee-track gap-6">
          {marqueeItems.map((cat, idx) => {
            const Icon = cat.icon;
            const count = counts[cat.name] ?? 0;

            return (
              <Link
                key={`${cat.name}-${idx}`}
                to={cat.path}
                className="group w-72 shrink-0 flex items-center gap-4.5 p-5 rounded-2xl border border-gray-200 dark:border-[#2C2C3E] bg-white dark:bg-[#181824] shadow-sm hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-250"
              >
                <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/70 border border-violet-100 dark:border-violet-800/80 flex items-center justify-center text-violet-700 dark:text-violet-300 shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                  <Icon size={26} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-violet-700 dark:text-violet-300 mt-0.5">
                    {count} {count === 1 ? "Skill live" : "Skills live"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

export default ExploreCategories;
