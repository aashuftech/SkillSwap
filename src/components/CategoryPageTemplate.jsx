import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star, MessageCircle, ArrowLeftRight, Users, PlusCircle, Sparkles, MapPin } from "lucide-react";
import { Card, Badge, Button, Section, SectionHeading } from "./ui";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// Tailwind's JIT scanner needs full literal class strings somewhere in
// the source — it can't resolve `bg-${accent}-600` at runtime — so
// every per-accent style lives here as static strings rather than
// being built from the `accent` key in data/categoryPages.js.
const ACCENT = {
  indigo: { chip: "bg-indigo-50", icon: "text-indigo-600", check: "text-indigo-600", button: "bg-indigo-600 hover:bg-indigo-700" },
  pink: { chip: "bg-pink-50", icon: "text-pink-500", check: "text-pink-500", button: "bg-pink-500 hover:bg-pink-600" },
  green: { chip: "bg-green-50", icon: "text-green-600", check: "text-green-600", button: "bg-green-600 hover:bg-green-700" },
  yellow: { chip: "bg-yellow-50", icon: "text-yellow-600", check: "text-yellow-600", button: "bg-yellow-500 hover:bg-yellow-600" },
};

/**
 * Shared layout for every "Popular Skill" landing page (Web
 * Development, Graphic Design, Language Exchange, Music).
 */
const CategoryPageTemplate = ({ data }) => {
  const { title, icon: Icon, tagline, description, accent, topics, mentors } = data;
  const theme = ACCENT[accent] ?? ACCENT.indigo;
  const navigate = useNavigate();

  const [communitySkills, setCommunitySkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);

  useEffect(() => {
    setLoadingSkills(true);
    fetch(`${API}/api/skills?category=${encodeURIComponent(title)}`)
      .then((res) => res.json())
      .then((resData) => {
        setCommunitySkills(resData.skills || []);
      })
      .catch(() => setCommunitySkills([]))
      .finally(() => setLoadingSkills(false));
  }, [title]);

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
      title: skillTitle || title,
    });
    if (avatar) params.set("avatar", avatar);
    navigate(`/chat?${params.toString()}`);
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <Section tone="soft" spacing="lg" className="text-center">
        <div className={`jb-icon-chip w-16 h-16 rounded-2xl ${theme.chip} flex items-center justify-center mx-auto mb-5`}>
          <Icon size={30} className={theme.icon} />
        </div>
        <Badge tone="soft" className="mx-auto mb-4">{tagline}</Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/add-skills" leftIcon={<PlusCircle size={16} />} size="md">
            Teach {title}
          </Button>
          <Button to="/start-swap" variant="outline" size="md">
            Find All Swaps
          </Button>
        </div>
      </Section>

      {/* Dynamic Community Member Skills Section */}
      <Section tone="white" className="border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 mb-1">
                <Users size={15} />
                <span>Live Community Swaps</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Community members offering {title}
              </h2>
            </div>
            <Button to="/add-skills" variant="outlinePrimary" size="sm" leftIcon={<PlusCircle size={15} />}>
              Add Your Skill Here
            </Button>
          </div>

          {loadingSkills ? (
            <p className="py-12 text-center text-sm text-gray-400">Loading {title} community skills…</p>
          ) : communitySkills.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-violet-200 bg-violet-50/50 p-8 text-center">
              <Sparkles className="mx-auto text-violet-500 mb-3" size={28} />
              <h3 className="font-semibold text-gray-900 text-lg">Be the first to share a {title} skill!</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Got knowledge in {title}? Post what you teach and swap it with someone who can teach you in return.
              </p>
              <Button to="/add-skills" className="mt-5" size="sm" leftIcon={<PlusCircle size={15} />}>
                Add {title} Skill
              </Button>
            </div>
          ) : (
            <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {communitySkills.map((item) => (
                <div
                  key={item.id}
                  className="relative z-10 p-6 flex flex-col justify-between rounded-2xl border border-gray-200 dark:border-[#2C2C40] bg-white dark:bg-[#151522] shadow-sm hover:border-violet-500 dark:hover:border-violet-400 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.user?.avatar ? (
                          <img
                            src={item.user.avatar}
                            alt={item.user.name}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-violet-200 dark:ring-violet-700 shadow-xs shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold shrink-0 text-base shadow-xs">
                            {item.user?.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white text-base truncate">{item.user?.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.user?.ratingCount > 0 && item.user?.rating ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                {Number(item.user.rating).toFixed(1)}
                                <span className="text-gray-400 dark:text-gray-500 text-[10px] font-normal">
                                  ({item.user.ratingCount})
                                </span>
                              </span>
                            ) : null}
                            {item.user?.location ? (
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                {item.user?.ratingCount > 0 ? "· " : ""}{item.user.location}
                              </span>
                            ) : !item.user?.ratingCount ? (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● Verified</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <span className="rounded-full bg-violet-50 dark:bg-violet-950/80 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-200 border border-violet-100 dark:border-violet-800/80 shrink-0">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white text-lg sm:text-xl mb-2 leading-snug">{item.title}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed line-clamp-3 mb-4">{item.description}</p>

                    {item.learnSkill && (
                      <div className="rounded-xl bg-violet-50 dark:bg-[#1E1E2E] p-3.5 text-sm text-violet-900 dark:text-violet-100 mb-5 flex items-center gap-2.5 border border-violet-100 dark:border-violet-800/80">
                        <ArrowLeftRight size={14} className="text-violet-700 dark:text-violet-300 shrink-0" />
                        <span className="truncate">Wants to learn: <strong className="text-violet-900 dark:text-white font-bold">{item.learnSkill}</strong></span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openChat(item.user?.name, item.title, item.user?.avatar, item.id)}
                    className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700 text-white text-sm font-bold py-3.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    <span>Connect & Swap</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* What you'll learn */}
      <Section tone="white">
        <SectionHeading title="Key topics in this domain" align="center" className="mx-auto" />
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <div key={topic} className="flex items-start gap-3 bg-[var(--jb-bg-soft)] rounded-xl p-4">
              <Check size={18} className={`${theme.check} shrink-0 mt-0.5`} />
              <span className="text-sm text-gray-700">{topic}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Featured Mentors */}
      {mentors && mentors.length > 0 && (
        <Section tone="soft">
          <SectionHeading title="Featured mentors" align="center" className="mx-auto" />
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.name} hoverable className="p-6 flex gap-4">
                <img
                  src={mentor.img}
                  alt={mentor.name}
                  loading="lazy"
                  className="w-20 h-20 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                  <p className="text-sm text-[var(--jb-primary)] font-medium mb-1.5">{mentor.skill}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{mentor.bio}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Star size={13} className="text-yellow-400 fill-yellow-400" /> {mentor.rating}
                    </span>
                    <Button
                      variant="custom"
                      size="sm"
                      onClick={() => openChat(mentor.name, mentor.skill, mentor.img)}
                      leftIcon={<MessageCircle size={14} />}
                      className={`!rounded-lg text-white ${theme.button}`}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section tone="white" className="text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Have a skill to trade for {title.toLowerCase()}?
        </h3>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Post what you can teach and get matched with someone who wants to learn it.
        </p>
        <Button to="/start-swap" size="lg">Start Swapping</Button>
      </Section>
    </div>
  );
};

export default CategoryPageTemplate;

