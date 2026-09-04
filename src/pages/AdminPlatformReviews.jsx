import React, { useEffect, useState, useCallback } from "react";
import {
  MessageSquareHeart,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  RefreshCw,
  Loader2,
  Filter,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import AdminNav from "../components/AdminNav";
import { authFetch } from "../lib/authFetch";

const safeParseJson = async (response) => {
  try {
    const text = await response.text();
    return JSON.parse(text);
  } catch {
    return { success: false, message: "Server returned an invalid response." };
  }
};

export default function AdminPlatformReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch("/api/admin/platform-reviews");
      const data = await safeParseJson(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load platform reviews.");
      }
      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message || "Could not fetch platform reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const updateReviewStatus = async (id, status) => {
    setActionLoadingId(id);
    setError("");
    setSuccessMsg("");
    try {
      const response = await authFetch(`/api/admin/platform-reviews/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const data = await safeParseJson(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update review status.");
      }

      setReviews((prev) =>
        prev.map((r) =>
          r._id === id
            ? { ...r, status, approvedBy: data.review?.approvedBy, approvedAt: data.review?.approvedAt }
            : r
        )
      );
      setSuccessMsg(`Review status updated to ${status}.`);
    } catch (err) {
      setError(err.message || "Could not update status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDelete = async (id) => {
    setActionLoadingId(id);
    setError("");
    setSuccessMsg("");
    try {
      const response = await authFetch(`/api/admin/platform-reviews/${id}`, {
        method: "DELETE",
      });
      const data = await safeParseJson(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete review.");
      }

      setReviews((prev) => prev.filter((r) => r._id !== id));
      setSuccessMsg("Platform review deleted permanently.");
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Could not delete review.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;

  return (
    <main className="min-h-screen bg-[var(--jb-bg)] dark:bg-[#07070D] px-4 py-10 sm:px-7 transition-colors duration-300">
      <section className="mx-auto max-w-7xl">
        {/* Admin Header */}
        <div className="overflow-hidden rounded-3xl bg-linear-to-br from-[#170f24] via-[#211438] to-violet-900 px-6 py-9 text-white shadow-xl sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-violet-300">
            SkillSwap Moderation
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Website Reviews
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                Review and approve real member testimonials for the homepage "Real swaps, real results" section.
              </p>
            </div>
            <button
              type="button"
              onClick={loadReviews}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15 cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          <AdminNav />
        </div>

        {/* Banners */}
        {successMsg && (
          <div className="mt-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs">
            <span><b>Success:</b> {successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-800 dark:text-red-300 flex items-center justify-between shadow-xs">
            <span><b>Error:</b> {error}</span>
            <button onClick={() => setError("")} className="text-red-700 dark:text-red-300 font-bold text-xs hover:underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Metrics Row */}
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181824] p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase text-gray-500">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{reviews.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">Pending Review</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">Approved Public</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{approvedCount}</p>
          </div>
          <div className="rounded-2xl border border-red-200 dark:border-red-800/60 bg-red-50/50 dark:bg-red-950/20 p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase text-red-700 dark:text-red-400">Rejected</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">{rejectedCount}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: `All (${reviews.length})` },
              { id: "pending", label: `Pending (${pendingCount})` },
              { id: "approved", label: `Approved (${approvedCount})` },
              { id: "rejected", label: `Rejected (${rejectedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === tab.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-white dark:bg-[#181824] border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 size={32} className="animate-spin text-violet-600 mx-auto" />
              <p className="text-xs text-gray-500 mt-2">Loading platform reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#181824] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-6">
              <MessageSquareHeart size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="font-bold text-gray-800 dark:text-white text-base">No reviews in this view</p>
              <p className="text-xs text-gray-500 mt-1">
                New user reviews submitted via the website CTA will appear here.
              </p>
            </div>
          ) : (
            filteredReviews.map((r) => {
              const isActionLoading = actionLoadingId === r._id;

              return (
                <div
                  key={r._id}
                  className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181824] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="grow min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      {r.userAvatar ? (
                        <img
                          src={r.userAvatar}
                          alt={r.userName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-lg shadow-xs">
                          {r.userName?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">
                            {r.userName}
                          </h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              r.status === "approved"
                                ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                : r.status === "rejected"
                                ? "bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700"
                                : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {r.teachingSkill ? `Teaches ${r.teachingSkill}` : "Member"} ·{" "}
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={
                            s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-700"
                          }
                        />
                      ))}
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">
                        {r.rating} / 5
                      </span>
                    </div>

                    {/* Review text */}
                    <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-[#12121A] p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 leading-relaxed">
                      "{r.reviewText}"
                    </p>
                  </div>

                  {/* Moderation Actions */}
                  <div className="flex items-center gap-2 shrink-0 md:flex-col md:w-36">
                    {r.status !== "approved" && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => updateReviewStatus(r._id, "approved")}
                        className="flex-1 md:w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 shadow-sm transition disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 size={15} /> Approve
                      </button>
                    )}

                    {r.status !== "rejected" && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => updateReviewStatus(r._id, "rejected")}
                        className="flex-1 md:w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-2.5 px-4 shadow-sm transition disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    )}

                    {r.status !== "pending" && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => updateReviewStatus(r._id, "pending")}
                        className="flex-1 md:w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-2 px-3 transition disabled:opacity-50 cursor-pointer"
                      >
                        <Clock size={14} /> Set Pending
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => setDeleteTarget(r)}
                      className="flex-1 md:w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 font-bold text-xs py-2 px-3 transition disabled:opacity-50 cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation In-App Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#181824] p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in duration-200">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Delete Platform Review</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Permanently removes this testimonial.</p>
                </div>
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300 mb-6 bg-gray-50 dark:bg-[#12121A] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/80">
                <p className="mb-2 font-semibold">Are you sure you want to delete this review?</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Author: <span className="font-bold text-gray-800 dark:text-gray-200">{deleteTarget.userName}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 italic">
                  "{deleteTarget.reviewText}"
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={actionLoadingId === deleteTarget._id}
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoadingId === deleteTarget._id}
                  onClick={() => confirmDelete(deleteTarget._id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {actionLoadingId === deleteTarget._id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
