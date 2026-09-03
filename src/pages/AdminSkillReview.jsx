import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, Star, Trash2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import AdminNav from "../components/AdminNav";
import { authFetch } from "../lib/authFetch";

const statusStyle = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

const TABS = [
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "featured", label: "⭐ Featured This Week" },
  { key: "rejected", label: "Rejected" },
  { key: "", label: "All Submissions" },
];

export default function AdminSkillReview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isFeaturedQuery = searchParams.get("featured") === "true";
  const [status, setStatus] = useState(isFeaturedQuery ? "featured" : (searchParams.get("status") || "pending"));
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (searchParams.get("featured") === "true") {
      setStatus("featured");
    }
  }, [searchParams]);

  const loadSkills = useCallback(async (currentStatus) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (currentStatus === "featured") {
        params.set("featured", "true");
      } else if (currentStatus) {
        params.set("status", currentStatus);
      }
      const response = await authFetch(`/api/admin/skills?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Skills could not load.");
      setSkills(data.skills || []);
    } catch (loadError) {
      setError(loadError.message || "Admin API connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkills(status);
  }, [status, loadSkills]);

  async function decide(id, nextStatus) {
    setBusyId(id);
    try {
      const response = await authFetch(`/api/admin/skills/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, adminNote: notes[id] || "" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Status update failed.");
      setSkills((current) =>
        status && status !== "featured"
          ? current.filter((item) => item._id !== id)
          : current.map((item) => (item._id === id ? data.skill : item))
      );
    } catch (updateError) {
      setError(updateError.message || "Could not update this skill.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleFeature(id) {
    setBusyId(id);
    setError("");
    try {
      const response = await authFetch(`/api/admin/skills/${id}/feature`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update feature status.");
      setSkills((current) =>
        status === "featured" && !data.isFeatured
          ? current.filter((item) => item._id !== id)
          : current.map((item) =>
              item._id === id
                ? { ...item, isFeatured: data.isFeatured, status: "approved" }
                : item
            )
      );
    } catch (featureError) {
      setError(featureError.message || "Could not toggle feature.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this skill submission permanently?")) return;
    setBusyId(id);
    try {
      const response = await authFetch(`/api/admin/skills/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete skill.");
      setSkills((current) => current.filter((item) => item._id !== id));
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete skill.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9ff] px-4 py-10 sm:px-7">
      <section className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#170f24] via-[#211438] to-violet-900 px-6 py-9 text-white shadow-xl sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-violet-300">SkillSwap command centre</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Skill & Feature Manager</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Screen community submissions and add top skills to <b>"Featured This Week"</b> on the home page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadSkills(status)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          <AdminNav />
        </div>

        {/* Tab filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key || "all"}
              type="button"
              onClick={() => {
                setStatus(tab.key);
                if (tab.key === "featured") setSearchParams({ featured: "true" });
                else if (tab.key) setSearchParams({ status: tab.key });
                else setSearchParams({});
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                status === tab.key
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border border-violet-200 bg-white text-violet-800 hover:bg-violet-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mt-6 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-7">
          {loading ? (
            <div className="py-14 text-center text-sm text-gray-500">
              <RefreshCw className="animate-spin text-violet-600 mx-auto mb-2" size={24} />
              Loading submissions…
            </div>
          ) : skills.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-500">
              {status === "featured"
                ? "No skills are currently featured this week. Click '⭐ Add to Featured' on any approved skill below to feature it!"
                : "No skills found in this view."}
            </div>
          ) : (
            <div className="space-y-4">
              {skills.map((item) => {
                const seq = item.user?.sequenceId ? `#${item.user.sequenceId}` : "";
                const avatar = item.user?.avatar || "";
                const isFeatured = !!item.isFeatured;

                return (
                  <article
                    key={item._id}
                    className={`rounded-2xl border p-5 transition ${
                      isFeatured ? "border-amber-300 bg-amber-50/20 shadow-xs" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={item.userName}
                            className="w-11 h-11 rounded-full object-cover border border-violet-100 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {item.userName?.charAt(0) || "U"}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            {seq && (
                              <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">
                                {seq}
                              </span>
                            )}
                            <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            by <b>{item.user?.name || item.userName}</b> ({item.user?.email || item.userEmail})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800">
                            <Star size={13} className="fill-amber-500 text-amber-500" /> Featured This Week
                          </span>
                        )}
                        <span className="rounded-full bg-violet-50 border border-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                          {item.category}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                            statusStyle[item.status] || statusStyle.pending
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-700 leading-relaxed">{item.description}</p>

                    {item.learnSkill && (
                      <p className="mt-2 text-xs text-violet-800 bg-violet-50/60 p-2.5 rounded-xl border border-violet-100">
                        🔄 Wants to learn: <b>{item.learnSkill}</b>
                      </p>
                    )}

                    {item.aiReview && (
                      <div className="mt-3 rounded-xl bg-violet-50/80 p-3 text-xs text-violet-950 border border-violet-100">
                        <p>
                          <b>AI recommendation:</b> {item.aiReview.recommendation} ·{" "}
                          {Math.round((item.aiReview.confidence || 0) * 100)}% confidence
                        </p>
                        <p className="mt-1">
                          <b>AI reason:</b> {item.aiReview.reason}
                        </p>
                      </div>
                    )}

                    <textarea
                      value={notes[item._id] ?? item.adminNote ?? ""}
                      onChange={(event) =>
                        setNotes((current) => ({ ...current, [item._id]: event.target.value }))
                      }
                      placeholder="Optional admin note for this submission..."
                      className="mt-3 min-h-16 w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-violet-500"
                    />

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.status !== "approved" && (
                          <button
                            type="button"
                            disabled={busyId === item._id}
                            onClick={() => decide(item._id, "approved")}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                        )}
                        {item.status !== "rejected" && (
                          <button
                            type="button"
                            disabled={busyId === item._id}
                            onClick={() => decide(item._id, "rejected")}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        )}

                        {/* Feature This Week Toggle Button */}
                        <button
                          type="button"
                          disabled={busyId === item._id}
                          onClick={() => toggleFeature(item._id)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                            isFeatured
                              ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                              : "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 shadow-xs"
                          } disabled:opacity-50`}
                        >
                          <Star size={14} className={isFeatured ? "fill-amber-600 text-amber-600" : "fill-white"} />
                          {isFeatured ? "Remove from Featured" : "⭐ Add to Featured This Week"}
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={busyId === item._id}
                        onClick={() => remove(item._id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-red-50 hover:text-red-600 hover:border-red-200 disabled:opacity-50"
                        title="Delete permanently"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
