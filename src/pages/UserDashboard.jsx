import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Compass,
  MessageCircle,
  Plus,
  RefreshCw,
  Sparkles,
  User,
  Camera,
  Upload,
  Image as ImageIcon,
  MapPin,
  Phone,
  BookOpen,
  HelpCircle,
  Save,
  Trash2,
  Loader2,
  Layers,
  ArrowLeftRight,
} from "lucide-react";
import { authFetch } from "../lib/authFetch";

const statusStyle = {
  approved: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  rejected: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
  pending: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
};

export default function UserDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("skillswapUser") || "{}");
    } catch {
      return {};
    }
  });

  // Overview / Skills State
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [skillsError, setSkillsError] = useState("");

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    location: "",
    bio: "",
    headline: "",
    phone: "",
    skillsToTeach: "",
    skillsToLearn: "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Messages State
  const [conversations, setConversations] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Initialize Profile Form with user data
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || "",
        location: currentUser.location || "",
        bio: currentUser.bio || "",
        headline: currentUser.headline || "",
        phone: currentUser.phone || "",
        skillsToTeach: currentUser.skillsToTeach || "",
        skillsToLearn: currentUser.skillsToLearn || "",
        avatar: currentUser.avatar || "",
      });
      setAvatarPreview(currentUser.avatar || "");
    }
  }, [currentUser]);

  // Load Skills
  const loadSkills = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoadingSkills(true);
    setSkillsError("");
    try {
      const response = await authFetch("/api/skills/mine");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load skills.");
      setSkills(data.skills || []);
    } catch (err) {
      setSkillsError(err.message || "Could not fetch your skills.");
    } finally {
      setLoadingSkills(false);
    }
  }, [token, navigate]);

  // Load Conversations for Messages Tab
  const loadConversations = useCallback(async () => {
    if (!token) return;
    setLoadingMessages(true);
    try {
      const response = await authFetch("/api/chat/conversations");
      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        return;
      }
      if (response.ok && data.conversations) {
        setConversations(data.conversations);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMessages(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "overview") loadSkills();
    if (activeTab === "messages") loadConversations();
  }, [activeTab, loadSkills, loadConversations]);

  const stats = useMemo(() => {
    const total = skills.length;
    const approved = skills.filter((item) => item.status === "approved").length;
    const pending = skills.filter((item) => item.status === "pending").length;
    return { total, approved, pending };
  }, [skills]);

  // Handle Photo File Upload (Convert to Base64)
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Image size must be under 5MB.");
      return;
    }
    setProfileError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setAvatarPreview(base64);
      setProfileForm((prev) => ({ ...prev, avatar: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processImageFile(file);
  };

  const removeAvatar = () => {
    setAvatarPreview("");
    setProfileForm((prev) => ({ ...prev, avatar: "" }));
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");

    try {
      const response = await authFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileForm),
      });
      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Server returned an invalid response. Please make sure the backend server ('npm run server') is running."
        );
      }
      if (!response.ok) throw new Error(data.message || "Failed to update profile.");

      setCurrentUser(data.user);
      localStorage.setItem("skillswapUser", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChange"));
      setProfileSuccess("Profile and photo updated successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err) {
      setProfileError(err.message || "Could not save profile changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <main className="min-h-screen bg-[var(--jb-bg)] dark:bg-[#07070D] px-4 py-10 sm:px-7 transition-colors duration-300">
      <section className="mx-auto max-w-7xl">
        {/* Banner Hero */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#181126] via-[#24173d] to-violet-950 px-6 py-9 text-white shadow-xl sm:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-violet-400/50 shadow-md"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600 text-2xl font-bold text-white shadow-md">
                  {currentUser?.name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-[.22em] text-violet-300">
                  Welcome back
                </p>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {currentUser?.name || "My Dashboard"}
                </h1>
                {currentUser?.headline && (
                  <p className="mt-1 text-xs text-violet-200/80">{currentUser.headline}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/add-skills"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 shadow-sm"
              >
                <Plus size={16} /> Add a Skill
              </Link>
              <Link
                to="/start-swap"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <Compass size={16} /> Find a Swap
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="mt-7 grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="h-fit rounded-3xl border border-violet-100 dark:border-gray-800 bg-white dark:bg-[#181824] p-3.5 shadow-sm space-y-1">
            <button
              type="button"
              onClick={() => setTab("overview")}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition cursor-pointer ${
                activeTab === "overview"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-900 dark:hover:text-violet-300"
              }`}
            >
              <Sparkles size={18} />
              <span>Overview & Skills</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("profile")}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition cursor-pointer ${
                activeTab === "profile"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-900 dark:hover:text-violet-300"
              }`}
            >
              <User size={18} />
              <span>My Profile & Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("messages")}
              className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition cursor-pointer ${
                activeTab === "messages"
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-900 dark:hover:text-violet-300"
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageCircle size={18} />
                <span>Chats</span>
              </span>
              {conversations.length > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    activeTab === "messages"
                      ? "bg-white/20 text-white"
                      : "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300"
                  }`}
                >
                  {conversations.length}
                </span>
              )}
            </button>

            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
              <Link
                to="/add-skills"
                className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-800 dark:hover:text-violet-300 transition"
              >
                <Plus size={16} /> Post a new skill
              </Link>
              <Link
                to="/start-swap"
                className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-800 dark:hover:text-violet-300 transition"
              >
                <Compass size={16} /> Browse community
              </Link>
            </div>
          </aside>

          {/* Tab Contents */}
          <div className="space-y-6">
            {/* TAB 1: OVERVIEW & SKILLS */}
            {activeTab === "overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard
                    label="Total submitted skills"
                    value={stats.total}
                    icon={<Sparkles size={20} className="text-violet-600 dark:text-violet-400" />}
                  />
                  <StatCard
                    label="Live & Approved"
                    value={stats.approved}
                    icon={<CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />}
                  />
                  <StatCard
                    label="Pending review"
                    value={stats.pending}
                    icon={<Clock3 size={20} className="text-amber-600 dark:text-amber-400" />}
                  />
                </div>

                <div className="rounded-3xl border border-violet-100 dark:border-gray-800 bg-white dark:bg-[#181824] p-6 shadow-sm sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-600 dark:text-violet-400">
                        My Skills
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                        Skills you have submitted
                      </h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Approved skills are automatically listed in their category page and Start Swap.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={loadSkills}
                      className="rounded-xl border border-violet-200 dark:border-violet-800/60 p-2.5 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition cursor-pointer"
                      title="Refresh"
                    >
                      <RefreshCw size={17} className={loadingSkills ? "animate-spin" : ""} />
                    </button>
                  </div>

                  {skillsError && (
                    <p className="mb-5 rounded-2xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/50">
                      {skillsError}
                    </p>
                  )}

                  {loadingSkills ? (
                    <p className="py-14 text-center text-sm text-gray-400">Loading your skills…</p>
                  ) : skills.length === 0 ? (
                    <div className="py-16 text-center rounded-2xl border border-dashed border-violet-200 dark:border-gray-800 bg-violet-50/40 dark:bg-[#12121A]">
                      <Sparkles className="mx-auto text-violet-500 mb-3" size={32} />
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">No skills yet</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Share what you can teach! When you submit a skill, AI automatically places it in the right category.
                      </p>
                      <Link
                        to="/add-skills"
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 shadow-sm"
                      >
                        Add your first skill <ArrowRight size={15} />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {skills.map((item) => (
                        <article
                          key={item._id}
                          className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#12121A] p-5 transition hover:border-violet-200 dark:hover:border-violet-800/60 hover:shadow-sm"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</p>
                              <span className="mt-1 inline-block rounded-full bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                                {item.category}
                              </span>
                              <p className="mt-1 text-xs text-gray-400">
                                Submitted on {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                                statusStyle[item.status] || statusStyle.pending
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {item.description}
                          </p>

                          {item.learnSkill && (
                            <div className="mt-3 rounded-xl bg-slate-50 dark:bg-[#181824] p-2.5 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-100 dark:border-gray-800">
                              <ArrowLeftRight size={13} className="text-violet-600 dark:text-violet-400 shrink-0" />
                              <span>Looking to learn: <strong className="text-gray-900 dark:text-white">{item.learnSkill}</strong></span>
                            </div>
                          )}

                          <div className="mt-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/40 p-3 text-xs text-violet-950 dark:text-violet-200 border border-violet-100 dark:border-violet-900/40">
                            <b>AI Moderation:</b> {item.aiReview?.reason || "Approved for community listings."}
                          </div>

                          {item.adminNote && (
                            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                              <b>Admin Note:</b> {item.adminNote}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: PROFILE MANAGEMENT */}
            {activeTab === "profile" && (
              <div className="rounded-3xl border border-violet-100 dark:border-gray-800 bg-white dark:bg-[#181824] p-6 shadow-sm sm:p-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-600 dark:text-violet-400">
                    Account Settings
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Your Profile & Photo
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Update your avatar and personal bio. Your profile is visible to other learners when swapping skills.
                  </p>
                </div>

                {profileSuccess && (
                  <div className="mt-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 p-4 text-sm font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                {profileError && (
                  <div className="mt-5 rounded-2xl bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
                  {/* Photo Upload Area: Drag & Drop + Gallery */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                      Profile Picture
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Avatar preview */}
                      <div className="relative shrink-0">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Preview"
                            className="w-24 h-24 rounded-full object-cover border-2 border-violet-500 shadow-md"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold text-3xl shadow-xs">
                            {profileForm.name?.charAt(0) || "U"}
                          </div>
                        )}
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={removeAvatar}
                            className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {/* Dropzone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 w-full border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                          isDragging
                            ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40"
                            : "border-gray-300 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 bg-gray-50/60 dark:bg-[#12121A] hover:bg-gray-100 dark:hover:bg-[#181824]"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Upload size={22} className="text-violet-600 dark:text-violet-400 mb-1.5" />
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          Drag & drop your picture here, or <span className="text-violet-600 dark:text-violet-400 underline font-bold">choose from gallery</span>
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-400 mt-0.5">
                          PNG, JPG, WEBP up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* General Profile Fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12121A] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                        placeholder="e.g. Rahul Verma"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Email Address (Account ID)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser?.email || ""}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#0d0d14] px-3.5 py-2.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        City / Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12121A] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                        placeholder="e.g. Mumbai, India"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12121A] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12121A] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                      placeholder="e.g. Full Stack Developer | Learning UI/UX Design"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Bio / About You
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12121A] p-3 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 leading-relaxed"
                      placeholder="Tell the community about your journey, what you teach, and what you're excited to learn..."
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Skills I Can Teach
                      </label>
                      <input
                        type="text"
                        value={profileForm.skillsToTeach}
                        onChange={(e) => setProfileForm({ ...profileForm, skillsToTeach: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12121A] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                        placeholder="e.g. React, Node.js, Tailwind, JavaScript"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Skills I Want To Learn
                      </label>
                      <input
                        type="text"
                        value={profileForm.skillsToLearn}
                        onChange={(e) => setProfileForm({ ...profileForm, skillsToLearn: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#12121A] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                        placeholder="e.g. Figma, Spanish, Video Editing"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50 cursor-pointer"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Saving Changes…
                        </>
                      ) : (
                        <>
                          <Save size={16} /> Save Profile Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: MESSAGES */}
            {activeTab === "messages" && (
              <div className="rounded-3xl border border-violet-100 dark:border-gray-800 bg-white dark:bg-[#181824] p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-600 dark:text-violet-400">
                      Messages
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      Your Active Conversations
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Messages with other members appear here when you connect with them on SkillSwap.
                    </p>
                  </div>
                  <Link
                    to="/start-swap"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:underline"
                  >
                    Find new swaps →
                  </Link>
                </div>

                {loadingMessages ? (
                  <p className="py-12 text-center text-sm text-gray-400">Loading messages…</p>
                ) : conversations.length === 0 ? (
                  <div className="py-16 text-center rounded-2xl border border-dashed border-violet-200 dark:border-gray-800 bg-violet-50/40 dark:bg-[#12121A]">
                    <MessageCircle className="mx-auto text-violet-500 mb-3" size={32} />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">No active messages</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                      You haven't messaged anyone yet. When you chat with swappers, your real conversations will appear here.
                    </p>
                    <Link
                      to="/start-swap"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 shadow-sm"
                    >
                      Connect with Swappers <ArrowRight size={15} />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {conversations.map((conv) => (
                      <div
                        key={conv.room}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-violet-50/40 dark:hover:bg-[#12121A] rounded-xl px-3 transition"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {conv.avatar ? (
                            <img
                              src={conv.avatar}
                              alt={conv.recipientName}
                              className="w-11 h-11 rounded-full object-cover shrink-0 border border-violet-100 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center text-base shrink-0">
                              {conv.recipientName?.charAt(0) || "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{conv.recipientName}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md">{conv.lastMessage}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                              {new Date(conv.lastMessageTime).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={`/chat?room=${encodeURIComponent(conv.room)}&user=${encodeURIComponent(
                            conv.recipientName
                          )}`}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 px-4 py-2 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition shrink-0"
                        >
                          <MessageCircle size={14} /> Open Chat
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-violet-100 dark:border-gray-800 bg-white dark:bg-[#181824] p-5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
      </div>
      <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/50 p-3">{icon}</div>
    </div>
  );
}
