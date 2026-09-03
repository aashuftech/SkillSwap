import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Bookmark, Sparkles, ArrowRight } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FEATURED_SKILLS } from "../data/skills";
import { Section } from "./ui";
import RibbonBackground from "./RibbonBackground";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const FeaturedSkills = () => {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
    fetch(`${API}/api/departments`)
      .then((res) => res.json())
      .then((data) => {
        if (data.departments && Array.isArray(data.departments)) {
          setDepartments(data.departments);
        }
      })
      .catch(() => {});
  }, []);

  const handleViewAll = (e) => {
    if (window.location.pathname === "/explore") {
      e.preventDefault();
      const el = document.getElementById("all-skills");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Section tone="soft" className="relative overflow-hidden py-18">
      {/* Exact Flowing Ribbon Background */}
      <RibbonBackground variant="explore" />

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 mb-9">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1.5">
            <Sparkles size={14} /> Trending Domains
          </div>
          <h2 data-aos="fade-up" className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Popular Skills
          </h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1.5">
            High-demand skills learners and mentors are actively swapping right now.
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

      <div data-aos="fade-up" className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {FEATURED_SKILLS.map((skill) => {
          const dept = departments.find((d) => d.name.toLowerCase() === skill.title.toLowerCase());
          const realLearners = dept?.learnerCount ?? 0;
          const realOffers = dept?.approvedSkillCount ?? 0;
          const learnerLabel = realLearners > 0 ? `${realLearners} Learners` : "0 Learners";
          const ratingCount = realOffers * 12 + realLearners * 8 || 12;

          return (
            <Link
              key={skill.title}
              to={skill.path}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 dark:border-[#2C2C3E] bg-white dark:bg-[#181824] shadow-sm hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-250"
            >
              <div>
                <div className="relative overflow-hidden h-40">
                  <img
                    src={skill.img}
                    alt={skill.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <span className="absolute top-3 left-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                    {learnerLabel}
                  </span>
                  <span className="absolute top-3 right-3 bg-black/70 p-1.5 rounded-full text-white/90 border border-white/20">
                    <Bookmark size={14} />
                  </span>
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-sm font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Star size={14} className="text-amber-400 fill-amber-400" /> {skill.rating}
                      <span className="text-white/70 text-xs">({ratingCount})</span>
                    </span>
                    <span className="bg-violet-600 px-2.5 py-0.5 rounded-md text-xs font-bold">
                      {realOffers} {realOffers === 1 ? "swap" : "swaps"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1.5 leading-relaxed line-clamp-2">
                    {skill.desc}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-1 flex items-center justify-between text-sm font-bold text-violet-700 dark:text-violet-400">
                <span>Explore Skills</span>
                <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
};

export default FeaturedSkills;
