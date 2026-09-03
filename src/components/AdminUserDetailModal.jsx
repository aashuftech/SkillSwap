import { useEffect, useState } from "react";
import {
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
  XCircle,
} from "lucide-react";
import { authFetch } from "../lib/authFetch";

const statusStyle = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function AdminUserDetailModal({ userId, onClose, onBanChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banBusy, setBanBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");
    authFetch(`/api/admin/users/${userId}`)
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.message || "Could not load user details.");
        setData(json);
      })
      .catch((loadError) => setError(loadError.message || "Could not reach the server."))
      .finally(() => setLoading(false));
  }, [userId]);

  async function toggleBan() {
    if (!data) return;
    const nextBanned = !data.user.banned;
    const confirmMsg = nextBanned
      ? `Ban ${data.user.name} (#${data.user.sequenceId})?\n\n• User will be automatically logged out within 4-5 seconds.\n• Blocked from logging back in with ${data.user.email}.`
      : `Unban ${data.user.name} (#${data.user.sequenceId})?\n\n• Account will be restored immediately.`;

    if (!window.confirm(confirmMsg)) return;

    setBanBusy(true);
    try {
      const response = await authFetch(`/api/admin/users/${data.user.id}/ban`, {
        method: "PATCH",
        body: JSON.stringify({ banned: nextBanned }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Could not update ban status.");
      setData((current) => ({ ...current, user: json.user }));
      onBanChanged?.(json.user);
    } catch (banError) {
      setError(banError.message || "Could not update ban status.");
    } finally {
      setBanBusy(false);
    }
  }

  if (!userId) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <User className="text-violet-600" size={20} />
            <h2 className="text-xl font-bold text-gray-900">User Profile & Account Info</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin text-violet-600" size={30} />
            <p className="mt-3 text-xs text-gray-500">Loading user profile details…</p>
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : data ? (
          <div className="mt-5 space-y-6">
            {/* Top User Summary Card */}
            <div className="rounded-3xl border border-violet-100 bg-linear-to-br from-violet-50/50 via-white to-purple-50/30 p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {data.user.avatar ? (
                    <img
                      src={data.user.avatar}
                      alt={data.user.name}
                      className="h-16 w-16 rounded-2xl object-cover border-2 border-violet-200 shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-2xl font-bold text-violet-700 shadow-sm">
                      {data.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-violet-200 px-2 py-0.5 text-xs font-black text-violet-900">
                        ID: #{data.user.sequenceId ?? "—"}
                      </span>
                      {data.user.role === "ADMIN" && (
                        <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-700">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-xl font-bold text-gray-900">{data.user.name}</h3>
                    <p className="text-xs text-gray-500">{data.user.email}</p>
                  </div>
                </div>

                {/* Status & Ban Action */}
                <div className="flex items-center gap-3">
                  {data.user.banned ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      <XCircle size={14} /> Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      <CheckCircle2 size={14} /> Active Account
                    </span>
                  )}

                  {data.user.role !== "ADMIN" && (
                    <button
                      type="button"
                      onClick={toggleBan}
                      disabled={banBusy}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition disabled:opacity-50 ${
                        data.user.banned
                          ? "border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                          : "border-red-200 bg-red-600 text-white hover:bg-red-700 shadow-xs"
                      }`}
                    >
                      {data.user.banned ? <ShieldCheck size={14} /> : <Ban size={14} />}
                      {banBusy ? "Updating…" : data.user.banned ? "Unban Account" : "Ban Account"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Contact & Profile Information
              </h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-slate-50/70 p-3.5">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                    <Mail size={12} /> Email Address
                  </span>
                  <p className="mt-1 text-xs font-bold text-gray-900">{data.user.email}</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-slate-50/70 p-3.5">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                    <MapPin size={12} /> Location / City
                  </span>
                  <p className="mt-1 text-xs font-bold text-gray-900">
                    {data.user.location || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-slate-50/70 p-3.5">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                    <Phone size={12} /> Phone Number
                  </span>
                  <p className="mt-1 text-xs font-bold text-gray-900">
                    {data.user.phone || "Not provided"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-slate-50/70 p-3.5">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                    <Calendar size={12} /> Registration Date
                  </span>
                  <p className="mt-1 text-xs font-bold text-gray-900">
                    {new Date(data.user.joinedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Bio & Headline */}
              {(data.user.headline || data.user.bio) && (
                <div className="mt-3 space-y-3">
                  {data.user.headline && (
                    <div className="rounded-2xl border border-gray-100 bg-slate-50/70 p-3.5">
                      <span className="text-[11px] font-semibold text-gray-400">
                        Professional Headline
                      </span>
                      <p className="mt-1 text-xs text-gray-800 font-medium">{data.user.headline}</p>
                    </div>
                  )}
                  {data.user.bio && (
                    <div className="rounded-2xl border border-gray-100 bg-slate-50/70 p-3.5">
                      <span className="text-[11px] font-semibold text-gray-400">About / Bio</span>
                      <p className="mt-1 text-xs text-gray-800 leading-relaxed">{data.user.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Skills Teach & Learn Profile Tags */}
              {(data.user.skillsToTeach || data.user.skillsToLearn) && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {data.user.skillsToTeach && (
                    <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-3.5">
                      <span className="text-[11px] font-bold text-violet-700">Skills Can Teach:</span>
                      <p className="mt-1 text-xs text-violet-950 font-medium">
                        {data.user.skillsToTeach}
                      </p>
                    </div>
                  )}
                  {data.user.skillsToLearn && (
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-3.5">
                      <span className="text-[11px] font-bold text-purple-700">
                        Skills Wants To Learn:
                      </span>
                      <p className="mt-1 text-xs text-purple-950 font-medium">
                        {data.user.skillsToLearn}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submitted Skills Section */}
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Submitted Skills ({data.skills.length})
                </h4>
              </div>

              {data.skills.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                  This user has not submitted any skill requests yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {data.skills.map((skill) => (
                    <article
                      key={skill.id}
                      className="rounded-2xl border border-gray-100 bg-white p-4.5 shadow-xs"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            Teaches: {skill.title}
                          </p>
                          <span className="text-xs font-bold text-violet-700">
                            {skill.category}
                          </span>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                            statusStyle[skill.status] || statusStyle.pending
                          }`}
                        >
                          {skill.status}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                        {skill.description}
                      </p>

                      <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-gray-700">
                        <strong>Wants in exchange:</strong> {skill.learnSkill || "Any skill"}
                      </div>

                      {skill.aiReview && (
                        <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-violet-50/70 p-2.5 text-xs text-violet-900">
                          <Sparkles size={14} className="text-violet-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">
                              AI Recommendation: {skill.aiReview.recommendation} (
                              {Math.round((skill.aiReview.confidence || 0) * 100)}%)
                            </span>
                            <p className="mt-0.5 text-violet-800 text-[11px]">
                              {skill.aiReview.reason}
                            </p>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
