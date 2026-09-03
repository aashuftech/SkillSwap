import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeftRight, MessageCircle, PlusCircle, SearchX, Sparkles, Loader2, Zap, CheckCircle2, Star } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { SWAP_LISTINGS } from "../data/swapListings";
import { Button, Badge } from "../components/ui";
import { aiHeaders, getAiVisitorId } from "../lib/aiVisitor";
import RibbonBackground from "../components/RibbonBackground";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const StartSwap = () => {
  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  }, []);

  const navigate = useNavigate();
  const [liveSkills, setLiveSkills] = useState([]);
  const [query, setQuery] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMatches, setAiMatches] = useState([]);
  const [isAiActive, setIsAiActive] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/skills`)
      .then((res) => res.json())
      .then((data) => {
        if (data.skills && Array.isArray(data.skills)) {
          const formatted = data.skills.map((s) => ({
            id: s.id,
            name: s.title,
            user: s.user?.name || "Community Member",
            offer: s.learnSkill || "Any useful skill",
            img: s.user?.avatar || "",
            category: s.category,
            desc: s.description,
            rating: s.user?.rating || null,
            ratingCount: s.user?.ratingCount || 0,
            location: s.user?.location || "Remote",
          }));
          setLiveSkills(formatted);
        }
      })
      .catch(() => {});
  }, []);

  const allListings = useMemo(() => {
    return [...liveSkills, ...SWAP_LISTINGS];
  }, [liveSkills]);

  // AI Matches Map for fast lookup of score & reason
  const aiMatchMap = useMemo(() => {
    const map = new Map();
    for (const m of aiMatches) {
      map.set(String(m.id), m);
    }
    return map;
  }, [aiMatches]);

  const listings = useMemo(() => {
    const q = query.trim().toLowerCase();

    // If AI matching is active and returned matches, prioritize AI results
    let pool = allListings;
    if (isAiActive && aiMatches.length > 0) {
      // Prioritize AI matches in ranking order
      const aiIds = new Set(aiMatches.map((m) => String(m.id)));
      const matchedList = aiMatches.map((m) => {
        const existing = allListings.find((l) => String(l.id) === String(m.id));
        return {
          ...existing,
          ...m,
          matchScore: m.matchScore,
          reason: m.reason,
          isMutualSwap: m.isMutualSwap,
        };
      });
      pool = matchedList;
    }

    if (!q) return pool;
    return pool.filter(
      (l) =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.offer && l.offer.toLowerCase().includes(q)) ||
        (l.user && l.user.toLowerCase().includes(q)) ||
        (l.category && l.category.toLowerCase().includes(q)) ||
        (l.reason && l.reason.toLowerCase().includes(q))
    );
  }, [allListings, query, isAiActive, aiMatches]);

  /** RAG-based AI match handler */
  const findWithAI = async (promptOverride) => {
    const prompt = (typeof promptOverride === "string" ? promptOverride : aiPrompt).trim();
    if (!prompt || aiLoading) return;
    setAiLoading(true);
    setAiMessage("");
    try {
      const response = await fetch(`${API}/api/ai/skill-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...aiHeaders() },
        body: JSON.stringify({ prompt, visitorId: getAiVisitorId() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "RAG skill match could not run.");
      
      setAiMatches(data.matches || []);
      setIsAiActive(true);
      setAiMessage(data.summary || `Found ${data.matches?.length || 0} top skill swap matches.`);
    } catch (error) {
      setAiMessage(error.message || "AI skill matching is currently unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  const clearAiSearch = () => {
    setIsAiActive(false);
    setAiMatches([]);
    setAiMessage("");
    setAiPrompt("");
  };

  /** Route to the chat room for a given listing */
  const openChat = (listing) => {
    let myName = "user";
    try {
      const user = JSON.parse(localStorage.getItem("skillswapUser") || "{}");
      if (user.name) myName = user.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    } catch {}
    const partnerClean = (listing.user || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const pair = [myName, partnerClean].sort().join("-");
    const room = `swap-${pair}-${listing.id ? String(listing.id).slice(-6) : "chat"}`;

    const params = new URLSearchParams({
      room,
      user: listing.user,
      title: listing.name,
    });
    if (listing.img) params.set("avatar", listing.img);
    navigate(`/chat?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9FF] dark:bg-[#07070C] pb-20 overflow-hidden transition-colors duration-300">
      <RibbonBackground variant="explore" />
      {/* Hero + search */}
      <div className="relative z-10 px-4 pt-16 pb-12 text-center border-b border-gray-200 dark:border-gray-800">
        <Badge className="mx-auto mb-4">Live swap requests</Badge>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Find your next skill swap
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg max-w-xl mx-auto mb-9">
          Search what people are offering, or use RAG AI matching to find members with complementary skills.
        </p>

        {/* Standard Search Bar */}
        <div className="relative max-w-lg mx-auto mb-5">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by skill, e.g. 'React', 'SEO', 'Python'..."
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181824] py-3.5 pl-12 pr-4 text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 transition-colors focus:border-violet-600 focus:outline-none shadow-xs"
          />
        </div>

        {/* RAG-based AI Skill Matcher Box */}
        <div className="mx-auto max-w-2xl rounded-3xl border border-violet-200/80 dark:border-violet-800/80 bg-white/95 dark:bg-[#181824]/95 p-5 text-left shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-extrabold text-violet-700 dark:text-violet-300">
              <Sparkles size={18} className="text-violet-600 animate-pulse" /> RAG AI Skill Matcher
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-600/80 dark:text-violet-400/80 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-200 dark:border-violet-800/50">
              Powered by Groq 120B
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
            Tell us what you teach and what you want to learn. Our RAG engine retrieves real database members and finds mutual swaps.
          </p>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") findWithAI();
              }}
              placeholder="e.g. I teach React and want to learn Graphic Design"
              className="min-w-0 flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-[#12121A] px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="button"
              onClick={() => findWithAI()}
              disabled={!aiPrompt.trim() || aiLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-700 active:scale-95 px-6 py-3 text-sm font-bold text-white shadow-md transition disabled:opacity-60 cursor-pointer shrink-0"
            >
              {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {aiLoading ? "Matching…" : "Find Best Matches"}
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Try:</span>
            {[
              "I teach React and want Graphic Design",
              "Teach Python, want Spanish",
              "Teach SEO, want UI/UX Design",
            ].map((examplePrompt) => (
              <button
                key={examplePrompt}
                type="button"
                onClick={() => {
                  setAiPrompt(examplePrompt);
                  findWithAI(examplePrompt);
                }}
                className="rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-gray-700 dark:text-gray-300 px-2 py-1 text-[11px] transition cursor-pointer"
              >
                "{examplePrompt}"
              </button>
            ))}
          </div>

          {/* AI Result Summary Bar */}
          {aiMessage && (
            <div className="mt-3.5 flex items-center justify-between bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/60 rounded-xl p-2.5 px-3.5 text-xs text-violet-800 dark:text-violet-200">
              <span className="font-medium flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                {aiMessage}
              </span>
              {isAiActive && (
                <button
                  type="button"
                  onClick={clearAiSearch}
                  className="font-bold underline text-violet-700 dark:text-violet-300 hover:text-violet-900 ml-2 cursor-pointer shrink-0"
                >
                  Show all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Listings */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-7">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {listings.length} {listings.length === 1 ? "swap" : "swaps"} available
            {isAiActive && " (AI Ranked)"}
          </p>
          <Button to="/add-skills" variant="outlinePrimary" size="sm" leftIcon={<PlusCircle size={15} />}>
            Add Your Skill
          </Button>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#181824] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-8">
            <SearchX size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-bold text-gray-900 dark:text-white text-lg">No swaps match "{query || aiPrompt}"</p>
            <p className="text-sm text-gray-400 mt-1">Try a different skill or reset search filters.</p>
          </div>
        ) : (
          <div className="space-y-4.5">
            {listings.map((listing) => {
              const aiData = aiMatchMap.get(String(listing.id)) || listing;
              const hasAiScore = typeof aiData.matchScore === "number";

              return (
                <div
                  key={listing.id}
                  data-aos="fade-up"
                  className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col gap-4 shadow-sm hover:shadow-lg ${
                    hasAiScore && aiData.isMutualSwap
                      ? "border-emerald-300/80 dark:border-emerald-700/80 bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-[#181824] dark:to-[#12241c]"
                      : hasAiScore
                      ? "border-violet-300 dark:border-violet-700 bg-gradient-to-br from-white via-white to-violet-50/30 dark:from-[#181824] dark:to-[#1b152b]"
                      : "border-gray-200 dark:border-[#2C2C3E] bg-white dark:bg-[#181824] hover:border-violet-500"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {listing.img ? (
                        <img
                          src={listing.img}
                          alt={listing.user}
                          loading="lazy"
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ring-violet-200 dark:ring-violet-800 shadow-xs"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-violet-600 text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-xs">
                          {listing.user?.charAt(0) || "U"}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug">
                            {listing.name}
                          </h3>
                          {hasAiScore && (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                                aiData.isMutualSwap
                                  ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                  : "bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-700"
                              }`}
                            >
                              <Zap size={11} className="fill-current" /> {aiData.matchScore}% Match
                              {aiData.isMutualSwap && " · Mutual Swap"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                          <span>by {listing.user}</span>
                          {listing.ratingCount > 0 && (
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star size={12} className="fill-amber-400" /> {listing.rating} ({listing.ratingCount})
                            </span>
                          )}
                          {listing.category && (
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md text-[11px]">
                              {listing.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => openChat(listing)}
                      size="md"
                      className="w-full sm:w-auto shrink-0 cursor-pointer"
                      leftIcon={<MessageCircle size={16} />}
                    >
                      Connect & Swap
                    </Button>
                  </div>

                  {/* Wants to learn pill */}
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-3.5 py-1.5 rounded-xl border border-violet-100 dark:border-violet-800/60">
                    <ArrowLeftRight size={14} className="shrink-0" />
                    <span>
                      Wants to Learn: <strong>{listing.offer}</strong>
                    </span>
                  </div>

                  {/* AI Reasoning Box */}
                  {hasAiScore && aiData.reason && (
                    <div className="bg-white/80 dark:bg-[#12121c]/80 border border-violet-100 dark:border-violet-900/40 rounded-xl p-3 text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <Sparkles size={14} className="text-violet-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-violet-700 dark:text-violet-300 font-semibold">AI Match Analysis: </strong>
                        <span>{aiData.reason}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StartSwap;
