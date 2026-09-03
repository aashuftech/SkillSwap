import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, BadgeCheck, MessageCircle, ArrowLeftRight, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Section, Button } from "./ui";

import RibbonBackground from "./RibbonBackground";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const FeaturedMentors = () => {
  const [featuredSkills, setFeaturedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/featured`)
      .then((res) => res.json())
      .then((data) => {
        if (data.skills && Array.isArray(data.skills)) {
          setFeaturedSkills(data.skills);
        }
      })
      .catch(() => setFeaturedSkills([]))
      .finally(() => setLoading(false));
  }, []);

  const openChat = (targetName, skillTitle, avatar, skillId = "") => {
    const safeName = typeof targetName === "string" ? targetName : targetName?.name || "Member";
    let myName = "user";
    try {
      const user = JSON.parse(localStorage.getItem("skillswapUser") || "{}");
      if (user.name) myName = user.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    } catch {}
    const partnerClean = safeName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const pair = [myName, partnerClean].sort().join("-");
    const room = `swap-${pair}${skillId ? `-${String(skillId).slice(-6)}` : ""}`;

    const params = new URLSearchParams({
      room,
      user: safeName,
      title: skillTitle || "Skill Swap",
    });
    if (avatar) params.set("avatar", avatar);
    navigate(`/chat?${params.toString()}`);
  };

  const handleViewAll = (e) => {
    if (window.location.pathname === "/explore") {
      e.preventDefault();
      const el = document.getElementById("all-skills");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Section tone="soft" className="relative overflow-hidden border-y border-gray-200 dark:border-gray-800 py-18">
      {/* Exact Flowing Ribbon Background */}
      <RibbonBackground variant="mentors" />

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 mb-9">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5">
            <Sparkles size={14} className="fill-amber-500 text-amber-500" /> Curated Community
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Featured This Week
          </h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1.5">
            Outstanding swappers hand-picked by our admins for exceptional exchange value.
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

      {loading ? (
        <div className="relative z-10 py-14 text-center">
          <Loader2 className="animate-spin text-violet-600 dark:text-violet-400 mx-auto" size={28} />
        </div>
      ) : featuredSkills.length === 0 ? (
        <div className="relative z-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151522] p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Star size={30} className="fill-amber-400 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Top Community Swaps Coming Soon</h3>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto mb-6">
            Our admins regularly highlight top skill swappers here. Explore all live approved skills to connect right away!
          </p>
          <Button to="/explore" size="md">
            Browse All Community Skills
          </Button>
        </div>
      ) : (
        <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSkills.map((skill) => {
            const userName = skill.user?.name || "Community Member";
            const avatar = skill.user?.avatar || "";

            return (
              <div
                key={skill.id}
                className="relative z-10 flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-gray-200 dark:border-[#2C2C40] bg-white dark:bg-[#151522] shadow-sm hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-250"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={userName}
                          className="w-13 h-13 rounded-xl object-cover ring-2 ring-violet-200 dark:ring-violet-700 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                          {userName.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">{userName}</p>
                          <BadgeCheck size={18} className="text-violet-600 dark:text-violet-400 fill-violet-100 dark:fill-violet-950" />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {skill.user?.ratingCount > 0 && skill.user?.rating ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              {Number(skill.user.rating).toFixed(1)}
                              <span className="text-gray-400 dark:text-gray-500 text-[11px] font-normal">
                                ({skill.user.ratingCount})
                              </span>
                            </span>
                          ) : null}
                          {skill.user?.location ? (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {skill.user?.ratingCount > 0 ? "· " : ""}{skill.user.location}
                            </span>
                          ) : !skill.user?.ratingCount ? (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Swapper
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/80 px-3 py-1 rounded-full shadow-xs shrink-0">
                      <Star size={12} className="fill-amber-500 text-amber-500" /> Featured
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="inline-block text-xs font-bold bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-200 border border-violet-100 dark:border-violet-800/80 px-3 py-1 rounded-full mb-2.5">
                      {skill.category}
                    </span>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl leading-snug">{skill.title}</h3>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-3 mb-5">
                    {skill.description}
                  </p>

                  {skill.learnSkill && (
                    <div className="rounded-xl bg-violet-50 dark:bg-[#1E1E2E] p-3.5 text-sm text-violet-900 dark:text-violet-100 mb-6 flex items-center gap-2.5 border border-violet-100 dark:border-violet-800/80">
                      <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/80 flex items-center justify-center text-violet-700 dark:text-violet-300 shrink-0">
                        <ArrowLeftRight size={14} />
                      </div>
                      <span className="truncate">
                        Wants to learn: <strong className="text-violet-900 dark:text-white font-bold">{skill.learnSkill}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openChat(userName, skill.title, avatar, skill.id)}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white text-sm font-bold py-3.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle size={17} />
                  <span>Connect & Swap</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
};

export default FeaturedMentors;
