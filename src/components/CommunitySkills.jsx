import { API } from "../lib/apiConfig.js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MessageCircle,
  ArrowLeftRight,
  Sparkles,
  Users,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "./ui";
import RibbonBackground from "./RibbonBackground";


const CATEGORIES = [
  "All Categories",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "SEO",
  "Digital Marketing",
  "Data Science",
  "Video Editing",
  "Language Exchange",
  "Music",
  "Others",
];

const CommunitySkills = () => {
  const [skills, setSkills] = useState([]);
  const [category, setCategory] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category && category !== "All Categories") {
      params.set("category", category);
    }
    if (search.trim()) {
      params.set("search", search.trim());
    }

    fetch(`${API}/api/skills?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.skills && Array.isArray(data.skills)) {
          setSkills(data.skills);
        } else {
          setSkills([]);
        }
      })
      .catch(() => setSkills([]))
      .finally(() => setLoading(false));
  }, [category, search]);

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

  return (
    <section id="all-skills" className="relative overflow-hidden px-4 sm:px-6 py-18 md:px-8 bg-slate-50/70 dark:bg-gray-900/50">
      {/* Exact Flowing Ribbon Background */}
      <RibbonBackground variant="flow" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.18em] text-violet-600 dark:text-violet-400 mb-1">
              <Users size={14} /> All Community Skills
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Browse & Connect with Swappers
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1.5">
              Explore skills offered by active community members across all 12 domains.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by skill name, technology, or keywords (e.g. React, SEO, Python, Photoshop)..."
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181824] py-4 pl-12 pr-4 text-sm sm:text-base text-gray-900 dark:text-white outline-none focus:border-violet-600 shadow-xs transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-9 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4.5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-violet-600 text-white shadow-sm"
                    : "border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181824] text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50/50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin text-violet-600 dark:text-violet-400 mb-3" size={30} />
            <p className="text-sm font-medium">Loading community skills…</p>
          </div>
        ) : skills.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#181824] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-8">
            <Sparkles className="mx-auto text-violet-400 mb-3" size={32} />
            <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">No skills found</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">
              No approved skills match your search or filter right now. Be the first to offer one!
            </p>
            <Button to="/add-skills" size="md">
              Teach a Skill
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => {
              const userName = skill.user?.name || "Community Member";
              const avatar = skill.user?.avatar || "";

              return (
                <div
                  key={skill.id}
                  className="flex flex-col justify-between p-6 rounded-2xl border border-gray-200 dark:border-[#2C2C3E] bg-white dark:bg-[#181824] shadow-sm hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-250"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3.5">
                      <span className="rounded-full bg-violet-50 dark:bg-violet-950/70 px-3.5 py-1 text-xs font-bold text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800/80">
                        {skill.category}
                      </span>
                      {skill.user?.location ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{skill.user.location}</span>
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">● Verified</span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug mb-2">
                      {skill.title}
                    </h3>
                    <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      {skill.description}
                    </p>

                    {skill.learnSkill && (
                      <div className="rounded-xl bg-violet-50/90 dark:bg-[#202030] p-3 text-sm text-violet-900 dark:text-violet-200 mb-5 flex items-center gap-2.5 border border-violet-100 dark:border-violet-900/50">
                        <ArrowLeftRight size={14} className="text-violet-700 dark:text-violet-300 shrink-0" />
                        <span className="truncate">
                          Wants to learn: <strong className="text-violet-800 dark:text-violet-200 font-bold">{skill.learnSkill}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={userName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-violet-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-xs">
                          {userName.charAt(0) || "U"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">{userName}</p>
                        {skill.user?.ratingCount > 0 && skill.user?.rating ? (
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            {Number(skill.user.rating).toFixed(1)}
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-normal">
                              ({skill.user.ratingCount})
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Skill Swapper</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openChat(userName, skill.title, avatar, skill.id)}
                      className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-xs hover:shadow-md shrink-0 cursor-pointer"
                    >
                      <MessageCircle size={15} /> Swap
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunitySkills;
